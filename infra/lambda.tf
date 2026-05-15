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
