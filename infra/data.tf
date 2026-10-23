# One table for quotes and applications. On demand, no backups and no deletion protection:
# the whole account is closed after the demo.
resource "aws_dynamodb_table" "main" {
  name                        = var.name
  billing_mode                = "PAY_PER_REQUEST"
  hash_key                    = "PK"
  range_key                   = "SK"
  deletion_protection_enabled = false

  # Ceilings, not provisioned capacity: excess traffic is throttled without buying more capacity.
  on_demand_throughput {
    max_read_request_units  = 25
    max_write_request_units = 10
  }

  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  ttl {
    attribute_name = "expiresAt"
    enabled        = true
  }
}

ephemeral "random_password" "session_secret" {
  length  = 48
  special = false
}

# Write-only, so the secret is never stored in Terraform state. Bump the version to rotate it.
resource "aws_ssm_parameter" "session_secret" {
  name             = "/${var.name}/session-secret"
  type             = "SecureString"
  value_wo         = ephemeral.random_password.session_secret.result
  value_wo_version = 1
}

resource "aws_ecr_repository" "web" {
  name                 = "zurich-life-direct"
  image_tag_mutability = "IMMUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_lifecycle_policy" "web" {
  repository = aws_ecr_repository.web.name
  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep the last 10 images"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = 10
      }
      action = { type = "expire" }
    }]
  })
}
