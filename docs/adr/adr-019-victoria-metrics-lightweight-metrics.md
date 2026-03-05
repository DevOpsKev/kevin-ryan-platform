---
title: "ADR-019: Lightweight Metrics with Victoria Metrics"
---

**Status:** Accepted
**Date:** 2026-03-05
**Decision Makers:** Human + Agent
**Prompted By:** ADR-006 deferred metrics collection (Prometheus) until dynamic workloads justified it. The platform now runs 7 static sites, Umami, and a full observability stack across two K3s nodes. Node-level resource metrics (CPU, memory, disk) and Kubernetes object metrics (deployment health, pod restarts) are needed for operational awareness, but the B2s VM (4 GB RAM) on node2 leaves limited headroom after Loki and Grafana.

## Context

ADR-006 deployed Grafana + Loki + Promtail without Prometheus, noting that "current workloads are static sites with no `/metrics` endpoints" and that "when specmcp.ai introduces an API backend, a follow-on ADR will add Prometheus."

The platform has since grown: two K3s nodes (ADR-016), a shared PostgreSQL Flexible Server (ADR-017), External Secrets Operator (ADR-018), Umami analytics, and the observability stack itself. The Grafana dashboards (Spec 0006) provide log-based visibility, but cannot answer resource-level questions: Is node2 running out of memory? Which pods are consuming the most CPU? Is the PostgreSQL connection count climbing?

Prometheus is the standard answer, but it is memory-hungry. ADR-006 estimated 256-512 MB for the server alone, plus node-exporter. On node2 (B2s, 4 GB RAM), Loki and Grafana already consume ~500 MB. Adding Prometheus would push the node to ~1 GB for observability alone, with limited headroom for OS overhead and filesystem cache.

A lighter-weight, Prometheus-compatible metrics solution is needed.

### Current resource budget on node2 (B2s, 4 GB RAM)

| Component | Estimated RAM |
|-----------|---------------|
| Loki (SingleBinary) | ~256 MB |
| Grafana + sidecar | ~250 MB |
| OS + K3s agent overhead | ~512 MB |
| **Total committed** | **~1 GB** |
| **Available for metrics** | **~1-1.5 GB** |

## Decision Drivers

- **Resource efficiency:** Must fit within ~1-1.5 GB on node2 alongside Loki and Grafana, without upgrading the VM SKU.
- **Prometheus compatibility:** Must speak PromQL and scrape standard `/metrics` endpoints so existing Grafana community dashboards work without modification.
- **Operational simplicity:** Prefer a single binary/chart that bundles the metrics server, node-exporter, and kube-state-metrics, minimising the number of HelmReleases.
- **GitOps native:** Must deploy via Flux HelmRelease, consistent with the existing Loki/Promtail/Grafana pattern.
- **No external dependencies:** Self-hosted on the cluster, no cloud service tie-in.

## Options Considered

### Option A: Prometheus (kube-prometheus-stack)

