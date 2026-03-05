# Spec 0005: Observability Stack (Grafana + Loki + Promtail)

## Task

1. Save this spec to `.spec/spec-0005-observability-stack.md` in the repo (create the `.spec/` directory if it does not exist).
2. Implement all Terraform and Kubernetes manifest changes described below.
3. After completing all work, create a provenance record at `.provenance/spec-0005-observability-stack.provenance.md` (create the `.provenance/` directory if it does not exist). See the **Provenance Record** section for the required format.

## Prerequisites

- Spec 0002 deployed: PostgreSQL Flexible Server running with `grafana_db` database created
- Spec 0003 deployed: ESO running, ClusterSecretStore `azure-keyvault` is `Valid` and `Ready`
- Read ADR-006 (`docs/adr/adr-006-observability-grafana-loki-promtail.md`) — the architectural decision this spec implements

## Context

ADR-006 mandates Grafana + Loki + Promtail as the observability stack. Grafana is the dashboard UI, Loki is the log store, and Promtail ships container logs to Loki. Grafana uses `grafana_db` on the shared PostgreSQL instance for state storage. All three components are deployed via Helm charts through Flux.

Node2 has taint `observability=true:NoSchedule` and label `role=observability` — Grafana and Loki should schedule there. Promtail runs as a DaemonSet on ALL nodes (it needs to collect logs from both node1 and node2).

### Current state (read these files before making changes)

| File / Directory | What it does |
|-----------------|-------------|
| `k8s/flux-system/kustomization.yaml` | Lists all Flux sync resources |
| `k8s/flux-system/external-secrets-sync.yaml` | Pattern for HelmRelease-based Flux sync |
| `k8s/external-secrets/helmrelease.yaml` | Pattern for HelmRelease spec |
| `k8s/umami/externalsecret.yaml` | Pattern for ExternalSecret with templating |
| `infra/main.tf` | Root Terraform module |
| `infra/modules/cloudflare/main.tf` | Cloudflare module — subdomains get cache rules, standalone records don't |

### Key facts

- **Grafana Helm chart:** `https://grafana-community.github.io/helm-charts` (migrated from grafana.github.io as of Jan 2026), chart name `grafana`
- **Loki Helm chart:** `https://grafana.github.io/helm-charts`, chart name `loki`
- **Promtail Helm chart:** `https://grafana.github.io/helm-charts`, chart name `promtail`
- **Grafana DB:** `grafana_db` on `psql-kevinryan-io.postgres.database.azure.com` (already created in Spec 0002)
- **Key Vault secrets available:** `pg-admin-password`, `pg-fqdn`, `pg-admin-username`
- **Node2 taint:** `observability=true:NoSchedule`
- **Node2 label:** `role=observability`
- **Subdomain:** `monitoring.kevinryan.io`

## 1. Terraform changes (small)

### Add DNS record for monitoring.kevinryan.io

Add to `infra/main.tf` (after the existing `cloudflare_record.analytics` block):

```hcl
resource "cloudflare_record" "monitoring" {
  zone_id = var.cloudflare_zone_id
  name    = "monitoring"
  content = module.network.public_ip_address
  type    = "A"
  proxied = true
  ttl     = 1
}
```

**Why standalone:** Same reason as `analytics` — Grafana serves dynamic content that must not be cached by the Cloudflare module's aggressive cache rule.

### Add Grafana admin password to Key Vault

Add to `infra/main.tf` (after the existing `azurerm_key_vault_secret.umami_app_secret` block):

```hcl
resource "random_password" "grafana_admin_password" {
  length  = 32
  special = false
}

resource "azurerm_key_vault_secret" "grafana_admin_password" {
  name         = "grafana-admin-password"
  value        = random_password.grafana_admin_password.result
  key_vault_id = module.keyvault.key_vault_id
}
```

**Note:** `special = false` — learned from Spec 0004 that special characters in passwords cause URL/config parsing issues.

### No other Terraform changes

No changes to variables, outputs, or modules. The `pgcrypto` extension is already allowlisted from Spec 0004.

## 2. Kubernetes manifests

