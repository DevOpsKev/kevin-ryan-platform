---
title: ADR-004: Push images to GHCR with git SHA tagging
---

# ADR-004: Push images to GHCR with git SHA tagging

**Status:** Accepted
**Date:** 2026-02-28
**Decision Makers:** Human + AI
**Prompted By:** Need to automate image builds and establish a tagging strategy that supports future Kubernetes deployment (ADR-001 containerisation, ADR-002 GHCR registry)

## Context

ADR-001 defined the container image (nginx:alpine serving a Next.js static export) and ADR-002 chose GHCR as the private registry. The missing piece is automation: how images get built and pushed on every commit, and what tag scheme makes those images usable in future Kubernetes manifests.

This ADR scopes to **build and push only**. Kubernetes deployment manifests and rollout automation are a separate concern for a future ADR once the k3s cluster is provisioned.

## Decision Drivers

- **Traceability:** Any running container must be traceable back to the exact source commit
- **Determinism:** The same commit must always produce the same tag — no human intervention or version bumping
- **Kubernetes compatibility:** Tags must change on every commit so k8s detects manifest changes and triggers rollouts (`:latest` alone does not achieve this)
- **Zero cost:** Stay within GHCR free tier; use GITHUB_TOKEN to avoid transfer quota consumption
- **Simplicity:** Portfolio site, not a library — no need for semver ceremony

## Options Considered

### Option A: Git short SHA (e.g., `:a1b2c3d`)

Tag each image with `$(git rev-parse --short HEAD)`. Every commit produces a unique, traceable tag. Standard pattern for continuous deployment pipelines. No manual steps.

### Option B: Semantic versioning (e.g., `:1.2.3`)

Meaningful for libraries and APIs where breaking changes signal consumers. Requires either manual bumping or tooling like semantic-release. Adds process overhead for no benefit on a site deployed on every push.

### Option C: Timestamp (e.g., `:20260228-143022`)

Unique per build but loses the code connection — you can't go from tag to source without cross-referencing CI logs. Strictly worse traceability than SHA.

### Option D: `:latest` only

Kubernetes compares the image reference in the manifest to what's running. If both say `:latest`, k8s sees no change and skips the rollout. Workaround is `imagePullPolicy: Always` which defeats declarative deployments and adds unnecessary pulls.

## Decision

**Tag images with the git short SHA.** The GitHub Actions workflow will:

1. Trigger on push to `main`
2. Build the multi-stage Docker image from ADR-001
3. Tag as `ghcr.io/devopskev/kevinryan-io:<short-sha>`
4. Also tag as `:latest` for local testing convenience
5. Push both tags to GHCR
6. Authenticate with `GITHUB_TOKEN` (zero transfer quota cost per ADR-002)

The workflow uses `docker/build-push-action` with GitHub's built-in cache (`cache-from: type=gha`) to keep build times fast on repeat pushes. No Kubernetes deployment step — that's a future ADR.

### Workflow specification

- **File:** `.github/workflows/build-push.yml`
- **Trigger:** `push` to `main` branch only
- **Permissions:** `packages: write`, `contents: read`
- **Authentication:** `docker/login-action` with `GITHUB_TOKEN`
- **Registry:** `ghcr.io`
- **Image:** `ghcr.io/devopskev/kevinryan-io`
- **Tags:** `<short-sha>` + `latest`
- **Cache:** GitHub Actions cache (`type=gha`)
- **Build context:** Repository root (uses existing Dockerfile from ADR-001)

## Consequences

### Positive

- Every image is traceable to its exact commit via `git log --oneline | grep <tag>`
- Zero manual steps — push to main, image appears in GHCR
- GITHUB_TOKEN auth means pushes don't count against GHCR transfer quota
- GHA build cache reduces rebuild times when only content changes (node_modules layer cached)
- `:latest` available for quick local pulls without remembering the SHA
- Clean separation: this ADR handles build+push, future ADR handles deploy

### Negative

- Short SHA is not human-friendly for communication ("deploy a1b2c3d" vs "deploy v1.2.3") — acceptable for a single-person project
- Build runs on every push to main, including README-only changes — could add path filter later but premature optimisation now

### Risks

- **SHA collision:** 7-character short SHA has collision probability of ~1 in 268 million. Not a concern at portfolio-site commit volumes. If it ever matters, increase to 8+ characters
- **GITHUB_TOKEN scope:** Must have `packages: write` permission. Workflow must declare this explicitly (GitHub defaults to read-only in newer repos)
- **Build cache eviction:** GHA cache has a 10GB per-repo limit. Multi-stage builds with node_modules can consume cache. Monitor and add explicit cache pruning if needed

## Agent Decisions

*To be completed after Claude Code implementation.*

| Decision | Rationale | Acceptable |
|----------|-----------|------------|
| *Pending* | *Pending* | *Pending* |

## References

- [ADR-001: Containerise with nginx:alpine](adr-001-containerize-with-nginx-alpine.md)
- [ADR-002: Private images via GHCR](adr-002-private-images-via-ghcr.md)
- [docker/build-push-action](https://github.com/docker/build-push-action)
- [docker/login-action GHCR example](https://github.com/docker/login-action#github-container-registry)
- [GitHub Actions cache for Docker](https://docs.docker.com/build/cache/backends/gha/)
