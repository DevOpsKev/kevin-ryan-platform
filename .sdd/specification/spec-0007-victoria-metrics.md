---
title: "Spec 0007: Victoria Metrics Metrics Stack"
---

## Task

1. Save this spec to `.spec/spec-0007-victoria-metrics.md` in the repo.
2. Implement all changes described below.
3. After completing all work, create a provenance record at `.provenance/spec-0007-victoria-metrics.provenance.md`. See the **Provenance Record** section for the required format.

## Prerequisites

- Spec 0005 deployed: Observability stack running (Grafana, Loki, Promtail in `observability` namespace)
- Spec 0006 deployed: Grafana dashboard sidecar enabled with `grafana_dashboard: "1"` label
- Read ADR-019 (`docs/adr/adr-019-victoria-metrics-lightweight-metrics.md`) — the architectural decision this spec implements

## Context

ADR-019 mandates Victoria Metrics as a lightweight, Prometheus-compatible metrics backend for the platform. The existing observability stack (Loki + Promtail + Grafana) provides log-based visibility but cannot answer resource-level questions: node CPU/memory usage, pod resource consumption, deployment health, or connection counts.

Victoria Metrics replaces Prometheus at a fraction of the memory cost (~110-210 MB vs ~400-600 MB). The `victoria-metrics-k8s-stack` Helm chart bundles the VM operator, VMSingle (time-series database), VMAgent (metrics scraper), node-exporter, and kube-state-metrics in a single HelmRelease.

The chart includes pre-built Grafana dashboard ConfigMaps (with `grafana_dashboard: "1"` label) that the existing Grafana sidecar (configured in Spec 0006) will auto-discover. No manual dashboard creation is needed.

### Current state (read these files before making changes)

| File / Directory | What it does |
|-----------------|-------------|
| `k8s/observability/` | Existing observability manifests (Grafana, Loki, Promtail, dashboards) |
| `k8s/observability/helmrelease-grafana.yaml` | Grafana HelmRelease — needs Victoria Metrics datasource added |
| `k8s/observability/namespace.yaml` | Observability namespace definition |
| `k8s/flux-system/observability-sync.yaml` | Flux sync for `k8s/observability/` — no changes needed |
| `docs/adr/adr-019-victoria-metrics-lightweight-metrics.md` | ADR mandating this work |

### Key facts

- **Helm chart repo:** `https://victoriametrics.github.io/helm-charts/`
- **Chart name:** `victoria-metrics-k8s-stack`
- **Chart version constraint:** `>=0.70.0 <1.0.0`
- **VMSingle port:** 8428
- **VMAgent port:** 8429
- **Release fullnameOverride:** `vm` (avoids hitting 63-character Kubernetes resource name limit)
- **VMSingle service name:** `vmsingle-vm` (operator naming convention: `vmsingle-<fullname>`)
- **Grafana datasource URL:** `http://vmsingle-vm.observability.svc.cluster.local:8428`
- **Grafana datasource name:** `VictoriaMetrics` (must match `external.grafana.datasource` in the chart — used by default dashboards)
- **Node2 taint:** `observability=true:NoSchedule`
- **Node2 label:** `role=observability`
- **Retention:** 31 days (`retentionPeriod: "31d"`)
- **Storage:** 10 Gi PVC
- **No Terraform changes required**
- **No Flux sync changes required** (existing `observability-sync.yaml` covers `k8s/observability/`)

## 1. HelmRepository for Victoria Metrics

Create `k8s/observability/helmrepository-victoriametrics.yaml`:

```yaml
apiVersion: source.toolkit.fluxcd.io/v1
kind: HelmRepository
metadata:
  name: victoriametrics
  namespace: observability
spec:
  interval: 1h
  url: https://victoriametrics.github.io/helm-charts/
```

## 2. HelmRelease for victoria-metrics-k8s-stack

Create `k8s/observability/helmrelease-victoria-metrics.yaml`:

