output "AZURE_OPENAI_KEY" {
  value = module.openai.openai_key
  sensitive = true
}


output "AZURE_OPENAI_API_ENDPOINT" {
  value = module.openai.openai_endpoint
}

output "REACT_APP_WEB_BASE_URL" {
  value = module.web.URI
}

output "API_BASE_URL" {
  value =  module.api.URI
}

output "AZURE_LOCATION" {
  value = var.location
}

output "APPLICATIONINSIGHTS_CONNECTION_STRING" {
  value     = module.applicationinsights.APPLICATIONINSIGHTS_CONNECTION_STRING
  sensitive = true
}


output "SERVICE_API_ENDPOINTS" {
  value = module.api.URI 
}