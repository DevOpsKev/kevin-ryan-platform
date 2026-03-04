---
title: "ADR-006: Observability with Grafana, Loki, and Promtail"
---

**Status:** Accepted
**Date:** 2026-02-28
**Decision Makers:** Human + AI
**Prompted By:** ADR-005 provisions a K3s cluster hosting multiple sites. Need infrastructure observability (log aggregation, dashboards, alerting) and a single pane of glass that also surfaces web analytics from the Umami instance established in ADR-003.

## Context

The K3s cluster from ADR-005 will run three static sites (kevinryan.io, sddbook.com, aiimmigrants.com), the Umami analytics stack from ADR-003, and the observability workloads defined here. All of this runs on a single Azure Spot B2ms VM (8 GB RAM).

Today there is no visibility into what's happening on the cluster. Nginx produces JSON structured access logs (configured in ADR-001), but nobody is collecting, storing, or querying them. When a pod crashes or Traefik misroutes, the only diagnostic path is SSH and kubectl — reactive, not proactive.

The observability stack must answer two questions: "are my containers and ingress healthy?" (infrastructure) and "what traffic patterns do my sites show?" (analytics). ADR-003 already deployed Umami for the second question but in its own dashboard. Consolidating both views into a single tool reduces context-switching and produces a stronger demo for client conversations.

The cluster also serves as a credibility signal for the DevEx/Platform Engineering positioning. A working Grafana instance with real dashboards is demonstrably more compelling than claiming observability experience without artefacts.

## Decision Drivers

- **Single pane of glass:** One dashboard URL for both infrastructure logs and web analytics, not two separate tools.
- **Resource efficiency:** Must fit within the remaining memory budget on a single B2ms node alongside K3s system components, three nginx pods, Umami, and PostgreSQL.
- **Kubernetes-native log collection:** Promtail must pick up container stdout/stderr automatically via the Kubernetes API, not require per-pod configuration.
- **Queryable structured logs:** Nginx already outputs JSON logs (ADR-001). The log backend must support label-based and JSON-field queries, not just full-text grep.
- **No dead weight:** Only deploy components that serve current workloads. Metrics collection is deferred until dynamic workloads (e.g., specmcp.ai API) exist to scrape.
- **Shared infrastructure:** Minimise the number of stateful services on the cluster by reusing the PostgreSQL instance from ADR-003.

## Options Considered

### Option A: Grafana + Loki + Promtail (no Prometheus)

Promtail runs as a DaemonSet, tails container logs from the node filesystem, enriches them with Kubernetes labels (pod, namespace, container), and ships them to Loki. Loki stores and indexes logs with a small footprint (BoltDB index + filesystem chunks). Grafana queries Loki via LogQL and also connects to Umami's PostgreSQL as a second datasource. Grafana uses the shared PostgreSQL instance for its own state (dashboards, users, alerting state).

Estimated memory: Promtail ~100 MB, Loki ~256 MB, Grafana ~200 MB. Total ~556 MB.

No Prometheus, no node_exporter, no metrics scraping. Current workloads are static sites — there are no application metrics to collect. Nginx request data is already captured in access logs, which Loki handles natively.

### Option B: Grafana + Loki + Promtail + Prometheus

Adds Prometheus server and node_exporter to Option A. Prometheus scrapes node-level metrics (CPU, memory, disk) and any future application metrics. Grafana gets a third datasource.

Prometheus server alone requires 256–512 MB for a small cluster, plus node_exporter at ~30 MB. Total observability footprint rises to ~850 MB–1.1 GB. On a single-node cluster running static sites, the only metrics worth scraping are node resources — and those are already visible via `kubectl top` and Loki-ingested system logs.

Prometheus earns its place when specmcp.ai or other dynamic workloads expose `/metrics` endpoints. Premature now.

### Option C: Grafana + Loki + Promtail + node_exporter only

