# ADR-005: Host on K3s with Azure Spot VM and Cloudflare CDN

**Status:** Accepted
**Date:** 2026-02-28
**Decision Makers:** Human + AI
**Prompted By:** Need to move off GitHub Pages to support multi-domain hosting (kevinryan.io, sddbook.com, aiimmigrants.com), run observability workloads alongside application containers, and demonstrate real Platform Engineering capability through the portfolio infrastructure itself

## Context

The portfolio site is currently a static Next.js export deployed to GitHub Pages via GitHub Actions. ADR-001 containerised the site with nginx:alpine, ADR-002 established GHCR as the private registry, and ADR-004 automated image builds with SHA tagging. The container is ready — it has nowhere production-grade to run.

Three forces are driving the move off GitHub Pages:

First, Kevin Ryan & Associates needs to serve multiple domains (kevinryan.io, sddbook.com, aiimmigrants.com) from a single infrastructure footprint. GitHub Pages ties one custom domain to one repository with no shared ingress layer.

Second, logging and monitoring containers need to run alongside the application workloads. The observability stack (separate ADR) requires compute — GitHub Pages provides none.

Third, the infrastructure backing a DevEx/Platform Engineering portfolio should demonstrate the capability it claims. A real Kubernetes API surface, ingress routing, observability pipelines, and infrastructure-as-code are more credible in client conversations than a static hosting badge.

Budget is constrained: under £30/month for compute. Kevin is a solo operator, so operational overhead must stay at 1–2 hours/month. All current workloads are static exports, but future workloads (e.g., specmcp.ai API backend) may require dynamic compute.

## Decision Drivers

- **Multi-domain routing:** Three domains today, more likely. Single ingress controller with per-domain TLS.
- **Compute for observability:** Logging and monitoring containers must co-locate with application workloads.
- **Professional credibility:** The infrastructure must be demonstrable — kubectl, manifests, ingress config, IaC — not abstracted away.
- **Cost:** Under £30/month all-in for compute, CDN, and registry.
- **Extensibility:** Must support future dynamic workloads without re-architecting.
- **Azure alignment:** Existing familiarity, certification path (AZ-104, AZ-400), and enterprise client audience favour Azure over budget VPS providers.

## Options Considered

### Option A: K3s on Azure Spot VM + Cloudflare

Single Azure Spot B2s/B2ms VM (2 vCPU, 4–8 GB RAM, Ubuntu 24.04 LTS) running K3s. Traefik (bundled with K3s) handles multi-domain ingress and TLS via Let's Encrypt. Cloudflare (free tier) provides DNS, CDN caching, DDoS protection, and TLS termination at the edge. ACR Basic tier stores images.

Estimated cost: £16–22/month (Spot VM £12–18 + ACR ~£4). Cloudflare free.

Spot eviction is a feature: Cloudflare serves cached static assets during the 30–60s VM respawn. Sites stay up. This is a genuine chaos engineering story.

### Option B: Azure Kubernetes Service (AKS) with spot node pool

Managed Kubernetes control plane with a single-node spot pool. Azure handles API server HA, etcd, upgrades.

Estimated cost: £60–100/month minimum (control plane, load balancer, networking overhead).

The managed control plane buys HA features that are redundant when Cloudflare is the availability layer. Cost is 3–4× Option A with no proportional benefit at this workload scale. AKS is the right answer for a team; wrong answer for a solo operator running static sites.

### Option C: Azure Container Apps

Fully managed serverless container platform. No cluster to operate. Per-request + per-vCPU-second billing.

Eliminates the Kubernetes API surface entirely — no ingress to configure, no cluster to operate, no observability pipeline to build. This contradicts the credibility objective. Sidecar containers for logging increase per-app cost. Multi-domain routing requires multiple Container App environments or awkward custom domain configuration compared to Traefik IngressRoutes.

### Option D: Hetzner / DigitalOcean VPS

Cheaper dedicated VMs (€4–8/month), predictable pricing, no spot eviction.

The IaC narrative (Bicep, Azure CLI, managed identity) is more compelling for the enterprise client audience than a budget VPS provider. The Azure certification path aligns with the professional development trajectory. The spot eviction risk is a feature — it validates the Cloudflare caching strategy and gives the chaos engineering story substance.

### Option E: GitHub Pages (status quo)

Free, zero-ops. Already working.

Cannot host multiple custom domains from a single infrastructure footprint, provides no compute for observability workloads, and offers no operational surface to demonstrate. Clean break — no fallback.

## Decision

**K3s on an Azure Spot VM with Cloudflare as the CDN and edge layer.** Option A.

The architecture:

