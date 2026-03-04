---
title: DR-015: Origin TLS certificate as Kubernetes secret with 1Password backup
---

# ADR-015: Origin TLS certificate as Kubernetes secret with 1Password backup

**Status:** Accepted
**Date:** 2026-03-03
**Decision Makers:** Human + AI
**Prompted By:** Rebuilding the K3s VM via `terraform destroy -target=module.compute && terraform apply` destroyed the cluster state including the manually-created `cloudflare-origin-tls` Kubernetes secret. Both kevinryan.io and brand.kevinryan.io were down until the certificate was manually recreated in both namespaces. This is unacceptable for a platform that will grow to host additional sites.

## Context

Cloudflare sits in front of the K3s cluster as a CDN and reverse proxy. The SSL/TLS mode is set to "Full (strict)", which means Cloudflare requires a valid TLS certificate on the origin server. This is provided by a Cloudflare Origin Certificate — a certificate issued by Cloudflare's own CA, trusted only by Cloudflare's edge, with a 15-year validity period.

Traefik, the K3s ingress controller, terminates TLS using this origin certificate. Each site's IngressRoute specifies `tls.secretName: cloudflare-origin-tls`, referencing a Kubernetes TLS secret containing the certificate and private key.

The problem: this secret exists only in the cluster. It was created manually via `kubectl create secret tls` and is not managed by Flux, Terraform, or any other declarative system. When the VM is destroyed and recreated, K3s is reinstalled, Flux bootstraps, pods start — but the TLS secret is gone. Traefik cannot terminate TLS, Cloudflare gets connection refused on HTTPS, and all sites return 521/522 errors.

Today this affected two sites. The platform will grow to include sddbook.com, aiimmigrants.com, and distributedequity.org (ADR-013). All will use the same wildcard origin certificate. A VM rebuild taking down five sites because of a missing secret is a significant operational risk.

Three aspects need to be addressed:

1. **Backup** — the certificate and key must be stored outside the cluster so they can be restored.
2. **Automation** — restoration should not require manual intervention after a VM rebuild.
3. **Security** — the private key must not be stored in plaintext in the git repository.

## Decision Drivers

- **Survive VM rebuilds.** A `terraform destroy && apply` of the compute module must result in a fully functional platform without manual secret recreation.
- **No plaintext secrets in git.** The origin certificate private key must not appear in any committed file, even in a private repository.
- **Consistent with ADR-012.** The existing secret management model uses 1Password for developer secrets, GitHub Actions secrets for CI/CD, and Azure Key Vault (future) for runtime secrets. The solution should fit within this model.
- **Solo operator simplicity.** External Secrets Operator, Vault, and cert-manager are powerful but add operational overhead and cluster dependencies. The solution should be proportionate to a solo-operated platform with a handful of static sites.
- **Multi-namespace.** The secret must exist in every site namespace. Adding a new site must not require remembering to manually create the secret.

## Options Considered

### Option A: 1Password backup + cloud-init restoration

Store the origin certificate and key in 1Password (consistent with ADR-012). During VM provisioning, cloud-init retrieves the certificate from 1Password via the CLI and creates the Kubernetes secrets in all site namespaces.

This requires the 1Password CLI to be available during cloud-init and an authentication mechanism (service account token or API key) for non-interactive access. 1Password offers service account tokens for CI/CD and automation use cases.

The cloud-init script would:

1. Install the 1Password CLI
2. Authenticate using a service account token (passed as a Terraform variable)
3. Retrieve the certificate and key from 1Password
4. Wait for K3s and Flux to create the site namespaces
5. Create the TLS secret in each namespace

Trade-offs: adds 1Password as a runtime dependency for infrastructure provisioning. If 1Password is down during VM creation, the secrets are not created and manual intervention is needed. The 1Password service account token itself becomes a secret that must be managed.

### Option B: Sealed Secrets (Bitnami)

Sealed Secrets encrypts Kubernetes secrets using a public key, producing a `SealedSecret` resource that can be safely committed to git. The Sealed Secrets controller in the cluster decrypts them using a private key that exists only in the cluster.

This is the Kubernetes-native solution. The encrypted `SealedSecret` YAML lives alongside the k8s manifests in git. Flux applies it, the controller decrypts it, and the Kubernetes secret appears.

Trade-offs: the Sealed Secrets controller must be running before the secret can be decrypted. On a fresh cluster, there is a bootstrap ordering problem — the controller needs to be installed and its own private key restored before it can decrypt anything. The controller's private key is itself a secret that must be backed up externally. This shifts the problem rather than solving it.

### Option C: Azure Key Vault + External Secrets Operator

Store the origin certificate in Azure Key Vault. Install the External Secrets Operator (ESO) in the cluster. ESO watches for `ExternalSecret` resources and syncs them from Key Vault into Kubernetes secrets.

This is the enterprise-grade solution and aligns with the Key Vault direction mentioned in ADR-012 for future PostgreSQL credentials. The certificate is stored in a managed, versioned, access-controlled vault with audit logging.

Trade-offs: ESO is a significant addition to the cluster — CRDs, a controller pod, RBAC configuration, and Azure authentication setup. For a solo operator running a handful of static sites, this is disproportionate. However, it becomes the right choice when the platform adds databases and application secrets. This option is the future direction but premature today.

### Option D: cloud-init with Terraform-injected certificate

Pass the origin certificate and key as Terraform variables (sourced from 1Password via `op run`). Terraform injects them into cloud-init as template variables. Cloud-init creates the Kubernetes secrets during VM provisioning.

This requires no additional tooling in the cluster or during provisioning — just Terraform variables and cloud-init scripting. The certificate never touches git; it flows from 1Password → developer's terminal → Terraform → cloud-init → kubectl.

