---
title: "ADR-010: ACR as primary registry, retain GHCR"
---

**Status:** Accepted
**Date:** 2026-02-28
**Decision Makers:** Human + AI
**Prompted By:** ADR-005 moved compute to Azure, ADR-007 moved PostgreSQL to Azure, and ADR-008 adopted Terraform with the `azurerm` provider. The K3s cluster needs a registry it can pull from via Managed Identity without stored credentials. GHCR requires a PAT-based `imagePullSecret` (ADR-002), which is the only expiring credential in the stack.

**Extends:** [ADR-002: Private images via GHCR](adr-002-private-images-via-ghcr.md) — GHCR remains as a secondary registry; ACR becomes the primary operational registry.

## Context

ADR-002 chose GHCR as the container registry when the infrastructure plan was GitHub-centric: GitHub Pages for hosting, GitHub Actions for CI, GHCR for images. The decision drivers were zero cost, zero infrastructure, and `GITHUB_TOKEN` authentication for pushes.

Since ADR-002, four decisions have shifted the infrastructure centre of gravity to Azure:

- ADR-005: Compute on an Azure Spot VM
- ADR-007: PostgreSQL on Azure Database Flexible Server
- ADR-008: Terraform managing all Azure resources with `azurerm`
- ADR-009: GitHub Actions authenticating to Azure via OIDC federation

The VM's system-assigned Managed Identity (ADR-005/008) can authenticate to any Azure service without stored credentials. For ACR, this means the K3s node pulls images with `AcrPull` role assignment — no `imagePullSecret`, no PAT, no rotation. GHCR requires a PAT stored as a Kubernetes secret, which ADR-002 acknowledged as a risk requiring periodic rotation.

The registry is the last piece outside the Azure boundary. Bringing the operational registry inside simplifies the authentication model, the Terraform resource graph, and the network path. However, GHCR retains value as a secondary registry: images published alongside the source code in GitHub serve as a public portfolio artefact and a fallback if ACR is unavailable.

## Decision Drivers

- **Eliminate PAT management:** GHCR pulls require a personal access token stored as an `imagePullSecret` on the K3s cluster. This PAT expires, must be rotated, and is a stored secret. Managed Identity authentication to ACR requires no stored credentials at all.
- **Same-network pulls:** ACR in North Europe and the K3s VM in North Europe communicate over Azure's backbone network. GHCR pulls traverse the public internet. Faster, more reliable, and no egress bandwidth concern.
- **Unified IaC:** ACR is an `azurerm_container_registry` resource in Terraform (ADR-008). GHCR cannot be managed by Terraform — it exists outside the resource graph.
- **Unified authentication model:** ADR-009 established OIDC federation for GitHub Actions to Azure. Push to ACR uses the same OIDC token. Push to GHCR uses `GITHUB_TOKEN` — a different auth mechanism for the same pipeline.
- **Cost acceptance:** The infrastructure budget (ADR-005/007) already accounts for ACR Basic at ~£4/month. ADR-002 optimised for zero cost when the financial runway was 8 weeks. The budget now includes managed Azure services; £4/month for the registry is not the marginal cost that breaks the budget.

## Options Considered

### Option A: Azure Container Registry (Basic tier)

