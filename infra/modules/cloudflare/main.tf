# SSL/TLS mode is set to "Full" in the Cloudflare dashboard.
# Cannot manage via Terraform — API token lacks Zone Settings:Edit permission
# and cloudflare_zone_settings_override has known issues with read-only settings.
# TODO: Update API token permissions and revisit.

resource "cloudflare_record" "root" {
  zone_id = var.zone_id
  name    = "@"
  content = var.vm_public_ip
  type    = "A"
  proxied = true
  ttl     = 1
}

resource "cloudflare_record" "www" {
  zone_id = var.zone_id
  name    = "www"
  content = var.vm_public_ip
  type    = "A"
  proxied = true
  ttl     = 1
}

resource "cloudflare_record" "subdomains" {
  for_each = toset(var.subdomains)

  zone_id = var.zone_id
  name    = each.key
  content = var.vm_public_ip
  type    = "A"
  proxied = true
  ttl     = 1
}

locals {
  subdomain_expressions = [for s in var.subdomains : "(http.host eq \"${s}.${var.domain}\")"]
  all_expressions = concat(
    ["(http.host eq \"${var.domain}\")", "(http.host eq \"www.${var.domain}\")"],
    local.subdomain_expressions
  )
  cache_expression = join(" or ", local.all_expressions)
}

resource "cloudflare_ruleset" "cache" {
  zone_id     = var.zone_id
  name        = "Cache rules for ${var.domain}"
  description = "Cache static site and serve stale on origin failure"
  kind        = "zone"
  phase       = "http_request_cache_settings"

  rules {
    action = "set_cache_settings"
    action_parameters {
      cache = true
      edge_ttl {
        mode    = "override_origin"
        default = 86400
      }
      serve_stale {
        disable_stale_while_updating = false
      }
    }
    expression  = local.cache_expression
    description = "Serve stale content on origin failure"
    enabled     = true
  }
}
