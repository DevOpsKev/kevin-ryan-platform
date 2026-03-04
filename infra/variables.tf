variable "location" {
  description = "Azure region for all resources"
  type        = string
  default     = "northeurope"
}

variable "vm_size" {
  description = "Azure VM SKU"
  type        = string
  default     = "Standard_B2s"
}

variable "admin_username" {
  description = "SSH admin username for the VM"
  type        = string
  default     = "azureuser"
}

variable "admin_ssh_public_key" {
  description = "SSH public key for VM access"
  type        = string
}

variable "admin_ip" {
  description = "Admin IP address for SSH access (CIDR notation, e.g. 1.2.3.4/32)"
  type        = string
}

variable "cloudflare_api_token" {
  description = "Cloudflare API token"
  type        = string
  sensitive   = true
}

variable "cloudflare_zone_id" {
  description = "Cloudflare zone ID for kevinryan.io"
  type        = string
}

variable "acr_name" {
  description = "Globally unique name for Azure Container Registry"
  type        = string
}

variable "github_token" {
  description = "GitHub PAT for Flux bootstrap"
  type        = string
  sensitive   = true
}

variable "github_repo_owner" {
  description = "GitHub repository owner"
  type        = string
  default     = "DevOpsKev"
}

variable "github_repo_name" {
  description = "GitHub repository name"
  type        = string
  default     = "kevin-ryan-platform"
}

variable "cloudflare_zone_id_aiimmigrants" {
  description = "Cloudflare zone ID for aiimmigrants.com"
  type        = string
}

variable "cloudflare_zone_id_specmcp" {
  description = "Cloudflare zone ID for specmcp.ai"
  type        = string
}

variable "cloudflare_zone_id_sddbook" {
  description = "Cloudflare zone ID for sddbook.com"
  type        = string
}

variable "cloudflare_zone_id_distributedequity" {
  description = "Cloudflare zone ID for distributedequity.org"
  type        = string
}
