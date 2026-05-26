import { StateGraph, Annotation, START, END } from "@langchain/langgraph";
import { DynamoDBClient, GetItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import OpenAI from "openai";
import { postPRReview } from "./github.js";

const dynamo = new DynamoDBClient({});
const openai = new OpenAI();

const MAX_DIFF_CHARS = 25000 * 4; // ~25k tokens

const SYSTEM_PROMPT = `You are an expert code reviewer. Analyze the PR diff and return a JSON object with exactly these fields:
- "summary": string — a concise review (2-3 sentences) covering overall quality, key concerns, and merge readiness
- "comments": array of objects, each with:
  - "path": string — exact file path as shown in the diff header
  - "line": number — the new-file line number shown in [N] annotations
  - "body": string — specific, actionable feedback

Rules:
- Focus on: bugs, security vulnerabilities, performance issues, logic errors
- Ignore: style preferences, minor formatting, variable naming unless clearly misleading
- Maximum 8 inline comments — quality over quantity
- Only reference lines annotated with [N] numbers (added or context lines)
- Return ONLY the JSON object, no markdown fences, no explanation`;

// ── State ────────────────────────────────────────────────────────────────────

const GraphState = Annotation.Root({
  userId:          Annotation({ reducer: (a, b) => b ?? a }),
  repoFullName:    Annotation({ reducer: (a, b) => b ?? a }),
  prNumber:        Annotation({ reducer: (a, b) => b ?? a }),
  prTitle:         Annotation({ reducer: (a, b) => b ?? a }),
  prBody:          Annotation({ reducer: (a, b) => b ?? a }),
  reviewableFiles: Annotation({ reducer: (a, b) => b ?? a }),
  githubToken:     Annotation({ reducer: (a, b) => b ?? a }),
  summary:         Annotation({ reducer: (a, b) => b ?? a }),
  comments:        Annotation({ reducer: (a, b) => b ?? a }),
});

// ── Nodes ────────────────────────────────────────────────────────────────────

async function fetchTokenNode(state) {
  const result = await dynamo.send(new GetItemCommand({
    TableName: process.env.DYNAMODB_TABLE,
    Key: { PK: { S: `USER#${state.userId}` }, SK: { S: "PROFILE" } },
  }));

  const githubToken = result.Item?.githubAccessToken?.S;
  if (!githubToken) throw new Error(`No GitHub token for userId: ${state.userId}`);

  return { githubToken };
}

async function analyzeNode(state) {
  const truncatedFiles = truncateToLimit(state.reviewableFiles);
  const formattedDiff = formatDiffForPrompt(truncatedFiles);

  const userMessage = [
    `PR Title: ${state.prTitle || "(no title)"}`,
    state.prBody ? `PR Description: ${state.prBody}` : null,
    `\nChanged files:\n\n${formattedDiff}`,
  ].filter(Boolean).join("\n");

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    temperature: 0.2,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
  });

  let parsed;
  try {
    parsed = JSON.parse(response.choices[0].message.content);
  } catch {
    return { summary: response.choices[0].message.content, comments: [] };
  }

  return {
    summary: parsed.summary ?? "Review complete.",
    comments: Array.isArray(parsed.comments) ? parsed.comments : [],
  };
}

async function postReviewNode(state) {
  const validLines = getValidLines(state.reviewableFiles);
  const validComments = state.comments.filter(
    (c) => c.path && c.line && c.body && validLines.has(`${c.path}:${c.line}`)
  );

  await postPRReview(
    state.repoFullName,
    state.prNumber,
    state.githubToken,
    state.summary,
    validComments
  );

  await dynamo.send(new PutItemCommand({
    TableName: process.env.DYNAMODB_TABLE,
    Item: {
      PK: { S: `USER#${state.userId}` },
      SK: { S: `REVIEW#${state.repoFullName}#PR#${state.prNumber}` },
      repoFullName:  { S: state.repoFullName },
      prNumber:      { N: String(state.prNumber) },
      prTitle:       { S: state.prTitle ?? "" },
      summary:       { S: state.summary },
      commentCount:  { N: String(validComments.length) },
      status:        { S: "completed" },
      createdAt:     { S: new Date().toISOString() },
    },
  }));

  console.log(JSON.stringify({
    event: "review_posted",
    repo: state.repoFullName,
    pr: state.prNumber,
    inlineComments: validComments.length,
    filteredOut: state.comments.length - validComments.length,
  }));

  return {};
}

// ── Graph ────────────────────────────────────────────────────────────────────

const graph = new StateGraph(GraphState)
  .addNode("fetch_token", fetchTokenNode)
  .addNode("analyze", analyzeNode)
  .addNode("post_review", postReviewNode)
  .addEdge(START, "fetch_token")
  .addEdge("fetch_token", "analyze")
  .addEdge("analyze", "post_review")
  .addEdge("post_review", END)
  .compile();

export async function runReviewPipeline(input) {
  return graph.invoke(input);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function truncateToLimit(files) {
  let totalChars = 0;
  const result = [];
  for (const f of files) {
    const chars = f.patch?.length ?? 0;
    if (totalChars + chars > MAX_DIFF_CHARS) break;
    result.push(f);
    totalChars += chars;
  }
  return result;
}

export function formatDiffForPrompt(files) {
  return files.map((file) => {
    const lines = [`File: ${file.filename} [${file.status}]`];

    if (!file.patch) {
      lines.push("(no patch — binary or renamed file)");
      return lines.join("\n");
    }

    let newLineNum = 0;
    for (const line of file.patch.split("\n")) {
      if (line.startsWith("@@")) {
        const m = line.match(/@@ -\d+(?:,\d+)? \+(\d+)/);
        if (m) newLineNum = parseInt(m[1]) - 1;
        lines.push(line);
      } else if (line.startsWith("+")) {
        newLineNum++;
        lines.push(`+[${newLineNum}] ${line.slice(1)}`);
      } else if (line.startsWith("-")) {
        lines.push(`-[   ] ${line.slice(1)}`);
      } else if (line.startsWith("\\")) {
        lines.push(line);
      } else {
        newLineNum++;
        lines.push(` [${newLineNum}] ${line.slice(1)}`);
      }
    }

    return lines.join("\n");
  }).join("\n\n---\n\n");
}


export function getValidLines(files) {
  const valid = new Set();
  for (const file of files) {
    if (!file.patch) continue;
    let newLineNum = 0;
    for (const line of file.patch.split("\n")) {
      if (line.startsWith("@@")) {
        const m = line.match(/@@ -\d+(?:,\d+)? \+(\d+)/);
        if (m) newLineNum = parseInt(m[1]) - 1;
      } else if (!line.startsWith("-") && !line.startsWith("\\")) {
        newLineNum++;
        valid.add(`${file.filename}:${newLineNum}`);
      }
    }
  }
  return valid;
}
