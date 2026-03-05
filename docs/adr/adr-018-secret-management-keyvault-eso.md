---
title: "ADR-018: Secret Management with Azure Key Vault and External Secrets Operator"
---

**Status:** Accepted
**Date:** 2026-03-05
**Decision Makers:** Human + Agent
**Prompted By:** ADR-017 provisions a managed PostgreSQL Flexible Server with credentials that must reach application pods in K3s. The platform needs a general-purpose secret management pattern that works for PostgreSQL today and any future service that requires secrets.

## Context

ADR-017 specifies "Azure AD + VM managed identity" as the authentication model for the managed PostgreSQL Flexible Server. In practice, this model does not work uniformly across all consumers:

- **Umami** (ADR-003) uses Prisma as its database client. Prisma does not support Azure AD token-based authentication for PostgreSQL — it requires a static connection string with a password.
- **Grafana** (ADR-006) does support Azure AD token auth via its PostgreSQL datasource plugin, but using two different authentication models for the same database server (managed identity for Grafana, password for Umami) adds unnecessary operational complexity.

The pragmatic decision is **password-based authentication for all app-level database connections**. This is a deliberate deviation from ADR-017's stated auth model, driven by the lowest-common-denominator constraint (Prisma). Terraform generates the credentials (`random_password`) and stores them securely — the question becomes: how do those secrets reach pods running in K3s?

Today the platform has one secret-producing system (PostgreSQL credentials from Terraform) and two consumers (Umami and Grafana). Future services will add more of both. The solution must be general-purpose, not PostgreSQL-specific.

## Decision Drivers

- **Separation of concerns:** Secret creation (Terraform) and secret consumption (K8s pods) should not be tightly coupled.
- **Resilience across node rebuilds:** Either K3s node can be destroyed and recreated (ADR-016) without losing access to secrets or requiring manual re-provisioning.
- **Auto-refresh:** If Terraform rotates a credential, pods should pick up the new value without manual intervention or node rebuilds.
- **Platform-wide reuse:** The pattern must work for any future service that requires secrets, not just PostgreSQL credentials.
- **GitOps compatibility:** Secret references (not values) should be declarative and committed to Git alongside other Kubernetes manifests.
- **Minimal operational overhead:** Prefer well-established tooling with low maintenance burden over custom scripts or bespoke solutions.

## Options Considered

### Option A: Cloud-init writes Kubernetes Secrets

Terraform outputs the FQDN and credentials. Cloud-init on each K3s node runs `kubectl create secret` at VM boot time, creating the required Kubernetes Secrets before Flux reconciles workloads.

This option builds on the existing cloud-init pattern already used for K3s bootstrap (ADR-016). No new tooling is required.

**Trade-offs:** Secrets are created only at boot time. If Terraform outputs change (e.g. a password rotation or a new database), the secrets go stale until the node is rebuilt. This creates tight coupling between IaC changes and VM lifecycle — a Terraform change that should be transparent to the cluster instead requires a node destroy/recreate. Additionally, cloud-init scripts become increasingly complex as more secrets are added, and secret creation is not idempotent without careful scripting.

### Option B: External Secrets Operator + Azure Key Vault (chosen)

Terraform writes credentials to Azure Key Vault. The External Secrets Operator (ESO) runs as a pod in the K3s cluster and continuously syncs Key Vault entries into native Kubernetes Secrets. Applications consume standard K8s Secrets — they have no awareness of Key Vault or ESO.

Key Vault serves as the platform-wide secret store: Terraform writes, ESO reads, applications consume. The sync is automatic, continuous, and survives node rebuilds.

**Trade-offs:** Introduces two new components — an Azure Key Vault resource and the ESO controller pod. ESO is deployed as a HelmRelease, which requires helm-controller in Flux (not currently installed; adding it is covered by the ADR-016 implementation work). The VM's system-assigned managed identity needs the Key Vault Secrets User role to authenticate.

### Option C: Sealed Secrets in Git

Encrypt secrets with the cluster controller's public key using Bitnami Sealed Secrets. Commit `SealedSecret` manifests to Git. The Sealed Secrets controller running in-cluster decrypts them into native K8s Secrets.

This is fully GitOps-native — encrypted secret manifests live in the same Git repo as all other Kubernetes manifests.

**Trade-offs:** The encryption is tied to the controller's key pair, which is cluster-specific. If the cluster is rebuilt (a real scenario given the VM-based K3s setup), the key pair must be backed up and restored before any SealedSecrets can be decrypted. This adds a fragile manual step to the node rebuild process. Additionally, Sealed Secrets does not support auto-refresh — a credential rotation requires re-encrypting and re-committing the SealedSecret manifest.

### Option D: Plain ConfigMap + managed identity (no secrets)

Store non-sensitive connection metadata (FQDN, database names) in a ConfigMap. Pods acquire Azure AD tokens at runtime via the Instance Metadata Service (IMDS) endpoint, authenticating to PostgreSQL without any stored password.

This is the simplest possible approach — nothing to encrypt, no secret store, no operator.

**Trade-offs:** This only works if every consumer supports Azure AD token-based PostgreSQL authentication. Umami uses Prisma, which does not support this authentication model. This option is therefore **ruled out** for the current platform composition. It would become viable only if all database consumers were replaced with ones supporting Azure AD token auth.

## Decision

