# Spec 4: Umami Analytics

## Task

1. Save this spec to `.spec/spec-4-umami.md` in the repo (create the `.spec/` directory if it does not exist).
2. Implement all Terraform and Kubernetes manifest changes described below.
3. After completing all work, create a provenance record at `.provenance/spec-4-umami.provenance.md` (create the `.provenance/` directory if it does not exist). See the **Provenance Record** section for the required format.

## Prerequisites

- Spec 2 deployed: PostgreSQL Flexible Server running, `umami_db` database created, credentials in Key Vault (`pg-admin-password`, `pg-fqdn`, `pg-admin-username`)
- Spec 3 deployed: ESO running, ClusterSecretStore `azure-keyvault` is `Valid` and `Ready`
- Read ADR-003 (`docs/adr/adr-003-self-host-umami-analytics.md`) — the architectural decision to self-host Umami

## Context

ADR-003 mandates self-hosted Umami analytics backed by PostgreSQL. The database (`umami_db`) and secret pipeline (Key Vault -> ESO -> K8s Secret) are already in place from Specs 2 and 3. This spec deploys Umami as a Kubernetes workload, creates its ExternalSecret for database credentials, wires up DNS and ingress, and adds `APP_SECRET` to Key Vault.

### Current state (read these files before making changes)

| File / Directory | What it does |
|-----------------|-------------|
| `k8s/kevinryan-io/deployment.yaml` | Example deployment pattern — follow resource limits and probe style |
| `k8s/kevinryan-io/ingress.yaml` | Example IngressRoute — Traefik CRD with `websecure` entryPoint and `tls: {}` |
| `k8s/kevinryan-io/service.yaml` | Example service pattern |
| `k8s/kevinryan-io/namespace.yaml` | Example namespace pattern |
| `k8s/flux-system/kustomization.yaml` | Resource list — needs new entry |
| `k8s/flux-system/kevinryan-io-sync.yaml` | Pattern for Flux Kustomization CR |
| `k8s/external-secrets/clustersecretstore.yaml` | ClusterSecretStore `azure-keyvault` already deployed |
| `infra/main.tf` | Root Terraform — needs small additions for APP_SECRET and DNS |

### Key facts

- **Umami image:** `ghcr.io/umami-software/umami:postgresql-latest` (public GHCR image, PostgreSQL-optimized build)
- **Container port:** `3000`
- **Health check endpoint:** `/api/heartbeat`
- **Required env vars:** `DATABASE_URL`, `APP_SECRET`, `DISABLE_TELEMETRY`
- **DATABASE_URL format:** `postgresql://<user>:<password>@<host>:5432/umami_db?sslmode=require`
- **Subdomain:** `analytics.kevinryan.io`
- **Key Vault secrets already available:** `pg-admin-password`, `pg-fqdn`, `pg-admin-username`
- **Key Vault secret to add:** `umami-app-secret` (random hex hash for data anonymisation)

## 1. Terraform changes (small)

### Add APP_SECRET to Key Vault

Add to `infra/main.tf` (after the existing `azurerm_key_vault_secret.pg_admin_username` block):

```hcl
resource "random_password" "umami_app_secret" {
  length  = 64
  special = false
}

resource "azurerm_key_vault_secret" "umami_app_secret" {
  name         = "umami-app-secret"
  value        = random_password.umami_app_secret.result
  key_vault_id = module.keyvault.key_vault_id
}
```

### Add DNS record for analytics.kevinryan.io

Add to `infra/main.tf` (after the existing `module.cloudflare` block, NOT inside it):

```hcl
resource "cloudflare_record" "analytics" {
  zone_id = var.cloudflare_zone_id
  name    = "analytics"
  content = module.network.public_ip_address
  type    = "A"
  proxied = true
  ttl     = 1
}
```

**Why a standalone record instead of adding to `subdomains`:** The Cloudflare module's `subdomains` list also includes subdomains in an aggressive cache rule (edge TTL override). Umami serves dynamic API responses that must not be cached. A standalone `cloudflare_record` creates the DNS A record with Cloudflare proxy (DDoS protection, SSL) but WITHOUT the custom cache rule.

