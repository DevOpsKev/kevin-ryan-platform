variable "zone_id" {
  description = "Cloudflare zone ID for the domain"
  type        = string
}

variable "domain" {
  description = "Domain name (e.g. kevinryan.io)"
  type        = string
}

variable "vm_public_ip" {
  description = "Public IP address of the VM"
  type        = string
}
