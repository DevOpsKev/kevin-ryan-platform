# Provenance: Spec 0003a — Fix ESO CRD Ordering

**Spec:** `.spec/spec-0003a-fix-eso-crd-ordering.md`
**Executed:** 2026-03-05
**Agent:** claude-sonnet-4-6 (Claude Code)

## Actions Taken

1. Checked out branch `claude/fix-eso-crd-ordering-WNMtM` (created fresh from current HEAD)
2. Created `.spec/spec-0003a-fix-eso-crd-ordering.md` with the full spec content
3. Deleted `k8s/external-secrets/clustersecretstore.yaml`
4. Created `k8s/external-secrets-store/clustersecretstore.yaml` with identical content to the deleted file
5. Created `k8s/flux-system/external-secrets-store-sync.yaml` with `dependsOn: [{name: external-secrets}]`
6. Updated `k8s/flux-system/kustomization.yaml` — added `external-secrets-store-sync.yaml` to resources list
7. Created `.provenance/spec-0003a-fix-eso-crd-ordering.provenance.md` (this file)
8. Committed all changes and pushed to `claude/fix-eso-crd-ordering-WNMtM`

## Decisions Made

No autonomous decisions were required — all actions were explicitly specified in the spec.

## Deviations from Spec

No deviations from spec.

## Artifacts Produced

| File | Status |
|------|--------|
| `.spec/spec-0003a-fix-eso-crd-ordering.md` | Created |
| `k8s/external-secrets/clustersecretstore.yaml` | Deleted |
| `k8s/external-secrets-store/clustersecretstore.yaml` | Created |
| `k8s/flux-system/external-secrets-store-sync.yaml` | Created |
| `k8s/flux-system/kustomization.yaml` | Modified (added `external-secrets-store-sync.yaml` to resources) |
| `.provenance/spec-0003a-fix-eso-crd-ordering.provenance.md` | Created |

## Validation Results

1. `.spec/spec-0003a-fix-eso-crd-ordering.md` exists — **PASS**
2. `k8s/external-secrets/clustersecretstore.yaml` does NOT exist — **PASS** (deleted)
3. `k8s/external-secrets/` contains exactly 3 files: `namespace.yaml`, `helmrepository.yaml`, `helmrelease.yaml` — **PASS**
4. `k8s/external-secrets-store/clustersecretstore.yaml` exists with `authType: ManagedIdentity` and `vaultUrl: "https://kv-kevinryan-io.vault.azure.net/"` — **PASS**
5. `k8s/flux-system/external-secrets-store-sync.yaml` has `dependsOn: [{name: external-secrets}]` and `path: ./k8s/external-secrets-store` — **PASS**
6. `k8s/flux-system/kustomization.yaml` includes both `external-secrets-sync.yaml` and `external-secrets-store-sync.yaml` — **PASS**
7. `k8s/flux-system/external-secrets-sync.yaml` unchanged — **PASS** (not touched)
8. No Terraform files modified — **PASS**
9. `.provenance/spec-0003a-fix-eso-crd-ordering.provenance.md` exists with all required sections — **PASS**
10. All files committed together — **PASS**
