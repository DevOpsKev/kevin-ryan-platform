# Spec 0006: Grafana Dashboards via GitOps

## Task

1. Save this spec to `.spec/spec-0006-grafana-dashboards.md` in the repo.
2. Implement all changes described below.
3. After completing all work, create a provenance record at `.provenance/spec-0006-grafana-dashboards.provenance.md`. See the **Provenance Record** section for the required format.

## Prerequisites

- Spec 0005 deployed: Grafana, Loki, and Promtail running in the `observability` namespace on node2
- Read ADR-006 (`docs/adr/adr-006-observability-grafana-loki-promtail.md`) — the architectural decision that established the observability stack

## Context

Grafana is deployed but has no dashboards. The only datasource is Loki (logs). Prometheus is not yet installed — dashboards must use LogQL queries only.

The Grafana community Helm chart includes a sidecar container that watches for ConfigMaps with a specific label and auto-provisions them as dashboards. This is the standard GitOps mechanism for dashboard management: dashboard JSON is stored in ConfigMap manifests in Git, Flux applies them, and the sidecar loads them into Grafana without manual intervention.

### Current state (read these files before making changes)

| File / Directory | What it does |
|-----------------|-------------|
| `k8s/observability/helmrelease-grafana.yaml` | Grafana HelmRelease — needs sidecar config added |
| `k8s/observability/helmrelease-loki.yaml` | Loki HelmRelease — SingleBinary mode, 744h retention |
| `k8s/observability/helmrelease-promtail.yaml` | Promtail DaemonSet on all nodes |
| `k8s/flux-system/observability-sync.yaml` | Flux Kustomization for `k8s/observability/` — already syncs this directory |

### Key facts

- **Datasource:** Loki only (no Prometheus) — all panels must use LogQL
- **Loki datasource name:** `Loki` (configured in `helmrelease-grafana.yaml` as the default datasource)
- **Sidecar label:** `grafana_dashboard: "1"` (Grafana chart default)
- **Dashboard namespace:** `observability` (same as Grafana)
- **Promtail labels available:** `namespace`, `pod`, `container`, `node_name`, `stream` (stdout/stderr)
- **Workloads generating logs:**
  - 7 static sites (nginx access/error logs): kevinryan-io, brand-kevinryan-io, aiimmigrants-com, specmcp-ai, sddbook-com, distributedequity-org, docs-kevinryan-io
  - Umami (Node.js application logs)
  - Flux controllers (kustomize-controller, helm-controller, source-controller — structured JSON logs)
  - External Secrets Operator
  - K3s system pods (coredns, traefik, metrics-server, local-path-provisioner)
  - Observability stack itself (Loki, Promtail, Grafana)

## 1. Update Grafana HelmRelease — enable dashboard sidecar

Modify `k8s/observability/helmrelease-grafana.yaml` to explicitly enable the dashboard sidecar in the `values` section. Add the following block under `values`:

```yaml
    sidecar:
      dashboards:
        enabled: true
        label: grafana_dashboard
        labelValue: "1"
        searchNamespace: observability
        folderAnnotation: grafana_folder
```

**Design notes:**

- The chart enables the sidecar by default, but making it explicit documents the label convention and avoids surprises if chart defaults change.
- `searchNamespace: observability` restricts the sidecar to only watch ConfigMaps in the Grafana namespace. This is sufficient because all dashboard ConfigMaps live in `k8s/observability/`.
- `folderAnnotation: grafana_folder` allows future dashboards to specify a folder via annotation.

## 2. Create Platform Overview dashboard ConfigMap

Create `k8s/observability/dashboard-platform-overview.yaml`:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: dashboard-platform-overview
  namespace: observability
  labels:
    grafana_dashboard: "1"
