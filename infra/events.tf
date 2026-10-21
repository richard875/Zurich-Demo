# ApplicationSubmitted: the BFF publishes to SNS, SNS delivers to SQS, SQS triggers the Lambda.
resource "aws_sns_topic" "application_submitted" {
  name              = "${var.name}-application-submitted"
  kms_master_key_id = "alias/aws/sns"
  # Carries the publisher's X-Ray trace on to SQS and the Lambda.
  tracing_config = "Active"
}

resource "aws_sqs_queue" "policy_issuer_dlq" {
  name                      = "${var.name}-policy-issuer-dlq"
  message_retention_seconds = 1209600
  sqs_managed_sse_enabled   = true
}

resource "aws_sqs_queue" "policy_issuer" {
  name = "${var.name}-policy-issuer"
  # Holds each message for 3 seconds so Processing is visible in the demo.
  delay_seconds = 3
  # AWS recommends at least six times the Lambda timeout.
  visibility_timeout_seconds = 60
  sqs_managed_sse_enabled    = true

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.policy_issuer_dlq.arn
    maxReceiveCount     = 3
  })
}

data "aws_iam_policy_document" "sns_to_sqs" {
  statement {
    actions   = ["sqs:SendMessage"]
    resources = [aws_sqs_queue.policy_issuer.arn]

    principals {
      type        = "Service"
      identifiers = ["sns.amazonaws.com"]
    }

    condition {
      test     = "ArnEquals"
      variable = "aws:SourceArn"
      values   = [aws_sns_topic.application_submitted.arn]
    }
  }
}

resource "aws_sqs_queue_policy" "policy_issuer" {
  queue_url = aws_sqs_queue.policy_issuer.id
  policy    = data.aws_iam_policy_document.sns_to_sqs.json
}

resource "aws_sns_topic_subscription" "policy_issuer" {
  topic_arn            = aws_sns_topic.application_submitted.arn
  protocol             = "sqs"
  endpoint             = aws_sqs_queue.policy_issuer.arn
  raw_message_delivery = true
}