Create `k8s/observability/` with the following files:

### `namespace.yaml`

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: observability
```

### `helmrepository-grafana.yaml`

```yaml
apiVersion: source.toolkit.fluxcd.io/v1
kind: HelmRepository
metadata:
  name: grafana
  namespace: observability
spec:
  interval: 1h
  url: https://grafana.github.io/helm-charts
```

### `helmrepository-grafana-community.yaml`

```yaml
apiVersion: source.toolkit.fluxcd.io/v1
kind: HelmRepository
metadata:
  name: grafana-community
  namespace: observability
spec:
  interval: 1h
  url: https://grafana-community.github.io/helm-charts
```

### `helmrelease-loki.yaml`

Loki deployed in SingleBinary mode (appropriate for a single-node log store):

```yaml
apiVersion: helm.toolkit.fluxcd.io/v2
kind: HelmRelease
metadata:
  name: loki
  namespace: observability
spec:
  interval: 1h
  chart:
    spec:
      chart: loki
      version: ">=6.0.0 <7.0.0"
      sourceRef:
        kind: HelmRepository
        name: grafana
        namespace: observability
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
    deploymentMode: SingleBinary
    loki:
      auth_enabled: false
      commonConfig:
        replication_factor: 1
      schemaConfig:
        configs:
          - from: "2024-01-01"
            store: tsdb
            object_store: filesystem
            schema: v13
            index:
              prefix: loki_index_
              period: 24h
      storage:
        type: filesystem
      limits_config:
        retention_period: 744h
    singleBinary:
      replicas: 1
      nodeSelector:
        role: observability
      tolerations:
        - key: observability
          operator: Equal
          value: "true"
          effect: NoSchedule
      persistence:
        enabled: true
        size: 10Gi
    backend:
      replicas: 0
    read:
      replicas: 0
    write:
      replicas: 0
    ingester:
      replicas: 0
    querier:
      replicas: 0
    queryFrontend:
      replicas: 0
    queryScheduler:
      replicas: 0
    distributor:
      replicas: 0
    compactor:
      replicas: 0
    indexGateway:
      replicas: 0
    bloomCompactor:
      replicas: 0
    bloomGateway:
      replicas: 0
    gateway:
      enabled: false
    minio:
      enabled: false
    chunksCache:
      enabled: false
    resultsCache:
      enabled: false
    lokiCanary:
      enabled: false
    test:
      enabled: false
```

**Design notes:**

- `SingleBinary` mode runs all Loki components in one pod — appropriate for this cluster size.
- All other deployment modes zeroed out to avoid validation errors.
- `auth_enabled: false` — single-tenant mode, no need for multi-tenancy.
- `retention_period: 744h` (31 days) per ADR-006.
- `filesystem` storage — sufficient for a single-node setup. Can migrate to Azure Blob later if needed.
- `nodeSelector` and `tolerations` schedule Loki on node2.
- `gateway`, `minio`, caches, canary, and tests disabled — not needed for SingleBinary.

### `helmrelease-promtail.yaml`

```yaml
apiVersion: helm.toolkit.fluxcd.io/v2
kind: HelmRelease
metadata:
  name: promtail
  namespace: observability
spec:
  interval: 1h
  chart:
    spec:
      chart: promtail
      version: ">=6.0.0 <7.0.0"
      sourceRef:
        kind: HelmRepository
        name: grafana
        namespace: observability
      interval: 1h
  install:
    remediation:
      retries: 5
  upgrade:
    remediation:
      retries: 5
  values:
    config:
      clients:
        - url: http://loki.observability.svc.cluster.local:3100/loki/api/v1/push
    tolerations:
      - key: observability
        operator: Equal
        value: "true"
        effect: NoSchedule
```

**Design notes:**

- Promtail is a DaemonSet by default — it runs on ALL nodes (both node1 and node2) to collect logs from every pod.
- The `tolerations` allow Promtail to also schedule on node2 (which has the observability taint). It already schedules on node1 by default.
- Pushes logs to Loki's in-cluster service endpoint.

### `externalsecret.yaml`

```yaml
apiVersion: external-secrets.io/v1
kind: ExternalSecret
metadata:
  name: grafana-db
  namespace: observability
