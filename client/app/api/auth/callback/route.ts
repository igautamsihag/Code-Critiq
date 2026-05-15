import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/?error=missing_code", request.url));
  }

  try {
    const accessToken = await exchangeCodeForToken(code);
    const profile = await fetchGitHubProfile(accessToken);
    const token = await signJwt(profile);

    const response = NextResponse.redirect(new URL("/dashboard", request.url));
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Auth error:", err);
    return NextResponse.redirect(new URL("/?error=auth_failed", request.url));
  }
}

async function exchangeCodeForToken(code: string): Promise<string> {
  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error_description);

  return data.access_token;
}

async function fetchGitHubProfile(accessToken: string) {
  const res = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
    },
  });

  if (!res.ok) throw new Error("Failed to fetch GitHub profile");

  return res.json();
}

async function signJwt(profile: {
  id: number;
  login: string;
  avatar_url: string;
}): Promise<string> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  return new SignJWT({
    userId: String(profile.id),
    username: profile.login,
    avatarUrl: profile.avatar_url,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);
}
