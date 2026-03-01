# ADR-013: Monorepo with pnpm Workspaces

**Status:** Accepted
**Date:** 2026-03-01
**Decision Makers:** Human + AI
**Prompted By:** The need to host multiple sites (kevinryan.io, sddbook.com, aiimmigrants.com, distributed-equity.org) on the same K3s cluster (ADR-005) with shared infrastructure (ADR-008) and CI/CD (ADR-009). Managing each site as a separate repository creates unnecessary operational overhead for a solo operator and fragments agent context across disconnected codebases.

## Context

The repository currently hosts a single Next.js static site (kevinryan.io) alongside shared infrastructure: Terraform modules, Kubernetes manifests, GitHub Actions workflows, and Flux CD configuration. Three additional sites need to be added — sddbook.com, aiimmigrants.com, and distributed-equity.org — all simple static sites deployed to the same K3s cluster.

Two distinct categories of asset exist in this platform:

**Presentation and infrastructure** (this repo) — the sites themselves, their Dockerfiles, Kubernetes manifests, Terraform modules, CI/CD pipelines, and observability configuration. These share a technology stack (Next.js, Tailwind, DaisyUI), a deployment target (K3s via Flux), a container registry (ACR), and a DNS provider (Cloudflare via Terraform). Changes to shared infrastructure affect all sites.

**Content and publishing** (separate repos) — the book generation pipelines for SDD, AI Immigrants, and Distributed Equity. These are fundamentally different systems: Pandoc, Python build scripts, EPUB/PDF output, Azure Blob Storage hosting. Their CI/CD is content-pipeline oriented (generate artifacts, push to blob storage), not container-oriented. They have no dependency on Next.js, Kubernetes, or any of the platform infrastructure.

The question is whether the presentation sites belong in one repository or four, given that the content pipelines are already correctly separated.

## Decision Drivers

- **Agent context coherence:** AI coding agents (Claude Code, Tessl) operate within a single repository context. With separate repos, an agent working on sddbook.com cannot see how Traefik IngressRoutes, Dockerfiles, or shared components are structured for kevinryan.io. In a monorepo, the agent has full context across all sites, infrastructure, and deployment manifests in a single context window. ADRs, AGENTS.md, and CLAUDE.md become a single shared knowledge base rather than duplicated and divergent copies.
- **Operational overhead for a solo operator:** Context-switching between four repositories — each with its own dependencies, CI/CD, lockfiles, and git history — is disproportionate overhead when the sites share the same stack and deployment target. With an 8-week financial runway, every hour spent on repository housekeeping is an hour not spent on income-generating work.
- **Infrastructure is already shared:** Terraform modules, Kubernetes namespaces, Flux configuration, Cloudflare DNS, and ACR all live in this repo and serve all sites. Adding a new site means adding a k8s subdirectory, a Terraform DNS entry, and a GitHub Actions workflow — all of which naturally belong alongside the existing infrastructure, not in a separate repo that references it.
- **Consistent patterns across sites:** Shared Dockerfile patterns, nginx configurations, Tailwind/DaisyUI theming, and component libraries are easier to maintain when they're in the same workspace. A security fix to the nginx config or a Tailwind version bump applies once, not four times.
- **Separation from content pipelines:** The book repos (sddbook, aiimmigrants, distributed-equity content) produce downloadable artifacts via Pandoc/Python pipelines that have nothing in common with the Next.js/Docker/K8s stack. Mixing content pipelines into this repo would dilute agent context rather than enhance it. The content repos stay separate; the presentation sites consolidate here.

## Options Considered

### Option A: pnpm Workspace Monorepo

Restructure the repository into a pnpm workspace with site packages under `sites/` and shared infrastructure at the root:

