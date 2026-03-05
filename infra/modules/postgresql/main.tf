resource "azurerm_subnet" "postgresql" {
  name                 = "snet-postgresql"
  resource_group_name  = var.resource_group_name
  virtual_network_name = var.vnet_name
  address_prefixes     = ["10.0.2.0/28"]

  delegation {
    name = "postgresql-delegation"

    service_delegation {
      name    = "Microsoft.DBforPostgreSQL/flexibleServers"
      actions = ["Microsoft.Network/virtualNetworks/subnets/join/action"]
    }
  }
}

resource "azurerm_private_dns_zone" "postgresql" {
  name                = "privatelink.postgres.database.azure.com"
  resource_group_name = var.resource_group_name
}

resource "azurerm_private_dns_zone_virtual_network_link" "postgresql" {
  name                  = "vnet-link-postgresql"
  resource_group_name   = var.resource_group_name
  private_dns_zone_name = azurerm_private_dns_zone.postgresql.name
  virtual_network_id    = var.vnet_id
}

resource "azurerm_postgresql_flexible_server" "main" {
  name                          = var.server_name
  location                      = var.location
  resource_group_name           = var.resource_group_name
  sku_name                      = "B_Standard_B1ms"
  storage_mb                    = 32768
  auto_grow_enabled             = true
  version                       = "16"
  backup_retention_days         = 7
  geo_redundant_backup_enabled  = false
  zone                          = "1"
  delegated_subnet_id           = azurerm_subnet.postgresql.id
  private_dns_zone_id           = azurerm_private_dns_zone.postgresql.id
  administrator_login           = var.admin_username
  administrator_password        = var.admin_password
  public_network_access_enabled = false

  depends_on = [azurerm_private_dns_zone_virtual_network_link.postgresql]
}

resource "azurerm_postgresql_flexible_server_database" "databases" {
  for_each  = toset(var.databases)
  name      = each.key
  server_id = azurerm_postgresql_flexible_server.main.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}
