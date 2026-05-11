# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

This is a monorepo. The `client/` directory contains the Next.js frontend. A backend directory is expected to be added alongside it.

## Stack

- **Next.js 16.2.6** with the App Router (`client/app/`)
- **React 19**
- **TypeScript 5**
- **Tailwind CSS 4** (configured via PostCSS in `postcss.config.mjs`)
- **ESLint 9** (flat config format in `eslint.config.mjs`)
- **Geist** font family loaded via `next/font/google`

> **Important:** This project uses Next.js 16, which has breaking changes from earlier versions. Before writing Next.js-specific code, check `client/node_modules/next/dist/docs/` for current API conventions.

## Commands

All commands run from `client/`:

```bash
cd client
npm run dev      # start dev server at http://localhost:3000
npm run build    # production build
npm run start    # serve production build
npm run lint     # run ESLint
```

## Architecture

The app uses the **App Router** exclusively — no `pages/` directory.

- `client/app/layout.tsx` — root layout; sets up Geist fonts, base HTML structure, and Tailwind's `antialiased` class
- `client/app/page.tsx` — home route (`/`)
- `client/app/globals.css` — global styles entry point for Tailwind
- `client/public/` — static assets served at `/`

New routes go in `client/app/` as folders with a `page.tsx`. Shared UI should live in `client/components/` (to be created). Server Components are the default; add `"use client"` only when needed for interactivity or browser APIs.
