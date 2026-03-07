---
title: "Spec 0000: Write ADR-018 — Secret Management with Key Vault and ESO"
---

## Task

1. Save this spec to `.sdd/specification/spec-0000-adr-018-secret-management.md` in the repo (create the `.sdd/specification/` directory if it does not exist).
2. Create the file `docs/adr/adr-018-secret-management-keyvault-eso.md` following the project's ADR template at `docs/adr/template.md`. Match the depth, tone, and structure of existing ADRs (see `docs/adr/adr-017-managed-postgresql-shared-database.md` and `docs/adr/adr-016-second-k3s-node-for-observability.md` for reference).
3. After completing all work, create a provenance record at `.sdd/provenance/spec-0000-adr-018-secret-management.provenance.md` (create the `.sdd/provenance/` directory if it does not exist). See the Provenance Record section below for the required format.

## Metadata

- **Status:** Accepted
- **Date:** 2026-03-05
- **Decision Makers:** Human + Agent
- **Prompted By:** ADR-017 provisions a managed PostgreSQL Flexible Server with credentials that must reach application pods in K8s. The platform needs a general-purpose secret management pattern that works for PostgreSQL today and any future service that requires secrets.

## Context the ADR must capture

ADR-017 specifies "Azure AD + VM managed identity" for PostgreSQL authentication. In practice, Umami uses Prisma, which does not support Azure AD token-based auth for PostgreSQL. Grafana does support it, but using two different auth models for the same database server adds unnecessary complexity. The pragmatic decision is password-based auth for all app-level DB connections, with Terraform generating the credentials and storing them securely.

The question then becomes: how do secrets created by Terraform reach pods running in K3s?

## Options to document

### Option A: Cloud-init writes Kubernetes Secrets

- Terraform outputs the FQDN/credentials, cloud-init creates K8s Secrets at VM boot.
- **Pros:** no new tooling, already have a cloud-init pattern.
- **Cons:** secrets go stale if Terraform outputs change without a node rebuild; tight coupling between IaC and K8s bootstrap; secrets only created at initial boot.

### Option B: External Secrets Operator + Azure Key Vault (chosen)

- Terraform writes credentials to Azure Key Vault; ESO runs in-cluster and syncs Key Vault entries into K8s Secrets automatically.
- **Pros:** clean separation of concerns, secrets auto-refresh, well-established pattern, works across node rebuilds, Key Vault serves as a platform-wide secret store for future services.
- **Cons:** two new components (Key Vault + ESO), ESO requires helm-controller in Flux (currently not installed), VM managed identity needs Key Vault access.

### Option C: Sealed Secrets in Git

- Encrypt secrets with the cluster's public key, commit SealedSecret manifests to Git, controller decrypts in-cluster.
- **Pros:** fully GitOps-native.
- **Cons:** cluster-specific (tied to controller key pair), key pair must be backed up and restored on cluster rebuild, over-engineering for non-password data.

### Option D: Plain ConfigMap + managed identity (no secrets)

- FQDN/database name in a ConfigMap (not sensitive — only resolvable inside the VNet), pods acquire Azure AD tokens at runtime via IMDS.
- **Pros:** simplest possible approach, nothing to encrypt.
- **Cons:** only works if all consumers support Azure AD token auth — Umami/Prisma does not, so this option is ruled out.

## Decision to record

Azure Key Vault as the platform secret store, synced to Kubernetes via External Secrets Operator. Option B.

Key details:

- Key Vault is provisioned as its own Terraform module (`infra/modules/keyvault/`), separate from the PostgreSQL module, because it will serve as the platform-wide secret store beyond just database credentials.
- Terraform generates a PostgreSQL admin password (`random_password`), writes it along with the server FQDN and database names to Key Vault secrets.
- ESO is deployed as a HelmRelease (requires adding helm-controller to Flux — covered by the ADR-016 implementation work).
- ClusterSecretStore (not namespace-scoped SecretStore) references the Key Vault, using the VM's system-assigned managed identity for authentication. Any namespace can create ExternalSecret resources that reference this store.
- ExternalSecret resources per application sync specific Key Vault entries into Kubernetes Secrets (e.g. `DATABASE_URL` for Umami, `GF_DATABASE_HOST`/`GF_DATABASE_PASSWORD` for Grafana).
- App-level DB auth is password-based, not Azure AD managed identity — this is a pragmatic deviation from ADR-017's stated auth model, driven by Prisma's lack of Azure AD token support.

