![Zurich Direct, a design concept](docs/readme-top.png)

# Zurich Direct (demo)

[How I use AI](docs/AI_MANIFEST.md) · [Key Decisions](docs/decisions.md)

Zurich Direct's life insurance and income protection site, redesigned in zurich.com.au's design language and built end to end: a server-rendered React front end, a BFF in front of mock MuleSoft APIs, an event-driven policy issuer on AWS, Terraform and a CI/CD pipeline that tests, scans and deploys every push to main.

You can get a quote, sign in with one click, apply, and watch your policy go from Processing to Active. The site is a design concept, not the live Zurich Direct site. Prices are invented, the sign-in is a mock, and no real names are collected.

**Try it at [zurich.richardeverley.com](https://zurich.richardeverley.com/).**

![Architecture](docs/architecture.png)

## Tech stack

- **Front end:** React 19, Modern.js (streaming SSR), Tailwind CSS 4, shadcn/ui on Radix, Zurich's design tokens, TanStack Query, Zustand, React Hook Form and Zod, Motion
- **Back end:** Modern.js BFF on Hono, mock MuleSoft rating and underwriting APIs, FingerprintJS mock sign-in, pino logs and OpenTelemetry traces
- **AWS:** ECS Fargate, Application Load Balancer, DynamoDB, SNS, SQS, Lambda, ECR, SSM Parameter Store, CloudWatch, X-Ray
- **Delivery:** Terraform, GitHub Actions with OIDC, Docker, gitleaks and Trivy
- **Tests:** Vitest, Testing Library, Playwright with axe accessibility checks, Terraform tests

## Run it locally

Needs Node 22.18 or later (22.x), pnpm 11 and Docker. Nothing touches AWS: DynamoDB runs locally and policies are issued in-process.

```bash
pnpm install
docker compose up -d   # DynamoDB Local
pnpm dev               # http://localhost:8080
```

## Test

```bash
pnpm lint && pnpm typecheck && pnpm test   # ESLint, Prettier, types, unit tests
pnpm --filter web exec playwright install chromium
pnpm e2e                                   # builds, then runs Playwright
```

## Deploy

Push to main. GitHub Actions lints, tests and scans, pushes the image to ECR, applies Terraform, then smoke-tests the live URL once ECS settles.

### First deploy

Do this once, in a dedicated AWS account with a `zurich-demo` profile.

1. Copy the two `.example` files in `infra/` and fill them in. Deploying from a fork? Set `github_repository` too.
2. Create the state bucket, a budget alert, the certificate and the image repository:

   ```bash
   export AWS_PROFILE=zurich-demo AWS_REGION=ap-southeast-2
   infra/bootstrap.sh <account-id> <alert-email> 20
   terraform -chdir=infra init -backend-config=backend.hcl
   terraform -chdir=infra apply -target=aws_acm_certificate.app -target=aws_ecr_repository.web
   ```

3. Add the certificate's DNS validation record at your DNS provider.
4. Push the first image and create everything else:

   ```bash
   aws ecr get-login-password | docker login -u AWS --password-stdin <account-id>.dkr.ecr.ap-southeast-2.amazonaws.com
   pnpm build && docker buildx build --platform linux/amd64 --push -t <ecr-url>:$(git rev-parse HEAD) .
   terraform -chdir=infra apply -var image_tag=$(git rev-parse HEAD)
   ```

5. Point a CNAME for your domain at the `alb_dns_name` output.
6. In GitHub, set the repository variables `AWS_DEPLOY_ROLE_ARN` (the `deploy_role_arn` output), `AWS_REGION` and `DOMAIN_NAME`.

## Where things are

| Path                      | What                                                         |
| ------------------------- | ------------------------------------------------------------ |
| `apps/web/src`            | Pages, components and motion                                 |
| `apps/web/api/lambda`     | BFF functions and the mock MuleSoft APIs                     |
| `apps/web/server`         | Middleware: sessions, security headers, rate limits, logging |
| `apps/web/shared`         | Validation rules shared by the browser and the BFF           |
| `functions/policy-issuer` | The Lambda that issues policies                              |
| `infra`                   | Terraform for the whole AWS account                          |
| `.github/workflows`       | CI/CD                                                        |
| `docs/phases`             | Each phase's plan, brief and evidence                        |
