---
title: "ADR-003: Self-host Umami analytics on k3s"
---

**Status:** Accepted
**Date:** 2026-02-28
**Decision Makers:** Human + Claude (claude.ai)
**Prompted By:** Need for web traffic analytics on kevinryan.io that aligns with privacy-first positioning and minimises cost and operational complexity on the k3s cluster.

## Context

kevinryan.io needs web traffic analytics to track visitor behaviour, referral sources, and content performance. The site is a professional portfolio supporting a career pivot into DevEx/Platform Engineering and AI-Native Software Engineering consulting. Kevin's broader work includes Distributed Equity Labs (AI licensing and ethics) and published thought leadership on AI governance.

The analytics solution must align with this privacy and ethics positioning. It must also run affordably on a single-node k3s cluster alongside the portfolio site, without consuming disproportionate resources.

Kevin is currently using Umami Cloud (free tier, up to 100k events/month) and wants to determine whether to continue with a hosted service or self-host, and which platform to use.

## Decision Drivers

- Privacy-first: no cookies, no personal data collection, GDPR-compliant by default
- Minimal resource footprint on a single-node k3s cluster
- Lightweight tracking script that does not degrade page performance
- Alignment with the consultancy's AI ethics and privacy positioning — self-hosting analytics on own infrastructure is a credibility signal
- Zero or near-zero cost
- Familiar technology stack to minimise maintenance burden
- Ability to share infrastructure (PostgreSQL) with future services on the cluster

## Options Considered

### Option A: Umami (self-hosted)

Open source (MIT), built with Next.js and React, backed by PostgreSQL. Tracking script is ~1KB. Cookieless by default. Minimal resource requirements — known to run comfortably on 2-core, 2GB RAM servers with capacity to spare. Docker images are maintained in the official repository with a ready-made docker-compose.yml. The stack (Next.js, React, PostgreSQL) is identical to what Kevin already works with, making maintenance and debugging straightforward. The PostgreSQL instance can be shared with future services on the cluster.

### Option B: Plausible (self-hosted)

Open source (AGPLv3), built with Elixir on the Erlang VM, backed by ClickHouse. Also ~1KB tracking script. Clean single-page dashboard similar to Umami. However, ClickHouse requires considerably more RAM than PostgreSQL, which would compete for resources on a single-node k3s cluster. The Elixir/Erlang stack is unfamiliar, increasing maintenance risk. Community edition is Docker-only.

### Option C: Matomo (self-hosted)

Open source (GPLv3), built with PHP, backed by MySQL/MariaDB. The most feature-rich option with heatmaps, session recording, A/B testing, and a large plugin ecosystem. However, the tracking script is ~23KB (23x heavier than Umami or Plausible), it requires a PHP web server (Apache or Nginx) alongside the application, and self-hosting demands significant server resources. The feature set is overkill for a portfolio site and the PHP stack adds maintenance complexity.

### Option D: PostHog (self-hosted)

Open source (MIT), marketed as "8+ products in one" including product analytics, session replay, feature flags, and A/B testing. Requires multiple containers for full functionality. The JavaScript snippet is significantly heavier than Umami or Plausible. Designed for product teams tracking application behaviour at scale — far beyond what a portfolio site requires. Resource requirements would dominate the k3s node.

### Option E: Google Analytics

Free, zero infrastructure, widely understood. However, visitor data is sent to Google, there is no self-hosting option, cookies and consent banners are required, and using Google Analytics directly contradicts the privacy and AI ethics positioning of Kevin's consultancy brand.

## Decision

**Use Umami for web traffic analytics, migrating from Umami Cloud to self-hosted on k3s.**

Umami is the strongest fit across every decision driver. The ~1KB tracking script has negligible impact on page performance. Cookieless, privacy-first tracking aligns with the consultancy's AI ethics positioning, and self-hosting on own infrastructure reinforces that credibility. The Next.js/PostgreSQL stack matches Kevin's existing skills, eliminating the learning curve that Plausible (Elixir/ClickHouse) or Matomo (PHP/MySQL) would introduce. Resource requirements are minimal, leaving headroom on the single-node k3s cluster.

### Migration strategy: Umami Cloud now, self-hosted later

Rather than self-hosting Umami from day one on the k3s cluster, the migration will be phased:

1. **Now:** Continue using Umami Cloud (free tier, 100k events/month). This is more than sufficient for current traffic levels and avoids adding complexity during initial k3s cluster provisioning and portfolio site deployment.
2. **Later:** Once the k3s cluster is stable and the portfolio site is running in production, deploy self-hosted Umami as a second workload on the cluster. Update the tracking script to point at the self-hosted instance. The Umami Cloud data can be exported or simply left as a historical baseline.

This phased approach means one less thing to debug during the critical initial deployment, while preserving the long-term goal of full self-hosting.

## Consequences

### Positive

- Zero cost in the immediate term (Umami Cloud free tier) and zero cost long-term (self-hosted on existing k3s infrastructure)
- Privacy-first analytics with no cookies, no personal data collection, and GDPR compliance by default
- ~1KB tracking script — negligible impact on page load performance and Lighthouse scores
- Self-hosting on own infrastructure is a tangible credibility signal for the AI ethics and privacy consultancy positioning
- PostgreSQL backend can be shared with future cluster services, reducing operational overhead
- Familiar Next.js/React/PostgreSQL stack minimises maintenance burden
- Phased migration reduces risk during initial k3s deployment

### Negative

- Umami's feature set is intentionally limited — no heatmaps, session recordings, or A/B testing. These are not needed for a portfolio site but would require a different tool if consulting engagements demanded them
- Self-hosted Umami adds a second workload to the k3s cluster, consuming some CPU and RAM (though minimal)
- Migration from Umami Cloud to self-hosted requires updating the tracking script and accepting a break in historical data continuity (unless data is exported)

### Risks

- **Umami Cloud free tier changes:** The 100k events/month free tier could be reduced or removed. Mitigation: the self-hosted migration is already planned, so this would simply accelerate the timeline.
- **PostgreSQL resource contention:** Sharing a PostgreSQL instance between Umami and future services could create contention under load. Mitigation: the portfolio site generates modest traffic; resource limits can be set per namespace in k3s.
- **Umami project health:** As an open-source project, Umami could slow in development or be abandoned. Mitigation: the MIT licence allows forking, the codebase is in a familiar stack, and migration to Plausible is straightforward if needed.

## Agent Decisions

No autonomous agent decisions were required for this ADR. The decision was made collaboratively between the human and Claude in conversation. Implementation will involve agent decisions in a future session when the Umami Kubernetes manifests and PostgreSQL deployment are authored — those will be captured in subsequent ADRs.

## References

- [ADR-001: Containerize with nginx:alpine](/adr-001-containerize-with-nginx-alpine.md)
- [ADR-002: Private images via GHCR](/adr-002-private-images-via-ghcr.md)
- [Umami documentation](https://umami.is/docs)
- [Umami GitHub repository](https://github.com/umami-software/umami)
- [Umami Cloud pricing](https://umami.is/pricing)