### No other Terraform changes

No changes to variables, outputs, or any modules.

## 2. Kubernetes manifests

Create `k8s/umami/` with the following files:

### `namespace.yaml`

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: umami
```

### `externalsecret.yaml`

```yaml
apiVersion: external-secrets.io/v1
kind: ExternalSecret
metadata:
  name: umami-db
  namespace: umami
spec:
  refreshInterval: 1h
  secretStoreRef:
    kind: ClusterSecretStore
    name: azure-keyvault
  target:
    name: umami-db
    creationPolicy: Owner
    template:
      engineVersion: v2
      data:
        DATABASE_URL: "postgresql://{{ .pg_admin_username }}:{{ .pg_admin_password }}@{{ .pg_fqdn }}:5432/umami_db?sslmode=require"
        APP_SECRET: "{{ .umami_app_secret }}"
  data:
  - secretKey: pg_admin_username
    remoteRef:
      key: pg-admin-username
  - secretKey: pg_admin_password
    remoteRef:
      key: pg-admin-password
  - secretKey: pg_fqdn
    remoteRef:
      key: pg-fqdn
  - secretKey: umami_app_secret
    remoteRef:
      key: umami-app-secret
```

**Design notes:**
- `template.data` constructs `DATABASE_URL` from individual Key Vault secrets — no connection string stored in Key Vault, reducing secret sprawl.
- `sslmode=require` because Azure PostgreSQL Flexible Server enforces SSL by default.
- `refreshInterval: 1h` means credential rotation in Key Vault propagates within an hour.
- The resulting K8s Secret `umami-db` contains two keys: `DATABASE_URL` and `APP_SECRET`.

### `deployment.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: umami
  namespace: umami
spec:
  replicas: 1
  selector:
    matchLabels:
      app: umami
  template:
    metadata:
      labels:
        app: umami
    spec:
      containers:
        - name: umami
          image: ghcr.io/umami-software/umami:postgresql-latest
          ports:
            - containerPort: 3000
          envFrom:
            - secretRef:
                name: umami-db
          env:
            - name: DISABLE_TELEMETRY
              value: "1"
          livenessProbe:
            httpGet:
              path: /api/heartbeat
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 30
          readinessProbe:
            httpGet:
              path: /api/heartbeat
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 10
          resources:
            requests:
              cpu: 50m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 512Mi
```

**Design notes:**
- `envFrom.secretRef` injects all keys from the `umami-db` Secret as env vars (`DATABASE_URL`, `APP_SECRET`).
- `DISABLE_TELEMETRY=1` set directly as an env var (not a secret, not sensitive).
- Resource limits are generous for initial startup (Umami runs Prisma migrations on first boot, which can be CPU/memory intensive). Steady-state usage is ~200MB RAM.
- `initialDelaySeconds: 30` for liveness gives Umami time to run migrations on first startup.
- Image is from public GHCR — no ACR credentials needed.

### `service.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  name: umami
  namespace: umami
spec:
  selector:
    app: umami
  ports:
    - port: 80
      targetPort: 3000
```

### `ingress.yaml`

```yaml
apiVersion: traefik.io/v1alpha1
kind: IngressRoute
metadata:
  name: umami
  namespace: umami
spec:
  entryPoints:
    - websecure
  routes:
    - match: Host(`analytics.kevinryan.io`)
      kind: Rule
      services:
        - name: umami
          port: 80
  tls: {}
```

**Design notes:**
- Follows the exact same Traefik IngressRoute pattern as `kevinryan-io`, `brand-kevinryan-io`, etc.
- `tls: {}` uses Traefik's default TLS certificate (Cloudflare handles SSL termination at the edge; Traefik handles it between Cloudflare and the pod since Cloudflare is set to Full SSL mode).

## 3. Flux sync

Create `k8s/flux-system/umami-sync.yaml`:

```yaml
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: umami
  namespace: flux-system
spec:
  dependsOn:
    - name: external-secrets-store
  interval: 10m0s
  path: ./k8s/umami
  prune: true
  sourceRef:
    kind: GitRepository
    name: flux-system
