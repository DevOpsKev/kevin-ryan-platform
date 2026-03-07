---
title: "Spec 0003: External Secrets Operator"
---

## Task

1. Save this spec to `.spec/spec-0003-external-secrets-operator.md` in the repo (create the `.spec/` directory if it does not exist).
2. Implement all Kubernetes manifest changes described below.
3. After completing all work, create a provenance record at `.provenance/spec-0003-external-secrets-operator.provenance.md` (create the `.provenance/` directory if it does not exist). See the **Provenance Record** section for the required format.

## Prerequisites

- Spec 0001 deployed: two-node K3s cluster with Flux (including helm-controller) running
- Spec 0002 deployed: PostgreSQL Flexible Server provisioned, Key Vault contains `pg-admin-password`, `pg-fqdn`, `pg-admin-username`
- Read ADR-018 (`docs/adr/adr-018-secret-management-keyvault-eso.md`) — the architectural decision this spec implements

## Context

ADR-018 mandates Azure Key Vault + External Secrets Operator (ESO) as the platform-wide secret management pattern. Terraform writes secrets to Key Vault; ESO syncs them into native Kubernetes Secrets for pod consumption.

This spec deploys ESO via Flux HelmRelease and creates a ClusterSecretStore backed by Azure Key Vault, authenticated via the VM's system-assigned managed identity. Application-specific ExternalSecrets are defined in later specs (Spec 0004 for Umami, Spec 0005 for Observability).

### Current state (read these files before making changes)

| File / Directory | What it does |
|-----------------|-------------|
| `k8s/flux-system/kustomization.yaml` | Lists all Flux sync resources — add the new ESO sync here |
| `k8s/flux-system/kevinryan-io-sync.yaml` | Example of a Flux Kustomization CR — follow this pattern |
| `k8s/flux-system/gotk-sync.yaml` | Flux GitRepository source — already exists, ESO sync references it |
| `infra/cloud-init-server.yaml` | Flux bootstrap includes `helm-controller` in `--components` |
| `infra/modules/keyvault/main.tf` | VM managed identities already have `Key Vault Secrets User` role |

### Key facts

- **Key Vault name:** `kv-kevinryan-io`
- **Key Vault URI:** `https://kv-kevinryan-io.vault.azure.net/`
- **Tenant ID:** `f55471fd-1e93-48b1-91d8-1bd1d46351b0` (from terraform output `github_actions_tenant_id`)
- **ESO Helm chart repo:** `https://charts.external-secrets.io`
- **ESO chart name:** `external-secrets`
- **Both VM managed identities** already have `Key Vault Secrets User` role (granted in `infra/modules/keyvault/main.tf`)
- **Flux has helm-controller** (installed via cloud-init in Spec 0001)
- **Node2 has taint** `observability=true:NoSchedule` — ESO will schedule on node1 by default (no toleration needed, node1 is fine for ESO)

## 1. Create `k8s/external-secrets/` directory

Create the following files in `k8s/external-secrets/`:

### `namespace.yaml`

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: external-secrets
```

### `helmrepository.yaml`

```yaml
apiVersion: source.toolkit.fluxcd.io/v1
kind: HelmRepository
metadata:
  name: external-secrets
  namespace: external-secrets
spec:
  interval: 1h
  url: https://charts.external-secrets.io
```

### `helmrelease.yaml`

```yaml
apiVersion: helm.toolkit.fluxcd.io/v2
kind: HelmRelease
metadata:
  name: external-secrets
  namespace: external-secrets
spec:
  interval: 1h
  chart:
    spec:
      chart: external-secrets
      version: ">=0.15.0 <1.0.0"
      sourceRef:
        kind: HelmRepository
        name: external-secrets
        namespace: external-secrets
      interval: 1h
  install:
    crds: CreateReplace
    remediation:
      retries: 5
  upgrade:
    crds: CreateReplace
    remediation:
      retries: 5
  values:
    installCRDs: true
```

**Design notes on the HelmRelease:**

- `version: ">=0.15.0 <1.0.0"` — semver range pins to the latest 0.x chart, avoiding the 1.x/2.x chart line which has breaking changes. The agent may adjust this if the latest chart version is in the 2.x line — check `https://artifacthub.io/packages/helm/external-secrets-operator/external-secrets` for the current latest. If the latest stable chart is 2.x, use `">=2.0.0 <3.0.0"` instead.
- `crds: CreateReplace` ensures CRDs are installed/updated on both install and upgrade.
- `remediation.retries: 5` gives Flux time to retry if the chart pull is slow on first attempt.

### `clustersecretstore.yaml`

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

**Design notes on the ClusterSecretStore:**

- `ClusterSecretStore` (not namespace-scoped `SecretStore`) so any namespace can create ExternalSecrets referencing it — Umami, Grafana, and any future service.
- `authType: ManagedIdentity` uses the VM's system-assigned managed identity. ESO running on node1 inherits node1's identity, which already has `Key Vault Secrets User` role.
- No `identityId` needed — there is only one managed identity per VM.
- No `tenantId` needed for ManagedIdentity auth — it is inferred from IMDS.

