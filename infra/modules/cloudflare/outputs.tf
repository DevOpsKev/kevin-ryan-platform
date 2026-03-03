output "root_record_id" {
  description = "Cloudflare DNS record ID for the root domain"
  value       = cloudflare_record.root.id
}

output "www_record_id" {
  description = "Cloudflare DNS record ID for www subdomain"
  value       = cloudflare_record.www.id
}

output "subdomain_record_ids" {
  description = "Map of subdomain name to Cloudflare DNS record ID"
  value       = { for k, v in cloudflare_record.subdomains : k => v.id }
}
