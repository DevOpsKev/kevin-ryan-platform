variable "location" {
  description = "Azure region for all resources"
  type        = string
}

variable "admin_ip" {
  description = "Admin IP address for SSH access (CIDR notation, e.g. 1.2.3.4/32)"
  type        = string
}
