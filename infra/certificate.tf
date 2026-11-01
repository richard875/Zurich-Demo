# CloudFront only uses certificates from us-east-1. DNS for the domain is outside AWS: add the
# validation record from the dns_validation_records output at the DNS provider, and apply waits
# until ACM sees it. ACM gives a domain the same record in every region, so one added for an
# earlier certificate in this account still works.
resource "aws_acm_certificate" "cloudfront" {
  region            = "us-east-1"
  domain_name       = var.domain_name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_acm_certificate_validation" "cloudfront" {
  region                  = "us-east-1"
  certificate_arn         = aws_acm_certificate.cloudfront.arn
  validation_record_fqdns = [for o in aws_acm_certificate.cloudfront.domain_validation_options : o.resource_record_name]
}
