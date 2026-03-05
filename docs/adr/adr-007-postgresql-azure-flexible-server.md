---
title: "ADR-007: PostgreSQL on Azure Database Flexible Server"
---

**Status:** Superseded by [ADR-017](adr-017-managed-postgresql-shared-database.md)
**Date:** 2026-02-28
**Decision Makers:** Human + AI
**Prompted By:** ADR-003 (Umami) and ADR-006 (Grafana) both depend on PostgreSQL. The K3s cluster runs on an Azure Spot VM (ADR-005) that can be evicted at any time. PostgreSQL state must survive VM lifecycle events without manual intervention.

## Context

Two cluster workloads now depend on PostgreSQL:

1. **Umami** (ADR-003) — stores web analytics events, sessions, and website configuration in `umami_db`. This is append-heavy write traffic at low volume (portfolio site visitors), but the accumulated history has value and is not reproducible from Git.
2. **Grafana** (ADR-006) — stores dashboard definitions, user accounts, alert rules, and datasource configuration in `grafana_db`. Dashboard JSON can be reprovisioned from Git ConfigMaps, but alert state, annotations, and preferences cannot.

ADR-005 chose an Azure Spot VM as the compute layer. Spot VMs can be evicted with 30 seconds notice. If PostgreSQL runs on the K3s node, eviction creates one of two problems: either the data is lost entirely (no external persistence), or the data survives on a Managed Disk but is inaccessible during the reattachment window and requires backup/restore procedures that Kevin must maintain.

The core question is whether PostgreSQL should be coupled to or decoupled from the ephemeral compute layer.

## Decision Drivers

- **Data durability:** Umami analytics history is not reproducible. Losing it to a spot eviction is unacceptable.
- **Stateless compute:** The K3s node should be fully ephemeral. Eviction recovery should be "VM respawns, pods reconnect" — not "VM respawns, wait for disk reattach, hope PostgreSQL recovers cleanly."
- **Operational overhead:** Solo operator. Backup scheduling, minor version upgrades, connection pooling, and failover should not be Kevin's problem.
- **Cost discipline:** Total infrastructure budget target is under £30/month. PostgreSQL hosting must fit within what remains after compute (£12–18) and ACR (~£4).
- **IaC coherence:** The PostgreSQL instance should be provisionable alongside the VM in Bicep, with the connection string flowing into K3s as a Kubernetes secret. Clean separation of compute and state in the IaC modules.
- **Network latency:** Umami and Grafana make frequent small queries. PostgreSQL must be low-latency from the K3s node.

## Options Considered

### Option A: Azure Database for PostgreSQL Flexible Server (Burstable B1ms)

Fully managed PostgreSQL. Azure handles automated backups (default 7-day retention with point-in-time restore), minor version upgrades, OS patching, connection security, and storage autogrow. The Burstable B1ms tier provides 1 vCPU, 2 GB RAM, 32 GB included storage. Deployed in the same region (North Europe / Dublin) as the K3s VM for single-digit millisecond latency, and aligned with the Irish company domicile for data residency.

Cost: ~£10–13/month. Total infrastructure budget becomes £26–35/month.

PostgreSQL is completely decoupled from the VM lifecycle. Spot eviction affects only compute — pods reconnect to the managed instance on respawn. The K3s node becomes fully stateless and ephemeral.