**Important: CRD ordering.** The `ClusterSecretStore` CRD does not exist until ESO installs it. Flux's kustomize-controller will retry failed resources, so the ClusterSecretStore will fail on the first reconciliation attempt and succeed after ESO's HelmRelease installs the CRDs. This is expected Flux behavior — no special dependency handling is required.

## 2. Create Flux sync for external-secrets

Create `k8s/flux-system/external-secrets-sync.yaml`:

```yaml
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: external-secrets
  namespace: flux-system
spec:
  interval: 10m0s
  path: ./k8s/external-secrets
  prune: true
  sourceRef:
    kind: GitRepository
    name: flux-system
```

This follows the exact same pattern as `kevinryan-io-sync.yaml` and all other site syncs.

## 3. Update `k8s/flux-system/kustomization.yaml`

Add `external-secrets-sync.yaml` to the `resources` list:

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
```

## No Terraform changes

This spec is purely Kubernetes manifests. No Terraform changes are needed — Key Vault and RBAC are already provisioned by Specs 0001 and 0002.

## Manual steps (not performed by the agent)

After the code changes are merged to `main`:

1. Flux will automatically detect the new manifests and begin reconciliation (within the 10-minute sync interval, or trigger manually)
2. To trigger immediately from node1: `flux reconcile kustomization flux-system --with-source`
3. Wait 2-3 minutes for ESO HelmRelease to install (chart download + pod startup + CRD registration)
4. The ClusterSecretStore may fail on first attempt while CRDs are being installed — Flux will retry and it will succeed

## Provenance Record

After completing the work, create `.provenance/spec-0003-external-secrets-operator.provenance.md` with the following structure:

```markdown
# Provenance: Spec 0003 — External Secrets Operator

**Spec:** `.spec/spec-0003-external-secrets-operator.md`
**Executed:** <timestamp>
**Agent:** <agent identifier if available>

## Actions Taken

Chronological list of every action performed (files created, files modified, commands run).

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
| ... | Created / Modified |

## Validation Results

Results of each validation step from the spec (pass/fail with details).
```

## Validation steps

After completing all work, confirm:

1. This spec has been saved to `.spec/spec-0003-external-secrets-operator.md`
2. `k8s/external-secrets/` exists with exactly 4 files: `namespace.yaml`, `helmrepository.yaml`, `helmrelease.yaml`, `clustersecretstore.yaml`
3. The HelmRepository points to `https://charts.external-secrets.io`
4. The HelmRelease installs chart `external-secrets` with a valid semver range, `crds: CreateReplace`, and `installCRDs: true`
5. The ClusterSecretStore uses `authType: ManagedIdentity` with `vaultUrl: "https://kv-kevinryan-io.vault.azure.net/"`
6. `k8s/flux-system/external-secrets-sync.yaml` exists and follows the same pattern as `kevinryan-io-sync.yaml` (path `./k8s/external-secrets`, sourceRef to `flux-system` GitRepository)
7. `k8s/flux-system/kustomization.yaml` includes `external-secrets-sync.yaml` in its resources list
8. No Terraform files were modified
9. `pnpm lint` passes (no site code changed, but confirm no regressions)
10. The provenance record exists at `.provenance/spec-0003-external-secrets-operator.provenance.md` and contains all required sections
11. All files (spec, K8s manifests, provenance) are committed together

### Post-merge validation (manual, performed by the operator after Flux reconciles)

These are verification commands to run from node1 after merging to `main` and waiting for Flux to reconcile:

```bash
# Check ESO pods are running
kubectl get pods -n external-secrets

# Check HelmRelease status
kubectl get helmrelease -n external-secrets

# Check ClusterSecretStore health (may take a few minutes after ESO starts)
kubectl get clustersecretstore azure-keyvault

# Detailed status — should show "Valid" or "SecretSynced"
kubectl describe clustersecretstore azure-keyvault

# Quick end-to-end test: create a temporary ExternalSecret to verify Key Vault access
kubectl apply -f - <<'EOF'
apiVersion: external-secrets.io/v1
kind: ExternalSecret
metadata:
  name: test-kv-access
  namespace: external-secrets
spec:
  refreshInterval: 1m
  secretStoreRef:
    kind: ClusterSecretStore
    name: azure-keyvault
  target:
    name: test-kv-access
    creationPolicy: Owner
  data:
  - secretKey: pg-fqdn
    remoteRef:
      key: pg-fqdn
EOF

# Wait 30 seconds, then check
kubectl get externalsecret test-kv-access -n external-secrets
kubectl get secret test-kv-access -n external-secrets -o jsonpath='{.data.pg-fqdn}' | base64 -d

# Clean up test resources
kubectl delete externalsecret test-kv-access -n external-secrets
```

The `pg-fqdn` value should decode to `psql-kevinryan-io.postgres.database.azure.com`.
