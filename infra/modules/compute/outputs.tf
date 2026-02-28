output "vm_principal_id" {
  description = "Principal ID of the VM's system-assigned managed identity"
  value       = azurerm_linux_virtual_machine.main.identity[0].principal_id
}

output "vm_id" {
  description = "ID of the virtual machine"
  value       = azurerm_linux_virtual_machine.main.id
}
