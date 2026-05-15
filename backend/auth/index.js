import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import jwt from "jsonwebtoken";

const dynamo = new DynamoDBClient({});

export async function handler(event) {
  const code = event.queryStringParameters?.code;

  if (!code) {
    return redirect(process.env.FRONTEND_URL, "error=missing_code");
  }

  try {
    const accessToken = await exchangeCodeForToken(code);
    const profile = await fetchGitHubProfile(accessToken);
    await upsertUser(profile, accessToken);
    const token = signJwt(profile);

    return {
      statusCode: 302,
      headers: {
        Location: `${process.env.FRONTEND_URL}/api/auth/callback?token=${token}`,
      },
      body: "",
    };
  } catch (err) {
    console.error("Auth error:", err);
    return redirect(process.env.FRONTEND_URL, "error=auth_failed");
  }
}

async function exchangeCodeForToken(code) {
  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error_description);

  return data.access_token;
}

async function fetchGitHubProfile(accessToken) {
  const res = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
    },
  });

  if (!res.ok) throw new Error("Failed to fetch GitHub profile");

  return res.json();
}

async function upsertUser(profile, accessToken) {
  await dynamo.send(
    new PutItemCommand({
      TableName: process.env.DYNAMODB_TABLE,
      Item: {
        PK: { S: `USER#${profile.id}` },
        SK: { S: "PROFILE" },
        userId: { S: String(profile.id) },
        username: { S: profile.login },
        email: { S: profile.email ?? "" },
        avatarUrl: { S: profile.avatar_url },
        githubAccessToken: { S: accessToken },
        updatedAt: { S: new Date().toISOString() },
      },
    })
  );
}

function signJwt(profile) {
  return jwt.sign(
    {
      userId: String(profile.id),
      username: profile.login,
      avatarUrl: profile.avatar_url,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function redirect(baseUrl, queryString) {
  return {
    statusCode: 302,
    headers: { Location: `${baseUrl}?${queryString}` },
    body: "",
  };
}
