output "vm_public_ip" {
  description = "Public IP address of the K3s VM"
  value       = module.network.public_ip_address
}

output "acr_login_server" {
  description = "ACR login server FQDN"
  value       = module.registry.acr_login_server
}

output "acr_name" {
  description = "ACR name"
  value       = module.registry.acr_name
}

output "resource_group_name" {
  description = "Name of the main resource group"
  value       = module.network.resource_group_name
}

# GitHub Actions secrets — copy these values directly
output "github_actions_client_id" {
  description = "AZURE_CLIENT_ID GitHub Actions secret"
  value       = module.github_oidc.client_id
}

output "github_actions_tenant_id" {
  description = "AZURE_TENANT_ID GitHub Actions secret"
  value       = module.github_oidc.tenant_id
}

output "github_actions_subscription_id" {
  description = "AZURE_SUBSCRIPTION_ID GitHub Actions secret"
  value       = data.azurerm_client_config.current.subscription_id
}

output "github_actions_acr_name" {
  description = "ACR_NAME GitHub Actions secret"
  value       = module.registry.acr_name
}

output "github_actions_acr_login_server" {
  description = "ACR_LOGIN_SERVER GitHub Actions secret"
  value       = module.registry.acr_login_server
}