A middle ground: skip the Prometheus server but run node_exporter to expose host metrics. Grafana can read node_exporter's metrics file directly or via a lightweight Prometheus instance.

This is half a metrics stack. node_exporter without Prometheus means either running Prometheus anyway (becoming Option B) or using Grafana Agent in metrics mode, which is essentially a Prometheus fork with different packaging. Same resource cost, more moving parts, for metrics that don't drive decisions today.

### Option D: ELK Stack (Elasticsearch + Logstash + Kibana)

The enterprise-standard log aggregation stack. Elasticsearch alone requires 1–2 GB heap minimum. Logstash adds another 512 MB. The three components would consume more RAM than all other cluster workloads combined. Designed for organisations processing millions of events per day, not a portfolio cluster.

### Option E: Grafana Cloud (hosted)

Free tier offers 50 GB logs, 10k metrics series, 50 GB traces. Zero infrastructure.

Removes the operational surface — same objection as Azure Container Apps in ADR-005. The observability stack is part of what the portfolio demonstrates. Also introduces an external dependency and data residency consideration for a privacy-conscious consultancy.

## Decision

**Grafana + Loki + Promtail, no Prometheus. Grafana shares the Umami PostgreSQL instance for state storage.** Option A.

The architecture within the K3s cluster:

```text
  ┌─────────────────────────────────────────────────────┐
  │                    K3s Node                          │
  │                                                     │
  │  ┌─────────────┐  stdout/stderr  ┌───────────────┐  │
  │  │ nginx pods  │ ──────────────▶ │   Promtail    │  │
  │  │ (×3 sites)  │                 │  (DaemonSet)  │  │
  │  └─────────────┘                 └──────┬────────┘  │
  │                                         │           │
  │  ┌─────────────┐                        │ push      │
  │  │   Umami     │                        │           │
  │  │  (Next.js)  │                 ┌──────▼────────┐  │
  │  └──────┬──────┘                 │     Loki      │  │
  │         │                        │  (log store)  │  │
  │         │ read/write             └──────┬────────┘  │
  │         │                               │           │
  │  ┌──────▼──────────────────┐            │ LogQL     │
  │  │      PostgreSQL         │            │           │
  │  │                         │     ┌──────▼────────┐  │
  │  │  umami_db (analytics)   │◀────│    Grafana    │  │
  │  │  grafana_db (state)     │     │  (dashboards) │  │
  │  └─────────────────────────┘     └───────────────┘  │
  │                                                     │
  └─────────────────────────────────────────────────────┘
```

**Grafana** serves as the single pane of glass with two datasources:

1. **Loki** — infrastructure logs. LogQL queries against nginx access logs (JSON-structured per ADR-001), Traefik ingress logs, and K3s system component logs. Dashboards for request rates, error rates, response times, and pod restarts.
2. **Umami PostgreSQL** — web analytics. SQL queries against Umami's `website_event` and `session` tables to surface page views, referral sources, and visitor geography alongside infrastructure data.

**Grafana state** (dashboards, users, alert rules, preferences) is stored in a dedicated `grafana_db` database on the shared PostgreSQL instance, not Grafana's default SQLite. This means Grafana's configuration survives pod restarts and redeployments without needing a persistent volume claim for a SQLite file. The PostgreSQL instance already exists for Umami (ADR-003), so this adds a database, not a service.

**No Prometheus.** Current workloads are static sites with no `/metrics` endpoints. Nginx request-level data is captured in structured access logs, which Loki handles. Node resource monitoring (CPU, RAM, disk) can be achieved through Loki-ingested system logs and `kubectl top` until dynamic workloads justify a dedicated metrics pipeline. When specmcp.ai introduces an API backend, a follow-on ADR will add Prometheus.

### Revised cluster memory budget