```

**Why `dependsOn: external-secrets-store`:** The Umami ExternalSecret references the `azure-keyvault` ClusterSecretStore. While the ExternalSecret CRD exists (ESO is installed), the ClusterSecretStore must be Ready for the ExternalSecret to sync. The `dependsOn` ensures the Umami manifests are only applied after the ClusterSecretStore is healthy.

## 4. Update `k8s/flux-system/kustomization.yaml`

Add `umami-sync.yaml` to the resources list:

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
  - umami-sync.yaml
```

## Manual steps (not performed by the agent)

### Terraform apply (before or after merge — the K8s manifests won't work until Key Vault has `umami-app-secret`)

```bash
cd infra
terraform plan    # Expect: 1 random_password + 1 KV secret + 1 Cloudflare record = 3 new resources
terraform apply
```

Verify:
```bash
az keyvault secret list --vault-name kv-kevinryan-io --query "[].name" -o tsv
# Should include: umami-app-secret (alongside existing pg-* secrets)

nslookup analytics.kevinryan.io
# Should resolve to node1 public IP (40.67.240.128) via Cloudflare proxy
```

### After merge to main — Flux reconciliation

```bash
az vm run-command invoke \
  --resource-group rg-kevinryan-io \
  --name vm-kevinryan-node1 \
  --command-id RunShellScript \
  --scripts "export KUBECONFIG=/etc/rancher/k3s/k3s.yaml && flux reconcile kustomization flux-system --with-source"
```

Wait 2-3 minutes for Umami to start (first boot runs Prisma migrations), then verify:

```bash
az vm run-command invoke \
  --resource-group rg-kevinryan-io \
  --name vm-kevinryan-node1 \
  --command-id RunShellScript \
  --scripts "export KUBECONFIG=/etc/rancher/k3s/k3s.yaml && echo '=== ExternalSecret ===' && kubectl get externalsecret -n umami && echo '=== Pods ===' && kubectl get pods -n umami && echo '=== Service ===' && kubectl get svc -n umami && echo '=== IngressRoute ===' && kubectl get ingressroute -n umami"
```

Final check — hit the health endpoint:
```bash
curl -k https://analytics.kevinryan.io/api/heartbeat
```
Should return `ok`.

Default admin login: `admin` / `umami` — change immediately after first login.

## Provenance Record

After completing the work, create `.provenance/spec-4-umami.provenance.md` with the following structure:

```markdown
# Provenance: Spec 4 — Umami Analytics

**Spec:** `.spec/spec-4-umami.md`
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

1. This spec has been saved to `.spec/spec-4-umami.md`
2. `infra/main.tf` contains `random_password.umami_app_secret`, `azurerm_key_vault_secret.umami_app_secret`, and `cloudflare_record.analytics`
3. No other Terraform files (variables, outputs, modules) were modified
4. `k8s/umami/` exists with exactly 5 files: `namespace.yaml`, `externalsecret.yaml`, `deployment.yaml`, `service.yaml`, `ingress.yaml`
5. The ExternalSecret uses `template.data` to construct `DATABASE_URL` from individual Key Vault secrets (not a pre-built connection string)
6. The ExternalSecret references `ClusterSecretStore` named `azure-keyvault`
7. The Deployment uses `ghcr.io/umami-software/umami:postgresql-latest` with `envFrom.secretRef` for `umami-db`
8. The Deployment includes `DISABLE_TELEMETRY=1`, liveness/readiness probes on `/api/heartbeat:3000`, and resource limits
9. The Service maps port 80 -> 3000
10. The IngressRoute matches `Host(\`analytics.kevinryan.io\`)` with `websecure` entryPoint and `tls: {}`
11. `k8s/flux-system/umami-sync.yaml` exists with `dependsOn: [{name: external-secrets-store}]`
12. `k8s/flux-system/kustomization.yaml` includes `umami-sync.yaml`
13. `terraform fmt -check -recursive infra/` passes
14. `pnpm lint` passes
15. The provenance record exists at `.provenance/spec-4-umami.provenance.md` and contains all required sections
16. All files (spec, Terraform changes, K8s manifests, provenance) are committed together