Managed registry in North Europe. 10 GB storage, 2 webhooks. Image pull via Managed Identity (`AcrPull` role on the VM's system-assigned identity). Image push via OIDC from GitHub Actions (`AcrPush` role on the federated identity). Provisioned and managed by Terraform alongside all other Azure resources.

Cost: ~£4/month.

### Option B: Retain GHCR as sole registry (status quo)

Keep images in GHCR only. Currently free. `GITHUB_TOKEN` for pushes, PAT-based `imagePullSecret` for pulls.

Functionally works but introduces an authentication asymmetry: every other Azure service uses Managed Identity or OIDC, while image pulls use a PAT. The PAT is the only stored, expiring credential in the entire stack. GHCR is also the only infrastructure component that Terraform cannot manage — it sits outside the resource graph as an implicit dependency.

### Option D: ACR only, decommission GHCR

Move entirely to ACR and stop pushing to GHCR. Simplest registry topology.

Loses the public portfolio artefact — container images published alongside source code in GitHub demonstrate the full build pipeline to anyone browsing the repo. Also loses a fallback registry if ACR is unavailable during spot eviction recovery. The `GITHUB_TOKEN` push to GHCR is free and adds seconds to the pipeline, not minutes. The cost of retaining it is negligible.

### Option C: ACR with geo-replication (Premium tier)

ACR Premium enables geo-replication, content trust, and private endpoint support. ~£40/month.

Designed for multi-region production deployments. Single-node K3s in one region does not benefit from geo-replication. Premium features are wasted at this scale. 10× the cost of Basic for capabilities that serve no current or foreseeable need.

## Decision

**Add Azure Container Registry (Basic tier) in North Europe as the primary operational registry. Retain GHCR as a secondary registry for portfolio visibility and fallback.** Option A, with GHCR retained from ADR-002.

The pipeline dual-pushes every image: ACR is the registry the K3s cluster pulls from (via Managed Identity), GHCR is the registry the public sees alongside the source code (via `GITHUB_TOKEN`). K3s never pulls from GHCR — no PAT, no `imagePullSecret`.

### Specification

**ACR (primary — operational):**

| Parameter | Value |
|-----------|-------|
| **Service** | Azure Container Registry |
| **SKU** | Basic |
| **Region** | North Europe (co-located with VM and PostgreSQL) |
| **Storage** | 10 GB included |
| **Image naming** | `<acr-name>.azurecr.io/kevinryan-io:<short-sha>` |
| **Push auth** | OIDC federation (GitHub Actions → Azure AD → AcrPush role) |
| **Pull auth** | Managed Identity (VM system-assigned identity → AcrPull role) |
| **Terraform resource** | `azurerm_container_registry` + `azurerm_role_assignment` |
| **Estimated cost** | ~£4/month |

**GHCR (secondary — portfolio artefact):**

| Parameter | Value |
|-----------|-------|
| **Service** | GitHub Container Registry |
| **Image naming** | `ghcr.io/devopskev/kevinryan-io:<short-sha>` |
| **Push auth** | `GITHUB_TOKEN` (automatic in GitHub Actions) |
| **Pull auth** | Not used by K3s — public visibility for portfolio only |
| **Cost** | Free |

### Migration steps

1. Terraform provisions ACR and role assignments (ADR-008).
2. Update GitHub Actions application workflow (ADR-009) to dual-push: ACR (via OIDC) and GHCR (via `GITHUB_TOKEN`).
3. Update Kubernetes deployment manifests to reference ACR image paths.
4. Remove `imagePullSecret` from K3s manifests — Managed Identity handles ACR auth. GHCR pull credentials are not needed since K3s only pulls from ACR.
5. Verify Flux reconciliation pulls the new image from ACR.
6. Verify GHCR receives the same image tag for portfolio visibility.
7. Update ADR-002 status to **Extended by ADR-010** (GHCR retained as secondary registry).

### What changes in ADR-004

ADR-004 defined the image tagging strategy (git short SHA + `:latest`) and the push to GHCR. The tagging strategy does not change. The workflow gains a second push target (ACR) alongside the existing GHCR push. Both registries receive identical tags from the same build. ADR-004 remains valid; its workflow file is updated to add the ACR push step.

## Consequences

### Positive

- **Zero stored credentials for image pulls.** Managed Identity replaces the PAT-based `imagePullSecret`. No secret to create, rotate, or recover after spot eviction. This is the most significant operational improvement — it removes the only expiring credential in the entire stack
- **Unified authentication model.** Every Azure interaction — Terraform apply, image push, image pull, PostgreSQL connection — uses either OIDC federation or Managed Identity. No PATs for infrastructure operations
- **Terraform manages the full resource graph.** ACR, its role assignments, and its network configuration are declarative resources alongside the VM and PostgreSQL server. `terraform plan` shows the complete infrastructure state
- **Same-network image pulls.** ACR and the K3s VM communicate over Azure's backbone in North Europe. No public internet egress for image pulls. Faster and more reliable, particularly during spot eviction recovery when pods pull images during startup
- **Simplified eviction recovery.** After spot eviction, cloud-init configures Managed Identity. Flux starts, triggers pod creation, pods pull from ACR via Managed Identity. No `imagePullSecret` to recreate, no PAT to inject. One less thing that can fail during the self-healing sequence
- **GHCR as portfolio artefact.** Container images published alongside the source code in GitHub demonstrate the full build pipeline to anyone browsing the repo. This is a credibility signal that costs nothing — `GITHUB_TOKEN` pushes are free and automatic
- **GHCR as fallback registry.** If ACR is unavailable during spot eviction recovery, the K3s manifests could be temporarily pointed at GHCR. Not automated, but a documented recovery option that requires only a manifest change and a Flux reconciliation

### Negative

- **Costs £4/month.** GHCR alone was free. The £4 is already budgeted (ADR-005 resource table) but it is a real cost that ADR-002 avoided. At the current image size (~50 MB), 10 GB storage holds ~200 tagged versions — more than sufficient
- **Dual-push adds pipeline complexity.** The GitHub Actions workflow now authenticates to two registries (OIDC for ACR, `GITHUB_TOKEN` for GHCR) and pushes to both. This adds ~15–30 seconds to the pipeline and two additional steps in the workflow YAML. If one push fails and the other succeeds, the registries diverge until the next successful build
- **Two registries to reason about.** Developers (Kevin) must know that ACR is operational and GHCR is archival. Manifests must always reference ACR, never GHCR. This is a convention, not an enforced constraint — misconfiguration is possible
- **ACR Basic has no private endpoint support.** Images are pulled over ACR's public endpoint (authenticated via Managed Identity). The image contents are not sensitive (static site build output), so this is acceptable. Premium tier adds private endpoints if needed in future

### Risks

- **ACR outage blocks deployments.** If ACR is unavailable, new pods cannot pull images. Running pods are unaffected (images are cached on the node). Mitigation: after spot eviction, K3s image cache is cold — an ACR outage during recovery would prevent pods from starting. This is the same risk class as the PostgreSQL dependency (ADR-007); Cloudflare serves cached static assets while the cluster recovers
- **Managed Identity propagation delay.** After VM provisioning, the system-assigned Managed Identity and its role assignment may take 1–2 minutes to propagate through Azure AD. If K3s pods attempt to pull images before propagation completes, pulls fail. Mitigation: cloud-init should include a delay or readiness check before starting K3s workloads
- **ACR name globally unique.** The ACR name must be globally unique across all Azure customers. Choose a distinctive name (e.g., `kracr` or `kevinryanacr`) and define it as a Terraform variable to avoid hardcoding

## Agent Decisions

| Decision | Rationale | Acceptable |
|----------|-----------|------------|
| Systemd timer refreshes ACR credentials every 2 hours via `az acr login --expose-token` | K3s uses containerd, not Docker. The kubelet credential provider for ACR is not mature on K3s. A systemd timer writing credentials to `/etc/rancher/k3s/registries.yaml` and restarting K3s is the most reliable approach. ACR tokens expire after 3 hours; 2-hour refresh interval ensures continuity | Yes |
| Username `00000000-0000-0000-0000-000000000000` for ACR token auth in registries.yaml | ACR access tokens use this zero-GUID as the username convention. The actual authentication is in the token (password field) obtained via managed identity | Yes |
| K3s restart on credential refresh | Required for K3s to pick up updated registries.yaml. Brief restart (~5s) is acceptable for a single-node cluster serving cached static content via Cloudflare | Yes |
| ACR `admin_enabled = false` | Managed Identity provides pull access. Admin credentials are a security anti-pattern and unnecessary when MI is configured | Yes |

## References

- [ADR-002: Private images via GHCR](adr-002-private-images-via-ghcr.md) — extended by this ADR; GHCR retained as secondary registry
- [ADR-004: Push images to GHCR with SHA tagging](adr-004-ghcr-push-with-sha-tagging.md) — tagging strategy (unchanged, workflow updated)
- [ADR-005: Host on K3s with Azure Spot VM and Cloudflare CDN](adr-005-k3s-azure-spot-cloudflare-cdn.md) — Managed Identity on the VM
- [ADR-008: Infrastructure-as-Code with Terraform](adr-008-iac-with-terraform.md) — ACR as Terraform resource
- [ADR-009: CI/CD with GitHub Actions and Flux CD](adr-009-cicd-github-actions-flux.md) — pipeline consuming ACR
- [Azure Container Registry documentation](https://learn.microsoft.com/en-us/azure/container-registry/)
- [ACR authentication with Managed Identity](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-authentication-managed-identity)
- [ACR pricing](https://azure.microsoft.com/en-gb/pricing/details/container-registry/)
