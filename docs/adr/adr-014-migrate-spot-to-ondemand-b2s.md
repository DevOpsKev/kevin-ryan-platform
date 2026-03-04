---
title: "ADR-014: Migrate from Azure Spot VM to On-Demand B2s"
---

**Status:** Accepted
**Date:** 2026-03-02
**Decision Makers:** Human + Agent
**Prompted By:** Spot instance eviction caused site downtime; Cloudflare returned a 522 error instead of serving cached content. Additionally, the Flux bootstrap config in cloud-init referenced the old repo name and path after a monorepo migration.

## Context

The kevinryan.io site runs on a K3s cluster on an Azure Spot VM (Standard_B2ms) in North Europe. The Spot instance was evicted and did not restart cleanly, causing a sustained outage. Rather than serving cached static content as intended, Cloudflare returned a 522 (connection timeout) error — indicating the cache was cold at the time of eviction.

Separately, during the monorepo migration (ADR-013), the Flux bootstrap command in `cloud-init.yaml` was not updated: it still referenced `--repository=kevinryan-io` and `--path=k8s`, both of which are wrong after the rename and restructure to `kevin-ryan-platform` and `k8s/kevinryan-io` respectively. This means a fresh VM provisioning would produce a broken Flux installation pointing at a non-existent repo path.

The Standard_B2s SKU (2 vCPU, 4 GB RAM) is available in North Europe availability zone 1 as an on-demand instance. 4 GB RAM is sufficient for the current workload: K3s server, Traefik, Flux CD (source-controller + kustomize-controller), and a single static nginx container. A Standard SKU public IP with a zone assignment is required to co-locate with the zonal VM.

## Decision Drivers

- **Availability:** Spot eviction with a cold CDN cache causes user-facing downtime. On-demand eliminates eviction risk.
- **Recovery automation:** cloud-init must correctly bootstrap Flux on a fresh VM for GitOps to restore cluster state automatically.
- **Zone co-location:** A zonal VM requires a zonal public IP to avoid cross-zone latency and provisioning constraints.
- **Cost:** Standard_B2s on-demand (~£24/month) is within the sub-£30 budget established in ADR-005.
- **RAM:** 4 GB is sufficient for current workloads; the B2ms (8 GB) was over-provisioned for a single static site.

## Options Considered

### Option A: On-Demand Standard_B2s, zone 1 (chosen)

Replace the Spot B2ms with an on-demand B2s pinned to availability zone 1 (the only North Europe zone where B2s is available on this subscription). Fix the Flux bootstrap parameters simultaneously.

Estimated cost: ~£24/month (VM + ACR Basic). Cloudflare free.

Eliminates eviction risk entirely. VM destroy/recreate is fully automated via cloud-init + Flux GitOps.

### Option B: Stay on Spot, increase cache TTLs

Retain the Spot VM, configure Cloudflare cache rules with longer TTLs (e.g. 7-day `s-maxage`) to reduce the probability of a cache miss on eviction.

Does not eliminate the risk — only reduces it. If the cache is cold (e.g. after a Cloudflare purge or first deployment to a new PoP), the 522 recurs. The chaos engineering story from ADR-005 was a deliberate framing, not a reliability guarantee.

### Option C: Spot with a cold-standby static export on GitHub Pages

Keep the Spot VM as primary, fall back to GitHub Pages for the static site on eviction.

Reintroduces the GitHub Pages dependency removed in ADR-005. Adds complexity to the DNS failover. The multi-domain routing (sddbook.com, aiimmigrants.com) still requires the VM, so GitHub Pages only covers kevinryan.io. Rejected.

## Decision

**Migrate to Standard_B2s on-demand, pinned to availability zone 1.** Fix the Flux bootstrap repository reference and path in the same change.

Changes made:

1. `infra/modules/compute/cloud-init.yaml`: `--repository=kevin-ryan-platform`, `--path=k8s/kevinryan-io`
2. `infra/modules/compute/main.tf`: Remove `priority = "Spot"`, `eviction_policy`, `max_bid_price`; add `zone = "1"`
3. `infra/modules/compute/variables.tf` and `infra/variables.tf`: Update `vm_size` default from `Standard_B2ms` to `Standard_B2s`
4. `infra/modules/network/main.tf`: Add `zones = ["1"]` to the public IP resource (already Standard SKU + Static)

This is a destroy/recreate of the VM resource in Terraform. Cloud-init handles full K3s + Flux bootstrap automatically on the new instance. The Cloudflare Origin Certificate TLS secret must be re-applied to the cluster manually after the VM comes up (as documented in ADR-005).

## Consequences

### Positive

- Eliminates spot eviction risk; the site is available as long as Azure zone 1 (North Europe) is healthy
- cloud-init now correctly bootstraps Flux against the current repo name and manifest path — fresh VM provisioning is fully automated
- Zonal public IP co-located with the VM avoids cross-zone constraints and aligns with Azure's zonal resource model
- 4 GB RAM is sufficient for current workloads; no change in operational overhead

### Negative

- Monthly compute cost increases from ~£10–15 (spot, variable) to ~£24 (on-demand, fixed)
- The VM is pinned to a single availability zone; an Azure zone 1 outage in North Europe would cause full downtime (no cross-zone failover at this budget tier)
- Spot eviction as a "chaos engineering story" (ADR-005) is no longer applicable

### Risks

- **Zone 1 outage:** If North Europe zone 1 is unhealthy, the VM and its zonal public IP are unavailable. Cloudflare CDN would serve cached static content for the duration. Mitigation: Cloudflare cache TTLs should remain at 24h minimum for static assets.
- **TLS secret lost on rebuild:** The Cloudflare Origin Certificate Kubernetes secret must be manually re-applied after a full destroy/recreate (same risk as ADR-005; OS disk does not survive `terraform destroy`). Mitigation: document the recovery runbook; automate via Key Vault in a future ADR.

## Agent Decisions

| Decision | Rationale | Acceptable |
|----------|-----------|------------|
| Remove `priority` field entirely rather than setting `priority = "Regular"` | `Regular` is the default for `azurerm_linux_virtual_machine`; omitting it is cleaner and idiomatic Terraform | Yes |
| Add `zones = ["1"]` to `azurerm_public_ip` in the network module | Standard SKU zonal public IPs must declare a zone; the existing resource is already Standard SKU + Static, so only `zones` is added | Yes |
| Update `vm_size` default in both `infra/variables.tf` and `infra/modules/compute/variables.tf` | Both defaults referenced `Standard_B2ms`; updating both keeps the module self-consistent when called without an explicit `vm_size` argument | Yes |
| No changes to NIC or OS disk | NICs do not carry a zone attribute in AzureRM; the OS disk is inline in the VM resource and inherits the VM's zone automatically | Yes |
| No changes to Cloudflare module | The module only consumes `var.vm_public_ip` (an IP address string); no zone-specific outputs are referenced | Yes |

## References

- [ADR-005: Host on K3s with Azure Spot VM and Cloudflare CDN](adr-005-k3s-azure-spot-cloudflare-cdn.md)
- [ADR-013: Monorepo with pnpm workspaces](adr-013-monorepo-pnpm-workspaces.md)
- [Azure VM availability zones](https://learn.microsoft.com/en-us/azure/virtual-machines/availability-set-overview)
- [Azure Standard_B2s pricing](https://azure.microsoft.com/en-gb/pricing/details/virtual-machines/linux/)
- [Cloudflare 522 error](https://developers.cloudflare.com/support/troubleshooting/cloudflare-errors/troubleshooting-cloudflare-5xx-errors/#error-522-connection-timed-out)
