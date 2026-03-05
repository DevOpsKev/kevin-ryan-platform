output "server_fqdn" {
  description = "FQDN of the PostgreSQL Flexible Server"
  value       = azurerm_postgresql_flexible_server.main.fqdn
}

output "server_id" {
  description = "Resource ID of the PostgreSQL Flexible Server"
  value       = azurerm_postgresql_flexible_server.main.id
}

output "admin_username" {
  description = "Administrator login name for the PostgreSQL server"
  value       = azurerm_postgresql_flexible_server.main.administrator_login
}

output "database_names" {
  description = "List of created database names"
  value       = [for db in azurerm_postgresql_flexible_server_database.databases : db.name]
}
