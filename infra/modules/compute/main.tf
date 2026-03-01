resource "azurerm_network_interface" "main" {
  name                = "nic-kevinryan-io"
  location            = var.location
  resource_group_name = var.resource_group_name

  ip_configuration {
    name                          = "internal"
    subnet_id                     = var.subnet_id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = var.public_ip_id
  }
}

resource "azurerm_network_interface_security_group_association" "main" {
  network_interface_id      = azurerm_network_interface.main.id
  network_security_group_id = var.nsg_id
}

resource "azurerm_linux_virtual_machine" "main" {
  name                = "vm-kevinryan-io"
  location            = var.location
  resource_group_name = var.resource_group_name
  size                = var.vm_size
  admin_username      = var.admin_username

  priority        = "Spot"
  eviction_policy = "Deallocate"
  max_bid_price   = -1

  network_interface_ids = [azurerm_network_interface.main.id]

  admin_ssh_key {
    username   = var.admin_username
    public_key = var.admin_ssh_public_key
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "ubuntu-24_04-lts"
    sku       = "server"
    version   = "latest"
  }

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
    disk_size_gb         = 30
  }

  identity {
    type = "SystemAssigned"
  }

  custom_data = base64encode(templatefile("${path.module}/cloud-init.yaml", {
    acr_login_server = var.acr_login_server
    acr_name         = var.acr_name
    github_token     = var.github_token
  }))

  lifecycle {
    ignore_changes = [custom_data]
  }
}
