variable "location" {
  description = "The supported Azure location where the resource deployed"
  type        = string
}

variable "rg_name" {
  description = "The name of the resource group to deploy resources into"
  type        = string
}

variable "tags" {
  description = "A list of tags used for deployed services."
  type        = map(string)
}

variable "resource_token" {
  description = "A suffix string to centrally mitigate resource name collisions."
  type        = string
}

variable "openai_model" {
  description = "Name of gpt model."
  type        = string
  default     = "gpt-4o"
}


variable "openai_version" {
  description = "Version of gpt model"
  type        = string
  default     = "2024-05-13"
}


variable "openai_capacity" {
  description = "Capacity of gpt model"
  type        = string
  default     = "100"
}
