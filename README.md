# Zurich Direct (demo)

Zurich Direct, redesigned in zurich.com.au's design language. A design concept with fake data and a mock sign-in.

![Architecture](docs/architecture.png)

## Run it

```bash
pnpm install
docker compose up -d   # DynamoDB Local
pnpm dev               # http://localhost:8080
```

## Deploy

Push to main. GitHub Actions tests, scans and deploys to ECS.

## First deploy

Copy the backend and tfvars examples first. Set the demo account ID, domain and image tag.

```bash
infra/bootstrap.sh <account-id> <alert-email> 20
terraform -chdir=infra init -backend-config=backend.hcl
terraform -chdir=infra apply -target=aws_acm_certificate.app -target=aws_ecr_repository.web
pnpm build && docker buildx build --platform linux/amd64 --push -t <ecr-url>:$(git rev-parse HEAD) .
terraform -chdir=infra apply -var image_tag=$(git rev-parse HEAD)
```

Add the DNS records Terraform outputs, then set the repository variables.

## Where things are

- apps/web: Modern.js app (pages, BFF, mock MuleSoft)
- apps/web/src/motion: animation tokens and building blocks
- functions/policy-issuer: Lambda that activates policies
- infra: Terraform
- [docs/AI_MANIFEST.md](docs/AI_MANIFEST.md): how this repo was built with Claude and Claude Code
