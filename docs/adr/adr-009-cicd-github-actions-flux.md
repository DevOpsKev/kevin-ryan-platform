---
title: "ADR-009: CI/CD with GitHub Actions and Flux CD"
---

**Status:** Accepted
**Date:** 2026-02-28
**Decision Makers:** Human + AI
**Prompted By:** ADR-004 established image builds with SHA tagging. ADR-005 and ADR-008 defined the compute layer and IaC framework. The missing piece is how code changes flow from Git to running containers on K3s, and how infrastructure changes are applied safely.

## Context

The current CI/CD pipeline (ADR-004) builds a Docker image on push to main, tags it with the git short SHA, and pushes it to the container registry. The pipeline ends there — there is no deployment step. The image exists in the registry but nothing tells K3s to run it.

Two distinct change types need separate deployment strategies:

**Application changes** (site code, content, styles) are frequent, low-risk, and should deploy automatically. A bad container image is caught by Kubernetes health checks and rolled back. The feedback loop must be fast — push to main, site updates within minutes.

**Infrastructure changes** (Terraform — VM size, PostgreSQL config, NSG rules, Cloudflare DNS) are infrequent, high-risk, and must be reviewed before applying. A bad Terraform apply can delete the database, change the VM region, or break networking. Solo operators lack the PR review safety net that teams have — the pipeline must compensate with a mandatory human gate.

ADR-005's spot eviction model adds a further requirement: after VM eviction and respawn, the cluster must self-heal to the correct state without a human triggering a pipeline. The deployment mechanism must be reconciliation-based, not push-based.

## Decision Drivers

- **Self-healing after spot eviction:** When the VM respawns and K3s bootstraps, workloads must converge to the desired state automatically, without manual pipeline runs or SSH intervention.
- **Git as single source of truth:** The Git repo must fully describe both infrastructure (Terraform) and workload state (Kubernetes manifests). Anyone reading the repo can determine what is deployed.
- **Auditability:** Every deployment must be traceable to a Git commit. Image SHA → manifest commit → source commit. Revert is `git revert`, not `kubectl rollback`.
- **Safety for infrastructure changes:** Terraform plan must be reviewable before apply. No unattended infrastructure mutations.
- **Minimal operational overhead:** Solo operator. The pipeline must not require babysitting, custom runners, or infrastructure of its own beyond GitHub Actions.
- **Platform continuity:** GitHub Actions is already in use (ADR-004). No platform migration.

## Options Considered

### Option A: GitHub Actions (build + plan) + Flux CD (deploy)

Two GitHub Actions workflows:

1. **Application workflow:** Push to main → build image → push to ACR with SHA tag → update image tag in Kubernetes manifest file in Git → commit. Flux CD, running inside K3s, detects the manifest change and applies it to the cluster.
2. **Infrastructure workflow:** Push to `infra/` → `terraform plan` → post plan as workflow summary → manual approval gate → `terraform apply`.

Flux CD runs as a lightweight controller (~100 MB RAM) on the K3s node. It continuously reconciles the cluster state against the Kubernetes manifests in a designated Git path. After spot eviction, when K3s restarts, Flux starts, reads the latest manifests from Git, and applies them — the cluster self-heals without any external trigger.

### Option B: GitHub Actions (build) + kubectl set image (deploy)

GitHub Actions builds the image, then SSHs into the VM or uses a stored kubeconfig to run `kubectl set image`. Simple and direct.

Does not self-heal after spot eviction. If the VM respawns, the cluster starts with whatever manifests cloud-init applied at bootstrap — which may be stale. A GitHub Actions workflow would need to be re-triggered manually, or cloud-init would need to pull and apply the latest manifests, duplicating what Flux does but without continuous reconciliation.

Also requires exposing port 6443 (K3s API) to GitHub Actions runners or storing a kubeconfig as a GitHub secret. Both are security surface area that Flux eliminates — Flux pulls from Git, it doesn't require inbound access.

### Option C: GitHub Actions (build) + ArgoCD (deploy)

Same GitOps model as Option A but with ArgoCD instead of Flux. ArgoCD provides a web UI, API server, Redis cache, and repo server — 3–4 pods consuming 300–500 MB RAM.

The web UI is the primary differentiator. For a team needing deployment visibility across multiple services, it's valuable. For a solo operator with Grafana already providing pod status via Loki, it's redundant overhead. The RAM cost (300–500 MB) is significant on a single-node cluster — nearly as much as the entire observability stack from ADR-006.

### Option D: Flux CD image automation (Flux updates tags directly)

Flux's image automation controller watches ACR for new tags matching a pattern, writes the updated tag back to the manifest in Git, and reconciles. Eliminates the GitHub Actions step that updates the manifest.

Adds two more Flux controllers (image-reflector-controller, image-automation-controller) and requires Flux to have Git write access. The tag update becomes an automated Flux commit rather than a GitHub Actions commit — harder to trace in the Actions UI and mixes concerns (the CI platform builds, but a cluster controller modifies the repo). The explicit GitHub Actions approach in Option A keeps the boundary clean: CI writes to Git, Flux reads from Git.