Authentication via Azure Managed Identity (the VM's system-assigned identity gets the PostgreSQL Flexible Server Contributor role), eliminating password management. Connection string is injected as a Kubernetes secret via cloud-init or sealed secret.

### Option B: PostgreSQL on K3s with Azure Managed Disk PVC

PostgreSQL runs as a StatefulSet on the K3s node. Data directory is backed by an Azure Managed Disk (32 GB Standard SSD, ~£1.50/month) via a PersistentVolumeClaim. The disk survives VM eviction and reattaches when the replacement VM provisions.

Cost: ~£1.50/month. Significantly cheaper.

But Kevin owns everything: backup cron jobs (pg_dump to Azure Blob Storage), minor version upgrades (rebuild the container image), connection pooling, monitoring for corruption, and testing the disk reattachment path. During VM eviction and respawn, there is a window where the disk is detached — if the replacement VM provisions in a different availability zone, the disk may not reattach without manual intervention. PostgreSQL startup after an unclean shutdown (eviction gives 30s notice, but pg_shutdown may not complete) risks WAL recovery delays or corruption.

The disk reattachment path is the critical failure mode. It works reliably in testing, but it is a moving part that fails silently until it doesn't.

### Option C: PostgreSQL on K3s with no external persistence

PostgreSQL data lives on the node's ephemeral OS disk. Cheapest and simplest. All data is lost on eviction.

Grafana dashboards can be reprovisioned from Git ConfigMaps. Umami analytics history cannot be reproduced. This is only viable if analytics data is treated as disposable. It is not — the accumulated traffic data supports the consultancy's content strategy decisions and serves as a demo dataset.

## Decision

**Azure Database for PostgreSQL Flexible Server, Burstable B1ms tier, deployed in North Europe (Dublin).** Option A.

The managed service makes the K3s node fully stateless. Eviction recovery becomes deterministic: VM respawns, cloud-init bootstraps K3s, pods start, they reconnect to the managed PostgreSQL instance at the same FQDN. No disk reattachment, no WAL recovery, no backup cron jobs.

### Specification

| Parameter | Value |
|-----------|-------|
| **Service** | Azure Database for PostgreSQL Flexible Server |
| **Tier** | Burstable B1ms (1 vCPU, 2 GB RAM) |
| **Storage** | 32 GB (Premium SSD, autogrow enabled) |
| **PostgreSQL version** | 16 |
| **Region** | North Europe / Dublin (same as K3s VM per ADR-005, aligned with Kevin Ryan & Associates company domicile) |
| **Backup retention** | 7 days (default, point-in-time restore) |
| **High availability** | Disabled (single-zone, portfolio workloads) |
| **Authentication** | Azure AD + Managed Identity (VM system-assigned identity) |
| **Network access** | Private access via VNet integration, or public access restricted to VM's public IP via firewall rules |
| **Databases** | `umami_db` (ADR-003), `grafana_db` (ADR-006) |
| **Estimated cost** | £10–13/month |

### Revised total infrastructure budget

| Component | Monthly cost |
|-----------|-------------|
| Azure Spot VM B2ms (ADR-005) | £12–18 |
| Azure Database for PostgreSQL B1ms | £10–13 |
| Azure Container Registry Basic (ADR-002) | ~£4 |
| Cloudflare (ADR-005) | Free |
| **Total** | **£26–35** |

This slightly exceeds the original £30/month target at the upper bound. The overage is justified: the managed PostgreSQL eliminates the most complex operational task (database administration) and removes the most fragile failure mode (disk reattachment after spot eviction). The alternative — saving £10/month by self-hosting PostgreSQL — costs more than £10/month in Kevin's time when something goes wrong.

## Consequences

### Positive

- K3s node is fully stateless and ephemeral — eviction recovery is deterministic with no data-layer concerns
- Automated backups with 7-day point-in-time restore at no additional cost — eliminates the need for backup cron jobs
- Minor version upgrades, OS patching, and storage management handled by Azure — zero database administration overhead
- Managed Identity authentication eliminates password rotation and secret management for the database connection
- Single FQDN for PostgreSQL that both Umami and Grafana connect to — connection string is stable across VM evictions
- Clean IaC separation: Bicep provisions the PostgreSQL server and the VM as independent resources with a network dependency, not a lifecycle dependency
- The managed database is a stronger architectural story in client conversations than "I run Postgres in a container on the same machine"

### Negative

- Cost increase of £10–13/month compared to self-hosted PostgreSQL on the K3s node, pushing the upper bound of total infrastructure cost to ~£35/month
- Introduces a dependency on Azure's managed PostgreSQL availability — if the Flexible Server has an outage, both Umami and Grafana are affected regardless of K3s node health. Mitigation: Azure Flexible Server SLA is 99.9% (single-zone); the sites themselves remain served by Cloudflare cache during any database outage, only analytics collection and dashboards are affected
- Network latency between the K3s node and the managed PostgreSQL instance is non-zero (single-digit ms within North Europe). Imperceptible for Umami's low-volume writes and Grafana's dashboard queries, but worth noting if a high-throughput workload is added later

### Risks

- **Budget pressure:** At £35/month upper bound, there is limited headroom for additional Azure services. Mitigation: the Spot VM discount fluctuates — actual cost is typically closer to the lower bound. If budget becomes critical, the Flexible Server can be stopped during known low-traffic periods (e.g., overnight) to reduce cost, though this is operationally awkward
- **Managed Identity configuration:** The VM's system-assigned identity must be granted the correct role on the PostgreSQL server. Misconfiguration results in authentication failures that surface as pod CrashLoopBackOff. Mitigation: IaC (Bicep) handles role assignment declaratively; test the connection during cloud-init before K3s workloads start
- **VNet integration complexity:** Private access via VNet integration adds networking configuration (subnet delegation, private DNS zone) to the Bicep modules. If this proves too complex during implementation, public access restricted by firewall rule to the VM's IP is an acceptable fallback — the security trade-off is minimal given the workloads are portfolio sites, not production SaaS
- **PostgreSQL 16 compatibility:** Umami and Grafana must support PostgreSQL 16. Both currently do. Pin the version in Bicep to prevent Azure from auto-upgrading to a major version that breaks compatibility

## Agent Decisions

*To be completed after Claude Code implementation.*

| Decision | Rationale | Acceptable |
|----------|-----------|------------|
| *Pending* | *Pending* | *Pending* |

## References

- [ADR-003: Self-host Umami analytics on K3s](adr-003-self-host-umami-analytics.md) — Umami PostgreSQL dependency
- [ADR-005: Host on K3s with Azure Spot VM and Cloudflare CDN](adr-005-k3s-azure-spot-cloudflare-cdn.md) — compute layer and spot eviction context
- [ADR-006: Observability with Grafana, Loki, and Promtail](adr-006-observability-grafana-loki-promtail.md) — Grafana PostgreSQL dependency
- [Azure Database for PostgreSQL Flexible Server pricing](https://azure.microsoft.com/en-gb/pricing/details/postgresql/flexible-server/)
- [Azure Database for PostgreSQL Flexible Server documentation](https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/)
- [Managed Identity authentication for PostgreSQL](https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/how-to-connect-with-managed-identity)
