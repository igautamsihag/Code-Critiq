# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Structure

Monorepo:
- `client/` — Next.js frontend
- `backend/` — AWS Lambda functions (one directory per function)
- `infra/` — Terraform config that deploys all AWS infrastructure

## Stack

- Next.js 16.2.6 (App Router), React 19, TypeScript 5
- CSS Modules — no Tailwind; all CSS lives in `client/styles/`
- ESLint 9 (flat config)
- Geist font via `next/font/google`

> Next.js 16 has breaking changes — check `client/node_modules/next/dist/docs/` before writing Next.js-specific code.

## Commands

Run from `client/`:

```bash
npm run dev        # http://localhost:3000
npm run build
npm run lint
npm test           # run all tests once
npm run test:watch # watch mode during development
```

## Conventions

- All CSS files go in `client/styles/`. Never colocate `.css` files next to components or pages.
- Use CSS Modules for scoped styles: `import styles from "@/styles/Name.module.css"`
- `globals.css` — reset, CSS variables, body only
- Dark mode via `@media (prefers-color-scheme: dark)` in each module
- New routes → `client/app/<route>/page.tsx`
- New components → `client/components/` + `client/styles/<Component>.module.css`
- Server Components by default; `"use client"` only when needed

## Authentication & Authorisation

**OAuth flow:**
1. Frontend redirects the user to GitHub OAuth (`https://github.com/login/oauth/authorize`) with scopes `repo, read:user, user:email, admin:repo_hook`
2. GitHub redirects to `{API_GATEWAY_URL}/auth/callback?code=...`
3. `backend/auth` Lambda exchanges the code for a GitHub access token, fetches the user profile, upserts a DynamoDB record, and signs a JWT (`userId`, `username`, `avatarUrl`, 7-day expiry)
4. Lambda redirects to `{FRONTEND_URL}/api/auth/callback?token={jwt}`, which sets an `httpOnly` cookie named `token`

**Protecting pages (server components):**
- Read the `token` cookie via `next/headers` → `cookies()`
- Verify with `jose`'s `jwtVerify` using `JWT_SECRET`
- `redirect("/")` on missing or invalid token

**Authorisation for backend calls:**
- Server components pass `Authorization: Bearer {token}` when calling backend Lambda endpoints
- Each Lambda verifies the JWT with `jsonwebtoken` and extracts `userId`

## Backend — Lambda Functions

Each Lambda lives in its own directory under `backend/` with an `index.js` and `package.json`. Before deploying, run `npm install` inside the Lambda directory so `node_modules` is included in the zip.

| Directory | Route | Purpose |
|---|---|---|
| `backend/auth/` | `GET /auth/callback` | GitHub OAuth callback — issues JWT |
| `backend/repos/` | `GET /repos` | Lists the user's GitHub repos |

**Deploying:** all infrastructure is managed by Terraform in `infra/`. Run from `infra/`:

```bash
terraform plan   # preview changes
terraform apply  # deploy
```

Terraform zips each `backend/<name>/` directory (including `node_modules`) and creates the Lambda + API Gateway route automatically.

## Data Layer — DynamoDB

Single table `code-critiq-data` with a `PK` / `SK` key schema.

**User profile item** (written by `backend/auth` on every login):
```
PK: USER#{githubUserId}
SK: PROFILE
userId, username, email, avatarUrl, githubAccessToken, updatedAt
```

**Fetching the GitHub access token in a Lambda:**
```js
const result = await dynamo.send(new GetItemCommand({
  TableName: process.env.DYNAMODB_TABLE,
  Key: { PK: { S: `USER#${userId}` }, SK: { S: 'PROFILE' } },
}))
const githubToken = result.Item.githubAccessToken.S
```

The table also has two GSIs for future use:
- `GSI1-repo-to-user` — look up which user connected a given repo (for webhook routing)
- `GSI2-user-reviews` — fetch all reviews for a user sorted by date

## GitHub API — Fetching Repos

`backend/repos` reads `githubAccessToken` from DynamoDB (by `userId` from the JWT), then calls:

```
GET https://api.github.com/user/repos?sort=updated&direction=desc&per_page=20&visibility=all
```

Returns `[{ name, fullName, private, language, stars, openIssues, updatedAt }]`.

The dashboard shows only the 3 most recent (`.slice(0, 3)`); the repositories page shows all of them.

## Environment Variables

In `client/.env.local` (never committed):

- `NEXT_PUBLIC_GITHUB_CLIENT_ID` — GitHub OAuth App client ID
- `NEXT_PUBLIC_API_URL` — API Gateway base URL (used in the OAuth redirect URI, exposed to the browser)
- `API_URL` — API Gateway base URL (used server-side to call Lambda endpoints, not exposed to the browser)
- `JWT_SECRET` — must match the value set in Terraform

## Testing

- Framework: Jest + React Testing Library
- Test files live in `client/__tests__/`, mirroring the source structure:
  - `__tests__/components/` for component tests
  - `__tests__/app/` for page tests
- Configuration: `client/jest.config.ts` (uses `next/jest.js` preset)
- Setup file: `client/jest.setup.ts` (loads `@testing-library/jest-dom` matchers)
- Mocks: `client/__mocks__/next/image.tsx` — replaces `next/image` with a plain `<img>` for assertability
- `next/jest.js` handles CSS Modules automatically (identity proxy)
- Write assertion-based tests only — no snapshots
- Only test critical, user-facing behaviour; skip boilerplate rendering

## CI

`.github/workflows/client-ci.yml` — triggers on push to `develop` and `main`, and PRs to `develop` and `main`. Three sequential jobs: `lint` → `test` → `build`, all running from `client/`.

## CD

`.github/workflows/client-cd.yml` — triggers via `workflow_run` when CI completes successfully on `main`. Deploys to Vercel using `npx vercel@latest --prod` directly (avoids third-party action version lag).

- Runs under the `production` GitHub Environment, restricted to the `main` branch
- Required GitHub repository secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
- `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` can be found in `client/.vercel/project.json` (not committed)
- Vercel handles the build on its own infrastructure — no local build step in the workflow