The standard Kubernetes metrics stack. The `kube-prometheus-stack` Helm chart bundles Prometheus server, AlertManager, node-exporter, kube-state-metrics, and Grafana (which we'd disable).

- **Pros:** Industry standard, massive ecosystem, every dashboard and alert rule ever written targets it.
- **Cons:** Prometheus server uses 256-512 MB RAM at this scale. With AlertManager and recording rules, realistically ~400-600 MB. This would consume most of the remaining headroom on node2, leaving no margin for growth.
- **Estimated RAM:** ~400-600 MB (server + node-exporter + kube-state-metrics)

### Option B: Victoria Metrics (victoria-metrics-k8s-stack)

Drop-in Prometheus replacement. Victoria Metrics single-node server replaces the Prometheus server, using the same scrape configs and serving PromQL queries. The `victoria-metrics-k8s-stack` Helm chart bundles the VM server, node-exporter, and kube-state-metrics.

- **Pros:** 3-5x lower memory usage than Prometheus at equivalent data volumes. Single binary with built-in retention, compaction, and downsampling. Full PromQL compatibility — all Grafana community dashboards work without modification. Active open-source project with strong Kubernetes adoption.
- **Cons:** Less ubiquitous than Prometheus in enterprise environments. Fewer third-party integrations (though the Prometheus-compatible API covers most cases). Some advanced PromQL features (exemplars, native histograms) may lag behind upstream Prometheus.
- **Estimated RAM:** ~50-150 MB (server) + ~30 MB (node-exporter) + ~30 MB (kube-state-metrics) = ~110-210 MB total

### Option C: Grafana Alloy + Grafana Cloud free tier

Grafana Alloy (formerly Grafana Agent) collects metrics and remote-writes them to Grafana Cloud's free tier (10k series, 50 GB logs). Zero storage on the cluster.

- **Pros:** Minimal cluster resource usage (~30-50 MB for the agent). No TSDB to manage. Free tier is generous for this scale.
- **Cons:** Introduces an external dependency and data residency concern — same objection raised against Grafana Cloud in ADR-006. The observability stack is part of what the portfolio demonstrates; outsourcing metrics undermines that narrative. Also couples availability to Grafana Cloud's SLA.
- **Estimated RAM:** ~30-50 MB (agent only, no storage)

### Option D: Grafana Mimir (SingleBinary mode)

Grafana's own Prometheus-compatible long-term storage backend. Can run in SingleBinary mode similar to how Loki is deployed.

- **Pros:** Native Grafana ecosystem integration. Designed for scale.
- **Cons:** Heavier than Victoria Metrics — Mimir SingleBinary uses ~300-500 MB at small scale, comparable to Prometheus. Over-engineered for a two-node cluster. Better suited for multi-tenant, high-cardinality environments.
- **Estimated RAM:** ~300-500 MB

## Decision

**Victoria Metrics single-node as the metrics backend, deployed via the `victoria-metrics-k8s-stack` Helm chart with node-exporter and kube-state-metrics.** Option B.

Victoria Metrics provides full Prometheus/PromQL compatibility at a fraction of the resource cost. At ~110-210 MB total, it fits comfortably within node2's remaining headroom without requiring a VM SKU upgrade.

Key deployment details:

- **Victoria Metrics server** schedules on node2 (`nodeSelector: role: observability`, toleration for `observability=true:NoSchedule`), consistent with Loki and Grafana.
- **node-exporter** runs as a DaemonSet on ALL nodes (with observability taint toleration), consistent with Promtail.
- **kube-state-metrics** schedules on node1 (default, no special scheduling needed — it's lightweight and talks to the API server).
- **Grafana datasource** added as a second datasource (type: `prometheus`, URL: `http://vmsingle.observability.svc.cluster.local:8428`) alongside the existing Loki datasource.
- **Retention:** 31 days (`retentionPeriod: 31d`), matching Loki's 744h retention.
- **Storage:** 10 Gi persistent volume on node2, matching Loki.
- **AlertManager:** Disabled initially. Can be enabled in a future spec when alerting rules are defined.

### Updated resource budget on node2

| Component | Estimated RAM |
|-----------|---------------|
| Loki (SingleBinary) | ~256 MB |
| Grafana + sidecar | ~250 MB |
| Victoria Metrics server | ~100 MB |
| node-exporter (on node2) | ~30 MB |
| OS + K3s agent overhead | ~512 MB |
| **Total committed** | **~1.15 GB** |
| **B2s available** | **4 GB** |
| **Headroom** | **~2.85 GB** |

Comfortable margin. No VM upgrade needed.

## Consequences

### Positive

- Node-level resource metrics (CPU, memory, disk, network) visible in Grafana for both K3s nodes — fills the observability gap identified in ADR-006.
- Kubernetes object metrics (deployment replicas, pod restarts, container states) available via kube-state-metrics — enables cluster health dashboards.
- Full PromQL compatibility means thousands of community Grafana dashboards work out of the box (Node Exporter, Kubernetes cluster overview, etc.).
- ~110-210 MB total footprint leaves substantial headroom on node2 — no VM SKU upgrade required.
- Consistent deployment pattern: Flux HelmRelease, same as Loki/Promtail/Grafana.
- If the platform ever outgrows Victoria Metrics, migration to Prometheus is straightforward — same scrape configs, same PromQL, same dashboards.

### Negative

- Victoria Metrics is less universally recognised than Prometheus in enterprise conversations. Mitigation: the PromQL compatibility means the skills demonstrated are transferable; the decision to use VM over Prometheus is itself a talking point about pragmatic engineering.
- Some cutting-edge Prometheus features (native histograms, exemplars) may not be supported. Mitigation: these features are not needed for the current workloads.
- Adds another stateful service (VM server with PVC) to node2. Mitigation: node2 is dedicated to observability workloads; this is expected.

### Risks

- **Victoria Metrics project health:** VM is actively maintained with regular releases, but it's a smaller community than Prometheus. Mitigation: if VM were abandoned, migration to Prometheus is a chart swap — the scrape configs, dashboards, and PromQL queries all carry over.
- **node2 disk pressure:** Loki (10 Gi) + Victoria Metrics (10 Gi) = 20 Gi of persistent storage on node2. Mitigation: B2s default OS disk is 30 Gi; may need to increase if both stores grow. Monitor via the metrics VM itself provides.
- **Scrape target discovery:** Victoria Metrics uses the same `kubernetes_sd_configs` as Prometheus. If service monitors or pod annotations are misconfigured, metrics won't be collected. Mitigation: the `victoria-metrics-k8s-stack` chart includes sensible defaults for node-exporter and kube-state-metrics scraping.

## Agent Decisions

No agent implementation decisions recorded — this ADR documents the human-directed architectural decision.

## References

- [ADR-006: Observability with Grafana, Loki, and Promtail](adr-006-observability-grafana-loki-promtail.md) — deferred Prometheus, established the observability stack this ADR extends
- [ADR-016: Second K3s node for observability](adr-016-second-k3s-node-for-observability.md) — node2 taint/label scheduling model
- [ADR-017: Managed PostgreSQL shared database](adr-017-managed-postgresql-shared-database.md) — shared database infrastructure
- [Victoria Metrics documentation](https://docs.victoriametrics.com/)
- [victoria-metrics-k8s-stack Helm chart](https://github.com/VictoriaMetrics/helm-charts/tree/master/charts/victoria-metrics-k8s-stack)
- [Victoria Metrics vs Prometheus comparison](https://docs.victoriametrics.com/faq/#what-is-the-difference-between-victoriametrics-and-prometheus)
