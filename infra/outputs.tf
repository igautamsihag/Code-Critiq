output "api_gateway_url" {
  description = "Base URL for the API Gateway"
  value       = aws_apigatewayv2_stage.default.invoke_url
}
