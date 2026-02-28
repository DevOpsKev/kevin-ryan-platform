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

# ADR-002: Private images via GHCR

**Status:** Accepted
**Date:** 2026-02-28
**Decision Makers:** Human + Claude (claude.ai)
**Prompted By:** ADR-001 established the container image; this ADR decides where to store and distribute it to the k3s cluster.

## Context

With the kevinryan.io container image built (ADR-001), the image needs to be stored somewhere the k3s cluster on Azure can pull from. The options range from a managed container registry to pushing images directly to the node. The decision affects cost, maintenance burden, image versioning, rollback capability, and CI/CD complexity.

Kevin is on GitHub Pro with an 8-week financial runway, making cost and maintenance overhead significant factors. The repository is private, so image visibility must match.

## Decision Drivers

- Zero additional cost during the financial runway period
- Minimal new infrastructure to create and maintain
- Private image support — the repository and images should not be publicly accessible
- Image versioning and rollback capability for production deployments
- Simple integration with the existing GitHub Actions CI/CD pipeline
- No vendor lock-in beyond what is already in play with GitHub

## Options Considered

### Option A: GitHub Container Registry (GHCR)

GitHub's built-in container registry at `ghcr.io`. Images default to private on first publish. Currently free for both storage and bandwidth. GitHub Pro includes 2GB storage and 10GB monthly transfer when pricing takes effect. The `GITHUB_TOKEN` available in Actions authenticates pushes with zero secret management. The k3s cluster pulls via an `imagePullSecret` referencing a personal access token or deploy key.

### Option B: Azure Container Registry (ACR)

Microsoft's managed registry. ACR Basic tier costs ~$5/month. Tighter network path to the Azure-hosted k3s node and native RBAC integration with Azure AD. However, it introduces a new Azure resource to provision via Bicep, a new cost line, and a new credential to manage — all for a single image that a personal portfolio site produces.

### Option C: Direct push via SSH

The GitHub Action builds the image, exports it as a tarball with `docker save`, SCPs it to the k3s node, and imports it with `k3s ctr images import`. No registry at all. Zero cost and zero external dependencies. However, there is no image versioning, no tag history, no rollback mechanism, and the approach breaks entirely when a second node is added to the cluster.

## Decision

**Store private container images in GitHub Container Registry (GHCR).**

The GitHub Action builds and pushes the image to `ghcr.io/devopskev/kevinryan-io:<tag>`. Images are private by default on GHCR, which matches the private repository. Container registry storage and bandwidth are currently free on all GitHub plans, and GitHub has committed to providing at least one month's notice before introducing charges. Even when pricing takes effect, the GitHub Pro plan's 2GB storage and 10GB transfer quota comfortably accommodates this use case — the nginx image is under 50MB, meaning 40+ tagged versions could exist before approaching the storage limit. Data transfer from GitHub Actions using `GITHUB_TOKEN` does not count against the transfer quota, so CI pushes are effectively free.

This eliminates the need to provision, configure, and pay for a separate registry. The k3s cluster authenticates to GHCR via an `imagePullSecret` containing a personal access token with `read:packages` scope.

## Consequences

### Positive

- Zero additional cost — no new Azure resource, no monthly fee
- Zero additional infrastructure to maintain — GHCR is already part of the GitHub ecosystem
- Private by default — images are not publicly accessible unless explicitly changed
- Full image versioning with tag history and the ability to roll back to any previous tag
- `GITHUB_TOKEN` handles authentication in Actions with no secret rotation needed for pushes
- Consistent with the existing development workflow — code and images live in the same platform
- Transfer from Actions to GHCR is free and does not count against plan quotas

### Negative

- External pull from k3s to GHCR counts against the 10GB monthly data transfer quota (when pricing takes effect). At ~50MB per pull, this allows ~200 pulls per month — more than sufficient for a single-node cluster
- Requires an `imagePullSecret` on the k3s cluster with a PAT scoped to `read:packages`; this PAT needs periodic rotation
- GHCR's free pricing for container images is explicitly described as subject to change, though with guaranteed advance notice

### Risks

- **GHCR pricing change:** GitHub could introduce charges for container registry storage/bandwidth. Mitigation: GitHub guarantees one month's notice; the Pro plan quota is already generous for this workload; migration to ACR Basic is straightforward if costs become material.
- **PAT expiration on k3s:** If the `imagePullSecret` PAT expires, the cluster cannot pull new images. Mitigation: use a fine-grained PAT with a long expiry, or automate rotation via a CronJob or external secret manager.
- **GHCR availability:** An outage at GitHub would prevent image pulls. Mitigation: k3s caches pulled images locally; only new deployments would be affected, not running pods.

## Agent Decisions

No autonomous agent decisions were required for this ADR. The decision was made collaboratively between the human and Claude in conversation. Implementation will involve agent decisions in a future session when the GitHub Action workflow and k3s manifests are authored — those will be captured in subsequent ADRs.

## References

- [ADR-001: Containerize with nginx:alpine](/adr-001-containerize-with-nginx-alpine.md)
- [GitHub Docs: Working with the Container registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [GitHub Docs: GitHub Packages billing](https://docs.github.com/en/billing/concepts/product-billing/github-packages)
- [GitHub Pricing](https://github.com/pricing)