data:
  platform-overview.json: |
    {
      "annotations": {
        "list": []
      },
      "editable": false,
      "fiscalYearStartMonth": 0,
      "graphTooltip": 1,
      "links": [],
      "panels": [
        {
          "title": "Log Volume by Namespace",
          "type": "timeseries",
          "gridPos": { "h": 8, "w": 24, "x": 0, "y": 0 },
          "datasource": { "type": "loki", "uid": "" },
          "targets": [
            {
              "expr": "sum by (namespace) (count_over_time({namespace=~\"$namespace\"} [$__interval]))",
              "legendFormat": "{{ namespace }}",
              "refId": "A"
            }
          ],
          "fieldConfig": {
            "defaults": {
              "custom": {
                "drawStyle": "bars",
                "fillOpacity": 80,
                "stacking": { "mode": "normal" }
              },
              "unit": "short"
            },
            "overrides": []
          },
          "options": {
            "tooltip": { "mode": "multi" },
            "legend": { "displayMode": "table", "placement": "right", "calcs": ["sum"] }
          }
        },
        {
          "title": "Error Rate",
          "type": "timeseries",
          "gridPos": { "h": 8, "w": 12, "x": 0, "y": 8 },
          "datasource": { "type": "loki", "uid": "" },
          "targets": [
            {
              "expr": "sum(count_over_time({namespace=~\"$namespace\"} |~ \"(?i)(error|fatal|panic)\" [$__interval]))",
              "legendFormat": "Errors",
              "refId": "A"
            }
          ],
          "fieldConfig": {
            "defaults": {
              "custom": {
                "drawStyle": "line",
                "fillOpacity": 20,
                "lineWidth": 2
              },
              "color": { "mode": "fixed", "fixedColor": "red" },
              "unit": "short"
            },
            "overrides": []
          },
          "options": {
            "tooltip": { "mode": "single" },
            "legend": { "displayMode": "list", "placement": "bottom" }
          }
        },
        {
          "title": "Error Rate by Namespace",
          "type": "timeseries",
          "gridPos": { "h": 8, "w": 12, "x": 12, "y": 8 },
          "datasource": { "type": "loki", "uid": "" },
          "targets": [
            {
              "expr": "sum by (namespace) (count_over_time({namespace=~\"$namespace\"} |~ \"(?i)(error|fatal|panic)\" [$__interval]))",
              "legendFormat": "{{ namespace }}",
              "refId": "A"
            }
          ],
          "fieldConfig": {
            "defaults": {
              "custom": {
                "drawStyle": "line",
                "fillOpacity": 10,
                "lineWidth": 2
              },
              "unit": "short"
            },
            "overrides": []
          },
          "options": {
            "tooltip": { "mode": "multi" },
            "legend": { "displayMode": "table", "placement": "right", "calcs": ["sum"] }
          }
        },
        {
          "title": "Recent Errors",
          "type": "logs",
          "gridPos": { "h": 10, "w": 24, "x": 0, "y": 16 },
          "datasource": { "type": "loki", "uid": "" },
          "targets": [
            {
              "expr": "{namespace=~\"$namespace\"} |~ \"(?i)(error|fatal|panic)\"",
              "refId": "A"
            }
          ],
          "options": {
            "showTime": true,
            "showLabels": true,
            "showCommonLabels": false,
            "wrapLogMessage": true,
            "prettifyLogMessage": false,
            "enableLogDetails": true,
            "sortOrder": "Descending",
            "dedupStrategy": "none"
          }
        }
      ],
      "schemaVersion": 39,
      "tags": ["platform", "overview", "loki"],
      "templating": {
        "list": [
          {
            "name": "namespace",
            "type": "query",
            "datasource": { "type": "loki", "uid": "" },
            "query": { "label": "namespace", "stream": "", "type": 1 },
            "current": { "text": "All", "value": "$__all" },
            "includeAll": true,
            "allValue": ".+",
            "multi": true,
            "refresh": 2,
            "sort": 1
          }
        ]
      },
      "time": { "from": "now-6h", "to": "now" },
      "title": "Platform Overview",
      "uid": "platform-overview"
    }
