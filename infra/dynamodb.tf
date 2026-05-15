resource "aws_dynamodb_table" "main" {
  name         = "${var.project}-data"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "PK"
  range_key    = "SK"

  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  # GSI1: given a repo (from webhook), find the connected user
  attribute {
    name = "GSI1_PK"
    type = "S"
  }

  attribute {
    name = "GSI1_SK"
    type = "S"
  }

  # GSI2: given a user, get all reviews sorted by date (dashboard feed)
  attribute {
    name = "GSI2_PK"
    type = "S"
  }

  attribute {
    name = "GSI2_SK"
    type = "S"
  }

  global_secondary_index {
    name            = "GSI1-repo-to-user"
    hash_key        = "GSI1_PK"
    range_key       = "GSI1_SK"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "GSI2-user-reviews"
    hash_key        = "GSI2_PK"
    range_key       = "GSI2_SK"
    projection_type = "ALL"
  }
}
