resource "azurerm_container_registry" "main" {
  name                = var.acr_name
  resource_group_name = var.resource_group_name
  location            = var.location
  sku                 = "Basic"
  admin_enabled       = false
}

resource "azurerm_role_assignment" "acr_pull" {
  for_each = toset(var.vm_principal_ids)

  scope                = azurerm_container_registry.main.id
  role_definition_name = "AcrPull"
  principal_id         = each.value
}
