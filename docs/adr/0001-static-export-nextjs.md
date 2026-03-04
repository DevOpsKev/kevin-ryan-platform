---
title: "ADR-0001: Static Export with Next.js for Portfolio Site"
description: Decision to use Next.js with static export for the kevinryan.io portfolio site.
---

**Status:** Accepted
**Date:** 2024-11-01

## Context

The kevinryan.io portfolio site needs to:

- Display a professional profile for a DevOps & AI Governance consultant
- Be fast, reliable, and cheap to host
- Support modern React component development with TypeScript
- Deploy as static files to a CDN or simple web server

The site has no dynamic server-side requirements — all content is known at build time. A server-rendered Next.js app would introduce operational complexity (Node.js runtime, memory management) with no benefit for a static portfolio.

## Decision

Use **Next.js 16 (App Router) with `output: 'export'`** to generate a fully static site at build time.

- Framework: Next.js 16 with App Router
- Styling: Tailwind CSS 4 + DaisyUI
- Language: TypeScript (strict mode)
- Deployment: Static HTML/CSS/JS served by nginx

## Consequences

**Positive:**

- Zero server runtime — nginx serves pre-built HTML
- Excellent developer experience with React 19 and TypeScript strict mode
- Tailwind CSS enables rapid, consistent styling without custom CSS
- Static output is portable: works on any web server, CDN, or object storage
- Small resource footprint in Kubernetes (5m CPU / 8Mi memory requests)

**Negative:**

- No server-side data fetching at request time — all data must be available at build time
- Rebuilding the image is required to update content
- No API routes, middleware, or server actions

**Neutral:**

- All pages must be statically exportable — dynamic routes require `generateStaticParams`
- Images must use `unoptimized: true` or a compatible loader for static export
