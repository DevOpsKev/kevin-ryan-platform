---
title: "ADR-012: Developer secret management with 1Password CLI"
---

**Status:** Accepted
**Date:** 2026-03-01
**Decision Makers:** Human + AI
**Prompted By:** ADRs 008–010 established infrastructure that requires secrets (Cloudflare API token, GitHub PAT for Flux, Azure credentials). As the project grows to include PostgreSQL (ADR-007) and potentially a second contributor, a consistent workflow for how secrets are stored, accessed, and injected during development must be decided. Three distinct contexts require secret management: local development, CI/CD pipelines, and running infrastructure.

## Context

The project currently has a small but growing set of secrets:

| Secret | Used by | Context |
|--------|---------|---------|
| Cloudflare API token | Terraform (local + CI) | Infrastructure provisioning |
| GitHub PAT (Flux) | cloud-init, Terraform | K3s Flux bootstrap |
| Azure credentials | Terraform, Azure CLI | Infrastructure provisioning |
| SSH private key | Developer | VM access for debugging |
| PostgreSQL connection string | Kubernetes pods (future) | Application runtime |

These secrets span three contexts with different trust models:

**Local development:** A developer runs Terraform, Azure CLI, and kubectl from their machine or Codespace. Secrets must be available in the terminal session without being written to files on disk (no `terraform.tfvars` with real tokens committed, no plaintext exports in `.bashrc`).

**CI/CD pipelines:** GitHub Actions needs Azure and Cloudflare credentials to run Terraform plan/apply and push images to ACR. ADR-009 established OIDC federation for Azure (no stored secret) and GitHub Actions secrets for the Cloudflare token.

**Running infrastructure:** The K3s cluster needs to pull images from ACR (Managed Identity, no secret) and will eventually need database credentials (Key Vault, future). ADR-010 eliminated stored credentials for image pulls.

The gap is in local development. Without a defined workflow, secrets end up in shell history, plaintext dotfiles, `terraform.tfvars` files that risk being committed, or environment variables set manually each session. Kevin already uses 1Password — the question is whether to formalise it as the project's local secret management tool.

## Decision Drivers

- **No secrets on disk.** `terraform.tfvars` must never contain real secret values. No plaintext tokens in dotfiles, shell history, or environment variable exports.
- **Session injection.** Secrets must be available in the terminal session for the duration of a command or session, then gone. Not persisted between sessions.
- **Team-ready.** A second contributor must be able to onboard by following documented steps, not by asking Kevin to share tokens via Slack.
- **Consistent with CI/CD model.** Local development should mirror CI/CD where possible — same variables, same providers, same authentication flow.
- **Works in Codespaces.** The development environment is GitHub Codespaces. The solution must work inside a Codespace, not just on a local machine.
- **Existing tooling.** Kevin already has a 1Password subscription. No new cost.

## Options Considered

### Option A: 1Password CLI (`op`)

1Password's CLI tool injects secrets from a 1Password vault into commands and environment variables at runtime. Secrets never touch disk.

Usage patterns:

```bash
# Inject secrets into a single command
op run --env-file=.env.tpl -- terraform plan

# Reference secrets in a template file (.env.tpl)
CLOUDFLARE_API_TOKEN=op://DevOps/Cloudflare/api-token
TF_VAR_cloudflare_api_token=op://DevOps/Cloudflare/api-token
TF_VAR_github_token=op://DevOps/GitHub-Flux-PAT/token

# Read a single secret
op read "op://DevOps/Cloudflare/api-token"
```

The `.env.tpl` file is committed to the repo — it contains secret references (URIs), not secret values. Any developer with 1Password access and the shared vault can run the same commands.

### Option B: Bitwarden CLI (`bw`)

Bitwarden's CLI can retrieve secrets via `bw get password <name>`. Open source, self-hostable.

The CLI is less ergonomic than 1Password for developer workflows. There is no `op run` equivalent — secrets must be captured into shell variables manually:

```bash
export TF_VAR_cloudflare_api_token=$(bw get password cloudflare-api-token)
terraform plan
```

This works but leaves the secret in the shell environment for the rest of the session. It also puts the secret in shell history if the export command is typed directly. Bitwarden does not support template files with secret references.

Kevin does not currently have a Bitwarden account — this would require migration.

### Option C: Environment variables (manual)

No password manager integration. Secrets are set manually at the start of each session:

```bash
export TF_VAR_cloudflare_api_token="cf-token-here"
export TF_VAR_github_token="ghp-token-here"
```

Simple and universal. No tooling dependency. But secrets appear in shell history, persist in the environment for the full session, and must be re-entered on every session start. No sharing mechanism beyond "send it to me on Slack." Scales to one person, barely.

### Option D: GitHub Codespaces secrets

Codespaces can inject secrets as environment variables via Settings → Codespaces → Secrets. These are available in every Codespace session automatically.

Solves the session injection problem for Codespaces specifically. Does not help when working outside Codespaces (local machine, VM, other CI). Secrets are tied to the GitHub account, not a shared vault — a second contributor would need their own copies. No template file or documentation of which secrets are required.

### Option E: Azure Key Vault for local development

Use Azure Key Vault as the secret store for local development. Retrieve secrets via `az keyvault secret show`.

