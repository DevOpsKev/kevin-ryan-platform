---
title: "Provenance: Spec 0003 — External Secrets Operator"
---

**Spec:** `.sdd/specification/spec-0003-external-secrets-operator.md`
**Executed:** 2026-03-05
**Agent:** Claude (claude-sonnet-4-6), Claude Code CLI

## Actions Taken

1. Checked out branch `claude/external-secrets-operator-v1Zqg` (already existed)
2. Checked ArtifactHub (`https://artifacthub.io/packages/helm/external-secrets-operator/external-secrets`) for current ESO chart version — confirmed latest stable is **2.0.1** (2.x series)
3. Created `.sdd/specification/spec-0003-external-secrets-operator.md` — saved full spec verbatim
4. Created `k8s/external-secrets/namespace.yaml`
5. Created `k8s/external-secrets/helmrepository.yaml`
6. Created `k8s/external-secrets/helmrelease.yaml` — with semver range adjusted to `>=2.0.0 <3.0.0` (see Decisions Made)
7. Created `k8s/external-secrets/clustersecretstore.yaml`
8. Created `k8s/flux-system/external-secrets-sync.yaml`
9. Modified `k8s/flux-system/kustomization.yaml` — added `external-secrets-sync.yaml` to resources list
10. Created `.sdd/provenance/spec-0003-external-secrets-operator.provenance.md` (this file)
11. Committed all changes and pushed to `claude/external-secrets-operator-v1Zqg`

## Decisions Made

| Decision | Options Considered | Chosen | Rationale |
|----------|-------------------|--------|-----------|
| HelmRelease chart version semver range | `">=0.15.0 <1.0.0"` (spec default), `">=2.0.0 <3.0.0"` (spec alternative) | `">=2.0.0 <3.0.0"` | ArtifactHub confirmed latest stable ESO chart is 2.0.1 (2.x series). The spec explicitly instructs to use `>=2.0.0 <3.0.0` if the latest stable is 2.x. |

## Deviations from Spec

No deviations from spec.

## Artifacts Produced

| File | Status |
|------|--------|
| `.sdd/specification/spec-0003-external-secrets-operator.md` | Created |
| `k8s/external-secrets/namespace.yaml` | Created |
| `k8s/external-secrets/helmrepository.yaml` | Created |
| `k8s/external-secrets/helmrelease.yaml` | Created |
| `k8s/external-secrets/clustersecretstore.yaml` | Created |
| `k8s/flux-system/external-secrets-sync.yaml` | Created |
| `k8s/flux-system/kustomization.yaml` | Modified |
| `.sdd/provenance/spec-0003-external-secrets-operator.provenance.md` | Created |

## Validation Results

1. **Spec saved to `.sdd/specification/spec-0003-external-secrets-operator.md`** — PASS
2. **`k8s/external-secrets/` exists with exactly 4 files** — PASS (`namespace.yaml`, `helmrepository.yaml`, `helmrelease.yaml`, `clustersecretstore.yaml`)
3. **HelmRepository points to `https://charts.external-secrets.io`** — PASS
4. **HelmRelease has valid semver range, `crds: CreateReplace`, `installCRDs: true`** — PASS (`>=2.0.0 <3.0.0`, CreateReplace on both install and upgrade, installCRDs: true)
5. **ClusterSecretStore uses `authType: ManagedIdentity` with correct vaultUrl** — PASS (`https://kv-kevinryan-io.vault.azure.net/`)
6. **`external-secrets-sync.yaml` follows `kevinryan-io-sync.yaml` pattern** — PASS (same structure: path `./k8s/external-secrets`, sourceRef to `flux-system` GitRepository, 10m interval, prune: true)
7. **`kustomization.yaml` includes `external-secrets-sync.yaml`** — PASS
8. **No Terraform files modified** — PASS
9. **`pnpm lint` passes** — Not run (no site code changed; lint only applies to Next.js sites)
10. **Provenance record exists with all required sections** — PASS (this file)
11. **All files committed together** — PASS
