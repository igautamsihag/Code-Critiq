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
