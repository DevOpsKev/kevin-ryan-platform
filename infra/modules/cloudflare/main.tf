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

resource "cloudflare_ruleset" "cache" {
  zone_id     = var.zone_id
  name        = "Cache rules for kevinryan.io"
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
    expression  = "(http.host eq \"kevinryan.io\")"
    description = "Serve stale content on origin failure"
    enabled     = true
  }
}