```
                    ┌─────────────────────────┐
                    │       Cloudflare         │
                    │  DNS · CDN · TLS · WAF   │
                    │                          │
                    │  kevinryan.io            │
                    │  sddbook.com             │
                    │  aiimmigrants.com        │
                    └────────────┬─────────────┘
                                 │
                                 │ HTTPS (origin pull)
                                 │
                    ┌────────────▼─────────────┐
                    │   Azure Spot VM (B2ms)    │
                    │   Ubuntu 24.04 LTS        │
                    │                           │
                    │  ┌──────────────────────┐ │
                    │  │        K3s            │ │
                    │  │                       │ │
                    │  │  Traefik Ingress      │ │
                    │  │    ├─ kevinryan.io    │ │
                    │  │    ├─ sddbook.com     │ │
                    │  │    └─ aiimmigrants.com│ │
                    │  │                       │ │
                    │  │  Observability stack   │ │
                    │  │  (ADR-006 or later)    │ │
                    │  └──────────────────────┘ │
                    │                           │
                    │  ACR pull via managed ID   │
                    └───────────────────────────┘
```

K3s gives a real Kubernetes API surface at a fraction of AKS cost. Traefik handles multi-domain IngressRoutes with TLS out of the box. Cloudflare caches static assets at the edge, meaning spot eviction causes a 30–60s cold start behind a warm cache — not a user-facing outage. The whole thing runs under £25/month and provides genuine operational surface for the DevEx/Platform Engineering positioning.

GitHub Pages is decommissioned. No fallback, no dual-running. The `.github/workflows/nextjs.yml` deployment workflow is removed and replaced by the ACR push + K3s deploy pipeline (separate ADR).

## Consequences

### Positive

- Multi-domain routing handled natively by Traefik IngressRoutes with per-domain TLS certificates via Let's Encrypt
- Real Kubernetes operational surface: kubectl, Helm, manifests, ingress config, resource limits, pod scheduling — all demonstrable to clients
- Spot + Cloudflare creates genuine resilience: sites remain available via CDN cache during VM eviction and respawn
- Cost target met: £16–22/month total
- Extensible to dynamic workloads (specmcp.ai) without re-architecting
- Complete IaC narrative: Bicep for VM provisioning, cloud-init for K3s bootstrap, Kubernetes manifests for workloads — aligns with planned `azure-bicep-k3s` Tessl skill

### Negative

- Operational overhead increases from zero (GitHub Pages) to 1–2 hours/month for OS patching, K3s upgrades, certificate rotation, and Traefik configuration
- No HA for the Kubernetes control plane — single-node K3s means etcd, API server, and scheduler all run on one machine. Acceptable for this workload class

### Risks

- **Spot eviction with empty Cloudflare cache:** If the VM is evicted and Cloudflare's cache has expired, sites are down until the VM respawns. Mitigation: set aggressive cache TTLs for static assets (24h minimum, `s-maxage=86400`). For truly critical availability, a future ADR could add a secondary VM in a different region or size
- **Spot capacity unavailable:** Azure may not have spot capacity in the chosen region/size. Mitigation: select a region with good spot availability history (North Europe or West Europe); accept pay-as-you-go pricing as a temporary fallback if spot is unavailable
- **K3s upgrade breaks Traefik:** K3s bundles Traefik; a K3s upgrade could introduce a breaking Traefik version. Mitigation: pin K3s channel to stable, test upgrades in a local k3d cluster before applying to production

## Agent Decisions

| Decision | Rationale | Acceptable |
|----------|-----------|------------|
| HTTP between Cloudflare and origin (entryPoint: `web`) for MVP | TLS termination at Cloudflare is sufficient. Traefik ACME for Full Strict deferred to reduce initial complexity | Yes |
| Standard SKU public IP with static allocation | Required for Spot VMs to retain IP after deallocation on eviction | Yes |
| 30 GB OS disk with Standard_LRS | Minimum for Ubuntu 24.04 + K3s + container images. Premium not needed for this workload | Yes |
| NSG SSH rule restricted to `admin_ip` variable | Temporary for initial setup and debugging. Can be removed once infrastructure is stable | Yes |

## References

- [ADR-001: Containerise with nginx:alpine](adr-001-containerize-with-nginx-alpine.md)
- [ADR-002: Private images via GHCR](adr-002-private-images-via-ghcr.md)
- [ADR-004: Push images to GHCR with SHA tagging](adr-004-ghcr-push-with-sha-tagging.md)
- [K3s documentation](https://docs.k3s.io/)
- [Azure Spot VMs](https://learn.microsoft.com/en-us/azure/virtual-machines/spot-vms)
- [Cloudflare CDN](https://developers.cloudflare.com/cache/)
- [Traefik IngressRoute](https://doc.traefik.io/traefik/routing/providers/kubernetes-crd/)