Trade-offs: the certificate and key pass through Terraform state, which is stored in Azure Blob Storage. Terraform state should be treated as sensitive, which it already is (ADR-008 uses an encrypted backend). Adding a new site namespace requires updating the cloud-init script to create the secret in the new namespace.

## Decision

**Option D: cloud-init with Terraform-injected certificate.** The origin certificate and key are stored in 1Password, referenced in `.env.tpl`, passed as Terraform variables, injected into cloud-init, and applied to all site namespaces during VM provisioning.

This is the simplest solution that meets all the requirements: survives rebuilds, no plaintext in git, consistent with the existing secret management model, no new cluster dependencies, and works for a solo operator.

### Implementation

**1Password vault entries:**

Store the Cloudflare origin certificate and private key as two items in the DevOps vault:

- `Cloudflare-Origin-Cert` — the PEM-encoded certificate
- `Cloudflare-Origin-Key` — the PEM-encoded private key

**`.env.tpl` additions:**

```bash
TF_VAR_cloudflare_origin_cert=op://DevOps/Cloudflare-Origin-Cert/certificate
TF_VAR_cloudflare_origin_key=op://DevOps/Cloudflare-Origin-Key/private-key
```

**Terraform variables** (`infra/variables.tf`):

```hcl
variable "cloudflare_origin_cert" {
  description = "Cloudflare origin certificate (PEM)"
  type        = string
  sensitive   = true
}

variable "cloudflare_origin_key" {
  description = "Cloudflare origin certificate private key (PEM)"
  type        = string
  sensitive   = true
}
```

These are passed to the compute module and injected into cloud-init.

**cloud-init addition** (after Flux bootstrap completes):

```bash
# Wait for Flux to create site namespaces
until kubectl get ns kevinryan-io 2>/dev/null; do sleep 10; done
until kubectl get ns brand-kevinryan-io 2>/dev/null; do sleep 10; done

# Create origin TLS secret in all site namespaces
for NS in kevinryan-io brand-kevinryan-io; do
  kubectl create secret tls cloudflare-origin-tls \
    --cert=/tmp/origin.pem --key=/tmp/origin-key.pem \
    -n "$NS"
done

# Clean up
rm -f /tmp/origin.pem /tmp/origin-key.pem
```

**Adding a new site:** When a new site is added to the platform (ADR-013), its namespace must be added to the cloud-init wait loop and the for loop. This is documented in AGENTS.md as part of the "Adding a new site" checklist.

### Future migration path

When the platform adds databases or application secrets (ADR-007), the External Secrets Operator (Option C) becomes justified. At that point, the origin certificate should move from cloud-init injection to ESO + Azure Key Vault, and this ADR should be superseded. The migration is straightforward: store the certificate in Key Vault, create an `ExternalSecret` resource in each namespace, and remove the cloud-init certificate logic.

## Consequences

### Positive

- **VM rebuilds are fully automated.** `terraform destroy -target=module.compute && terraform apply` produces a working platform with TLS, no manual intervention required.
- **No new cluster dependencies.** No additional controllers, CRDs, or operators to install and maintain.
- **Consistent with existing model.** Uses the same 1Password → Terraform → cloud-init pipeline that already manages the GitHub token for Flux bootstrap.
- **Certificate is backed up.** Stored in 1Password with the same access controls and audit trail as other secrets.

### Negative

- **Certificate in Terraform state.** The origin certificate and key are stored in the Azure Blob Storage backend as part of the Terraform state. This is encrypted at rest, but operators with state access can read it. Mitigation: Terraform state is already treated as sensitive (ADR-008). Access is restricted to the deployment service principal and vault-authenticated developers.
- **cloud-init namespace list is manual.** Adding a site requires updating the namespace list in cloud-init. Mitigation: documented in AGENTS.md and the "Adding a new site" pattern guide. A future improvement could dynamically discover namespaces with a label selector.
- **Ordering dependency on Flux.** cloud-init must wait for Flux to create namespaces before creating secrets. If Flux bootstrap fails, the secrets are not created. Mitigation: the wait loop retries indefinitely; if Flux is truly broken, the VM provisioning will timeout, which is the correct behaviour — a broken Flux means a broken platform regardless.

### Risks

- **Cloudflare origin certificate renewal.** The origin certificate has a 15-year validity period. When it eventually expires, the 1Password entry, Terraform state, and all cluster namespaces must be updated simultaneously. Mitigation: the 15-year window makes this a low-frequency event. Document the renewal procedure in a runbook.
- **1Password item naming change.** If the 1Password item is renamed, `.env.tpl` references break and `op run` fails before Terraform can start. Mitigation: use a dedicated DevOps vault with stable naming conventions (ADR-012).

## Agent Decisions

*To be completed during implementation.*

| Decision | Rationale | Acceptable |
|----------|-----------|------------|
| *Pending* | *Pending* | *Pending* |

## References

- [ADR-005: Host on K3s with Azure Spot VM and Cloudflare CDN](adr-005-k3s-azure-spot-cloudflare-cdn.md) — compute and CDN architecture
- [ADR-008: Infrastructure-as-Code with Terraform](adr-008-iac-with-terraform.md) — Terraform state and backend
- [ADR-012: Developer secret management with 1Password CLI](adr-012-developer-secret-management.md) — 1Password as secret management tool
- [ADR-013: Monorepo with pnpm Workspaces](adr-013-monorepo-pnpm-workspaces.md) — multi-site platform structure
- [Cloudflare Origin Certificates documentation](https://developers.cloudflare.com/ssl/origin-configuration/origin-ca/)
