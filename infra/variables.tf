variable "region" {
  description = "AWS region for every resource."
  type        = string
  default     = "ap-southeast-2"
}

variable "name" {
  description = "Prefix for resource names."
  type        = string
  default     = "zurich-demo"
}
