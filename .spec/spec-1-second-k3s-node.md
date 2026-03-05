# Spec 1: Second K3s Node + Key Vault + Helm Controller

## Task

1. Save this spec to `.spec/spec-1-second-k3s-node.md` in the repo.
2. Implement all Terraform and cloud-init changes described below.
3. After completing all work, create a provenance record at `.provenance/spec-1-second-k3s-node.provenance.md`. See the **Provenance Record** section for the required format.

## Prerequisites

- Spec 0 completed (ADR-018 exists at `docs/adr/adr-018-secret-management-keyvault-eso.md`)
- Read ADR-016 (`docs/adr/adr-016-second-k3s-node-for-observability.md`) — it is the architectural decision this spec implements
- Read ADR-018 — it explains why Key Vault is needed

## Context

The platform currently runs a single K3s server node (`vm-kevinryan-io`) on a Standard_B2s VM. ADR-016 mandates adding a second B2s VM as a K3s agent node for observability workloads. The Key Vault module is needed here (not in a later spec) because the K3s join token must be stored in Key Vault per ADR-016.

### Current state (read these files before making changes)

| File | What it does |
|------|-------------|
| `infra/main.tf` | Root module — wires network, compute, registry, cloudflare, github-oidc |
| `infra/variables.tf` | Root variables |
| `infra/outputs.tf` | Root outputs |
| `infra/modules/network/main.tf` | VNet `10.0.0.0/16`, subnet `10.0.1.0/24`, one public IP, NSG |
| `infra/modules/network/variables.tf` | location, admin_ip |
| `infra/modules/network/outputs.tf` | subnet_id, public_ip_address, public_ip_id, nsg_id, resource_group_name/location/id |
| `infra/modules/compute/main.tf` | Single VM with NIC, system-assigned managed identity, cloud-init |
| `infra/modules/compute/cloud-init.yaml` | K3s server install, Azure CLI, ACR credentials, Flux bootstrap |
| `infra/modules/compute/variables.tf` | location, resource_group_name, subnet_id, public_ip_id, nsg_id, vm_size, admin creds, acr, github_token |
| `infra/modules/compute/outputs.tf` | vm_principal_id, vm_id |

### Circular dependency resolution

`module.keyvault` needs `vm_principal_ids` from node1 and node2 (for RBAC). The cloud-init templates need the Key Vault name. If the templates reference `module.keyvault.key_vault_name`, Terraform sees: node → keyvault → node (cycle).

**Resolution:** Add `keyvault_name` as a root-level variable with a sensible default (`"kv-kevinryan-io"`). Use `var.keyvault_name` in both cloud-init `templatefile` calls and pass it into the keyvault module. This breaks the cycle: nodes have no Terraform dependency on keyvault; keyvault depends on node principal IDs only.

### Cloud-init race condition

The VMs (`module.node1`, `module.node2`) have no Terraform dependency on `azurerm_key_vault_secret.k3s_token`. Terraform may boot the VMs before the secret is written to Key Vault. Cloud-init runs immediately on boot.

**Resolution:** Both cloud-init templates must include a retry loop around the `az keyvault secret show` call (30 attempts, 10s sleep, hard failure if token not retrieved). Without this, the first `terraform apply` will produce VMs that fail to bootstrap.

## 1. Key Vault Terraform module

Create `infra/modules/keyvault/` with `main.tf`, `variables.tf`, `outputs.tf`, `versions.tf`.

### Resources to create

- **`azurerm_key_vault`** — name passed via variable. SKU: `standard`. `purge_protection_enabled = false` (portfolio project, not production). `enable_rbac_authorization = true` (use Azure RBAC, not access policies).
- **`azurerm_role_assignment`** — grant each VM's system-assigned managed identity the `Key Vault Secrets User` role on the Key Vault. Accept a list of principal IDs as a variable so both node1 and node2 identities can be granted access.
- **`azurerm_role_assignment`** — grant the Terraform caller the `Key Vault Secrets Officer` role so Terraform can write secrets. The caller's object ID is passed as a variable.

### Important: no data sources in this module

Do **not** include `data "azurerm_client_config" "current" {}` in this module. The Terraform caller's object ID and tenant ID are passed as variables from the root module. Including an unused data source is dead code.

### Variables

- `location`, `resource_group_name` (standard)
- `name` — the Key Vault name (passed from root `var.keyvault_name`)
- `tenant_id` (for the Key Vault `tenant_id` property)
- `vm_principal_ids` — list of VM managed identity principal IDs to grant `Key Vault Secrets User`
- `terraform_object_id` — the Terraform caller's object ID for `Key Vault Secrets Officer`

