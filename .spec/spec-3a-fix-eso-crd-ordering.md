# Spec 3a: Fix ESO CRD Ordering — Split ClusterSecretStore into Dependent Kustomization

## Task

1. Save this spec to `.spec/spec-3a-fix-eso-crd-ordering.md` in the repo.
2. Implement all changes described below.
3. After completing all work, create a provenance record at `.provenance/spec-3a-fix-eso-crd-ordering.provenance.md`. See the **Provenance Record** section for the required format.

## Problem

Spec 3 placed the `ClusterSecretStore` in the same Flux Kustomization as the ESO HelmRelease (`k8s/external-secrets/`). Flux's kustomize-controller performs a **server-side dry-run of ALL resources before applying ANY of them**. The `ClusterSecretStore` CRD does not exist until ESO installs it via the HelmRelease, so the dry-run fails:

```
ClusterSecretStore/azure-keyvault dry-run failed: no matches for kind "ClusterSecretStore" in version "external-secrets.io/v1"
```

This blocks the entire Kustomization — including the HelmRelease that would install the CRDs. It is a chicken-and-egg deadlock.

## Solution

Split the `ClusterSecretStore` into its own directory and Flux Kustomization with `dependsOn`, so it only applies after ESO is fully installed and CRDs are registered.

### Current state (read these files before making changes)

| File | Current content |
|------|----------------|
| `k8s/external-secrets/clustersecretstore.yaml` | ClusterSecretStore manifest — **must be moved** |
| `k8s/external-secrets/namespace.yaml` | Namespace — stays |
| `k8s/external-secrets/helmrepository.yaml` | HelmRepository — stays |
| `k8s/external-secrets/helmrelease.yaml` | HelmRelease — stays |
| `k8s/flux-system/external-secrets-sync.yaml` | Flux Kustomization for `k8s/external-secrets/` — stays unchanged |
| `k8s/flux-system/kustomization.yaml` | Resource list — needs new entry |

## 1. Move ClusterSecretStore to new directory

**Delete** `k8s/external-secrets/clustersecretstore.yaml`.

**Create** `k8s/external-secrets-store/clustersecretstore.yaml` with the exact same content:

```yaml
apiVersion: external-secrets.io/v1
kind: ClusterSecretStore
metadata:
  name: azure-keyvault
spec:
  provider:
    azurekv:
      authType: ManagedIdentity
      vaultUrl: "https://kv-kevinryan-io.vault.azure.net/"
```

## 2. Create Flux sync with `dependsOn`

Create `k8s/flux-system/external-secrets-store-sync.yaml`:

```yaml
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: external-secrets-store
  namespace: flux-system
spec:
  dependsOn:
    - name: external-secrets
  interval: 10m0s
  path: ./k8s/external-secrets-store
  prune: true
  sourceRef:
    kind: GitRepository
    name: flux-system
```

**Key detail:** `dependsOn: [{name: external-secrets}]` means Flux will not reconcile this Kustomization until the `external-secrets` Kustomization reports `Ready=True`. The `external-secrets` Kustomization becomes Ready only after the HelmRelease succeeds (ESO installed, CRDs registered). At that point, the ClusterSecretStore dry-run passes.

## 3. Update `k8s/flux-system/kustomization.yaml`

Add `external-secrets-store-sync.yaml` to the resources list:

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - gotk-components.yaml
  - gotk-sync.yaml
  - kevinryan-io-sync.yaml
  - brand-kevinryan-io-sync.yaml
  - aiimmigrants-com-sync.yaml
  - specmcp-ai-sync.yaml
  - sddbook-com-sync.yaml
  - distributedequity-org-sync.yaml
  - docs-kevinryan-io-sync.yaml
  - external-secrets-sync.yaml
  - external-secrets-store-sync.yaml
```

## 4. No other changes

- `k8s/external-secrets/namespace.yaml` — unchanged
- `k8s/external-secrets/helmrepository.yaml` — unchanged
- `k8s/external-secrets/helmrelease.yaml` — unchanged
- `k8s/flux-system/external-secrets-sync.yaml` — unchanged
- No Terraform changes

## Expected reconciliation flow after merge

1. Flux syncs `k8s/flux-system/` — sees two Kustomizations: `external-secrets` and `external-secrets-store`
2. `external-secrets` Kustomization applies: namespace, HelmRepository, HelmRelease — all standard resources, dry-run passes
3. Helm controller installs ESO chart — pods start, CRDs are registered
4. `external-secrets` Kustomization becomes `Ready=True`
5. `external-secrets-store` Kustomization is now eligible (dependency satisfied)
6. ClusterSecretStore dry-run passes (CRD exists), resource is applied
7. ClusterSecretStore connects to Key Vault via managed identity

## Provenance Record

After completing the work, create `.provenance/spec-3a-fix-eso-crd-ordering.provenance.md` with the following structure:

```markdown
# Provenance: Spec 3a — Fix ESO CRD Ordering

**Spec:** `.spec/spec-3a-fix-eso-crd-ordering.md`
**Executed:** <timestamp>
**Agent:** <agent identifier if available>

## Actions Taken

Chronological list of every action performed (files created, files modified, files deleted, commands run).

## Decisions Made

Any decisions the agent made during execution that were not explicitly specified in the spec. For each:

| Decision | Options Considered | Chosen | Rationale |
|----------|-------------------|--------|-----------|
| ... | ... | ... | ... |

If no autonomous decisions were required, state: "No autonomous decisions were required — all actions were explicitly specified in the spec."

## Deviations from Spec

Any points where the agent deviated from the spec, and why. If none, state: "No deviations from spec."

## Artifacts Produced

| File | Status |
|------|--------|
| ... | Created / Modified / Deleted |

## Validation Results

Results of each validation step from the spec (pass/fail with details).
```

## Validation steps

After completing all work, confirm:

1. This spec has been saved to `.spec/spec-3a-fix-eso-crd-ordering.md`
2. `k8s/external-secrets/clustersecretstore.yaml` does **NOT** exist (deleted)
3. `k8s/external-secrets/` contains exactly 3 files: `namespace.yaml`, `helmrepository.yaml`, `helmrelease.yaml`
4. `k8s/external-secrets-store/clustersecretstore.yaml` exists with correct content (`authType: ManagedIdentity`, `vaultUrl: "https://kv-kevinryan-io.vault.azure.net/"`)
5. `k8s/flux-system/external-secrets-store-sync.yaml` exists with `dependsOn: [{name: external-secrets}]` and `path: ./k8s/external-secrets-store`
6. `k8s/flux-system/kustomization.yaml` includes both `external-secrets-sync.yaml` and `external-secrets-store-sync.yaml`
7. `k8s/flux-system/external-secrets-sync.yaml` is unchanged from its current content
8. No Terraform files were modified
9. The provenance record exists at `.provenance/spec-3a-fix-eso-crd-ordering.provenance.md` and contains all required sections
10. All files (spec, K8s manifests, provenance) are committed together
