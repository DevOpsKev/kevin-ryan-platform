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
