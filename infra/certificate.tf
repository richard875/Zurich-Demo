# DNS for the domain is outside AWS: add the validation record from the
# dns_validation_records output at the DNS provider, and apply waits until ACM sees it.
resource "aws_acm_certificate" "app" {
  domain_name       = var.domain_name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_acm_certificate_validation" "app" {
  certificate_arn         = aws_acm_certificate.app.arn
  validation_record_fqdns = [for o in aws_acm_certificate.app.domain_validation_options : o.resource_record_name]
}
