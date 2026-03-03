variable "zone_id" {
  description = "Cloudflare zone ID"
  type        = string
}

variable "vm_public_ip" {
  description = "Public IP address of the VM"
  type        = string
}

variable "domain" {
  description = "Domain name (used in cache rule expression)"
  type        = string
}