```text
kevinryan-io/
├── sites/
│   ├── kevinryan-io/       # Next.js app, Dockerfile, nginx.conf
│   ├── sddbook-com/
│   ├── aiimmigrants-com/
│   └── distributed-equity-org/
├── packages/               # Shared components (future)
│   └── shared-ui/
├── infra/                  # Terraform (shared)
├── k8s/                    # Kubernetes manifests (per-site subdirs)
├── .github/workflows/      # CI/CD (per-site + shared)
├── .adr/                   # Architecture decisions
├── AGENTS.md
└── pnpm-workspace.yaml
```

Each site is an independent pnpm package with its own `package.json`, build scripts, Dockerfile, and nginx configuration. The workspace root owns git hooks, lint-staged, infrastructure, and workspace-level scripts. GitHub Actions workflows use `paths:` filters to trigger per-site builds. Flux reconciles per-site k8s manifests independently.

### Option B: Separate Repositories per Site

Each site gets its own repository: `kevinryan-io`, `sddbook-com`, `aiimmigrants-com`, `distributed-equity-org`. Shared infrastructure either lives in a fifth repository or is duplicated.

This is the standard approach for teams where different groups own different services. It provides complete isolation — a bad merge to sddbook.com cannot affect kevinryan.io under any circumstances. Each repo has its own CI/CD, its own release cadence, and its own access controls.

For a solo operator running four static sites on the same cluster, this isolation is unnecessary. The sites share an owner, a stack, a deployment target, and an infrastructure layer. The duplication cost (four AGENTS.md files, four sets of git hooks, four Terraform references, four lockfiles to maintain) outweighs the isolation benefit. Agent context is fragmented — a pattern solved in one repo must be manually replicated to the others.

### Option C: Git Subtree or Submodule Composition

Keep separate repositories but compose them into a parent repository via git subtrees or submodules. Agents see the full tree; sites can still be worked on independently.

Subtrees create merge complexity that scales poorly and make git history difficult to reason about. Submodules require explicit version pinning and syncing, adding operational steps to every change. Both approaches are fragile for a solo operator — a forgotten `git submodule update` or a subtree merge conflict becomes a time sink. The complexity exists to serve a use case (independent team ownership with shared visibility) that doesn't apply here.

## Decision

**pnpm workspace monorepo.** Option A.

The restructure proceeds in stages to minimise risk:

**Stage 1:** Move the existing kevinryan.io app into `sites/kevinryan-io/`. Update CI/CD, Docker build contexts, and workspace configuration. Verify the full pipeline — build, lint, Docker, deploy — works identically. No functional changes.

**Stage 2:** Add new sites as additional workspace packages under `sites/`. Each site gets its own GitHub Actions workflow with `paths:` trigger scoping, its own k8s namespace and manifests, and its own Dockerfile.

**Stage 3 (optional):** Extract shared components (footer, theme, common utilities) into `packages/shared-ui/` if patterns emerge across sites. This is deferred until at least two sites share concrete components — premature extraction creates coupling without benefit.

### Workspace structure

The root `package.json` becomes a workspace root (`kevinryan-platform`) with delegating scripts. Each site package owns its own Next.js dependencies, build scripts, and configuration. Husky and lint-staged remain at the root since git hooks fire from the repository root.

### CI/CD scoping

GitHub Actions workflows shift from `paths-ignore` (exclude infrastructure) to `paths` (include only the relevant site directory). This is essential for the monorepo — each site's deploy workflow must trigger only on changes to its own directory, not on changes to other sites. The Terraform workflow is unchanged; it already triggers on `infra/**`.

The Flux CD reconciliation model (ADR-009) is unaffected. Each site has its own k8s manifest subdirectory. Flux watches the entire `k8s/` path and applies changes per-namespace. Adding a new site means adding a new subdirectory under `k8s/`, which Flux picks up automatically.

### What stays separate

The book content and publishing pipeline repositories (sddbook, aiimmigrants, distributed-equity) remain independent. The relationship is one-directional: book repos produce downloadable artifacts (EPUB, PDF) hosted on Azure Blob Storage; the monorepo sites link to those artifacts. The presentation sites never depend on the book build pipelines, and the book repos never depend on the platform infrastructure.

