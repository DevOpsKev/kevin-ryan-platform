output "acr_login_server" {
  description = "Login server FQDN for the ACR"
  value       = azurerm_container_registry.main.login_server
}

output "acr_name" {
  description = "Name of the ACR"
  value       = azurerm_container_registry.main.name
}

output "acr_id" {
  description = "Resource ID of the ACR"
  value       = azurerm_container_registry.main.id
}
