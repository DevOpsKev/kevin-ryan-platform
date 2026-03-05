---
title: "ADR-017: Managed PostgreSQL as Shared Database Layer"
---

**Status:** Accepted
**Date:** 2026-03-05
**Decision Makers:** Human + Agent
**Prompted By:** Umami (ADR-003) and Grafana (ADR-006) both require PostgreSQL. Additional services will too. The K3s cluster now runs two nodes (ADR-016): `node1` for sites, `node2` for observability. The database layer must be independent of both nodes' lifecycles and serve multiple services without per-service overhead.

## Context

The platform has two active PostgreSQL consumers today and expects more:

- **Umami** (ADR-003) — web analytics events, sessions, and website configuration. Append-heavy, low-volume, but accumulated history is not reproducible from Git.
- **Grafana** (ADR-006) — dashboard definitions, alert rules, datasource configuration, and annotations. Dashboard JSON can be reprovisioned from Git ConfigMaps, but runtime state cannot.
- **Future services** — any application onboarded to the platform will need a database. Each additional service should be a new database on a shared instance, not a new infrastructure resource.

The two-node cluster introduced in ADR-016 separates compute concerns: sites on `node1`, observability on `node2`. The database must outlive both nodes. Either node can be destroyed and recreated via `terraform apply` without affecting data. PostgreSQL must not be co-located with either node.

ADR-007 documented an earlier version of this decision when the platform ran a single Spot VM and used Bicep for IaC. That context has changed substantially: the platform now runs on-demand VMs (ADR-014), uses Terraform (ADR-008), has a fixed private VNet, and has a known growth trajectory. ADR-017 supersedes ADR-007.

## Decision Drivers

- **Node lifecycle independence:** Either K3s node can be destroyed and recreated without data loss or manual recovery.
- **Shared instance model:** One Flexible Server, one database per service — not one VM-level PostgreSQL pod per service.
- **Private access only:** The managed PostgreSQL instance must not be reachable from the public internet. VNet private access is the only accepted network path.
- **Managed operations:** Backups, minor version upgrades, patching, and storage management are Azure's responsibility.
- **Cost discipline:** Must fit within the updated budget ceiling established by ADR-016 (~£48–50/month for compute alone).
- **Terraform-native:** Provisioned and managed via the existing Terraform modules (ADR-008), not Bicep or any other IaC tool.

## Options Considered

### Option A: PostgreSQL in K3s

Run a PostgreSQL StatefulSet on one of the K3s nodes. Two sub-variants:

**A1 — Ephemeral (OS disk):** Cheapest and simplest. All data is lost on a node rebuild. Umami analytics history is not reproducible. Rejected outright.

**A2 — Azure Managed Disk PVC:** PostgreSQL data on a PersistentVolumeClaim backed by an Azure Managed Disk (~£1.50/month). The disk survives node eviction but must reattach to the replacement node, requiring the same availability zone. Disk reattachment after an unclean shutdown carries WAL recovery risk. Kevin owns backups (pg_dump cron jobs), minor version upgrades, and monitoring for corruption. Cheapest option but highest operational risk and ongoing maintenance overhead.

### Option B: Azure Database for PostgreSQL Flexible Server (chosen)

Fully managed PostgreSQL. Azure handles automated backups (7-day default with point-in-time restore), minor version upgrades, OS patching, and storage autogrow. Deployed in the same VNet as the K3s nodes — private access only, no public endpoint. A single Flexible Server instance hosts separate databases for each service: `umami_db`, `grafana_db`, and future additions.

The Burstable B1ms tier (1 vCPU, 2 GB RAM, 32 GB Premium SSD) is sufficient for the combined workload: low-volume Umami writes and Grafana dashboard queries do not require sustained compute. Cost: ~£13–16/month.

PostgreSQL is completely decoupled from the VM lifecycle. A node rebuild changes nothing about the database layer — the connection FQDN is stable, Azure manages availability, and pods reconnect on pod restart.

### Option C: External managed service (e.g. Supabase, Neon, Railway)

Offload PostgreSQL to a third-party managed service with a generous free tier.

Removes Azure cost for the database layer. Trade-offs: data leaves the Azure VNet, introduces a hard external dependency, and complicates the IaC model (Terraform would provision Azure resources but not the database). Rejected on data-locality, IaC coherence, and portfolio grounds.

## Decision

**Azure Database for PostgreSQL Flexible Server, Burstable B1ms, North Europe, private VNet access only.** Option B.

One Flexible Server instance serves all platform services. Each service gets a dedicated database (`umami_db`, `grafana_db`). Future services add a database — not a new server.

### Specification

| Parameter | Value |
|-----------|-------|
| **Service** | Azure Database for PostgreSQL Flexible Server |
| **Tier** | Burstable B1ms (1 vCPU, 2 GB RAM) |
| **Storage** | 32 GB (Premium SSD, autogrow enabled) |
| **PostgreSQL version** | 16 |
| **Region** | North Europe / Dublin |
| **Backup retention** | 7 days (point-in-time restore included) |
| **High availability** | Disabled (single-zone; portfolio workloads) |
| **Network access** | Private access via VNet integration — no public endpoint |
| **Authentication** | Azure AD + VM managed identity |
| **Databases** | `umami_db`, `grafana_db` (additional databases added per service) |
| **Estimated cost** | £13–16/month |

