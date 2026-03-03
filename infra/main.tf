# Circular dependency resolution:
# compute needs the ACR login server, registry needs the VM principal ID.
# The ACR login server is deterministic: <acr_name>.azurecr.io
# So we pass the constructed value to compute and create the ACR independently.
# The registry module then assigns AcrPull to the VM's managed identity after
# both resources exist. This avoids the cycle and produces a clean plan.

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

module "compute" {
  source               = "./modules/compute"
  location             = module.network.resource_group_location
  resource_group_name  = module.network.resource_group_name
  subnet_id            = module.network.subnet_id
  public_ip_id         = module.network.public_ip_id
  nsg_id               = module.network.nsg_id
  vm_size              = var.vm_size
  admin_username       = var.admin_username
  admin_ssh_public_key = var.admin_ssh_public_key
  acr_login_server     = "${var.acr_name}.azurecr.io"
  acr_name             = var.acr_name
  github_token         = var.github_token
}

module "registry" {
  source              = "./modules/registry"
  location            = module.network.resource_group_location
  resource_group_name = module.network.resource_group_name
  acr_name            = var.acr_name
  vm_principal_id     = module.compute.vm_principal_id
}

module "cloudflare" {
  source       = "./modules/cloudflare"
  zone_id      = var.cloudflare_zone_id
  vm_public_ip = module.network.public_ip_address
  domain       = "kevinryan.io"
  subdomains   = ["brand"]
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

module "github_oidc" {
  source                     = "./modules/github-oidc"
  github_repo_owner          = var.github_repo_owner
  github_repo_name           = var.github_repo_name
  acr_id                     = module.registry.acr_id
  resource_group_id          = module.network.resource_group_id
  tfstate_storage_account_id = data.azurerm_storage_account.tfstate.id
  tfstate_resource_group_id  = "/subscriptions/${data.azurerm_client_config.current.subscription_id}/resourceGroups/rg-kevinryan-tfstate"
}
