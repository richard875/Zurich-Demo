output "ecr_repository_url" {
  value = aws_ecr_repository.web.repository_url
}

output "dynamodb_table_name" {
  value = aws_dynamodb_table.main.name
}

output "sns_topic_arn" {
  value = aws_sns_topic.application_submitted.arn
}

output "policy_issuer_queue_url" {
  value = aws_sqs_queue.policy_issuer.url
}

output "policy_issuer_dlq_url" {
  value = aws_sqs_queue.policy_issuer_dlq.url
}

output "policy_issuer_function_name" {
  value = aws_lambda_function.policy_issuer.function_name
}

output "session_secret_parameter_name" {
  value = aws_ssm_parameter.session_secret.name
}