### Outputs

- `key_vault_id`
- `key_vault_uri`
- `key_vault_name`

## 2. Network module changes

### New resources

- **Second public IP** — `pip-kevinryan-node2`, same spec as the existing public IP (Static, Standard SKU, zone 1). node2 needs a public IP for outbound internet access (container image pulls).

### New outputs

- `public_ip_address_node2` — the second public IP address value
- `public_ip_id_node2` — the second public IP resource ID
- `vnet_id` — the VNet resource ID (needed by future specs for PostgreSQL subnet delegation)
- `vnet_name` — the VNet name

### Existing resources — no changes

The existing subnet (`10.0.1.0/24`) is large enough for both VMs. No new subnet is needed for the compute nodes. The existing NSG can be shared — HTTP/HTTPS rules don't harm node2 (nothing listens on those ports).

## 3. Compute module refactoring

The current compute module creates a single VM with a hardcoded cloud-init template. Refactor it so the **same module** can be instantiated twice (once for node1, once for node2) with different parameters.

### Changes to the module

- **Parameterise the VM name** — add a `vm_name` variable (e.g. `vm-kevinryan-node1`, `vm-kevinryan-node2`). Use it for the VM, NIC (`nic-${var.vm_name}`), and OS disk names (`osdisk-${var.vm_name}`).
- **Accept cloud-init as a variable** — add a `custom_data` variable (string, base64-encoded). Remove the inline `templatefile()` call and the `cloud-init.yaml` file from the module. The caller (root module) is responsible for templating and encoding cloud-init. This makes the module role-agnostic.
- **Remove the `acr_login_server`, `acr_name`, `github_token` variables** — these were only needed for the cloud-init template, which is now the caller's responsibility.
- **Keep** `location`, `resource_group_name`, `subnet_id`, `public_ip_id`, `nsg_id`, `vm_size`, `admin_username`, `admin_ssh_public_key`.
- **Keep** the `lifecycle { ignore_changes = [custom_data] }` block — cloud-init only runs at first boot; changes require a node rebuild (taint + apply).

### Compute module outputs update

- Add `private_ip_address` output (the VM NIC's private IP — needed so node2's cloud-init can join node1 via its private IP)

## 4. Cloud-init templates — move to root

Move cloud-init templates out of the compute module and into the root `infra/` directory. The root module templates and base64-encodes them before passing to the compute module.

### Retry logic (required in both templates)

Both templates must retrieve the K3s token from Key Vault with a retry loop. The VMs may boot before Terraform finishes writing the secret. Use this pattern:

```yaml
- |
  for i in $(seq 1 30); do
    K3S_TOKEN=$(az keyvault secret show --vault-name "${keyvault_name}" --name k3s-token --query value -o tsv 2>/dev/null) && break
    sleep 10
  done
  if [ -z "$K3S_TOKEN" ]; then echo "FATAL: Failed to retrieve K3s token from Key Vault after 5 minutes"; exit 1; fi
```

### `infra/cloud-init-server.yaml` (node1 — K3s server)

Based on the existing `infra/modules/compute/cloud-init.yaml` with these changes:

- **K3s install**: retrieve `K3S_TOKEN` from Key Vault using the retry pattern above, then:
  ```yaml
  - curl -sfL https://get.k3s.io | K3S_TOKEN="$K3S_TOKEN" INSTALL_K3S_CHANNEL=stable sh -
  ```
- **Flux bootstrap**: change `--components` to include `helm-controller`:
  ```
  --components=source-controller,kustomize-controller,helm-controller
  ```
- **Everything else** stays the same (Azure CLI install, managed identity login, ACR credential refresh, etc.)
- **Template variables**: `keyvault_name`, `acr_login_server`, `acr_name`, `github_token`

### `infra/cloud-init-agent.yaml` (node2 — K3s agent)

New file. Must include:

- Same `package_update`, `package_upgrade`, `packages` as the server template
- **Azure CLI install** and managed identity login (same as server)
- **ACR credential refresh** script and systemd timer (same as server — node2 also pulls images)
- **K3s agent install** — retrieve the join token from Key Vault using the retry pattern above, then join via node1's private IP. Apply the observability taint and label at install time via `INSTALL_K3S_EXEC`:
  ```yaml
  - curl -sfL https://get.k3s.io | K3S_TOKEN="$K3S_TOKEN" K3S_URL="https://${node1_private_ip}:6443" INSTALL_K3S_CHANNEL=stable INSTALL_K3S_EXEC="--node-taint observability=true:NoSchedule --node-label role=observability" sh -
  ```
