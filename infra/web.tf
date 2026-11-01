# The site runs as one Lambda function from the web image: AWS Lambda Web Adapter (see the
# Dockerfile) passes each request to the same Node server that runs locally. CloudFront serves the
# domain over HTTPS in front of the function URL. Nothing is billed by the hour, so a site that's
# visited a few times a week stays inside the always-free allowances.

# Used by the function: the table, the topic, the session secret and site password, its logs and X-Ray.
resource "aws_iam_role" "web" {
  name               = "${var.name}-web"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

data "aws_iam_policy_document" "web" {
  statement {
    actions   = ["dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:Query"]
    resources = [aws_dynamodb_table.main.arn]
  }

  statement {
    actions   = ["sns:Publish"]
    resources = [aws_sns_topic.application_submitted.arn]
  }

  statement {
    actions   = ["ssm:GetParameters"]
    resources = [aws_ssm_parameter.session_secret.arn, aws_ssm_parameter.site_password.arn]
  }

  statement {
    actions   = ["logs:CreateLogStream", "logs:PutLogEvents"]
    resources = ["${aws_cloudwatch_log_group.web_function.arn}:*"]
  }
}

resource "aws_iam_role_policy" "web" {
  name   = "web"
  role   = aws_iam_role.web.id
  policy = data.aws_iam_policy_document.web.json
}

resource "aws_iam_role_policy_attachment" "web_xray" {
  role       = aws_iam_role.web.name
  policy_arn = "arn:aws:iam::aws:policy/AWSXRayDaemonWriteAccess"
}

resource "aws_cloudwatch_log_group" "web_function" {
  name              = "/aws/lambda/${var.name}-web"
  retention_in_days = 7
}

# CloudFront sends this with every request, and the app refuses requests to the function URL that
# don't carry it (server/security.ts). It's kept in Terraform state, which is in the private,
# encrypted state bucket, because CloudFront's settings need the value itself.
resource "random_password" "origin_verify" {
  length  = 48
  special = false
}

locals {
  web_environment = {
    APP_ORIGIN               = "https://${var.domain_name}"
    DYNAMODB_TABLE           = aws_dynamodb_table.main.name
    EVENTS_MODE              = "sns"
    SNS_TOPIC_ARN            = aws_sns_topic.application_submitted.arn
    MULESOFT_BASE_URL        = "http://localhost:8080/api/mock-mulesoft"
    MOCK_MULESOFT_LATENCY_MS = "300"
    MOCK_MULESOFT_FAIL_RATE  = "0"
    COOKIE_SECURE            = "true"
    LOG_LEVEL                = "info"
    # Read at start-up by start.ts, so the secrets themselves aren't in the function's settings.
    SESSION_SECRET_PARAMETER = aws_ssm_parameter.session_secret.name
    SITE_PASSWORD_PARAMETER  = aws_ssm_parameter.site_password.name
    ORIGIN_VERIFY_SECRET     = random_password.origin_verify.result
  }
}

resource "aws_lambda_function" "web" {
  function_name = "${var.name}-web"
  role          = aws_iam_role.web.arn
  package_type  = "Image"
  image_uri     = "${aws_ecr_repository.web.repository_url}:${var.image_tag}"
  architectures = ["x86_64"]
  # More memory also means more CPU, which shortens the cold start every visit begins with.
  memory_size = 1024
  timeout     = 30

  environment {
    variables = local.web_environment
  }

  tracing_config {
    mode = "Active"
  }

  logging_config {
    log_format = "Text"
    log_group  = aws_cloudwatch_log_group.web_function.name
  }

  depends_on = [aws_iam_role_policy.web]
}

# Public, because CloudFront can only sign GET requests to a function URL; the origin header above
# is what keeps visitors from going around CloudFront.
resource "aws_lambda_function_url" "web" {
  function_name      = aws_lambda_function.web.function_name
  authorization_type = "NONE"
  invoke_mode        = "RESPONSE_STREAM"
}

resource "aws_lambda_permission" "web_url" {
  statement_id           = "FunctionURLAllowPublicAccess"
  action                 = "lambda:InvokeFunctionUrl"
  function_name          = aws_lambda_function.web.function_name
  principal              = "*"
  function_url_auth_type = "NONE"
}

resource "aws_lambda_permission" "web_url_invoke" {
  statement_id             = "FunctionURLInvokeAllowPublicAccess"
  action                   = "lambda:InvokeFunction"
  function_name            = aws_lambda_function.web.function_name
  principal                = "*"
  invoked_via_function_url = true
}

data "aws_cloudfront_cache_policy" "disabled" {
  name = "Managed-CachingDisabled"
}

# Everything the visitor sent except Host (the function URL needs its own), plus CloudFront's
# headers, including the CloudFront-Viewer-Address the rate limits use.
data "aws_cloudfront_origin_request_policy" "all_viewer_except_host" {
  name = "Managed-AllViewerExceptHostHeader"
}

resource "aws_cloudfront_distribution" "web" {
  enabled         = true
  comment         = var.name
  aliases         = [var.domain_name]
  is_ipv6_enabled = true
  http_version    = "http2and3"
  # Every edge location, Sydney included. The always-free allowance covers all of them.
  price_class = "PriceClass_All"

  origin {
    origin_id   = "web"
    domain_name = trimsuffix(trimprefix(aws_lambda_function_url.web.function_url, "https://"), "/")

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
      origin_read_timeout    = 30
    }

    custom_header {
      name  = "X-Origin-Verify"
      value = random_password.origin_verify.result
    }
  }

  # Nothing is cached at the edge. Pages and APIs are personal, and everything, static files
  # included, is behind the site's password gate, which only the function can check: an edge copy
  # of a script or image would go to visitors without the password. Browsers still keep
  # fingerprinted assets for a year (private, immutable), so a return visit fetches only the page.
  default_cache_behavior {
    target_origin_id         = "web"
    viewer_protocol_policy   = "redirect-to-https"
    allowed_methods          = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods           = ["GET", "HEAD"]
    cache_policy_id          = data.aws_cloudfront_cache_policy.disabled.id
    origin_request_policy_id = data.aws_cloudfront_origin_request_policy.all_viewer_except_host.id
  }

  # CloudFront would otherwise cache these errors for 10 seconds and could hand one visitor's
  # error to the next.
  dynamic "custom_error_response" {
    for_each = [400, 403, 404, 405, 414, 416, 500, 501, 502, 503, 504]
    content {
      error_code            = custom_error_response.value
      error_caching_min_ttl = 0
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.cloudfront.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}
