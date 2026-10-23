# Mock AWS only: these checks never create resources or contact the deployment account.
mock_provider "aws" {
  mock_data "aws_availability_zones" {
    defaults = { names = ["ap-southeast-2a", "ap-southeast-2b"] }
  }
  mock_data "aws_iam_policy_document" {
    defaults = { json = "{\"Version\":\"2012-10-17\",\"Statement\":[]}" }
  }
}

mock_provider "archive" {}

run "keep_demo_cost_envelope" {
  command = plan
  variables {
    aws_account_id = "123456789012"
    domain_name    = "demo.example.com"
    image_tag      = "test-image"
  }

  assert {
    condition = (
      aws_ecs_task_definition.web.cpu == "512" &&
      aws_ecs_task_definition.web.memory == "1024" &&
      aws_ecs_service.web.desired_count == 1
    )
    error_message = "Keep one 0.5 vCPU / 1 GB task; increasing capacity needs explicit cost approval."
  }

  assert {
    condition = (
      aws_dynamodb_table.main.billing_mode == "PAY_PER_REQUEST" &&
      aws_dynamodb_table.main.on_demand_throughput[0].max_read_request_units == 25 &&
      aws_dynamodb_table.main.on_demand_throughput[0].max_write_request_units == 10
    )
    error_message = "Keep on-demand billing with the demo's read/write ceilings."
  }

  assert {
    condition = (
      aws_lambda_function.policy_issuer.memory_size == 256 &&
      aws_lambda_function.policy_issuer.timeout == 10 &&
      length(aws_lambda_event_source_mapping.policy_issuer.scaling_config) == 0 &&
      length(aws_lambda_event_source_mapping.policy_issuer.provisioned_poller_config) == 0
    )
    error_message = "Keep the existing Lambda size and inexpensive on-demand SQS polling."
  }
}
