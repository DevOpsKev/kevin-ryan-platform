output "root_record_id" {
  description = "Cloudflare DNS record ID for the root domain"
  value       = cloudflare_record.root.id
}

output "www_record_id" {
  description = "Cloudflare DNS record ID for www subdomain"
  value       = cloudflare_record.www.id
}
