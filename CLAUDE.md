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
npm run dev      # http://localhost:3000
npm run build
npm run lint
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

## CI

`.github/workflows/client-ci.yml` — triggers on push/PR to `main` and `develop`. Two sequential jobs: `lint` → `build`, both running from `client/`.