```yaml
apiVersion: helm.toolkit.fluxcd.io/v2
kind: HelmRelease
metadata:
  name: victoria-metrics
  namespace: observability
spec:
  interval: 1h
  chart:
    spec:
      chart: victoria-metrics-k8s-stack
      version: ">=0.70.0 <1.0.0"
      sourceRef:
        kind: HelmRepository
        name: victoriametrics
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
    fullnameOverride: vm

    # --- Victoria Metrics Operator ---
    victoria-metrics-operator:
      enabled: true
      operator:
        disable_prometheus_converter: false
      nodeSelector:
        role: observability
      tolerations:
        - key: observability
          operator: Equal
          value: "true"
          effect: NoSchedule

    # --- VMSingle (time-series database) ---
    vmsingle:
      enabled: true
      spec:
        retentionPeriod: "31d"
        storage:
          accessModes:
            - ReadWriteOnce
          resources:
            requests:
              storage: 10Gi
        nodeSelector:
          role: observability
        tolerations:
          - key: observability
            operator: Equal
            value: "true"
            effect: NoSchedule

    # --- VMAgent (metrics scraper) ---
    vmagent:
      enabled: true
      spec:
        scrapeInterval: 30s
        selectAllByDefault: true
        nodeSelector:
          role: observability
        tolerations:
          - key: observability
            operator: Equal
            value: "true"
            effect: NoSchedule

    # --- node-exporter (DaemonSet on ALL nodes) ---
    prometheus-node-exporter:
      enabled: true
      tolerations:
        - key: observability
          operator: Equal
          value: "true"
          effect: NoSchedule

    # --- kube-state-metrics (on node1, default scheduling) ---
    kube-state-metrics:
      enabled: true

    # --- Disable bundled Grafana (we have our own from Spec 0005) ---
    grafana:
      enabled: false

    # --- Dashboard ConfigMaps (auto-discovered by our Grafana sidecar) ---
    defaultDashboards:
      enabled: true

    # --- Datasource name embedded in dashboard JSONs ---
    external:
      grafana:
        datasource: VictoriaMetrics

    # --- Recording rules (pre-computed metrics for dashboards) ---
    defaultRules:
      create: true

    # --- Disable alerting components (deferred to a future spec per ADR-019) ---
    alertmanager:
      enabled: false
    vmalert:
      enabled: false
    vmauth:
      enabled: false
    vmcluster:
      enabled: false

    # --- K3s does not expose these as separate services ---
    kubeControllerManager:
      enabled: false
    kubeScheduler:
      enabled: false
    kubeEtcd:
      enabled: false
    kubeProxy:
      enabled: false

    # --- Kubelet scraping (K3s exposes kubelet metrics on the standard HTTPS port) ---
    kubelet:
      enabled: true
```

**Design notes:**

- `fullnameOverride: vm` keeps resource names short, avoiding the 63-character Kubernetes name limit. The VMSingle service becomes `vmsingle-vm`, VMAgent becomes `vmagent-vm`.
- `grafana.enabled: false` disables the bundled Grafana. Our existing Grafana (Spec 0005) is used instead.
- `defaultDashboards.enabled: true` creates ConfigMaps with `grafana_dashboard: "1"` label. The existing Grafana sidecar (Spec 0006) auto-discovers and provisions these dashboards.
- `external.grafana.datasource: VictoriaMetrics` sets the datasource name embedded in dashboard JSON. This must match the datasource name configured in our Grafana HelmRelease (Section 3).
- K3s bundles kube-controller-manager, kube-scheduler, and etcd into the K3s binary. The default scrape configs for these components expect separate pods/services that don't exist in K3s. Disabling them avoids noisy error logs from failed service discovery.
- `kubeProxy.enabled: false` — K3s uses kube-proxy built into the binary, same reasoning.
- `kubelet.enabled: true` — K3s does expose kubelet metrics on the standard HTTPS port, so this works.
- `vmalert.enabled: false` and `alertmanager.enabled: false` — alerting deferred to a future spec, per ADR-019.
- `vmcluster.enabled: false` — using VMSingle (single-node TSDB), not the clustered deployment.
- `vmauth.enabled: false` — authentication proxy not needed for internal-only access.
- `prometheus-node-exporter.tolerations` includes the observability taint so it schedules on BOTH nodes (DaemonSet runs on node1 by default; the toleration enables node2).
- `victoria-metrics-operator` schedules on node2, consistent with other observability components.
- `vmsingle.spec.retentionPeriod: "31d"` matches Loki's 744h (31 day) retention, per ADR-019.
- `vmsingle.spec.storage: 10Gi` matches Loki's storage allocation, per ADR-019.
- `vmagent.spec.scrapeInterval: 30s` balances metric freshness with resource usage for a small cluster.
- CRD management uses `install.crds: CreateReplace` and `upgrade.crds: CreateReplace`, matching the pattern from the Loki HelmRelease.

## 3. Update Grafana HelmRelease (add Victoria Metrics datasource)

Modify `k8s/observability/helmrelease-grafana.yaml` — add Victoria Metrics as a second datasource alongside Loki.

The `datasources` section should become:

```yaml
    datasources:
      datasources.yaml:
        apiVersion: 1
        datasources:
          - name: Loki
            type: loki
            access: proxy
            url: http://loki.observability.svc.cluster.local:3100
            isDefault: true
          - name: VictoriaMetrics
            type: prometheus
            access: proxy
            url: http://vmsingle-vm.observability.svc.cluster.local:8428
            isDefault: false
```

**Design notes:**