spec:
  refreshInterval: 1h
  secretStoreRef:
    kind: ClusterSecretStore
    name: azure-keyvault
  target:
    name: grafana-db
    creationPolicy: Owner
    template:
      engineVersion: v2
      data:
        GF_DATABASE_TYPE: "postgres"
        GF_DATABASE_HOST: "{{ .pg_fqdn }}:5432"
        GF_DATABASE_NAME: "grafana_db"
        GF_DATABASE_USER: "{{ .pg_admin_username }}"
        GF_DATABASE_PASSWORD: "{{ .pg_admin_password }}"
        GF_DATABASE_SSL_MODE: "require"
        GF_SECURITY_ADMIN_PASSWORD: "{{ .grafana_admin_password }}"
  data:
  - secretKey: pg_fqdn
    remoteRef:
      key: pg-fqdn
  - secretKey: pg_admin_username
    remoteRef:
      key: pg-admin-username
  - secretKey: pg_admin_password
    remoteRef:
      key: pg-admin-password
  - secretKey: grafana_admin_password
    remoteRef:
      key: grafana-admin-password
```

**Design notes:**

- Grafana reads `GF_DATABASE_*` environment variables for PostgreSQL backend configuration.
- `GF_SECURITY_ADMIN_PASSWORD` sets the admin password from Key Vault (not a default password).
- The resulting K8s Secret `grafana-db` is consumed by the Grafana HelmRelease via `envFromSecret`.

### `helmrelease-grafana.yaml`

```yaml
apiVersion: helm.toolkit.fluxcd.io/v2
kind: HelmRelease
metadata:
  name: grafana
  namespace: observability
spec:
  interval: 1h
  chart:
    spec:
      chart: grafana
      version: ">=11.0.0 <12.0.0"
      sourceRef:
        kind: HelmRepository
        name: grafana-community
        namespace: observability
      interval: 1h
  install:
    remediation:
      retries: 5
  upgrade:
    remediation:
      retries: 5
  values:
    replicas: 1
    nodeSelector:
      role: observability
    tolerations:
      - key: observability
        operator: Equal
        value: "true"
        effect: NoSchedule
    envFromSecret: grafana-db
    grafana.ini:
      server:
        root_url: "https://monitoring.kevinryan.io"
      auth:
        disable_login_form: false
      users:
        allow_sign_up: false
    datasources:
      datasources.yaml:
        apiVersion: 1
        datasources:
          - name: Loki
            type: loki
            access: proxy
            url: http://loki.observability.svc.cluster.local:3100
            isDefault: true
    service:
      type: ClusterIP
      port: 80
```

**Design notes:**

- `envFromSecret: grafana-db` injects all `GF_*` env vars from the ExternalSecret.
- Loki datasource is pre-configured — Grafana can query logs immediately after deploy.
- `root_url` set for correct URL generation behind Cloudflare proxy.
- Schedules on node2 via `nodeSelector` and `tolerations`.
- The Grafana chart defaults to port 3000 internally; the service exposes it on port 80.

### `ingress.yaml`

```yaml
apiVersion: traefik.io/v1alpha1
kind: IngressRoute
metadata:
  name: grafana
  namespace: observability
spec:
  entryPoints:
    - websecure
  routes:
    - match: Host(`monitoring.kevinryan.io`)
      kind: Rule
      services:
        - name: grafana
          port: 80
  tls: {}
```

## 3. Flux sync

Create `k8s/flux-system/observability-sync.yaml`:

```yaml
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: observability
  namespace: flux-system
spec:
  dependsOn:
    - name: external-secrets-store
  interval: 10m0s
  path: ./k8s/observability
  prune: true
  sourceRef:
    kind: GitRepository
    name: flux-system
