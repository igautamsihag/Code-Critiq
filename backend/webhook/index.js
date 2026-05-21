import { DynamoDBClient, QueryCommand, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import crypto from "crypto";

const lambda = new LambdaClient({});

const dynamo = new DynamoDBClient({});

// Files that add noise without value for code review
const IGNORED_PATTERNS = [
  /^package-lock\.json$/,
  /^yarn\.lock$/,
  /^pnpm-lock\.yaml$/,
  /^Gemfile\.lock$/,
  /^poetry\.lock$/,
  /^go\.sum$/,
  /^Cargo\.lock$/,
  /\.min\.(js|css)$/,
  /\.map$/,
  /^(dist|build|out|\.next|coverage|vendor)\//,
];

export async function handler(event) {
  const signature = event.headers?.["x-hub-signature-256"];
  const rawBody = event.body ?? "";

  if (!verifySignature(rawBody, signature)) {
    return reply(401, { error: "Invalid signature" });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return reply(400, { error: "Invalid JSON" });
  }

  const eventType = event.headers?.["x-github-event"];

  if (eventType !== "pull_request") {
    return reply(200, { skipped: true, reason: "not a pull_request event" });
  }

  const action = payload.action;
  if (!["opened", "synchronize", "reopened"].includes(action)) {
    return reply(200, { skipped: true, reason: `action '${action}' not reviewable` });
  }

  const repoFullName = payload.repository?.full_name;
  const prNumber = payload.pull_request?.number;

  if (!repoFullName || !prNumber) {
    return reply(400, { error: "Missing repository or PR number in payload" });
  }

  // Look up which user owns this connected repo
  let userId;
  try {
    const result = await dynamo.send(new QueryCommand({
      TableName: process.env.DYNAMODB_TABLE,
      IndexName: "GSI1-repo-to-user",
      KeyConditionExpression: "GSI1_PK = :repoPK",
      ExpressionAttributeValues: { ":repoPK": { S: `REPO#${repoFullName}` } },
      Limit: 1,
    }));
    if (!result.Items?.length) {
      return reply(404, { error: "Repo not connected" });
    }
    userId = result.Items[0].GSI1_SK?.S?.replace("USER#", "");
  } catch (err) {
    console.error("DynamoDB GSI lookup error:", err);
    return reply(500, { error: "Internal server error" });
  }

  // Fetch the user's GitHub token so we can call the GitHub API
  let githubToken;
  try {
    const result = await dynamo.send(new GetItemCommand({
      TableName: process.env.DYNAMODB_TABLE,
      Key: { PK: { S: `USER#${userId}` }, SK: { S: "PROFILE" } },
    }));
    githubToken = result.Item?.githubAccessToken?.S;
    if (!githubToken) {
      console.error(`No GitHub token found for userId: ${userId}`);
      return reply(500, { error: "GitHub token not found" });
    }
  } catch (err) {
    console.error("DynamoDB profile fetch error:", err);
    return reply(500, { error: "Internal server error" });
  }

  // Fetch changed files for this PR from GitHub
  let allFiles;
  try {
    allFiles = await fetchPRFiles(repoFullName, prNumber, githubToken);
  } catch (err) {
    console.error("GitHub PR files fetch error:", err);
    return reply(502, { error: "Failed to fetch PR files from GitHub" });
  }

  // Filter out noise files, keep only reviewable code
  const reviewableFiles = allFiles.filter((f) => !isIgnored(f.filename));
  const skippedFiles = allFiles.length - reviewableFiles.length;

  const estimatedTokens = estimateTokens(reviewableFiles);

  console.log(JSON.stringify({
    event: "pr_diff_fetched",
    repo: repoFullName,
    pr: prNumber,
    action,
    totalFiles: allFiles.length,
    reviewableFiles: reviewableFiles.length,
    skippedFiles,
    estimatedInputTokens: estimatedTokens,
  }));

  // Invoke ai-agent Lambda asynchronously — InvocationType Event means fire-and-forget.
  // We return 200 to GitHub immediately; the review posts to the PR independently.
  await lambda.send(new InvokeCommand({
    FunctionName: process.env.AI_AGENT_FUNCTION_NAME,
    InvocationType: "Event",
    Payload: JSON.stringify({
      userId,
      repoFullName,
      prNumber,
      prTitle: payload.pull_request?.title ?? "",
      prBody: payload.pull_request?.body ?? "",
      reviewableFiles,
    }),
  }));

  return reply(200, { received: true });
}

async function fetchPRFiles(repoFullName, prNumber, githubToken) {
  // GitHub returns max 300 files per page; for very large PRs we cap at page 1 (~30 files default)
  const res = await fetch(
    `https://api.github.com/repos/${repoFullName}/pulls/${prNumber}/files?per_page=100`,
    {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API ${res.status}: ${text}`);
  }

  return res.json();
}

function isIgnored(filename) {
  return IGNORED_PATTERNS.some((pattern) => pattern.test(filename));
}

// Rough estimate: 1 token ≈ 4 characters in code/diff content
function estimateTokens(files) {
  const totalChars = files.reduce((sum, f) => sum + (f.patch?.length ?? 0), 0);
  return Math.ceil(totalChars / 4);
}

function verifySignature(body, signature) {
  if (!signature || !process.env.WEBHOOK_SECRET) return false;
  const expected = `sha256=${crypto
    .createHmac("sha256", process.env.WEBHOOK_SECRET)
    .update(body)
    .digest("hex")}`;
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

function reply(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}
