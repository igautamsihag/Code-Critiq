import { DynamoDBClient, GetItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import jwt from "jsonwebtoken";

const dynamo = new DynamoDBClient({});

export async function handler(event) {
  const authHeader = event.headers?.authorization ?? event.headers?.Authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) return reply(401, { error: "Unauthorized" });

  let userId;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    userId = payload.userId;
  } catch {
    return reply(401, { error: "Invalid token" });
  }

  let body;
  try {
    body = JSON.parse(event.body ?? "{}");
  } catch {
    return reply(400, { error: "Invalid JSON" });
  }

  const { fullName } = body;
  if (!fullName || typeof fullName !== "string") {
    return reply(400, { error: "fullName is required" });
  }

  let githubToken;
  try {
    const result = await dynamo.send(new GetItemCommand({
      TableName: process.env.DYNAMODB_TABLE,
      Key: { PK: { S: `USER#${userId}` }, SK: { S: "PROFILE" } },
    }));
    if (!result.Item) return reply(404, { error: "User not found" });
    githubToken = result.Item.githubAccessToken?.S;
    if (!githubToken) return reply(500, { error: "GitHub token not found" });
  } catch (err) {
    console.error("DynamoDB error:", err);
    return reply(500, { error: "Internal server error" });
  }

  const webhookUrl = `${process.env.API_GATEWAY_URL}/webhook`;
  let webhookId;
  try {
    const ghRes = await fetch(`https://api.github.com/repos/${fullName}/hooks`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "web",
        active: true,
        events: ["push", "pull_request"],
        config: {
          url: webhookUrl,
          content_type: "json",
          secret: process.env.WEBHOOK_SECRET,
        },
      }),
    });

    if (!ghRes.ok) {
      const text = await ghRes.text();
      console.error("GitHub webhook error:", ghRes.status, text);
      if (ghRes.status === 403) return reply(403, { error: "No permission to create webhook on this repo" });
      if (ghRes.status === 422) return reply(409, { error: "Webhook already exists for this repo" });
      return reply(502, { error: "Failed to create webhook" });
    }

    const hook = await ghRes.json();
    webhookId = hook.id;
  } catch (err) {
    console.error("GitHub fetch error:", err);
    return reply(502, { error: "Failed to create webhook" });
  }

  try {
    await dynamo.send(new PutItemCommand({
      TableName: process.env.DYNAMODB_TABLE,
      Item: {
        PK: { S: `USER#${userId}` },
        SK: { S: `REPO#${fullName}` },
        webhookId: { N: String(webhookId) },
        connectedAt: { S: new Date().toISOString() },
        GSI1_PK: { S: `REPO#${fullName}` },
        GSI1_SK: { S: `USER#${userId}` },
      },
    }));
  } catch (err) {
    console.error("DynamoDB write error:", err);
    return reply(500, { error: "Failed to store connection" });
  }

  return reply(200, { webhookId });
}

function reply(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}
