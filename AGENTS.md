# Agent Rules <!-- tessl-managed -->

@.tessl/RULES.md follow the [instructions](.tessl/RULES.md)

## Project Summary

This is a static Next.js 16 portfolio site for Kevin Ryan (DevOps & AI Governance Consultant).

**Stack:**

- Next.js 16 (App Router)
- React 19
- TypeScript (strict mode)
- Tailwind CSS 4 + DaisyUI
- pnpm
- Static export to GitHub Pages

## Key Constraints

- No server-side runtime dependencies
- No `any` type without justification
- No custom CSS when Tailwind suffices
- All pages must be statically exportable
- Maximum component size: 200 lines
- One component per file

## Build Commands

```bash
pnpm install    # Install dependencies
pnpm dev        # Development server at localhost:3000
pnpm build      # Production build (static export to out/)
pnpm lint       # Run ESLint
```

## Directory Structure

```text
kevinryan-io/
├── app/                    # Next.js App Router pages
├── components/             # React components (one per file)
├── public/                 # Static assets
├── .tessl/                 # Tessl agent context (managed by Tessl CLI)
├── .github/workflows/      # CI/CD
└── out/                    # Build output (git-ignored)
```

## When Generating Code

1. Follow TypeScript strict mode conventions
2. Use Tailwind utilities for styling
3. Ensure static export compatibility
4. Include alt attributes on all images
5. Keep components under 200 lines

## Prohibited Patterns

- `any` type without inline justification comment
- `eslint-disable` without inline justification comment
- Custom CSS when Tailwind can achieve the same result
- Server components with runtime data fetching
- API routes, middleware, or server actions
- Inline styles (`style={{ }}`)
- Index as React key

## When Unclear

If a request conflicts with project constraints or specifications, flag the conflict rather than silently deviating. Ask for clarification.

## Pre-Commit Checklist

> **Note:** Husky + lint-staged enforces most of these checks automatically at commit time
> (ESLint, TypeScript type checking, markdownlint). The pre-push hook runs `pnpm build`.
> This checklist remains as a manual reference for anything the hooks don't catch.

Before suggesting code is complete:

- [ ] `pnpm build` would pass
- [ ] `pnpm lint` would pass
- [ ] No TypeScript errors
- [ ] All images have alt text
- [ ] No new dependencies without justification
- [ ] Components under 200 lines
