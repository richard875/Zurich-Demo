# Mock AWS only: these checks never create resources or contact the deployment account.
mock_provider "aws" {
  mock_data "aws_iam_policy_document" {
    defaults = { json = "{\"Version\":\"2012-10-17\",\"Statement\":[]}" }
  }
  mock_resource "aws_lambda_function_url" {
    defaults = { function_url = "https://example.lambda-url.ap-southeast-2.on.aws/" }
  }
}

mock_provider "archive" {}

run "keep_demo_cost_envelope" {
  command = plan
  variables {
    aws_account_id = "123456789012"
    domain_name    = "demo.example.com"
    image_tag      = "test-image"
    site_password  = "test-site-password"
  }

  assert {
    condition = (
      aws_lambda_function.web.memory_size == 1024 &&
      aws_lambda_function.web.timeout == 30 &&
      aws_lambda_function_url.web.invoke_mode == "RESPONSE_STREAM"
    )
    error_message = "Keep the web function at 1 GB and 30 seconds; more needs explicit cost approval."
  }

  assert {
    condition = (
      aws_cloudfront_distribution.web.default_cache_behavior[0].cache_policy_id == data.aws_cloudfront_cache_policy.disabled.id &&
      length(aws_cloudfront_distribution.web.ordered_cache_behavior) == 0
    )
    error_message = "Nothing may be cached at CloudFront: the password gate must see every request, static files included."
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