## Consequences to include

### Positive

- Single source of truth for secrets (Key Vault) — Terraform writes, ESO reads, no manual steps.
- Secrets auto-refresh without node rebuilds.
- Key Vault is reusable for any future service that needs secrets (not just PostgreSQL).
- ClusterSecretStore means adding a new consumer is one ExternalSecret manifest — no infrastructure changes.
- GitOps-compatible — ExternalSecret manifests are committed to Git, actual secret values are not.

### Negative

- Adds Key Vault cost (~£0/month at this scale, but a new Azure resource to manage).
- ESO is another pod running in the cluster consuming resources.
- Requires helm-controller in Flux (adding this is covered by the second K3s node implementation).
- Password-based DB auth is less elegant than managed identity — credentials exist that could theoretically leak.

### Risks

- **Key Vault access misconfiguration:** If the VM managed identity lacks the Key Vault Secrets User role, ESO cannot read secrets and all ExternalSecrets fail. Mitigation: Terraform handles role assignment declaratively; validate by checking ClusterSecretStore health status after deployment.
- **ESO availability:** If the ESO pod crashes, existing K8s Secrets remain (they're regular Secrets once created) but won't refresh. Mitigation: ESO is lightweight and well-tested; standard pod restart policies apply.
- **Helm-controller dependency:** ESO deployment is blocked until helm-controller is added to Flux. Mitigation: this is addressed in the ADR-016 implementation (Spec 0001) which is sequenced before ESO deployment.

## Agent Decisions table

Use the standard "No agent implementation decisions recorded" row — this ADR documents the human-directed architectural decision.

## References to include

- ADR-003 (Umami)
- ADR-006 (Observability — Grafana, Loki, Promtail)
- ADR-017 (Managed PostgreSQL — this ADR refines its auth model)
- ADR-016 (Second K3s node — helm-controller prerequisite)
- External Secrets Operator docs
- Azure Key Vault provider for ESO
- Azure Key Vault pricing

## Provenance Record

After completing the work, create `.sdd/provenance/spec-0000-adr-018-secret-management.provenance.md` with the following structure:

```markdown
# Provenance: Spec 0000 — ADR-018 Secret Management with Key Vault and ESO

**Spec:** `.sdd/specification/spec-0000-adr-018-secret-management.md`
**Executed:** <timestamp>
**Agent:** <agent identifier if available>

## Actions Taken

Chronological list of every action performed (files created, files modified, commands run).

## Decisions Made

Any decisions the agent made during execution that were not explicitly specified in the spec. For each:

| Decision | Options Considered | Chosen | Rationale |
|----------|-------------------|--------|-----------|
| ... | ... | ... | ... |

If no autonomous decisions were required, state: "No autonomous decisions were required — all actions were explicitly specified in the spec."

## Deviations from Spec

Any points where the agent deviated from the spec, and why. If none, state: "No deviations from spec."

## Artifacts Produced

| File | Status |
|------|--------|
| `.sdd/specification/spec-0000-adr-018-secret-management.md` | Created / Modified |
| `docs/adr/adr-018-secret-management-keyvault-eso.md` | Created |
| `.sdd/provenance/spec-0000-adr-018-secret-management.provenance.md` | Created |

## Validation Results

Results of each validation step from the spec (pass/fail with details).
```

This provenance record must be committed alongside the spec and ADR in the same commit.

## Validation steps

After completing all work, confirm:

1. This spec has been saved to `.sdd/specification/spec-0000-adr-018-secret-management.md`
2. The file exists at `docs/adr/adr-018-secret-management-keyvault-eso.md`
3. The frontmatter title field matches the pattern `"ADR-018: ..."`
4. The file follows the template structure (all sections present: Context, Decision Drivers, Options Considered, Decision, Consequences, Agent Decisions, References)
5. All four options (A–D) are documented with trade-offs
6. The deviation from ADR-017's managed identity auth is explicitly called out
7. `pnpm lint` passes (markdownlint will catch formatting issues)
8. No broken relative links in the References section — verify the referenced ADR filenames exist in `docs/adr/`
9. The provenance record exists at `.sdd/provenance/spec-0000-adr-018-secret-management.provenance.md` and contains all required sections
10. All three files (spec, ADR, provenance) are committed together
