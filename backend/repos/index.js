import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import jwt from "jsonwebtoken";

const dynamo = new DynamoDBClient({});

export async function handler(event) {
  const authHeader = event.headers?.authorization ?? event.headers?.Authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return reply(401, { error: "Unauthorized" });
  }

  let userId;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    userId = payload.userId;
  } catch {
    return reply(401, { error: "Invalid token" });
  }

  let userItem;
  try {
    const result = await dynamo.send(
      new GetItemCommand({
        TableName: process.env.DYNAMODB_TABLE,
        Key: {
          PK: { S: `USER#${userId}` },
          SK: { S: "PROFILE" },
        },
      })
    );
    userItem = result.Item;
  } catch (err) {
    console.error("DynamoDB error:", err);
    return reply(500, { error: "Internal server error" });
  }

  if (!userItem) {
    return reply(404, { error: "User not found" });
  }

  const githubToken = userItem.githubAccessToken?.S;
  if (!githubToken) {
    return reply(500, { error: "GitHub token not found" });
  }

  let ghData;
  try {
    const ghRes = await fetch(
      "https://api.github.com/user/repos?sort=updated&per_page=20&visibility=all",
      {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );
    if (!ghRes.ok) {
      console.error("GitHub API error:", ghRes.status, await ghRes.text());
      return reply(502, { error: "Failed to fetch repos from GitHub" });
    }
    ghData = await ghRes.json();
  } catch (err) {
    console.error("GitHub fetch error:", err);
    return reply(502, { error: "Failed to fetch repos from GitHub" });
  }

  const repos = ghData.map((r) => ({
    name: r.name,
    fullName: r.full_name,
    private: r.private,
    language: r.language,
    stars: r.stargazers_count,
    openIssues: r.open_issues_count,
    updatedAt: r.updated_at,
  }));

  return reply(200, repos);
}

function reply(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}