### Updated total infrastructure budget

| Component | Monthly cost |
|-----------|-------------|
| K3s node1 — Standard_B2s on-demand (ADR-014) | ~£24 |
| K3s node2 — Standard_B2s on-demand (ADR-016) | ~£24 |
| Azure Database for PostgreSQL Flexible Server B1ms | £13–16 |
| Azure Container Registry Basic (ADR-010) | ~£4 |
| Cloudflare | Free |
| **Total** | **~£65–68/month** |

The addition of `node2` (ADR-016) already moved the compute budget beyond the original £30/month target. The managed PostgreSQL cost is unchanged from ADR-007's estimate. The combined platform budget is now ~£65–68/month.

### Private VNet access

The Flexible Server is deployed with VNet integration — a dedicated subnet is delegated to `Microsoft.DBforPostgreSQL/flexibleServers` and a private DNS zone (`privatelink.postgres.database.azure.com`) is created and linked to the VNet. The K3s nodes resolve the server FQDN via the private DNS zone. No public IP is assigned to the PostgreSQL instance.

This is a firmer stance than ADR-007, which permitted "public access restricted to the VM's IP via firewall rules" as a fallback. With two stable on-demand VMs in a fixed VNet (ADR-014, ADR-016), private access is the only accepted configuration.

## Consequences

### Positive

- K3s nodes are fully stateless and ephemeral — either node can be destroyed and recreated without affecting the database layer
- Automated 7-day point-in-time restore at no additional cost — no backup cron jobs to maintain
- One instance, multiple databases — adding a new service is a Terraform resource block, not a new server
- Private VNet access only — the PostgreSQL instance is not reachable from the public internet
- Stable FQDN across VM rebuilds — pods reconnect without configuration changes
- Managed minor version upgrades and OS patching — zero database administration overhead
- Stronger infrastructure story than "Postgres in a container on the same VM"

### Negative

- Cost of ~£13–16/month for a workload that could theoretically run for ~£1.50/month (managed disk PVC)
- Introduces a dependency on Azure's managed PostgreSQL availability — a Flexible Server outage affects Umami and Grafana regardless of K3s node health. The sites themselves continue to be served by Cloudflare CDN during a database outage
- VNet private access adds networking configuration complexity (subnet delegation, private DNS zone) to the Terraform modules

### Risks

- **Budget creep:** At ~£65–68/month the platform is more expensive than originally planned. Mitigation: the two-node cluster (ADR-016) is the primary driver; PostgreSQL cost is unchanged. Accept the new baseline; review if a third workload is added.
- **node2 data loss on rebuild:** Grafana is scheduled on `node2` (ADR-016) but its persistent state is in the managed PostgreSQL, not on the node's disk. A `node2` rebuild does not lose Grafana data. Loki log storage (local disk on `node2`) is a separate concern not addressed here.
- **Managed Identity configuration:** The VM managed identities must be granted the correct role on the Flexible Server. Misconfiguration results in authentication failures that surface as pod CrashLoopBackOff. Mitigation: Terraform handles role assignments declaratively; validate the connection during cloud-init before Flux applies workload manifests.
- **PostgreSQL 16 compatibility:** Umami and Grafana must support PostgreSQL 16. Both currently do. Pin the version in Terraform to prevent Azure from auto-upgrading to a major version without a tested upgrade path.
- **Subnet delegation contention:** The delegated subnet cannot host other resource types. Mitigation: allocate a dedicated `/28` subnet for the Flexible Server in the VNet address space.

## Agent Decisions

| Decision | Rationale | Acceptable |
|----------|-----------|------------|
| No agent implementation decisions recorded | This ADR documents the human-directed architectural decision; implementation details will be recorded in subsequent PRs | Yes |

## References

- [ADR-003: Self-host Umami Analytics](adr-003-self-host-umami-analytics.md)
- [ADR-006: Observability with Grafana, Loki, and Promtail](adr-006-observability-grafana-loki-promtail.md)
- [ADR-007: PostgreSQL on Azure Flexible Server](adr-007-postgresql-azure-flexible-server.md) *(superseded by this ADR)*
- [ADR-008: Infrastructure as Code with Terraform](adr-008-iac-with-terraform.md)
- [ADR-014: Migrate from Azure Spot VM to On-Demand B2s](adr-014-migrate-spot-to-ondemand-b2s.md)
- [ADR-016: Add Second K3s Node for Observability Workloads](adr-016-second-k3s-node-for-observability.md)
- [Azure Database for PostgreSQL Flexible Server pricing](https://azure.microsoft.com/en-gb/pricing/details/postgresql/flexible-server/)
- [Azure PostgreSQL VNet private access](https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/concepts-networking-private)