```

**Why `dependsOn: external-secrets-store`:** The ExternalSecret references the ClusterSecretStore. Same pattern as the Umami sync.

## 4. Update `k8s/flux-system/kustomization.yaml`

Add `observability-sync.yaml` to the resources list (after `umami-sync.yaml`).

## Manual steps (not performed by the agent)

### Terraform apply (before or after merge)

```bash
cd infra
terraform plan    # Expect: 1 random_password + 1 KV secret + 1 Cloudflare record = 3 new resources
terraform apply
```

Verify:

```bash
az keyvault secret list --vault-name kv-kevinryan-io --query "[].name" -o tsv
# Should include: grafana-admin-password

nslookup monitoring.kevinryan.io
# Should resolve via Cloudflare proxy
```

### After merge to main — Flux reconciliation

```bash
az vm run-command invoke \
  --resource-group rg-kevinryan-io \
  --name vm-kevinryan-node1 \
  --command-id RunShellScript \
  --scripts "export KUBECONFIG=/etc/rancher/k3s/k3s.yaml && flux reconcile kustomization flux-system --with-source"
```

Wait 3-5 minutes for all charts to install, then verify:

```bash
az vm run-command invoke \
  --resource-group rg-kevinryan-io \
  --name vm-kevinryan-node1 \
  --command-id RunShellScript \
  --scripts "export KUBECONFIG=/etc/rancher/k3s/k3s.yaml && echo '=== HelmReleases ===' && kubectl get helmrelease -n observability && echo '=== Pods ===' && kubectl get pods -n observability -o wide && echo '=== ExternalSecret ===' && kubectl get externalsecret -n observability && echo '=== Services ===' && kubectl get svc -n observability && echo '=== IngressRoute ===' && kubectl get ingressroute -n observability"
```

Final check:

```bash
curl -k https://monitoring.kevinryan.io/api/health
```

Should return `{"commit":"...","database":"ok","version":"..."}`.

Login: `admin` / the password from `az keyvault secret show --vault-name kv-kevinryan-io --name grafana-admin-password --query value -o tsv`

## Provenance Record

After completing the work, create `.provenance/spec-0005-observability-stack.provenance.md` with the following structure:

```markdown
# Provenance: Spec 0005 — Observability Stack

**Spec:** `.spec/spec-0005-observability-stack.md`
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

1. This spec has been saved to `.spec/spec-0005-observability-stack.md`
2. `infra/main.tf` contains `random_password.grafana_admin_password`, `azurerm_key_vault_secret.grafana_admin_password`, and `cloudflare_record.monitoring`
3. `k8s/observability/` exists with exactly 8 files: `namespace.yaml`, `helmrepository-grafana.yaml`, `helmrepository-grafana-community.yaml`, `helmrelease-loki.yaml`, `helmrelease-promtail.yaml`, `helmrelease-grafana.yaml`, `externalsecret.yaml`, `ingress.yaml`
4. Loki HelmRelease uses `deploymentMode: SingleBinary` with `replication_factor: 1`, filesystem storage, 744h retention, and schedules on node2 (`nodeSelector` + `tolerations`)
5. All non-SingleBinary components are zeroed out (backend, read, write, ingester, querier, etc. all `replicas: 0`)
6. Promtail HelmRelease pushes to `http://loki.observability.svc.cluster.local:3100/loki/api/v1/push` and tolerates the observability taint (runs on ALL nodes)
7. Grafana HelmRelease uses `envFromSecret: grafana-db`, has Loki pre-configured as a datasource, `root_url` set to `https://monitoring.kevinryan.io`, and schedules on node2
8. The ExternalSecret constructs `GF_DATABASE_*` env vars from Key Vault secrets and includes `GF_SECURITY_ADMIN_PASSWORD`
9. The IngressRoute matches `Host(\`monitoring.kevinryan.io\`)` with `websecure` entryPoint and `tls: {}`
10. `k8s/flux-system/observability-sync.yaml` exists with `dependsOn: [{name: external-secrets-store}]`
11. `k8s/flux-system/kustomization.yaml` includes `observability-sync.yaml`
12. `terraform fmt -check -recursive infra/` passes
13. `pnpm lint` passes
14. The provenance record exists at `.provenance/spec-0005-observability-stack.provenance.md` and contains all required sections
15. All files (spec, Terraform changes, K8s manifests, provenance) are committed together