## Consequences

### Positive

- **Unified agent context:** A single AGENTS.md, CLAUDE.md, and ADR directory serves all sites. Agents see the full platform — infrastructure, deployment, and all sites — in one context window. Patterns established for one site (Traefik routing, Dockerfile optimisation, nginx security headers) are immediately available as reference for new sites
- **Single dependency management surface:** One `pnpm-lock.yaml`, one Renovate/Dependabot configuration, one set of version bumps. Security patches to shared dependencies (Next.js, Tailwind) apply once
- **Infrastructure colocation:** Terraform modules, Kubernetes manifests, and CI/CD workflows live alongside the applications they serve. Adding a new site is a single PR touching `sites/`, `k8s/`, `.github/workflows/`, and optionally `infra/modules/cloudflare/`
- **Reduced context-switching:** `cd sites/sddbook-com && pnpm dev` instead of finding the right repo, checking the right branch, and remembering the right commands. Every site follows the same conventions
- **Atomic cross-site changes:** A shared nginx security header update, a Tailwind version bump, or an AGENTS.md update is a single commit, not four PRs across four repos

### Negative

- **Blast radius on shared configuration:** A broken root `pnpm-workspace.yaml`, a bad Husky hook, or a misconfigured lint-staged rule affects all sites simultaneously. Mitigation: the root configuration is minimal (workspace definition, git hooks, lint-staged) and changes infrequently. Site-specific configuration lives in each site's own directory
- **Lockfile churn:** A dependency change in one site regenerates the shared `pnpm-lock.yaml`, creating noise in PRs for other sites. Mitigation: pnpm's workspace protocol and lockfile format handle this efficiently — only the changed package's resolution entries update. Commit messages indicate which site triggered the change
- **Repository size growth:** Four sites' static assets (images, PDFs, EPUBs) accumulate in one repo. Mitigation: the current repo is 2.9 MB in `public/`. Static sites with reasonable asset management will remain well under git's comfort zone. If assets grow significantly, Git LFS can be added per-path

### Risks

- **pnpm workspace resolution edge cases:** Hoisted dependencies or phantom dependencies could cause a site to build locally but fail in CI where only its own dependencies are installed. Mitigation: each site's Dockerfile copies only its own `package.json` and `pnpm-lock.yaml`, running `pnpm install --frozen-lockfile` in isolation. CI builds catch resolution issues that local development might mask
- **GitHub Actions path filter gaps:** A change to a shared file (root tsconfig, workspace config) might not trigger any site-specific workflow. Mitigation: add shared paths to each site workflow's trigger, or create a separate workflow for workspace-level changes that builds all sites
- **Repo rename confusion:** The repository is currently named `kevinryan-io`, which implies a single-site repo. The monorepo should eventually be renamed (e.g., `kr-platform`), but this requires updating Flux bootstrap configuration, GitHub Actions references, and container image source labels. Mitigation: defer rename to a separate ADR. The repo name does not affect functionality — Flux uses the git URL, not the repo name, and image names are independent of the repo name

## Agent Decisions

*To be completed during implementation — this section will capture autonomous decisions made by the coding agent during the Stage 1 restructure.*

| Decision | Rationale | Acceptable |
|----------|-----------|------------|
| *Pending Stage 1 implementation* | | |

## References

- [ADR-005: Host on K3s with Azure Spot VM and Cloudflare CDN](adr-005-k3s-azure-spot-cloudflare-cdn.md) — compute and deployment target
- [ADR-008: Infrastructure-as-Code with Terraform](adr-008-iac-with-terraform.md) — shared Terraform modules
- [ADR-009: CI/CD with GitHub Actions and Flux CD](adr-009-cicd-github-actions-flux.md) — deployment pipeline and GitOps model
- [ADR-011: Git hooks with Husky and lint-staged](adr-011-git-hooks-husky-lint-staged.md) — root-level git hooks
- [pnpm Workspaces documentation](https://pnpm.io/workspaces)
