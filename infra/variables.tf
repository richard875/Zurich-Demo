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

variable "domain_name" {
  description = "Public hostname for the app, e.g. zurich.example.com. Its DNS lives outside AWS."
  type        = string
}

variable "allowed_cidrs" {
  description = "IP ranges the WAF lets through. Everyone else gets a 403."
  type        = list(string)
}

variable "image_tag" {
  description = "Tag of the web image in ECR to run (the commit SHA)."
  type        = string
}

variable "github_repository" {
  description = "owner/name of the GitHub repository whose main branch may deploy."
  type        = string
  default     = "richard875/Zurich-Demo"
}
