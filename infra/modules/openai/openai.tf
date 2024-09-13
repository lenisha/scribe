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
# DEPLOY AZURE OPENAI RESOURCE
# ------------------------------------------------------------------------------------------------------
resource "azurerm_cognitive_account" "openaimodels" {
  name                = format("oai-%s", var.resource_token)
  location            = var.location
  resource_group_name = var.rg_name
  kind                = "OpenAI"
  sku_name            = "S0"

  identity {
    type = "SystemAssigned"
  }

   tags = var.tags
}



# ------------------------------------------------------------------------------------------------------
# DEPLOY GPT-4 MODEL
# ------------------------------------------------------------------------------------------------------
resource "azurerm_cognitive_deployment" "gtp4" {
  name                 = "gpt-4o"
  cognitive_account_id = azurerm_cognitive_account.openaimodels.id
  model {
    format  = "OpenAI"
    name    = "gpt-4o"
    version = "2024-05-13"
  }

  sku {
    name = "Standard"
    capacity = "100"
  }


}