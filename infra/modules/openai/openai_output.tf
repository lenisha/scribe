output "openai_endpoint" {
  value = azurerm_cognitive_account.openaimodels.endpoint
}

output "openai_key" {
  value = azurerm_cognitive_account.openaimodels.primary_access_key
}

output "gpt4_deployment_id" {
  value = azurerm_cognitive_deployment.gtp4.id
}

output "gpt4_deployment_name" {
  value = azurerm_cognitive_deployment.gtp4.name
}

