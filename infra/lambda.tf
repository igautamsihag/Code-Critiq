data "archive_file" "auth" {
  type        = "zip"
  source_dir  = "${path.module}/../backend/auth"
  output_path = "${path.module}/../backend/auth.zip"
  excludes    = ["node_modules/.cache"]
}

resource "aws_lambda_function" "auth" {
  function_name    = "${var.project}-auth"
  filename         = data.archive_file.auth.output_path
  source_code_hash = data.archive_file.auth.output_base64sha256
  role             = aws_iam_role.lambda_exec.arn
  handler          = "index.handler"
  runtime          = "nodejs22.x"
  timeout          = 10

  environment {
    variables = {
      DYNAMODB_TABLE       = aws_dynamodb_table.main.name
      GITHUB_CLIENT_ID     = var.github_client_id
      GITHUB_CLIENT_SECRET = var.github_client_secret
      JWT_SECRET           = var.jwt_secret
      FRONTEND_URL         = var.frontend_url
    }
  }
}

data "archive_file" "repos" {
  type        = "zip"
  source_dir  = "${path.module}/../backend/repos"
  output_path = "${path.module}/../backend/repos.zip"
  excludes    = ["node_modules/.cache"]
}

resource "aws_lambda_function" "repos" {
  function_name    = "${var.project}-repos"
  filename         = data.archive_file.repos.output_path
  source_code_hash = data.archive_file.repos.output_base64sha256
  role             = aws_iam_role.lambda_exec.arn
  handler          = "index.handler"
  runtime          = "nodejs22.x"
  timeout          = 10

  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.main.name
      JWT_SECRET     = var.jwt_secret
    }
  }
}

data "archive_file" "connect" {
  type        = "zip"
  source_dir  = "${path.module}/../backend/connect"
  output_path = "${path.module}/../backend/connect.zip"
  excludes    = ["node_modules/.cache"]
}

resource "aws_lambda_function" "connect" {
  function_name    = "${var.project}-connect"
  filename         = data.archive_file.connect.output_path
  source_code_hash = data.archive_file.connect.output_base64sha256
  role             = aws_iam_role.lambda_exec.arn
  handler          = "index.handler"
  runtime          = "nodejs22.x"
  timeout          = 15

  environment {
    variables = {
      DYNAMODB_TABLE  = aws_dynamodb_table.main.name
      JWT_SECRET      = var.jwt_secret
      WEBHOOK_SECRET  = var.webhook_secret
      API_GATEWAY_URL = aws_apigatewayv2_api.main.api_endpoint
    }
  }
}

data "archive_file" "webhook" {
  type        = "zip"
  source_dir  = "${path.module}/../backend/webhook"
  output_path = "${path.module}/../backend/webhook.zip"
  excludes    = ["node_modules/.cache"]
}

resource "aws_lambda_function" "webhook" {
  function_name    = "${var.project}-webhook"
  filename         = data.archive_file.webhook.output_path
  source_code_hash = data.archive_file.webhook.output_base64sha256
  role             = aws_iam_role.lambda_exec.arn
  handler          = "index.handler"
  runtime          = "nodejs22.x"
  timeout          = 30

  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.main.name
      WEBHOOK_SECRET = var.webhook_secret
    }
  }
}
