import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
import crypto from "crypto";

const dynamo = new DynamoDBClient({});

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
  const repoFullName = payload.repository?.full_name;

  if (!repoFullName) {
    return reply(400, { error: "Missing repository in payload" });
  }

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
    console.error("DynamoDB error:", err);
    return reply(500, { error: "Internal server error" });
  }

  console.log(`Received ${eventType} event for ${repoFullName} (userId: ${userId})`);

  // TODO: trigger AI review pipeline

  return reply(200, { received: true });
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