- **No Flux bootstrap** — Flux runs on node1 only; node2 is a worker node.
- **Template variables**: `keyvault_name`, `acr_login_server`, `acr_name`, `node1_private_ip`

## 5. K3s join token

- In the root `main.tf`, create a `random_password` resource for the K3s cluster token (length 48, `special = false`).
- Store it in Key Vault as a secret named `k3s-token` using `azurerm_key_vault_secret`.
- Both cloud-init templates retrieve the token from Key Vault at boot time using the retry pattern.

## 6. Registry module update

The registry module currently grants AcrPull to a single `vm_principal_id`. Both nodes need to pull images from ACR.

- **`infra/modules/registry/variables.tf`**: replace `vm_principal_id` (string) with `vm_principal_ids` (list of string).
- **`infra/modules/registry/main.tf`**: replace the single `azurerm_role_assignment` with a `for_each` over `toset(var.vm_principal_ids)`.

## 7. Root `main.tf` wiring

After refactoring, the root module should look approximately like this:

```hcl
module "network" {
  source   = "./modules/network"
  location = var.location
  admin_ip = var.admin_ip
}

module "node1" {
  source               = "./modules/compute"
  vm_name              = "vm-kevinryan-node1"
  location             = module.network.resource_group_location
  resource_group_name  = module.network.resource_group_name
  subnet_id            = module.network.subnet_id
  public_ip_id         = module.network.public_ip_id
  nsg_id               = module.network.nsg_id
  vm_size              = var.vm_size
  admin_username       = var.admin_username
  admin_ssh_public_key = var.admin_ssh_public_key
  custom_data          = base64encode(templatefile("${path.module}/cloud-init-server.yaml", {
    acr_login_server = "${var.acr_name}.azurecr.io"
    acr_name         = var.acr_name
    github_token     = var.github_token
    keyvault_name    = var.keyvault_name
  }))
}

module "node2" {
  source               = "./modules/compute"
  vm_name              = "vm-kevinryan-node2"
  location             = module.network.resource_group_location
  resource_group_name  = module.network.resource_group_name
  subnet_id            = module.network.subnet_id
  public_ip_id         = module.network.public_ip_id_node2
  nsg_id               = module.network.nsg_id
  vm_size              = var.vm_size
  admin_username       = var.admin_username
  admin_ssh_public_key = var.admin_ssh_public_key
  custom_data          = base64encode(templatefile("${path.module}/cloud-init-agent.yaml", {
    acr_login_server = "${var.acr_name}.azurecr.io"
    acr_name         = var.acr_name
    keyvault_name    = var.keyvault_name
    node1_private_ip = module.node1.private_ip_address
  }))
}

module "keyvault" {
  source              = "./modules/keyvault"
  name                = var.keyvault_name
  location            = module.network.resource_group_location
  resource_group_name = module.network.resource_group_name
  tenant_id           = data.azurerm_client_config.current.tenant_id
  terraform_object_id = data.azurerm_client_config.current.object_id
  vm_principal_ids    = [module.node1.vm_principal_id, module.node2.vm_principal_id]
}

resource "random_password" "k3s_token" {
  length  = 48
  special = false
}

resource "azurerm_key_vault_secret" "k3s_token" {
  name         = "k3s-token"
  value        = random_password.k3s_token.result
  key_vault_id = module.keyvault.key_vault_id
}

module "registry" {
  source              = "./modules/registry"
  location            = module.network.resource_group_location
  resource_group_name = module.network.resource_group_name
  acr_name            = var.acr_name
  vm_principal_ids    = [module.node1.vm_principal_id, module.node2.vm_principal_id]
}

# ... cloudflare modules use module.network.public_ip_address (node1's IP, unchanged)
# ... github_oidc unchanged
```

### Dependency ordering (no explicit `depends_on` needed)

- `module.node1` and `module.node2` reference `var.keyvault_name` (a root variable) — no dependency on the keyvault module
- `module.keyvault` references `module.node1.vm_principal_id` and `module.node2.vm_principal_id` — natural dependency on both node modules
- `azurerm_key_vault_secret.k3s_token` depends on `module.keyvault.key_vault_id` and `random_password.k3s_token` — natural dependencies
- `module.node2` references `module.node1.private_ip_address` — natural data dependency

### Root variables update

Add to `infra/variables.tf`:

```hcl
variable "keyvault_name" {
  description = "Globally unique name for the Azure Key Vault (3-24 chars, alphanumeric + hyphens)"
  type        = string
  default     = "kv-kevinryan-io"
}
```

### Root outputs update

Add to `infra/outputs.tf`:

