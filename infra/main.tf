# Circular dependency resolution:
# module.keyvault needs vm_principal_ids from node1 and node2 (for RBAC).
# The cloud-init templates need the Key Vault name — passed via var.keyvault_name (a root variable),
# NOT via module.keyvault.key_vault_name. This breaks the cycle: nodes have no Terraform
# dependency on keyvault; keyvault depends on node principal IDs only.

terraform {
  required_version = ">= 1.5"

  backend "azurerm" {
    resource_group_name  = "rg-kevinryan-tfstate"
    storage_account_name = "krtfstate2026" # Set from bootstrap output via -backend-config or env
    container_name       = "tfstate"
    key                  = "kevinryan-io.tfstate"
  }

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
    azuread = {
      source  = "hashicorp/azuread"
      version = "~> 3.0"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
  resource_provider_registrations = "none"
}

provider "azuread" {}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

data "azurerm_client_config" "current" {}

data "azurerm_storage_account" "tfstate" {
  name                = "krtfstate2026"
  resource_group_name = "rg-kevinryan-tfstate"
}

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
  custom_data = base64encode(templatefile("${path.module}/cloud-init-server.yaml", {
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
  custom_data = base64encode(templatefile("${path.module}/cloud-init-agent.yaml", {
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

module "cloudflare" {
  source       = "./modules/cloudflare"
  zone_id      = var.cloudflare_zone_id
  vm_public_ip = module.network.public_ip_address
  domain       = "kevinryan.io"
  subdomains   = ["brand", "docs"]
}

module "cloudflare_aiimmigrants" {
  source       = "./modules/cloudflare"
  zone_id      = var.cloudflare_zone_id_aiimmigrants
  vm_public_ip = module.network.public_ip_address
  domain       = "aiimmigrants.com"
}

module "cloudflare_specmcp" {
  source       = "./modules/cloudflare"
  zone_id      = var.cloudflare_zone_id_specmcp
  vm_public_ip = module.network.public_ip_address
  domain       = "specmcp.ai"
}

module "cloudflare_sddbook" {
  source       = "./modules/cloudflare"
  zone_id      = var.cloudflare_zone_id_sddbook
  vm_public_ip = module.network.public_ip_address
  domain       = "sddbook.com"
}

module "cloudflare_distributedequity" {
  source       = "./modules/cloudflare"
  zone_id      = var.cloudflare_zone_id_distributedequity
  vm_public_ip = module.network.public_ip_address
  domain       = "distributedequity.org"
}

module "github_oidc" {
  source                     = "./modules/github-oidc"
  github_repo_owner          = var.github_repo_owner
  github_repo_name           = var.github_repo_name
  acr_id                     = module.registry.acr_id
  resource_group_id          = module.network.resource_group_id
  tfstate_storage_account_id = data.azurerm_storage_account.tfstate.id
  tfstate_resource_group_id  = "/subscriptions/${data.azurerm_client_config.current.subscription_id}/resourceGroups/rg-kevinryan-tfstate"
}