| Component | Estimated RAM |
|-----------|---------------|
| K3s system (API server, etcd, scheduler, Traefik) | ~500 MB |
| nginx pods (×3 sites) | ~50 MB |
| Umami (Next.js) | ~200 MB |
| PostgreSQL (umami_db + grafana_db) | ~100 MB |
| Promtail | ~100 MB |
| Loki | ~256 MB |
| Grafana | ~200 MB |
| **Total committed** | **~1.4 GB** |
| **B2ms available** | **8 GB** |
| **Headroom** | **~6.6 GB** |

Comfortable margin for OS overhead, filesystem cache, and future workloads.

## Consequences

### Positive

- Single Grafana URL for both infrastructure health and web analytics — reduces context-switching and produces a stronger client demo
- Promtail automatically discovers and tails all container logs via the Kubernetes API — no per-pod configuration as sites are added
- Nginx JSON structured logs (ADR-001) are immediately queryable in Loki with label and JSON-field filters
- Grafana state in PostgreSQL survives pod restarts without a separate PVC, and centralises all cluster state in one stateful service
- Total observability footprint (~556 MB) leaves substantial headroom on the B2ms node
- No Prometheus means no idle metrics scraping, no TSDB compaction, and no alert rules to maintain for metrics nobody is generating

### Negative

- No node-level resource metrics (CPU, memory, disk utilisation) in Grafana until Prometheus is added. Mitigation: `kubectl top nodes` and `kubectl top pods` are sufficient for a single-node cluster; Loki can surface OOM kills and resource pressure from system logs
- Grafana's PostgreSQL dependency means a PostgreSQL outage takes down both analytics and dashboards. Mitigation: acceptable for a portfolio cluster — if PostgreSQL is down, there are bigger problems than dashboards
- Loki's embedded BoltDB index is single-node only. If the cluster ever scales to multiple nodes, Loki would need an object store backend (e.g., Azure Blob Storage). Not a concern at current scale

### Risks

- **PostgreSQL resource contention:** Three consumers (Umami writes, Grafana reads/writes, Grafana querying Umami tables) sharing one instance. Mitigation: traffic volumes are low (portfolio sites), PostgreSQL connection pooling, and resource limits per namespace. Monitor via Loki-ingested PostgreSQL logs
- **Loki storage growth:** Nginx access logs accumulate. At modest traffic, Loki's default 744-hour (31-day) retention is sufficient. Set `retention_period: 744h` in Loki config and monitor disk usage. Increase the VM disk or add Azure Blob Storage as a backend if needed
- **Grafana dashboard drift:** Dashboard JSON checked into Git can diverge from what's running in Grafana if manual edits are made via the UI. Mitigation: provision dashboards via Grafana's file-based provisioning from ConfigMaps, treating dashboard JSON as code
- **Promtail DaemonSet on single node:** A DaemonSet is designed for multi-node clusters. On a single node it's functionally identical to a Deployment with one replica, but uses slightly more Kubernetes API overhead. Acceptable — and correct when a second node is added later

## Agent Decisions

*To be completed after Claude Code implementation.*

| Decision | Rationale | Acceptable |
|----------|-----------|------------|
| *Pending* | *Pending* | *Pending* |

## References

- [ADR-001: Containerise with nginx:alpine](adr-001-containerize-with-nginx-alpine.md) — nginx JSON structured logging
- [ADR-003: Self-host Umami analytics on K3s](adr-003-self-host-umami-analytics.md) — PostgreSQL instance and Umami deployment
- [ADR-005: Host on K3s with Azure Spot VM and Cloudflare CDN](adr-005-k3s-azure-spot-cloudflare-cdn.md) — cluster provisioning and VM sizing
- [Grafana Loki documentation](https://grafana.com/docs/loki/latest/)
- [Promtail configuration](https://grafana.com/docs/loki/latest/send-data/promtail/)
- [Grafana PostgreSQL datasource](https://grafana.com/docs/grafana/latest/datasources/postgres/)
- [Grafana database configuration](https://grafana.com/docs/grafana/latest/setup-grafana/configure-grafana/#database)
