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

output "dns_validation_records" {
  description = "Add these at the DNS provider so ACM can issue the certificate."
  value = [for o in aws_acm_certificate.app.domain_validation_options : {
    name  = o.resource_record_name
    type  = o.resource_record_type
    value = o.resource_record_value
  }]
}

output "app_url" {
  value = "https://${var.domain_name}"
}

output "alb_dns_name" {
  description = "Point a CNAME for domain_name at this."
  value       = aws_lb.app.dns_name
}

output "deploy_role_arn" {
  value = aws_iam_role.github_deploy.arn
}

output "ecs_cluster_name" {
  value = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  value = aws_ecs_service.web.name
}