## Decision

**GitHub Actions for build, registry push, manifest update, and Terraform plan/apply. Flux CD for cluster reconciliation.** Option A.

### Application pipeline

```text
  Push to main
       │
       ▼
  ┌─────────────────────────────────┐
  │  GitHub Actions                  │
  │  .github/workflows/deploy.yml   │
  │                                  │
  │  1. Build Docker image           │
  │  2. Tag with git short SHA       │
  │  3. Push to ACR                  │
  │  4. Update image tag in          │
  │     k8s/kevinryan-io/deploy.yaml │
  │  5. Commit + push manifest       │
  └─────────────────────────────────┘
       │
       │  Git commit (manifest change)
       ▼
  ┌─────────────────────────────────┐
  │  Flux CD (inside K3s)           │
  │                                  │
  │  source-controller watches repo  │
  │  kustomize-controller detects    │
  │    manifest change               │
  │  Applies to cluster              │
  │  Kubernetes rolls out new pods   │
  └─────────────────────────────────┘
```

**Trigger:** Push to `main` (path filter: exclude `infra/`, `docs/`, `*.md`).

**Steps:**

1. Checkout repo.
2. Authenticate to ACR via OIDC (Azure AD workload identity federation — no long-lived secrets).
3. Build Docker image (multi-stage, from ADR-001 Dockerfile).
4. Tag as `<acr-login-server>/kevinryan-io:<short-sha>` + `:latest`.
5. Push to ACR.
6. Update the `image:` field in `k8s/kevinryan-io/deployment.yaml` with the new SHA tag (sed or yq).
7. Commit and push the manifest change to `main`.

Flux detects the manifest commit and applies the updated deployment. Kubernetes performs a rolling update. If the new pod fails health checks, Kubernetes holds the old replica.

**The same workflow pattern repeats for sddbook.com and aiimmigrants.com** — each site has its own deployment manifest in `k8s/<site>/`, its own Dockerfile, and its own image in ACR. GitHub Actions builds and pushes each independently. Flux reconciles all of them.

### Infrastructure pipeline

```text
  Push to infra/
       │
       ▼
  ┌──────────────────────────────────┐
  │  GitHub Actions                   │
  │  .github/workflows/terraform.yml  │
  │                                   │
  │  1. terraform init                │
  │  2. terraform plan                │
  │  3. Post plan to workflow summary │
  │  4. ── Manual approval gate ──    │
  │  5. terraform apply               │
  └──────────────────────────────────┘
```

**Trigger:** Push to `main` (path filter: `infra/**`).

**Steps:**

1. Checkout repo.
2. Authenticate to Azure via OIDC (workload identity federation).
3. Authenticate to Cloudflare via API token (GitHub secret).
4. `terraform init` with Azure Storage Account backend (ADR-008).
5. `terraform plan -out=tfplan`.
6. Post human-readable plan output to the workflow summary.
7. **Manual approval gate** via GitHub Actions `environment` with required reviewers (Kevin). The workflow pauses until approval.
8. On approval: `terraform apply tfplan`.

The plan output in the workflow summary serves as the review artefact. Kevin reads the plan, confirms the changes are intentional, and approves. If the plan shows unexpected changes (e.g., a force-replacement of the PostgreSQL server), he rejects and investigates.

### Flux CD specification

| Parameter | Value |
|-----------|-------|
| **Components** | source-controller, kustomize-controller |
| **Not installed** | image-reflector-controller, image-automation-controller, helm-controller, notification-controller |
| **Git source** | `github.com/DevOpsKev/kevinryan-io`, branch `main`, path `k8s/` |
| **Reconciliation interval** | 1 minute |
| **Estimated RAM** | ~100 MB |
| **Bootstrap** | `flux bootstrap github` via cloud-init during K3s setup |

Flux is bootstrapped onto the cluster during initial VM provisioning (cloud-init). On spot eviction and respawn, cloud-init re-bootstraps K3s and Flux. Flux reads the latest manifests from Git and applies them — the cluster converges to the desired state without any external trigger.

### Authentication model

| Credential | Mechanism | Secret storage |
|------------|-----------|----------------|
| Azure (GitHub Actions → ACR, Terraform) | OIDC workload identity federation | None — federated token, no stored secret |
| Cloudflare (GitHub Actions → Terraform) | API token | GitHub Actions secret |
| ACR (K3s → image pull) | Managed Identity (VM system-assigned) | None — Azure handles token refresh |
| Git (Flux → repo read) | Deploy key (read-only) | Kubernetes secret on cluster, created by `flux bootstrap` |
| Git (GitHub Actions → manifest push) | `GITHUB_TOKEN` (default) | Automatic |

No long-lived Azure credentials anywhere. OIDC federation for GitHub Actions, Managed Identity for the VM. The only stored secret is the Cloudflare API token.

## Consequences

### Positive

