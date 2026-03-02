variable "location" {
  description = "Azure region"
  type        = string
}

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
}

variable "subnet_id" {
  description = "ID of the subnet for the VM NIC"
  type        = string
}

variable "public_ip_id" {
  description = "ID of the public IP to attach to the NIC"
  type        = string
}

variable "nsg_id" {
  description = "ID of the network security group to associate with the NIC"
  type        = string
}

variable "vm_size" {
  description = "Azure VM size"
  type        = string
  default     = "Standard_B2s"
}

variable "admin_username" {
  description = "SSH admin username"
  type        = string
  default     = "azureuser"
}

variable "admin_ssh_public_key" {
  description = "SSH public key for VM access"
  type        = string
}

variable "acr_login_server" {
  description = "ACR login server FQDN (e.g. myacr.azurecr.io)"
  type        = string
}

variable "acr_name" {
  description = "ACR name (without .azurecr.io)"
  type        = string
}

variable "github_token" {
  description = "GitHub PAT for Flux bootstrap"
  type        = string
  sensitive   = true
}
