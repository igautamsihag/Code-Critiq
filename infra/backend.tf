terraform {
  backend "s3" {
    bucket         = "code-critiq-tf-state-974263620945"
    key            = "code-critiq/terraform.tfstate"
    region         = "ap-southeast-2"
    use_lockfile = true
    encrypt      = true
  }
}
