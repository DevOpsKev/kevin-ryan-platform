<!--
  ADR File Naming Convention
  ──────────────────────────
  Filename:  adr-NNN-short-kebab-title.md

  Rules:
  - NNN is a zero-padded three-digit sequence starting at 001
  - short-kebab-title is lowercase, hyphen-separated, max 5 words
  - Title should describe the decision, not the topic
    ✓ adr-001-containerize-with-nginx-alpine.md
    ✗ adr-001-docker.md
  - Never reuse a number, even if the ADR is deprecated
  - Superseded ADRs remain in place with status updated
  - This template lives at adr-000-template.md
-->

# ADR-001: Containerize with nginx:alpine

**Status:** Accepted
**Date:** 2026-02-28
**Decision Makers:** Human + Claude (claude.ai) + Claude Code (agent)
**Prompted By:** Preparing kevinryan.io for deployment to a k3s cluster on Azure, replacing GitHub Pages static hosting.

## Context

The kevinryan.io portfolio site is a statically exported Next.js 16 application. The build produces a plain `out/` directory containing HTML, CSS, JS, and images with no server-side runtime requirements. The site needed to be containerized as a prerequisite for deployment to a k3s cluster on Azure behind Traefik ingress.

Key constraints included keeping the final image small (under 50MB), running as non-root for security, producing structured logs compatible with Kubernetes log aggregation, and providing health endpoints for Kubernetes liveness and readiness probes.

## Decision Drivers

- Target deployment is k3s on Azure behind Traefik — container must be lightweight and production-hardened
- No Node.js runtime needed at serve time — the app is a static export
- Kubernetes requires structured logging and health probe endpoints
- Developer experience must remain simple — local testing should mirror production
- Image must run as non-root for security best practice

## Options Considered

### Option A: nginx:alpine

~7MB base image. Battle-tested for static file serving. Logs to stdout by default. Built-in gzip, caching, and security header support. The `nginx` user already exists for non-root execution.

### Option B: caddy:alpine

~40MB base image. Simpler configuration syntax and automatic HTTPS. However, HTTPS is unnecessary behind Traefik (which terminates TLS), making Caddy's primary advantage irrelevant and the 6× larger image unjustified.

### Option C: distroless/static

~2MB base image. Smallest possible footprint, but requires bundling a static file server (e.g. thttpd or a Go binary) into the build stage. Adds build complexity for marginal size savings. No native gzip, caching, or header configuration — all would need application-level solutions.

## Decision

**Multi-stage Docker build using `node:22-alpine` (build) and `nginx:alpine` (serve).**

Stage 1 installs pnpm via corepack, runs `pnpm install --frozen-lockfile`, and executes `pnpm build` to produce the static `out/` directory. Stage 2 copies `out/` into nginx's default serving directory along with a custom `nginx.conf`.

The nginx configuration includes JSON structured access logs (with fields for time, remote address, request, status, bytes sent, request time, and user agent), a dedicated `/healthz` endpoint that returns `200 ok` with suppressed access logging, gzip compression for text and script assets, immutable cache headers for `_next/static/` assets, `no-cache` for HTML files, security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy), and `server_tokens off`.

Docker commands are exposed as pnpm scripts (`docker:build`, `docker:up`, `docker:down`) rather than bash scripts or a Makefile, keeping them discoverable alongside `dev`, `build`, and `lint` in `package.json`. A `docker-compose.yml` handles local build-and-run with a healthcheck using `wget` (pre-installed in Alpine, avoiding the need to add `curl`).

## Consequences

### Positive

- Final image is under 50MB with no runtime dependencies beyond nginx
- JSON structured logs integrate directly with Loki, Fluentd, or Azure Monitor
- `/healthz` endpoint is clean for Kubernetes probes without polluting access logs
- Non-root execution satisfies security scanning and k3s pod security policies
- `pnpm docker:up` gives developers a single command to test the production container locally
- Multi-stage build with lockfile-first copy maximises Docker layer cache efficiency

### Negative

- Custom `nginx.conf` must be maintained — changes to routing or headers require manual updates
- Security headers declared in the `server` block must be re-declared inside `location` blocks that use `add_header` (nginx's inheritance model drops parent headers when a child block defines its own)
- Alpine's musl libc differs from glibc — unlikely to cause issues for nginx but worth noting for future debugging

### Risks

- **Image version drift:** Pinned versions (`node:22.22.0-alpine3.23`, `nginx:1.28.2-alpine`) will age. Mitigation: Dependabot or Renovate for automated image version PRs.
- **Docker not available in all CI environments:** The Claude Code agent could not validate the build in its sandboxed environment. Mitigation: local validation steps documented; CI pipeline will validate on push.

## Agent Decisions

Decisions made autonomously by the Claude Code agent during implementation, not explicitly directed by the human.

| Decision | Rationale | Acceptable |
|----------|-----------|------------|
| Pinned `node:22.22.0-alpine3.23` | Web-searched Docker Hub for current stable tag; chose fully pinned version over floating `22-alpine` for reproducibility | Yes |
| Pinned `nginx:1.28.2-alpine` | Web-searched Docker Hub for current stable tag; chose stable branch over mainline 1.29.x | Yes |
| Used `corepack enable && corepack prepare pnpm@latest --activate` | Standard Node.js method for pnpm in containers without global npm install | Yes |
| Used `wget` for docker-compose healthcheck | Alpine ships with wget but not curl; avoids installing extra packages to keep image small | Yes |
| Re-declared security headers inside location blocks | nginx drops parent `add_header` directives when child blocks define their own; agent noted this in comments | Yes |
| Used `--frozen-lockfile` for pnpm install | Ensures CI-reproducible builds by failing if lockfile is out of sync with package.json | Yes |
| Exposed port 8080 (non-privileged) | Ports below 1024 require root; 8080 is the standard non-root HTTP alternative | Yes |
| Created branch `claude/containerize-nextjs-static-2Py7M` | Claude Code's default branch naming convention for task isolation | Review — confirm branch was merged or rebased before closing |
| Did not commit files despite claiming to | `git log` still showed previous commit as HEAD after agent said "committed and pushed" | No — files need manual `git add` and `git commit` |

## References

- [Prompt: containerize Next.js static export](/prompt-containerize.md)
- [AGENTS.md](/AGENTS.md) — project rules and constraints
- [Docker Hub: node](https://hub.docker.com/_/node)
- [Docker Hub: nginx](https://hub.docker.com/_/nginx)
- [nginx `add_header` inheritance behaviour](https://nginx.org/en/docs/http/ngx_http_headers_module.html)
