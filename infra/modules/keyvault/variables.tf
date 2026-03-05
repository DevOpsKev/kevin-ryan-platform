variable "location" {
  description = "Azure region"
  type        = string
}

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
}

variable "name" {
  description = "Name of the Key Vault (3-24 chars, alphanumeric + hyphens, globally unique)"
  type        = string
}

variable "tenant_id" {
  description = "Azure AD tenant ID for the Key Vault"
  type        = string
}

variable "vm_principal_ids" {
  description = "List of VM managed identity principal IDs to grant Key Vault Secrets User role"
  type        = list(string)
}

variable "terraform_object_id" {
  description = "Object ID of the Terraform caller to grant Key Vault Secrets Officer role"
  type        = string
}
