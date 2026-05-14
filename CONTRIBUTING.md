# Contributing to Code Critiq

Thank you for your interest in contributing. Please read this guide before opening a pull request.

---

## Project Structure

```
Code-Critiq/
└── client/         # Next.js frontend
    ├── app/        # App Router pages and layouts
    ├── components/ # Shared UI components
    ├── styles/     # CSS Modules (all styles live here)
    └── __tests__/  # Jest + React Testing Library tests
```

The repository is structured as a monorepo. The backend will be added alongside `client/`.

---

## Getting Started

1. Fork the repository and clone it locally:

```bash
git clone https://github.com/your-username/Code-Critiq.git
cd Code-Critiq/client
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file in `client/`:

```env
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_oauth_client_id
```

4. Start the development server:

```bash
npm run dev
```

---

## Branching Strategy

```
develop → staging → main
```

| Branch | Purpose |
|---|---|
| `main` | Production — never commit directly |
| `staging` | Pre-production verification |
| `develop` | Active development — branch off from here |

Always create your feature branch from `develop`:

```bash
git checkout develop
git checkout -b feature/your-feature-name
```

---

## Workflow

1. Create a feature branch from `develop`
2. Make your changes
3. Ensure lint and tests pass (see below)
4. Open a PR targeting `develop`
5. Once reviewed and merged, changes flow: `develop` → `staging` → `main`

---

## Code Style

- **TypeScript** — all new code must be typed; avoid `any`
- **CSS Modules** — all styles go in `client/styles/`; never colocate `.css` files next to components
- **Server Components by default** — only add `"use client"` when necessary
- **No comments** unless the reason is non-obvious

Run the linter before pushing:

```bash
npm run lint
```

---

## Testing

- Tests live in `client/__tests__/`, mirroring the source structure
- Write assertion-based tests only — no snapshots
- Only test critical, user-facing behaviour

Run tests before opening a PR:

```bash
npm test
```

---

## Commit Messages

Use the following prefixes:

| Prefix | When to use |
|---|---|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `refactor:` | Code change that isn't a fix or feature |
| `test:` | Adding or updating tests |
| `chore:` | Build process, dependencies, config |
| `docs:` | Documentation only |

Example:

```
feat: add downloadable review report
```

---

## Pull Request Guidelines

- Keep PRs focused — one feature or fix per PR
- Fill out the PR description with what changed and why
- Ensure all CI checks pass before requesting a review
- Link any related issues in the PR description

---

## Reporting Issues

Open an issue on GitHub with:

- A clear description of the problem
- Steps to reproduce
- Expected vs actual behaviour
- Your environment (OS, Node version, browser)