```

**Design notes:**

- `"editable": false` — dashboards are managed by Git, not by clicking in the UI. Manual edits would be overwritten on next Flux reconciliation.
- `"uid": "platform-overview"` — stable UID so Grafana updates the dashboard in place rather than creating duplicates.
- The `namespace` template variable uses a Loki label values query, includes "All" option with regex `.+`, and supports multi-select.
- Datasource UID is left as `""` (empty string) — Grafana resolves this to the default datasource, which is Loki.
- Four panels: log volume (stacked bars), total error rate (red line), error rate by namespace (multi-line), and recent errors (logs table).
- Error detection regex `(?i)(error|fatal|panic)` is case-insensitive and catches the most common severity indicators across nginx, Node.js, and Go log formats.

## 3. Create Flux CD dashboard ConfigMap

Create `k8s/observability/dashboard-flux-cd.yaml`:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: dashboard-flux-cd
  namespace: observability
  labels:
    grafana_dashboard: "1"
data:
  flux-cd.json: |
    {
      "annotations": {
        "list": []
      },
      "editable": false,
      "fiscalYearStartMonth": 0,
      "graphTooltip": 1,
      "links": [],
      "panels": [
        {
          "title": "Reconciliation Activity",
          "type": "timeseries",
          "gridPos": { "h": 6, "w": 24, "x": 0, "y": 0 },
          "datasource": { "type": "loki", "uid": "" },
          "targets": [
            {
              "expr": "sum by (container) (count_over_time({namespace=\"flux-system\", container=~\"$controller\"} |~ \"(?i)reconcil\" [$__interval]))",
              "legendFormat": "{{ container }}",
              "refId": "A"
            }
          ],
          "fieldConfig": {
            "defaults": {
              "custom": {
                "drawStyle": "bars",
                "fillOpacity": 60,
                "stacking": { "mode": "normal" }
              },
              "unit": "short"
            },
            "overrides": []
          },
          "options": {
            "tooltip": { "mode": "multi" },
            "legend": { "displayMode": "list", "placement": "bottom" }
          }
        },
        {
          "title": "Flux Errors and Warnings",
          "type": "timeseries",
          "gridPos": { "h": 6, "w": 24, "x": 0, "y": 6 },
          "datasource": { "type": "loki", "uid": "" },
          "targets": [
            {
              "expr": "sum by (container) (count_over_time({namespace=\"flux-system\", container=~\"$controller\"} |~ \"(?i)(error|warn|failed)\" [$__interval]))",
              "legendFormat": "{{ container }}",
              "refId": "A"
            }
          ],
          "fieldConfig": {
            "defaults": {
              "custom": {
                "drawStyle": "line",
                "fillOpacity": 20,
                "lineWidth": 2,
                "pointSize": 5
              },
              "color": { "mode": "palette-classic" },
              "unit": "short"
            },
            "overrides": []
          },
          "options": {
            "tooltip": { "mode": "multi" },
            "legend": { "displayMode": "list", "placement": "bottom" }
          }
        },
        {
          "title": "Reconciliation Events",
          "type": "logs",
          "gridPos": { "h": 10, "w": 24, "x": 0, "y": 12 },
          "datasource": { "type": "loki", "uid": "" },
          "targets": [
            {
              "expr": "{namespace=\"flux-system\", container=~\"$controller\"} |~ \"(?i)(reconcil|applied|created|deleted|updated|drift|error|warn|failed)\"",
              "refId": "A"
            }
          ],
          "options": {
            "showTime": true,
            "showLabels": true,
            "showCommonLabels": false,
            "wrapLogMessage": true,
            "prettifyLogMessage": false,
            "enableLogDetails": true,
            "sortOrder": "Descending",
            "dedupStrategy": "none"
          }
        },
        {
          "title": "All Flux Logs",
          "type": "logs",
          "gridPos": { "h": 10, "w": 24, "x": 0, "y": 22 },
          "datasource": { "type": "loki", "uid": "" },
          "targets": [
            {
              "expr": "{namespace=\"flux-system\", container=~\"$controller\"}",
              "refId": "A"
            }
          ],
          "options": {
            "showTime": true,
            "showLabels": true,
            "showCommonLabels": false,
            "wrapLogMessage": true,
            "prettifyLogMessage": false,
            "enableLogDetails": true,
            "sortOrder": "Descending",
            "dedupStrategy": "none"
          }
        }
      ],
      "schemaVersion": 39,
      "tags": ["flux", "gitops", "loki"],
      "templating": {
        "list": [
          {
            "name": "controller",
            "type": "custom",
            "current": { "text": "All", "value": "$__all" },
            "includeAll": true,
            "allValue": "kustomize-controller|helm-controller|source-controller",
            "options": [
              { "text": "All", "value": "$__all", "selected": true },
              { "text": "kustomize-controller", "value": "kustomize-controller", "selected": false },
              { "text": "helm-controller", "value": "helm-controller", "selected": false },
              { "text": "source-controller", "value": "source-controller", "selected": false }
            ],
            "query": "kustomize-controller,helm-controller,source-controller",
            "multi": true
          }
        ]
      },
      "time": { "from": "now-6h", "to": "now" },
      "title": "Flux CD",
      "uid": "flux-cd"
    }
```

