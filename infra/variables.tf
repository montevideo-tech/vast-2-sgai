locals {
  app_name    = "vast2sgai"
}

variable "aws_profile" {
  description = "sso"
  type        = string
}

variable "certificate_arn" {
  description = "Certificate ARN variable"
  type        = string
}

variable "backend_domain_name" {
  description = "Backend domain name"
  type        = string
}