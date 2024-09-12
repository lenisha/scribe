locals {
  tags                         = { azd-env-name : var.environment_name }
  sha                          = base64encode(sha256("${var.environment_name}${var.location}${data.azurerm_client_config.current.subscription_id}"))
  resource_token               = substr(replace(lower(local.sha), "[^A-Za-z0-9_]", ""), 0, 13)
  cors                         = "*"
}
# ------------------------------------------------------------------------------------------------------
# Deploy resource Group
# ------------------------------------------------------------------------------------------------------
resource "azurecaf_name" "rg_name" {
  name          = var.environment_name
  resource_type = "azurerm_resource_group"
  random_length = 0
  clean_input   = true
}

resource "azurerm_resource_group" "rg" {
  name     = azurecaf_name.rg_name.result
  location = var.location

  tags = local.tags
}

# ------------------------------------------------------------------------------------------------------
# Deploy application insights
# ------------------------------------------------------------------------------------------------------
module "applicationinsights" {
  source           = "./modules/applicationinsights"
  location         = var.location
  rg_name          = azurerm_resource_group.rg.name
  environment_name = var.environment_name
  workspace_id     = module.loganalytics.LOGANALYTICS_WORKSPACE_ID
  tags             = azurerm_resource_group.rg.tags
  resource_token   = local.resource_token
}

# ------------------------------------------------------------------------------------------------------
# Deploy log analytics
# ------------------------------------------------------------------------------------------------------
module "loganalytics" {
  source         = "./modules/loganalytics"
  location       = var.location
  rg_name        = azurerm_resource_group.rg.name
  tags           = azurerm_resource_group.rg.tags
  resource_token = local.resource_token
}



# ------------------------------------------------------------------------------------------------------
# Deploy OpenAI
# ------------------------------------------------------------------------------------------------------
module "openai" {
  source         = "./modules/openai"
  location       = var.location
  rg_name        = azurerm_resource_group.rg.name
  tags           = azurerm_resource_group.rg.tags
  resource_token = local.resource_token
}
# ------------------------------------------------------------------------------------------------------
# Deploy SPEECH
# ------------------------------------------------------------------------------------------------------
module "speech" {
  source         = "./modules/speech"
  location       = var.location
  rg_name        = azurerm_resource_group.rg.name
  tags           = azurerm_resource_group.rg.tags
  resource_token = local.resource_token
}

# ------------------------------------------------------------------------------------------------------
# Deploy app service plan
# ------------------------------------------------------------------------------------------------------
module "appserviceplan" {
  source         = "./modules/appserviceplan"
  location       = var.location
  rg_name        = azurerm_resource_group.rg.name
  tags           = azurerm_resource_group.rg.tags
  resource_token = local.resource_token
  sku_name       = "B1"
}

# ------------------------------------------------------------------------------------------------------
# Deploy app service web app
# ------------------------------------------------------------------------------------------------------
module "web" {
  source         = "./modules/appservicenode"
  location       = var.location
  rg_name        = azurerm_resource_group.rg.name
  resource_token = local.resource_token

  tags               = merge(local.tags, { azd-service-name : "web" })
  service_name       = "scribe-web"
  appservice_plan_id = module.appserviceplan.APPSERVICE_PLAN_ID

  app_settings = {
    "SCM_DO_BUILD_DURING_DEPLOYMENT" = "false"
  }

  health_check_path = "/"
  app_command_line  = "pm2 serve /home/site/wwwroot --no-daemon --spa"
}

# ------------------------------------------------------------------------------------------------------
# Deploy app service api
# ------------------------------------------------------------------------------------------------------
module "api" {
  source         = "./modules/appservicepython"
  location       = var.location
  rg_name        = azurerm_resource_group.rg.name
  resource_token = local.resource_token

  tags               = merge(local.tags, { "azd-service-name" : "api" })
  service_name       = "scribe-api"
  appservice_plan_id = module.appserviceplan.APPSERVICE_PLAN_ID
  app_settings = {
    "AZURE_OPENAI_API_KEY"                   = module.openai.openai_key
    "AZURE_OPENAI_DEPLOYMENT"                = module.openai.gpt4_deployment_id
    "AZURE_OPENAI_ENDPOINT"                  = module.openai.openai_endpoint
    "SPEECH_KEY"                             = module.speech.speech_key
    "SPEECH_REGION"                          = var.location
    "CORS"                                   = local.cors
    "SCM_DO_BUILD_DURING_DEPLOYMENT"         = "true"
    "APPLICATIONINSIGHTS_CONNECTION_STRING"  = module.applicationinsights.APPLICATIONINSIGHTS_CONNECTION_STRING
  }
  identity = [{
    type = "SystemAssigned"
  }]

  health_check_path = "/"
}

# Workaround: set API_ALLOW_ORIGINS to the web app URI
resource "null_resource" "api_set_allow_origins" {
  triggers = {
    web_uri = module.web.URI
  }

  provisioner "local-exec" {
    command = "az webapp config appsettings set --resource-group ${azurerm_resource_group.rg.name} --name ${module.api.APPSERVICE_NAME} --settings API_ALLOW_ORIGINS=${module.web.URI}"
  }
}



