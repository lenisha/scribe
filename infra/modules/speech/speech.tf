terraform {
  required_providers {
    azurerm = {
    version = "~>4.1.0"
      source  = "hashicorp/azurerm"
    }
    azurecaf = {
      source  = "aztfmod/azurecaf"
      version = "~>1.2.24"
    }
  }
}

provider "azurerm" {
  features {}
}


data "azurerm_client_config" "current" {}
# ------------------------------------------------------------------------------------------------------
# DEPLOY AZURE SPEECH RESOURCE
# ------------------------------------------------------------------------------------------------------
resource "azurerm_ai_services" "speech" {
  name                = format("speech-%s", var.resource_token)
  location            = "canadacentral"
  resource_group_name = var.rg_name
  sku_name            = "S0"
  
  tags = var.tags
}