- The datasource name `VictoriaMetrics` must match `external.grafana.datasource` in the k8s-stack chart values. The default dashboards reference this name in their JSON.
- `type: prometheus` — Victoria Metrics is fully PromQL-compatible and uses Grafana's built-in Prometheus datasource type.
- `isDefault: false` — Loki remains the default datasource. Metrics dashboards explicitly reference `VictoriaMetrics` by name.
- The URL uses the in-cluster service DNS: `vmsingle-vm` is derived from `fullnameOverride: vm` plus the operator naming convention `vmsingle-<name>`, on port 8428 (VMSingle default).

## Manual steps (not performed by the agent)

### After merge to main — Flux reconciliation

```bash
flux reconcile kustomization flux-system --with-source
```

Wait 3-5 minutes for the chart to install. The VM operator needs to start before it can create the VMSingle and VMAgent pods. Then verify:

```bash
echo '=== HelmReleases ===' && \
kubectl get helmrelease -n observability && \
echo '=== Pods ===' && \
kubectl get pods -n observability -o wide && \
echo '=== VMSingle ===' && \
kubectl get vmsingle -n observability && \
echo '=== VMAgent ===' && \
kubectl get vmagent -n observability && \
echo '=== Services ===' && \
kubectl get svc -n observability | grep -E 'vm|node-exporter|kube-state'
```

Expected pods:

- `vmsingle-vm-0` (StatefulSet, on node2)
- `vmagent-vm-*` (StatefulSet, on node2)
- `vm-victoria-metrics-operator-*` (Deployment, on node2)
- `vm-prometheus-node-exporter-*` (DaemonSet, one per node)
- `vm-kube-state-metrics-*` (Deployment, on node1)

### Verify metrics are being collected

```bash
kubectl run -n observability curl-test --rm -it --restart=Never \
  --image=curlimages/curl -- \
  curl -s 'http://vmsingle-vm:8428/api/v1/query?query=up'
```

Should return a JSON response with `"status":"success"` and multiple `up` metric entries.

### Verify dashboards in Grafana

1. Open `https://monitoring.kevinryan.io`
2. Navigate to Dashboards
3. Expect to see new dashboards from the k8s-stack (Node Exporter Full, Kubernetes overview, VictoriaMetrics internal metrics, etc.)
4. Open "Node Exporter / Nodes" — should show CPU, memory, disk, and network metrics for both K3s nodes

### Troubleshooting

If dashboards do not appear in Grafana after the chart installs:

1. Check that dashboard ConfigMaps exist:

    ```bash
    kubectl get configmap -n observability -l grafana_dashboard=1
    ```

2. If no ConfigMaps from the k8s-stack are listed, the chart may require `grafana.forceDeployDatasource: true` to create dashboard ConfigMaps when the bundled Grafana is disabled. Add this value to the HelmRelease and reconcile.

3. If ConfigMaps exist but Grafana doesn't show them, restart the Grafana pod to trigger sidecar re-scan:

    ```bash
    kubectl rollout restart deployment grafana -n observability
    ```

## Provenance Record

After completing the work, create `.provenance/spec-0007-victoria-metrics.provenance.md` using the provenance template at `.provenance/template.md`.

## Validation steps

After completing all work, confirm:

1. This spec has been saved to `.spec/spec-0007-victoria-metrics.md`
2. `k8s/observability/helmrepository-victoriametrics.yaml` exists with URL `https://victoriametrics.github.io/helm-charts/`
3. `k8s/observability/helmrelease-victoria-metrics.yaml` exists with chart `victoria-metrics-k8s-stack`, `fullnameOverride: vm`, and all values from Section 2
4. VMSingle is configured with `retentionPeriod: "31d"`, `storage: 10Gi`, and schedules on node2 (`nodeSelector` + `tolerations`)
5. VMAgent is configured with `scrapeInterval: 30s`, `selectAllByDefault: true`, and schedules on node2
6. node-exporter tolerates the observability taint (runs on ALL nodes)
7. kube-state-metrics has no special scheduling (runs on node1 by default)
8. Grafana, AlertManager, VMAlert, VMAuth, and VMCluster are all disabled in the chart values
9. K3s-incompatible scrape targets are disabled (`kubeControllerManager`, `kubeScheduler`, `kubeEtcd`, `kubeProxy`)
10. `defaultDashboards.enabled: true` and `external.grafana.datasource: VictoriaMetrics`
11. `k8s/observability/helmrelease-grafana.yaml` has a second datasource named `VictoriaMetrics` with type `prometheus` and URL `http://vmsingle-vm.observability.svc.cluster.local:8428`
12. Loki remains `isDefault: true`, VictoriaMetrics is `isDefault: false`
13. `pnpm lint` passes
14. The provenance record exists at `.provenance/spec-0007-victoria-metrics.provenance.md` and contains all required sections
15. All files (spec, manifests, provenance) are committed together
