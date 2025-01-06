terraform {
    required_providers {
        aws = {
            source  = "hashicorp/aws"
            version = "4.55.0"
        }
    }
    backend "s3" {
        bucket = "terraform-vast2sgai"
        key    = "terraform.tfstate.d/terraform.tfstate"
        region = "us-east-1"
    }
    required_version = ">= 1.1.0"
}

provider "aws" {
    profile = var.aws_profile
    region  = "us-east-1"
}