**Design notes:**

- `controller` template variable is a static custom list (not a query) because the three Flux controllers are fixed and known.
- `allValue` uses pipe-separated regex so the LogQL `container=~"$controller"` filter works correctly when "All" is selected.
- Four panels: reconciliation activity (stacked bars), errors/warnings (line chart), filtered reconciliation events (logs), and unfiltered full logs (for debugging).
- Reconciliation event filter includes `reconcil|applied|created|deleted|updated|drift|error|warn|failed` to surface the most operationally relevant log lines.

## No Terraform changes

DNS, secrets, and infrastructure are all already in place from Spec 0005. No changes to `infra/`.

## No Flux sync changes

Dashboard ConfigMaps live in `k8s/observability/` which is already synced by `k8s/flux-system/observability-sync.yaml`. No new sync resource needed.

## Manual steps (not performed by the agent)

After merging to `main`, Flux will reconcile automatically (within 10 minutes) or trigger manually:

```bash
az vm run-command invoke \
  --resource-group rg-kevinryan-io \
  --name vm-kevinryan-node1 \
  --command-id RunShellScript \
  --scripts "export KUBECONFIG=/etc/rancher/k3s/k3s.yaml && flux reconcile kustomization flux-system --with-source"
```

Wait 2-3 minutes for the Grafana pod to restart (sidecar config change triggers rollout), then verify:

```bash
az vm run-command invoke \
  --resource-group rg-kevinryan-io \
  --name vm-kevinryan-node1 \
  --command-id RunShellScript \
  --scripts "export KUBECONFIG=/etc/rancher/k3s/k3s.yaml && kubectl get configmap -n observability -l grafana_dashboard=1"
```

Should show `dashboard-platform-overview` and `dashboard-flux-cd`.

Then visit `https://monitoring.kevinryan.io` and verify both dashboards appear in the dashboard list.

## Provenance Record

After completing the work, create `.provenance/spec-0006-grafana-dashboards.provenance.md` using the provenance template at `.provenance/template.md`.

## Validation steps

After completing all work, confirm:

1. This spec has been saved to `.spec/spec-0006-grafana-dashboards.md`
2. `k8s/observability/helmrelease-grafana.yaml` includes `sidecar.dashboards.enabled: true` with `label: grafana_dashboard`, `labelValue: "1"`, and `searchNamespace: observability`
3. `k8s/observability/dashboard-platform-overview.yaml` exists as a ConfigMap with label `grafana_dashboard: "1"` and contains valid dashboard JSON with `"uid": "platform-overview"`
4. The Platform Overview dashboard JSON includes: namespace template variable, log volume by namespace panel, error rate panel, error rate by namespace panel, and recent errors logs panel
5. `k8s/observability/dashboard-flux-cd.yaml` exists as a ConfigMap with label `grafana_dashboard: "1"` and contains valid dashboard JSON with `"uid": "flux-cd"`
6. The Flux CD dashboard JSON includes: controller template variable (kustomize-controller, helm-controller, source-controller), reconciliation activity panel, errors/warnings panel, reconciliation events logs panel, and all logs panel
7. All dashboard JSON has `"editable": false`
8. No Terraform files were modified
9. No new Flux sync resources were created (existing `observability-sync.yaml` covers `k8s/observability/`)
10. `pnpm lint` passes (markdownlint on spec and provenance files)
11. The provenance record exists at `.provenance/spec-0006-grafana-dashboards.provenance.md` and contains all required sections
12. All files (spec, ConfigMaps, HelmRelease change, provenance) are committed together
