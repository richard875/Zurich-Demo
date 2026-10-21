#!/usr/bin/env bash
# One-off setup in the zurich-demo account: the Terraform state bucket and a monthly budget.
# Safe to run more than once. Usage: infra/bootstrap.sh <account-id> <alert-email> [monthly-usd]
set -euo pipefail

account_id="${1:?usage: bootstrap.sh <account-id> <alert-email> [monthly-usd]}"
alert_email="${2:?usage: bootstrap.sh <account-id> <alert-email> [monthly-usd]}"
monthly_usd="${3:-20}"

profile=zurich-demo
region=ap-southeast-2
bucket="zurich-demo-tfstate-${account_id}"
budget_name=zurich-demo-monthly

caller=$(aws sts get-caller-identity --profile "$profile" --query Account --output text)
if [[ "$caller" != "$account_id" ]]; then
  echo "Profile $profile points at account $caller, expected $account_id. Stopping." >&2
  exit 1
fi

if aws s3api head-bucket --bucket "$bucket" --profile "$profile" >/dev/null 2>&1; then
  echo "Bucket $bucket already exists"
else
  aws s3api create-bucket --bucket "$bucket" --region "$region" \
    --create-bucket-configuration "LocationConstraint=$region" --profile "$profile" >/dev/null
  echo "Created bucket $bucket"
fi

# These calls replace the bucket's settings, so re-running them is harmless.
aws s3api put-bucket-versioning --bucket "$bucket" \
  --versioning-configuration Status=Enabled --profile "$profile"
aws s3api put-bucket-encryption --bucket "$bucket" --profile "$profile" \
  --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'
aws s3api put-public-access-block --bucket "$bucket" --profile "$profile" \
  --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
echo "Bucket $bucket: versioning on, encryption on, public access blocked"

# AWS Budgets is a global service served from us-east-1.
if aws budgets describe-budget --account-id "$account_id" --budget-name "$budget_name" \
  --region us-east-1 --profile "$profile" >/dev/null 2>&1; then
  echo "Budget $budget_name already exists"
else
  notification() {
    printf '{"Notification":{"NotificationType":"ACTUAL","ComparisonOperator":"GREATER_THAN","Threshold":%s,"ThresholdType":"PERCENTAGE"},"Subscribers":[{"SubscriptionType":"EMAIL","Address":"%s"}]}' "$1" "$alert_email"
  }
  aws budgets create-budget --account-id "$account_id" --region us-east-1 --profile "$profile" \
    --budget "{\"BudgetName\":\"$budget_name\",\"BudgetLimit\":{\"Amount\":\"$monthly_usd\",\"Unit\":\"USD\"},\"TimeUnit\":\"MONTHLY\",\"BudgetType\":\"COST\"}" \
    --notifications-with-subscribers "[$(notification 80),$(notification 100)]"
  echo "Created budget $budget_name: US\$$monthly_usd a month, emails $alert_email at 80% and 100%"
fi

echo "Terraform state bucket: $bucket"
