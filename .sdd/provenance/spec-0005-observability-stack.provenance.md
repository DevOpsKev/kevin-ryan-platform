---
title: "Provenance: Spec 0005 — Observability Stack"
---

**Spec:** `.spec/spec-0005-observability-stack.md`
**Executed:** 2026-03-05
**Agent:** Cursor (claude-4.6-opus)

## Actions Taken

1. Read ADR-006 (`docs/adr/adr-006-observability-grafana-loki-promtail.md`) for architectural requirements
2. Read existing infrastructure state: `infra/main.tf`, `infra/modules/postgresql/main.tf`, `infra/modules/postgresql/variables.tf`
3. Confirmed `grafana_db` already exists in PostgreSQL module's default `databases` list — no DB changes needed
4. Read existing Flux/K8s patterns: `k8s/flux-system/kustomization.yaml`, `k8s/flux-system/umami-sync.yaml`, `k8s/umami/externalsecret.yaml`, `k8s/umami/ingress.yaml`
5. Researched current Helm chart repos — discovered Grafana chart migrated to `grafana-community` repo (Jan 2026)
6. Saved spec to `.spec/spec-0005-observability-stack.md`
7. Modified `infra/main.tf`: added `random_password.grafana_admin_password`, `azurerm_key_vault_secret.grafana_admin_password`, `cloudflare_record.monitoring`
8. Created `k8s/observability/` directory
9. Created `k8s/observability/namespace.yaml`
10. Created `k8s/observability/helmrepository-grafana.yaml` (Loki + Promtail charts)
11. Created `k8s/observability/helmrepository-grafana-community.yaml` (Grafana chart)
12. Created `k8s/observability/helmrelease-loki.yaml` (SingleBinary mode, filesystem storage, 744h retention, node2 scheduling)
13. Created `k8s/observability/helmrelease-promtail.yaml` (DaemonSet, tolerates observability taint)
14. Created `k8s/observability/externalsecret.yaml` (GF_DATABASE_* + GF_SECURITY_ADMIN_PASSWORD from Key Vault)
15. Created `k8s/observability/helmrelease-grafana.yaml` (community chart, envFromSecret, Loki datasource pre-configured, node2 scheduling)
16. Created `k8s/observability/ingress.yaml` (Traefik IngressRoute for monitoring.kevinryan.io)
17. Created `k8s/flux-system/observability-sync.yaml` (dependsOn: external-secrets-store)
18. Modified `k8s/flux-system/kustomization.yaml`: added `observability-sync.yaml` to resources
19. Ran `terraform fmt -check -recursive infra/` — passed
20. Ran `pnpm lint` — passed (0 errors, 2 pre-existing warnings)

## Decisions Made

| Decision | Options Considered | Chosen | Rationale |
|----------|-------------------|--------|-----------|
| Grafana chart repo | `grafana.github.io/helm-charts` vs `grafana-community.github.io/helm-charts` | `grafana-community` | Official Grafana chart migrated to community repo as of Jan 2026; old repo no longer receives updates |
| Two HelmRepository resources | Single repo vs separate repos for Grafana and Loki/Promtail | Separate | Loki and Promtail remain on `grafana.github.io/helm-charts`; only the Grafana chart moved to community repo |
| Loki schema version | v12 vs v13 | v13 with TSDB store | v13 is the current recommended schema for new deployments |
| Loki persistence size | 5Gi vs 10Gi vs 20Gi | 10Gi | 31-day retention with low-traffic portfolio sites; 10Gi provides headroom without waste |
| Disabled Loki sub-components | Selective vs exhaustive zeroing | Exhaustive (all 12 component types set to replicas: 0) | Avoids chart validation errors; explicit is better than implicit |

## Deviations from Spec

No deviations from spec.

## Artifacts Produced

| File | Status |
|------|--------|
| `.spec/spec-0005-observability-stack.md` | Created |
| `infra/main.tf` | Modified (3 resources added) |
| `k8s/observability/namespace.yaml` | Created |
| `k8s/observability/helmrepository-grafana.yaml` | Created |
| `k8s/observability/helmrepository-grafana-community.yaml` | Created |
| `k8s/observability/helmrelease-loki.yaml` | Created |
| `k8s/observability/helmrelease-promtail.yaml` | Created |
| `k8s/observability/externalsecret.yaml` | Created |
| `k8s/observability/helmrelease-grafana.yaml` | Created |
| `k8s/observability/ingress.yaml` | Created |
| `k8s/flux-system/observability-sync.yaml` | Created |
| `k8s/flux-system/kustomization.yaml` | Modified |
| `.provenance/spec-0005-observability-stack.provenance.md` | Created |

## Validation Results

| Check | Result |
|-------|--------|
| Spec saved to `.spec/` | Pass |
| `infra/main.tf` contains 3 new resources | Pass |
| `k8s/observability/` has 8 files | Pass |
| Loki: SingleBinary, replication_factor 1, filesystem, 744h, node2 | Pass |
| All non-SingleBinary replicas zeroed | Pass |
| Promtail: correct Loki URL, observability toleration | Pass |
| Grafana: envFromSecret, Loki datasource, root_url, node2 | Pass |
| ExternalSecret: GF_DATABASE_* + GF_SECURITY_ADMIN_PASSWORD | Pass |
| IngressRoute: monitoring.kevinryan.io, websecure, tls | Pass |
| Flux sync: dependsOn external-secrets-store | Pass |
| kustomization.yaml includes observability-sync.yaml | Pass |
| `terraform fmt -check -recursive infra/` | Pass |
| `pnpm lint` | Pass (0 errors) |
| Provenance record exists | Pass |
