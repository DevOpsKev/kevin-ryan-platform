output "subnet_id" {
  description = "ID of the main subnet"
  value       = azurerm_subnet.main.id
}

output "public_ip_address" {
  description = "Static public IP address"
  value       = azurerm_public_ip.main.ip_address
}

output "public_ip_id" {
  description = "ID of the public IP resource"
  value       = azurerm_public_ip.main.id
}

output "nsg_id" {
  description = "ID of the network security group"
  value       = azurerm_network_security_group.main.id
}

output "resource_group_name" {
  description = "Name of the resource group"
  value       = azurerm_resource_group.main.name
}

output "resource_group_location" {
  description = "Location of the resource group"
  value       = azurerm_resource_group.main.location
}