Adds a cloud dependency to local development — every `terraform plan` requires an Azure connection to retrieve secrets before it can connect to Azure to plan. Circular complexity. Key Vault is the right choice for runtime secrets in the K3s cluster (future), not for developer workstation secrets.

## Decision

**1Password CLI (`op`) for local developer secret management. GitHub Actions secrets for CI/CD. Azure Key Vault reserved for runtime infrastructure secrets (future).** Option A for local, with the existing CI/CD and infrastructure patterns from ADRs 008–010 unchanged.

### Three-tier secret management model

| Context | Mechanism | Secret storage |
|---------|-----------|----------------|
| **Local development** | 1Password CLI (`op run` with `.env.tpl`) | 1Password vault |
| **CI/CD** | OIDC federation (Azure), GitHub Actions secrets (Cloudflare) | GitHub / Azure AD |
| **Running infrastructure** | Managed Identity (ACR), Key Vault (future, PostgreSQL) | Azure |

### Implementation

**`.env.tpl`** (committed to repo — contains references, not values):

```bash
TF_VAR_cloudflare_api_token=op://DevOps/Cloudflare/api-token
TF_VAR_cloudflare_zone_id=op://DevOps/Cloudflare/zone-id
TF_VAR_github_token=op://DevOps/GitHub-Flux-PAT/token
TF_VAR_admin_ssh_public_key=op://DevOps/Azure-VM-SSH/public-key
ARM_SUBSCRIPTION_ID=op://DevOps/Azure/subscription-id
```

**Developer workflow:**

```bash
# One-time: install 1Password CLI and sign in
op signin

# Run Terraform with secrets injected
cd infra
op run --env-file=.env.tpl -- terraform plan
op run --env-file=.env.tpl -- terraform apply
```

**Onboarding a new contributor:**

1. Install 1Password CLI
2. Request access to the DevOps vault in 1Password
3. `op run --env-file=.env.tpl -- terraform plan` works immediately

**`.env.tpl` is NOT `.env`.** The `.tpl` extension makes it clear this is a template with references. `.env` files are gitignored. `.env.tpl` is committed.

### What this does NOT cover

- **CI/CD secrets** — unchanged from ADR-009. OIDC for Azure, GitHub Actions secrets for Cloudflare.
- **Runtime secrets** — Azure Managed Identity for ACR pulls (ADR-010). Key Vault for PostgreSQL credentials (future, when ADR-007 is implemented).
- **Kubernetes secrets** — External Secrets Operator or similar to sync Key Vault into Kubernetes (future).

## Consequences

### Positive

- **No secrets on disk.** `op run` injects secrets as environment variables for the duration of the command only. They do not persist in the shell, dotfiles, or files on disk
- **Committed secret references.** `.env.tpl` documents exactly which secrets are required, where they live in 1Password, and what Terraform variable they map to. A new contributor reads the file and knows what to set up
- **Session-scoped injection.** Secrets exist only for the lifetime of the `op run` command. No residual tokens in the environment after the command completes
- **Team-ready.** Sharing access means granting vault access in 1Password. No copying tokens over Slack, no per-person `.env` files
- **Works in Codespaces.** 1Password CLI runs in Codespaces. `op signin` authenticates via the browser, then `op run` works in the terminal

### Negative

- **1Password dependency.** Every developer needs a 1Password account and the CLI installed. This is a paid tool (~$3/month per user). For a solo consultancy this is trivial; for open-source contributors it would be a barrier. Mitigation: the `.env.tpl` format is self-documenting — a contributor without 1Password can manually export the same variables
- **`op signin` per session.** 1Password CLI sessions expire. Developers must re-authenticate periodically. Mitigation: 1Password integrates with system biometrics for faster re-auth
- **1Password vault structure must be maintained.** Secret references in `.env.tpl` are URIs to specific vault items. If items are renamed or moved, the references break. Mitigation: use a dedicated DevOps vault with stable naming conventions

### Risks

- **`.env` file accidentally committed.** If a developer creates a `.env` file with real values (bypassing `op run`), it could be committed. Mitigation: `.env` is in `.gitignore`. The pre-commit hook could be extended to reject files matching `.env` patterns
- **1Password outage blocks development.** If 1Password is unavailable, `op run` fails and Terraform cannot be run. Mitigation: 1Password CLI caches vault items locally for offline access. Extended outages are rare
- **Codespace-1Password authentication flow.** `op signin` in a Codespace requires browser-based authentication. If the Codespace cannot open a browser (e.g., SSH-only access), authentication requires a manual token flow. Mitigation: document the `op signin --raw` flow for headless environments

## Agent Decisions

*To be completed after implementation.*

| Decision | Rationale | Acceptable |
|----------|-----------|------------|
| *Pending* | *Pending* | *Pending* |

## References

- [ADR-008: Infrastructure-as-Code with Terraform](adr-008-iac-with-terraform.md) — Terraform variable injection
- [ADR-009: CI/CD with GitHub Actions and Flux CD](adr-009-cicd-github-actions-flux.md) — CI/CD secret model
- [ADR-010: ACR as primary registry, retain GHCR](adr-010-acr-primary-retain-ghcr.md) — Managed Identity for image pulls
- [1Password CLI documentation](https://developer.1password.com/docs/cli/)
- [1Password secret references](https://developer.1password.com/docs/cli/secret-references/)
- [1Password `.env` file support](https://developer.1password.com/docs/cli/secrets-environment-variables/)