```hcl
output "node1_public_ip" {
  description = "Public IP address of node1 (K3s server)"
  value       = module.network.public_ip_address
}

output "node2_public_ip" {
  description = "Public IP address of node2 (K3s agent)"
  value       = module.network.public_ip_address_node2
}
```

Keep `vm_public_ip` pointing to node1 for backward compatibility.

## 8. Flux helm-controller

The cloud-init server template change (`--components=source-controller,kustomize-controller,helm-controller`) handles this. When node1 is rebuilt, `flux bootstrap` will:

1. Detect the existing Flux installation in the Git repo
2. Regenerate `k8s/flux-system/gotk-components.yaml` to include helm-controller manifests
3. Commit and push the updated file

**The agent does not need to manually edit `gotk-components.yaml`** — it will be auto-generated by the Flux bootstrap process on the live cluster.

## 9. Files to delete

- `infra/modules/compute/cloud-init.yaml` — replaced by `infra/cloud-init-server.yaml` and `infra/cloud-init-agent.yaml` at the root level

## Manual steps (not performed by the agent)

These steps happen after the code changes are merged. Document them in the provenance record under a "Post-merge manual steps" heading:

1. `terraform init` (new `random` provider needed)
2. `terraform plan` — review the plan carefully (node1 will be replaced if tainted)
3. `terraform taint module.node1.azurerm_linux_virtual_machine.main` — force node1 rebuild to pick up new cloud-init
4. `terraform apply` — creates Key Vault, K3s token secret, node2, and rebuilds node1
5. Verify both nodes are ready: `kubectl get nodes`
6. Verify helm-controller is running: `kubectl get pods -n flux-system`
7. Verify node2 taint: `kubectl describe node vm-kevinryan-node2 | grep Taint`

Note: `k8s/flux-system/gotk-components.yaml` will be auto-regenerated by `flux bootstrap` on node1 rebuild to include helm-controller manifests.

## Provenance Record

After completing the work, create `.provenance/spec-1-second-k3s-node.provenance.md` with the following structure:

````markdown
# Provenance: Spec 1 — Second K3s Node + Key Vault + Helm Controller

**Spec:** `.spec/spec-1-second-k3s-node.md`
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
| ... | Created / Modified / Deleted |

## Validation Results

Results of each validation step from the spec (pass/fail with details).
````

## Validation steps

After completing all work, confirm:

1. This spec has been saved to `.spec/spec-1-second-k3s-node.md`
2. `infra/modules/keyvault/` exists with `main.tf`, `variables.tf`, `outputs.tf`, `versions.tf`
3. `infra/modules/keyvault/main.tf` does **not** contain `data "azurerm_client_config"` (no unused data sources)
4. `infra/modules/network/main.tf` contains a second public IP resource (`pip-kevinryan-node2`)
5. `infra/modules/network/outputs.tf` exports `vnet_id`, `vnet_name`, `public_ip_id_node2`, `public_ip_address_node2`
6. `infra/modules/compute/main.tf` uses a `vm_name` variable (not hardcoded) and accepts `custom_data` as a variable
7. `infra/modules/compute/variables.tf` does **not** contain `acr_login_server`, `acr_name`, or `github_token`
8. `infra/modules/compute/outputs.tf` includes `private_ip_address`
9. `infra/modules/compute/cloud-init.yaml` has been deleted
10. `infra/cloud-init-server.yaml` exists and includes `helm-controller` in the Flux `--components` flag
11. `infra/cloud-init-agent.yaml` exists and includes K3s agent install with `--node-taint` and `--node-label` flags
12. Both cloud-init templates retrieve the K3s token from Key Vault with a retry loop (30 attempts, 10s sleep, hard failure on exhaustion)
13. `infra/main.tf` instantiates the compute module twice (`node1` and `node2`) and wires the keyvault module
14. `infra/main.tf` contains `random_password.k3s_token` and `azurerm_key_vault_secret.k3s_token`
15. `infra/main.tf` uses `var.keyvault_name` (not `module.keyvault.key_vault_name`) in cloud-init templatefile calls — no circular dependency
16. The registry module grants AcrPull to both node1 and node2 managed identities via `for_each`
17. `terraform fmt -check -recursive infra/` passes (no formatting issues)
18. `terraform validate` passes in the `infra/` directory (requires `terraform init` — run if `.terraform/` exists, skip if provider plugins are missing)
19. No circular dependencies in the module wiring — verify by inspecting variable references
20. `pnpm lint` passes
21. The provenance record exists at `.provenance/spec-1-second-k3s-node.provenance.md` and contains all required sections
22. All files (spec, infrastructure changes, provenance) are committed together
