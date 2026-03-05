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

output "resource_group_id" {
  description = "ID of the resource group"
  value       = azurerm_resource_group.main.id
}

output "public_ip_address_node2" {
  description = "Static public IP address for node2"
  value       = azurerm_public_ip.node2.ip_address
}

output "public_ip_id_node2" {
  description = "ID of the public IP resource for node2"
  value       = azurerm_public_ip.node2.id
}

output "vnet_id" {
  description = "ID of the virtual network"
  value       = azurerm_virtual_network.main.id
}

output "vnet_name" {
  description = "Name of the virtual network"
  value       = azurerm_virtual_network.main.name
}