**Azure Key Vault as the platform secret store, synced to Kubernetes via External Secrets Operator.** Option B.

### Architecture

```text
Terraform                  Azure Key Vault              K3s Cluster
┌──────────────┐          ┌──────────────────┐         ┌────────────────────────┐
│ random_pass  │─writes──▶│ pg-admin-password │◀─reads──│ ESO (ClusterSecretStore)│
│ pg FQDN     │─writes──▶│ pg-fqdn           │         │         │              │
│ db names    │─writes──▶│ pg-umami-db       │         │    ExternalSecret      │
│              │          │ pg-grafana-db     │         │         │              │
└──────────────┘          └──────────────────┘         │    K8s Secret          │
                                                        │         │              │
                                                        │    Pod (env vars)     │
                                                        └────────────────────────┘
```

### Key details

- **Key Vault module:** Provisioned as its own Terraform module (`infra/modules/keyvault/`), separate from the PostgreSQL module. Key Vault is a platform-wide resource — it will store secrets beyond just database credentials as the platform grows.
- **Secret population:** Terraform generates a PostgreSQL admin password (`random_password`), writes it along with the server FQDN and database names to Key Vault secrets. The PostgreSQL module outputs these values; the Key Vault module consumes them.
- **ESO deployment:** Deployed as a HelmRelease via Flux. This requires adding helm-controller to the Flux installation — covered by the ADR-016 implementation work (adding the second K3s node and expanding Flux capabilities).
- **ClusterSecretStore:** A cluster-scoped store (not namespace-scoped `SecretStore`) references the Key Vault instance, authenticating via the VM's system-assigned managed identity. Any namespace can create `ExternalSecret` resources that reference this store.
- **ExternalSecret per application:** Each application gets an `ExternalSecret` manifest that maps specific Key Vault entries to Kubernetes Secret keys. For example:
  - Umami: `DATABASE_URL` composed from FQDN, database name, and password
  - Grafana: `GF_DATABASE_HOST`, `GF_DATABASE_NAME`, `GF_DATABASE_PASSWORD`
- **Auth model deviation:** App-level database authentication is password-based, not Azure AD managed identity. This is a pragmatic deviation from ADR-017's stated authentication model, driven by Prisma's lack of Azure AD token support. The managed identity is still used — but for ESO-to-Key Vault authentication, not for application-to-database authentication.

## Consequences

### Positive

- Single source of truth for secrets (Key Vault) — Terraform writes, ESO reads, no manual steps
- Secrets auto-refresh without node rebuilds — if Terraform rotates a password and updates Key Vault, ESO picks up the change on its next sync interval
- Key Vault is reusable for any future service that needs secrets, not just PostgreSQL credentials
- ClusterSecretStore means adding a new secret consumer is one `ExternalSecret` manifest — no infrastructure changes required
- GitOps-compatible — `ExternalSecret` manifests are committed to Git, actual secret values are not
- Clean separation: Terraform owns secret creation, ESO owns secret delivery, applications own secret consumption

### Negative

- Adds Key Vault cost (~£0/month at this scale on the free tier, but a new Azure resource to manage and monitor)
- ESO is another pod running in the cluster consuming resources (~50–100 MB RAM)
- Requires helm-controller in Flux, which is not currently installed (adding it is covered by the ADR-016 implementation)
- Password-based database auth is less elegant than managed identity — credentials exist that could theoretically leak if Key Vault access is misconfigured or a Kubernetes Secret is exposed

### Risks

- **Key Vault access misconfiguration:** If the VM managed identity lacks the Key Vault Secrets User role, ESO cannot read secrets and all ExternalSecrets enter a failed state. Pods that depend on these secrets will fail to start or lose access on Secret expiry. Mitigation: Terraform handles the role assignment declaratively as part of the Key Vault module; validate by checking `ClusterSecretStore` health status after deployment.
- **ESO availability:** If the ESO pod crashes or is evicted, existing Kubernetes Secrets remain intact (they are regular Secrets once created) but will not refresh until ESO recovers. Mitigation: ESO is a lightweight, well-tested controller with standard pod restart policies; schedule it on `node2` alongside the observability stack where memory headroom exists.
- **Helm-controller dependency:** ESO deployment is blocked until helm-controller is added to Flux. Mitigation: this is addressed in the ADR-016 implementation (Spec 1), which is sequenced before ESO deployment. ESO cannot be deployed until that work is complete.

## Agent Decisions

| Decision | Rationale | Acceptable |
|----------|-----------|------------|
| No agent implementation decisions recorded | This ADR documents the human-directed architectural decision; implementation details will be recorded in subsequent PRs | Yes |

## References

- [ADR-003: Self-host Umami Analytics](adr-003-self-host-umami-analytics.md)
- [ADR-006: Observability with Grafana, Loki, and Promtail](adr-006-observability-grafana-loki-promtail.md)
- [ADR-016: Add Second K3s Node for Observability Workloads](adr-016-second-k3s-node-for-observability.md)
- [ADR-017: Managed PostgreSQL as Shared Database Layer](adr-017-managed-postgresql-shared-database.md) *(this ADR refines its auth model)*
- [External Secrets Operator documentation](https://external-secrets.io/)
- [Azure Key Vault provider for ESO](https://external-secrets.io/latest/provider/azure-key-vault/)
- [Azure Key Vault pricing](https://azure.microsoft.com/en-gb/pricing/details/key-vault/)