- **Self-healing cluster:** After spot eviction, Flux reconciles the cluster to the latest Git state without human intervention. This is the primary architectural benefit and the reason Flux exists in this stack
- **Full audit trail:** Every deployment is a Git commit. Source SHA → image tag → manifest commit. `git log k8s/kevinryan-io/deployment.yaml` shows the complete deployment history
- **Revert is `git revert`:** Rolling back a bad deployment means reverting the manifest commit. Flux detects the change and applies the previous image tag. No `kubectl rollback` needed
- **Gated infrastructure changes:** Terraform never applies unattended. The manual approval gate compensates for the lack of team PR review
- **No inbound access to K3s API:** Flux pulls from Git (outbound). GitHub Actions never needs to reach port 6443. NSG can block inbound API access entirely
- **Minimal secret surface:** OIDC federation eliminates long-lived Azure credentials. Only the Cloudflare API token is a stored secret
- **Flux is CNCF graduated:** Production-grade, well-maintained, and recognised in enterprise Platform Engineering conversations

### Negative

- **Manifest commit noise:** Every application deployment creates a manifest-update commit on `main`. These are automated, mechanical commits that clutter `git log`. Mitigation: use a consistent commit message prefix (e.g., `[deploy] kevinryan-io: a1b2c3d`) so they can be filtered with `git log --invert-grep`
- **Two-step deploy latency:** GitHub Actions pushes the manifest → Flux polls Git (up to 1-minute interval) → Kubernetes rolls out. Total latency from push to live is 2–4 minutes, not the near-instant of a direct kubectl. Acceptable for portfolio sites
- **Flux adds a component to the cluster:** Another controller to monitor, another thing that can fail. If Flux's source-controller crashes, deployments stop flowing. Mitigation: Loki captures Flux controller logs; Grafana dashboard surfaces Flux health
- **GitHub Actions environment approval is manual:** Kevin must actively approve every Terraform apply. If he's unavailable, infrastructure changes queue indefinitely. Acceptable for a solo operator — this is a feature, not a bug

### Risks

- **Manifest commit triggers infinite loop:** GitHub Actions pushes a manifest commit to `main`, which triggers the application workflow again (it also triggers on push to `main`). Mitigation: path filter on the application workflow excludes `k8s/`. The manifest commit only touches `k8s/`, so it does not re-trigger the build. This must be tested during implementation
- **Flux Git credentials expire:** The deploy key created by `flux bootstrap` does not expire, but if the repo is transferred or the key is revoked, Flux silently stops reconciling. Mitigation: Flux surfaces reconciliation errors as Kubernetes events and conditions; Loki ingests these; Grafana alerts on Flux reconciliation failures
- **OIDC federation misconfiguration:** If the Azure AD app registration for GitHub Actions OIDC is misconfigured, both the application and infrastructure pipelines fail to authenticate. Mitigation: the OIDC configuration is part of the Terraform bootstrap (ADR-008) and is tested by the first pipeline run. Document the federation setup in the repo README
- **Manifest update conflict:** If two site builds run concurrently and both try to commit manifest changes, one will fail on push (non-fast-forward). Mitigation: use `concurrency` groups in GitHub Actions to serialise deployments per site, or retry with rebase on conflict

## Agent Decisions

| Decision | Rationale | Acceptable |
|----------|-----------|------------|
| Flux bootstrap via cloud-init `runcmd` with `--token-auth` | Simplest bootstrap method for a single-node cluster. Token is passed as a sensitive Terraform variable into cloud-init template. Deploy key created automatically by Flux | Yes |
| Deploy workflow uses `paths-ignore` with `k8s/**` to prevent infinite loop | Manifest commit only touches `k8s/` files, which are excluded from the deploy trigger. Verified in workflow YAML path filter | Yes |
| Concurrency group `deploy-kevinryan-io` with `cancel-in-progress: false` | Serialises deployments to prevent manifest commit conflicts. Concurrent builds queue rather than cancel to avoid skipped deployments | Yes |
| All GitHub Actions pinned to full commit SHA | Meets security requirement from task spec. Version comments added for maintainability | Yes |
| Terraform variables passed via `TF_VAR_*` environment variables in CI | Cleaner than generating tfvars files in CI. Secrets come from GitHub Actions secrets | Yes |

## References

- [ADR-002: Private images via GHCR](adr-002-private-images-via-ghcr.md) — registry (transitioning to ACR)
- [ADR-004: Push images to GHCR with SHA tagging](adr-004-ghcr-push-with-sha-tagging.md) — image build and tagging strategy
- [ADR-005: Host on K3s with Azure Spot VM and Cloudflare CDN](adr-005-k3s-azure-spot-cloudflare-cdn.md) — compute layer and eviction model
- [ADR-008: Infrastructure-as-Code with Terraform](adr-008-iac-with-terraform.md) — Terraform resources and state backend
- [Flux CD documentation](https://fluxcd.io/flux/)
- [Flux bootstrap for GitHub](https://fluxcd.io/flux/installation/bootstrap/github/)
- [GitHub Actions OIDC with Azure](https://learn.microsoft.com/en-us/azure/developer/github/connect-from-azure-openid-connect)
- [GitHub Actions environments and approvals](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)
