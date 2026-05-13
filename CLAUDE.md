# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Structure

Monorepo — `client/` is the Next.js frontend; backend to be added alongside it.

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

## Environment Variables

In `client/.env.local` (never committed):

- `NEXT_PUBLIC_GITHUB_CLIENT_ID` — GitHub OAuth App client ID

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
