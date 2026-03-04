---
title: "ADR-0003: Astro Starlight for Documentation Site"
description: Decision to use Astro Starlight to build the docs.kevinryan.io documentation site.
---

**Status:** Accepted
**Date:** 2025-03-01

## Context

The platform needs a documentation site at `docs.kevinryan.io` to host:

- Architecture Decision Records (ADRs)
- Platform guides and runbooks
- API and integration documentation

Requirements:

- Markdown-first authoring — engineers and AI agents write `.md` files, not React components
- Auto-generated navigation from directory structure
- Syntax-highlighted code blocks
- Mermaid diagram support
- Static output (no server runtime) — consistent with all other sites in the monorepo
- Themeable to match the Kevin Ryan brand (lime accent, Bebas Neue headings, Archivo body)

Options considered:

1. **Docusaurus** — React-based, more complex, larger bundle
2. **VitePress** — Vue-based, good DX but Vue adds a dependency outside the React monorepo
3. **Astro Starlight** — Astro-based, Markdown/MDX-first, excellent defaults, highly themeable via CSS custom properties
4. **MkDocs** — Python-based, excellent for docs-as-code but requires Python toolchain

## Decision

Use **Astro Starlight** (`@astrojs/starlight`) as the documentation framework.

Content lives in `docs/` at the repo root — humans and AI agents edit markdown there. The Astro Starlight site in `sites/docs-kevinryan-io/` is the build toolchain. A symlink (`src/content/docs → ../../../../docs`) enables local dev; the Dockerfile copies content directly to avoid symlink resolution issues in the build context.

## Consequences

**Positive:**

- Markdown-first: no framework knowledge required to add documentation
- Auto-generated sidebar from directory structure via `autogenerate`
- Built-in Shiki syntax highlighting and Mermaid support
- Excellent accessibility defaults out of the box
- Themeable via CSS custom properties — brand colours and fonts applied without framework overrides
- Static output aligns with the platform's zero-server-runtime constraint
- Node.js toolchain — consistent with the rest of the monorepo

**Negative:**

- Content symlink pattern requires developer awareness (symlink committed to repo)
- Dockerfile must `cp -r` docs content to work around Docker's symlink handling
- Adding Astro to the monorepo introduces a second JavaScript framework alongside Next.js

**Neutral:**

- `docs/` is decoupled from `sites/docs-kevinryan-io/` — content and build toolchain are separate concerns
- Astro builds output to `dist/` (not `out/` like Next.js) — Dockerfile updated accordingly
- `deploy-docs.yml` triggers on both `sites/docs-kevinryan-io/**` and `docs/**` changes
