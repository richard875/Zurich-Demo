# Build the bundle first: pnpm --filter policy-issuer build
data "archive_file" "policy_issuer" {
  type        = "zip"
  source_file = "${path.module}/../functions/policy-issuer/dist/lambda/index.cjs"
  output_path = "${path.module}/.terraform/policy-issuer.zip"
}

data "aws_iam_policy_document" "lambda_assume" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "policy_issuer" {
  name               = "${var.name}-policy-issuer"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

data "aws_iam_policy_document" "policy_issuer" {
  statement {
    actions = [
      "sqs:ReceiveMessage",
      "sqs:DeleteMessage",
      "sqs:GetQueueAttributes",
      "sqs:ChangeMessageVisibility",
    ]
    resources = [aws_sqs_queue.policy_issuer.arn]
  }

  statement {
    actions   = ["dynamodb:UpdateItem"]
    resources = [aws_dynamodb_table.main.arn]
  }

  statement {
    actions   = ["logs:CreateLogStream", "logs:PutLogEvents"]
    resources = ["${aws_cloudwatch_log_group.policy_issuer.arn}:*"]
  }
}

resource "aws_iam_role_policy" "policy_issuer" {
  name   = "policy-issuer"
  role   = aws_iam_role.policy_issuer.id
  policy = data.aws_iam_policy_document.policy_issuer.json
}

resource "aws_iam_role_policy_attachment" "policy_issuer_xray" {
  role       = aws_iam_role.policy_issuer.name
  policy_arn = "arn:aws:iam::aws:policy/AWSXRayDaemonWriteAccess"
}

resource "aws_cloudwatch_log_group" "policy_issuer" {
  name              = "/aws/lambda/${var.name}-policy-issuer"
  retention_in_days = 7
}

resource "aws_lambda_function" "policy_issuer" {
  function_name    = "${var.name}-policy-issuer"
  role             = aws_iam_role.policy_issuer.arn
  runtime          = "nodejs22.x"
  architectures    = ["arm64"]
  handler          = "index.handler"
  filename         = data.archive_file.policy_issuer.output_path
  source_code_hash = data.archive_file.policy_issuer.output_base64sha256
  memory_size      = 256
  timeout          = 10

  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.main.name
      LOG_LEVEL      = "info"
    }
  }

  tracing_config {
    mode = "Active"
  }

  logging_config {
    log_format = "Text"
    log_group  = aws_cloudwatch_log_group.policy_issuer.name
  }

  depends_on = [aws_iam_role_policy.policy_issuer]
}

resource "aws_lambda_event_source_mapping" "policy_issuer" {
  event_source_arn        = aws_sqs_queue.policy_issuer.arn
  function_name           = aws_lambda_function.policy_issuer.arn
  batch_size              = 10
  function_response_types = ["ReportBatchItemFailures"]
}
