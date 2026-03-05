---
title: "ADR-016: Add Second K3s Node for Observability Workloads"
---

**Status:** Accepted
**Date:** 2026-03-05
**Decision Makers:** Human + Agent
**Prompted By:** The current B2s (4 GB RAM) has ~1–2 GB headroom after running K3s, Traefik, Flux CD, and site containers — insufficient to co-host the observability stack (Grafana, Loki, Promtail) introduced in ADR-006.

## Context

The observability stack defined in ADR-006 (Grafana, Loki, Promtail) requires meaningful memory to operate reliably. The single B2s node migrated to in ADR-014 runs K3s server, Traefik, Flux CD (source-controller + kustomize-controller), and the site containers. At steady state, only ~1–2 GB of the 4 GB remains free — not enough headroom to safely add Grafana (~300–500 MB), Loki (~200–400 MB), and Promtail (~50 MB) without risking OOM kills against site workloads.

Two broad approaches were considered: vertical scaling (upgrade the single node) or horizontal scaling (add a dedicated agent node for observability).

## Decision Drivers

- **Site availability:** Observability tooling must not compete with site containers for memory on the same node.
- **Failure isolation:** An observability failure should not affect site uptime.
- **Cost:** Any solution must stay within the sub-£50/month budget.
- **Portfolio value:** The infrastructure should demonstrate patterns relevant to enterprise Kubernetes work.
- **Operational simplicity:** GitOps via Flux must remain the single source of truth for cluster state.

## Options Considered

### Option A: Upgrade to Standard_B2as_v2 (8 GB, single node)

Replace the B2s with a B2as_v2 (AMD, 2 vCPU, 8 GB RAM). All workloads remain on one node.

Doubles available RAM, resolves the headroom problem immediately, and requires minimal infrastructure change (a Terraform `vm_size` update and a destroy/recreate).

Trade-offs: vertical scaling only — the ceiling moves but the single-node constraint remains. A node failure takes down both sites and observability simultaneously. Does not advance multi-node cluster experience. Cost: ~£28–32/month.

### Option B: Add a second Standard_B2s as a K3s agent node (chosen)

Provision a second B2s VM (`node2`) as a K3s agent joined to the existing server (`node1`). Site workloads remain on `node1`; observability workloads are scheduled exclusively on `node2` via a `NoSchedule` taint on `node2` and matching tolerations + `nodeSelector` on observability Helm releases.

Both nodes run at the same B2s spec. Total cost: ~£48/month (two B2s VMs + ACR Basic).

Failure isolation: if `node2` fails, metrics and dashboards are unavailable but sites are completely unaffected. The inverse is also true — a `node1` failure does not corrupt Loki data or Grafana state held on `node2`.

### Option C: External managed observability (e.g. Grafana Cloud free tier)

Offload Grafana and Loki to Grafana Cloud's free tier; retain Promtail on-cluster as a log shipper.

Eliminates the memory problem without any VM changes. Trade-offs: data leaves the cluster, introduces an external dependency, caps log retention and query capacity on the free tier, and removes the self-hosted observability story from the portfolio. Rejected on portfolio and data-locality grounds.

## Decision

**Add a second Standard_B2s VM as a K3s agent node.** Sites stay on `node1`; all observability workloads move to `node2`.

Scheduling isolation is enforced by:

1. A `NoSchedule` taint on `node2` (`observability=true:NoSchedule`) to prevent general workloads from landing there.
2. Matching `tolerations` and `nodeSelector: { kubernetes.io/hostname: node2 }` on the Grafana, Loki, and Promtail Helm releases.

Infrastructure changes:

- `infra/modules/compute/`: extract a reusable compute module; instantiate two VMs (`node1` as K3s server, `node2` as K3s agent joining via the server's private IP).
- `infra/modules/network/`: associate a second NIC / public IP with `node2` (or use a private-only NIC if `node2` requires no direct inbound traffic).
- K3s agent join token passed from `node1` to `node2` via cloud-init; token stored as an Azure Key Vault secret to avoid embedding secrets in Terraform state in plaintext.
- Taint applied via a `kubectl` call in `node2`'s cloud-init post-join, or managed declaratively via a Flux `HelmRelease` post-hook.

## Consequences

### Positive

- Observability stack runs without memory pressure; ~4 GB dedicated to Grafana, Loki, and Promtail on `node2`
- A `node2` failure leaves sites fully operational — monitoring is degraded, not site availability
- Multi-node K3s cluster (server + agent) is a recognisable enterprise Kubernetes pattern, strengthening the portfolio narrative
- Failure domains are separated at the VM level, which is the strongest isolation available at this budget tier
- Cost (~£48/month) remains below the sub-£50 budget ceiling

### Negative

- Monthly cost increases from ~£24 to ~£48 (adds one B2s on-demand VM)
- Operational surface doubles: two VMs to patch, monitor, and rebuild after a destroy/recreate
- The Cloudflare Origin Certificate TLS secret (currently only needed on `node1`) must still be manually re-applied to the cluster after a `node1` rebuild — unchanged risk from ADR-014
- K3s agent join requires the server's private IP and join token to be available at `node2` boot time; ordering dependency must be handled in Terraform (`depends_on`) and cloud-init

### Risks

- **Join token exposure:** The K3s join token grants full cluster access. Mitigation: store in Azure Key Vault; cloud-init retrieves it via the VM's managed identity at boot time.
- **node2 rebuild loses observability data:** Loki stores log data on the node's local disk by default. A destroy/recreate of `node2` loses historical logs. Mitigation: document the data-loss boundary; consider Azure Disk persistent volume in a future ADR if log retention becomes a requirement.
- **node1 still a SPOF for the control plane:** K3s HA requires an odd number of server nodes (3+). At this budget tier, `node1` remains the single control-plane node; a `node1` failure makes the API server unavailable (sites continue to serve from cached container state until pods are evicted, but no new scheduling occurs). Accepted trade-off at this scale.

## Agent Decisions

| Decision | Rationale | Acceptable |
|----------|-----------|------------|
| No agent implementation decisions recorded | This ADR documents the human-directed architectural decision only; implementation details will be recorded in subsequent ADRs or PRs | Yes |

## References

- [ADR-005: Host on K3s with Azure Spot VM and Cloudflare CDN](adr-005-k3s-azure-spot-cloudflare-cdn.md)
- [ADR-006: Observability with Grafana, Loki, and Promtail](adr-006-observability-grafana-loki-promtail.md)
- [ADR-014: Migrate from Azure Spot VM to On-Demand B2s](adr-014-migrate-spot-to-ondemand-b2s.md)
- [K3s agent node join docs](https://docs.k3s.io/quick-start#install-k3s-on-agent-nodes)
- [Kubernetes taints and tolerations](https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/)
- [Azure Standard_B2s pricing](https://azure.microsoft.com/en-gb/pricing/details/virtual-machines/linux/)
