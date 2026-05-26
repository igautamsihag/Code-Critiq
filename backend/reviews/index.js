import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
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

  let items;
  try {
    const result = await dynamo.send(new QueryCommand({
      TableName: process.env.DYNAMODB_TABLE,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
      ExpressionAttributeValues: {
        ":pk":     { S: `USER#${userId}` },
        ":prefix": { S: "REVIEW#" },
      },
    }));
    items = result.Items ?? [];
  } catch (err) {
    console.error("DynamoDB error:", err);
    return reply(500, { error: "Internal server error" });
  }

  const reviews = items
    .map((item) => ({
      repoFullName: item.repoFullName?.S ?? "",
      prNumber:     Number(item.prNumber?.N ?? 0),
      prTitle:      item.prTitle?.S ?? "",
      summary:      item.summary?.S ?? "",
      commentCount: Number(item.commentCount?.N ?? 0),
      status:       item.status?.S ?? "completed",
      createdAt:    item.createdAt?.S ?? "",
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return reply(200, reviews);
}

function reply(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}
