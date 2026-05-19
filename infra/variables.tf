variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "ap-southeast-2"
}

variable "project" {
  description = "Project name used as a prefix for all resources"
  type        = string
  default     = "code-critiq"
}

variable "github_client_id" {
  description = "GitHub OAuth App client ID"
  type        = string
}

variable "github_client_secret" {
  description = "GitHub OAuth App client secret"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "Secret key for signing JWTs"
  type        = string
  sensitive   = true
}

variable "frontend_url" {
  description = "Frontend URL for redirects"
  type        = string
  default     = "https://your-vercel-app.vercel.app"
}

variable "webhook_secret" {
  description = "HMAC secret GitHub uses to sign webhook payloads"
  type        = string
  sensitive   = true
}
