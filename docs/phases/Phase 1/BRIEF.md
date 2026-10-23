# Build brief: Zurich Life Direct (demo)

You're building a small demo app described in `docs/phases/Phase 1/PLAN.md`. PLAN.md says **what** to build and with which stack. This brief (`docs/phases/Phase 1/BRIEF.md`) says **how**: it fills in the details the plan leaves open and sets the rules. If the two disagree, this brief wins.

## Files

- The repo root is the folder you're running in.
- `doc/` (singular) holds my planning files: `PLAN.md`, `PLAN.pdf`, `BRIEF.md` and `architecture.png`. Read them, but don't edit or move them.
- `doc/` must never be committed. When you create `.gitignore`, add `doc/` to it along with the usual entries (`node_modules/`, `.env`, `.output/`, `dist/`, `.terraform/`, `*.tfstate*`, `*.tfvars` except an example file).
- `docs/` (plural) is the repo's own docs folder: it's committed and holds `decisions.md` and `architecture.png`.

## Context

- Nothing happens to the app after the demo.
- Optimise for a working, polished happy path. Don't design for extensibility: no feature flags, no "future" hooks, no abstractions with one user.
- It's a demo: fake data, a mock sign-in, an invented product and partner. It should look like a real Zurich product and be clearly labelled as a demo on every page.

## Before you start

Read `docs/phases/Phase 1/PLAN.md` and this brief end to end. Then ask me for all of these in one message and wait for my answers:

1. My main AWS CLI profile name (the AWS Organizations management account).
2. The email address for the new `zurich-demo` account's root user.
3. Whether I have a subdomain for HTTPS (e.g. `zurich-demo.<my-domain>`), or we run HTTP only on the load balancer.
4. My public IP address(es) for the WAF allowlist.
5. GitHub owner and repo name (private repo).
6. Monthly budget alert amount (suggest US$20).

Then reply with your Phase 0 plan. Don't write code until I say go.

## How to work with me

- Work in the four phases at the end of this brief. At the end of each phase, stop and send a short report: what's done, how to see it (commands or URL), anything I need to do, open questions. Keep it under 15 lines, then wait for "go".
- Ask before you:
  - run anything that creates, changes or deletes AWS resources (`terraform apply`, AWS CLI writes)
  - create the GitHub repo or push to it
  - add a dependency that isn't in the stack below (type packages and dev tools that listed tools need are fine)
- Never run `terraform destroy`, `aws organizations close-account`, or anything that deletes data unless I ask for it in so many words.
- Before **every** AWS command or Terraform run, check the target account: `aws sts get-caller-identity --profile zurich-demo` must show the zurich-demo account ID. The only commands allowed with my main profile are the AWS Organizations account-creation calls in Phase 0, shown to me first.
- Modern.js 3, Tailwind v4, FingerprintJS v5, AWS SDK v3, OpenTelemetry and the Terraform AWS provider change quickly. Check the installed version's types or official docs before you use an API; don't write from memory. If something in this brief doesn't match the installed version, use the current equivalent and mention it in the phase report.
- If a task runs more than an hour past what it should take, stop and propose a simpler route.

## Fixed decisions (don't revisit)

**Use:**

- Node.js 22 LTS everywhere: `.nvmrc`, Docker `node:22-slim`, Lambda `nodejs22.x`. TypeScript in strict mode.
- pnpm workspace with three members: `apps/web`, `functions/policy-issuer`, `infra`.
- Modern.js 3 for frontend **and** backend: `@modern-js/app-tools`, `@modern-js/plugin-bff` and `@modern-js/server-runtime`, all on the same version. Use the React version the Modern.js template installs.
- Tailwind CSS v4 (set up through the Rsbuild guide the Modern.js docs link to) + shadcn/ui (Radix). shadcn's CLI may not recognise Modern.js, so follow its manual installation steps.
- `@zurich/design-tokens` for fonts, icons and logo (CSS only).
- TanStack Query, React Hook Form + Zod, Zustand.
- `@fingerprintjs/fingerprintjs` (open source, MIT) for the mock sign-in.
- DynamoDB (AWS SDK v3 with `@aws-sdk/lib-dynamodb`); SNS → SQS with a dead-letter queue → Lambda.
- Terraform (AWS provider, S3 backend), ECS Fargate, ALB + AWS WAF, ECR, SSM Parameter Store.
- GitHub Actions with OIDC into AWS; Trivy; gitleaks.
- Vitest + React Testing Library; Playwright + `@axe-core/playwright`.
- pino for logs; OpenTelemetry → AWS X-Ray and CloudWatch.
- ESLint + Prettier. If the Modern.js template ships a different linter or formatter, keep the template's and tell me.

**Don't use:** Next.js, Express, NestJS or a standalone Hono server; Cognito or any identity provider, or passwords; EKS, Kubernetes or Helm; CDK, SAM, Serverless Framework or Amplify; Redux or CSS-in-JS; MSW; any AI or Bedrock feature; `@zurich/web-components`. Don't build anything that isn't in PLAN.md: no second partner brand, no admin screens.

## Modern.js facts

Checked against the docs in October 2026. Still confirm against the installed version.

- Modern.js runs its BFF on Hono. There is no separate server.
- Enable the BFF by adding `bffPlugin()` from `@modern-js/plugin-bff` next to `appTools()` in `modern.config.ts`. In `tsconfig.json`, add the path `"@api/*": ["./api/lambda/*"]` and include `api`.
- Each file in `api/lambda/` becomes a route under `/api` (`api/lambda/quotes.ts` → `/api/quotes`), and the export name sets the HTTP method. Files starting with `_` are ignored, so shared server code can live in `api/lambda/_lib/`.
- Pages call BFF functions by importing them (`import { post } from '@api/quotes'`), and Modern.js turns the call into an HTTP request.
- Validate input with operators from `@modern-js/plugin-bff/server`, e.g. `Api(Post('/quotes'), Data(zodSchema), handler)`. `Query`, `Params`, `Headers`, `SetHeaders`, `HttpCode` and `Middleware` are also available.
- Server middleware lives in `server/modern.server.ts`: `defineServerConfig({ middlewares: [{ name, handler }] })`, where handlers are Hono-style `(c, next)`. `useHonoContext()` from `@modern-js/server-runtime` gives you the Hono context inside BFF functions.
- If you need a Hono helper such as `hono/cookie`, add `hono` as a direct dependency pinned to the version Modern.js already resolves.
- Pages use conventional routing (`src/routes/**/page.tsx` and `layout.tsx`).
- Build for Node with `npx modern deploy`, which outputs `.output/`. Start it with `node .output/index`; the port comes from `PORT` (default 8080). In a monorepo, build workspace dependencies first.

## The app

### Pages

| Path | What it does |
| --- | --- |
| `/` | Landing page for the fictional partner "Harbour Bank", co-branded with Zurich. Hero, two cover types (Life, Income Protection), "Get a quote". |
| `/quote` | Three steps on one route. The step is in the URL (`?step=1`), and answers sit in a Zustand store persisted to `sessionStorage`. **1. About you:** date of birth, smoker (yes/no), state, plus a "Use demo details" button. **2. Choose cover:** life cover $100,000–$2,000,000 in $50,000 steps; optional income protection $1,000–$10,000 a month. **3. Your quote:** monthly and yearly premium, a breakdown by cover, a 10% discount on income protection when both are chosen, the general advice warning and "Apply now". |
| `/apply` | Needs a session. First name, four yes/no health questions and a declaration checkbox. |
| `/apply/received` | "Application received" with a link to My policies. If underwriting referred the application, it says "We'll be in touch" instead. |
| `/policies` | Needs a session. Lists the customer's applications. Polls every 2 seconds while any is Processing and shows the policy number once Active. |

On every page:

- A demo banner across the top: "Demo only — not a real Zurich product. Fake data, mock sign-in."
- A header with the Zurich logo and a "with Harbour Bank" lockup, links to Get a quote and My policies, and the sign-in state ("Sign in", or "Demo customer · device 3f9a" with a Sign out link).
- A footer with an invented legal line.
- `<meta name="robots" content="noindex,nofollow">`, plus an `X-Robots-Tag` response header.

**Sign-in:** if a signed-out user clicks "Apply now" or "Sign in", open a dialog titled "Sign in to apply (demo)". It says: "This demo identifies your browser with FingerprintJS instead of a password." Its "Continue" button signs the user in and carries on to where they were going.

### BFF API

| Method and path | Needs session | What it does |
| --- | --- | --- |
| `GET /api/health` | No | Returns `{ ok: true }` for the load balancer. |
| `POST /api/quotes` | No | Validates input, calls mock MuleSoft rating, saves the quote (7-day TTL), returns it. |
| `POST /api/session` | No | Takes `{ visitorId }`. Sets `customerId` = `cust_` + the first 16 hex characters of sha256(visitorId), sets the session cookie, returns `{ customerId, deviceLabel }`. |
| `GET /api/session` | No | Returns the current session, or `{ signedIn: false }`. |
| `DELETE /api/session` | No | Clears the cookie. If a DELETE export is awkward in Modern.js, use `POST /api/session/sign-out`. |
| `POST /api/applications` | Yes | Takes `{ quoteId, firstName, answers }` and calls mock MuleSoft underwriting. ACCEPT: saves status `PROCESSING` and publishes `ApplicationSubmitted`. REFER: saves status `REFERRED` and publishes nothing. |
| `GET /api/policies` | Yes | Lists the customer's applications, newest first. |
| `POST /api/mock-mulesoft/rating` | No | Made-up rating (below). |
| `POST /api/mock-mulesoft/underwriting` | No | Any "yes" answer → REFER, otherwise ACCEPT. |

**Mock MuleSoft:** these routes live in the same app, but treat them as an external system. The BFF reaches them only over HTTP through `MULESOFT_BASE_URL`, never by import. The client:

- times out after 3 seconds and retries once after 200 ms on a timeout or 5xx
- sends `x-correlation-id`
- validates responses with Zod
- turns failures into a 502 with a friendly message

The mock honours `MOCK_MULESOFT_LATENCY_MS` (default 300) and `MOCK_MULESOFT_FAIL_RATE` (default 0), so I can show the error state during the demo.

**Rating:** invent a deterministic table in one file, with numbers that are clearly made up:

- a rate per $1,000 of life cover, by 5-year age band
- a rate per $100 of monthly income protection benefit, by age band
- a 1.5× loading for smokers; state doesn't change the price
- 10% off the income protection premium when both covers are chosen
- age must be 18–60 on the quote date, otherwise it's a validation error
- yearly premium = monthly × 12, rounded to cents

**Session cookie:**

- Named `zld_session`. Value = `customerId.expiry.signature`, signed with HMAC-SHA256 using `SESSION_SECRET` and compared in constant time.
- Flags: HttpOnly, SameSite=Lax, Path=/, an 8-hour expiry, and `Secure` when `COOKIE_SECURE=true`.
- Middleware returns 401 on `/api/applications*` and `/api/policies*` when there's no valid session.
- POST and DELETE requests to `/api/*` must send an `Origin` header matching the app's host, as a simple CSRF check.

**FingerprintJS:** import it dynamically, only when someone clicks sign in. `const fp = await FingerprintJS.load(); const { visitorId } = await fp.get();`. If the installed version has a monitoring or telemetry option, turn it off. The device label is the last 4 characters of `customerId`.

### Data (DynamoDB, one table)

| Item | PK | SK | Attributes |
| --- | --- | --- | --- |
| Quote | `QUOTE#<quoteId>` | `QUOTE` | inputs, premiums, `createdAt`, `expiresAt` (TTL, 7 days) |
| Application / policy | `CUSTOMER#<customerId>` | `APP#<createdAt>#<applicationId>` | `quoteId`, `firstName`, cover summary, premiums, `status` (`PROCESSING`, `ACTIVE` or `REFERRED`), `policyNumber`, `createdAt`, `updatedAt` |

Use `crypto.randomUUID()` for IDs. `pnpm db:init` creates the table in DynamoDB Local.

### Events and the Lambda

The event body is `{ type: 'ApplicationSubmitted', customerId, sk, applicationId, correlationId }`, validated with Zod on both ends.

- **`EVENTS_MODE=sns` (AWS):** the BFF publishes to SNS with a `correlationId` message attribute. SNS → SQS with raw message delivery and `delay_seconds = 3`, so Processing is visible in the demo. Messages go to a dead-letter queue after 3 receives. The queue triggers the Lambda.
- **`EVENTS_MODE=inline` (local dev and CI):** the BFF calls the same issuing code in-process after 3 seconds, against DynamoDB Local. Local dev and E2E tests need no AWS at all.

The issuing logic lives in `functions/policy-issuer/src/issue-policy.ts`. The web app imports it as a workspace dependency for inline mode.

The Lambda handler:

- processes SQS batches and validates each message
- runs `UpdateItem` to set `ACTIVE` and a `policyNumber` (`ZLD-` + 8 digits), on condition that the status is still `PROCESSING`; a failed condition counts as success (idempotent)
- returns `batchItemFailures` for real errors
- logs with pino, including the correlationId
- is bundled with esbuild into a zip that Terraform deploys

### Look and feel

- **Colour tokens:** define them in Tailwind v4 `@theme` and map them to shadcn's CSS variables (e.g. `--primary` = Zurich Blue).

| Token | Hex | Use |
| --- | --- | --- |
| Zurich Blue | `#2167AE` | Primary |
| Dark Blue | `#23366F` | Text |
| Mid Blue | `#5495CF` | |
| Light Blue | `#91BFE3` | |
| Sky Blue | `#1FB1E6` | |
| Sand Stone | `#DAD2BD` | |
| Dove | `#DDE4E3` | |
| Zurich White | `#ECEEEF` | |
| Moss | `#3A8367` | Success |
| Lemon | `#F9E547` | Warning |
| Peach | `#FD7C6D` | Error |

- **Type and controls:** Zurich Sans (weights 300–700) everywhere. Ogg only for the landing-page hero headline. H1 is 48px at weight 300 on desktop. Text is Dark Blue, never black. Buttons are Zurich Blue with white text and a 4px radius.
- **Assets:** fonts, icons and logo come from `@zurich/design-tokens`, and from the logo CSS in `@zurich/css-components` if needed. Inspect the packages to find the right CSS files. Import CSS only. Peer-dependency warnings from these packages are fine.
- **Zurich's design-system rules:** no more than three background colours per page, and Zurich Blue visible on every page.
- **Layout:** mobile-first and working at 375px wide, generous whitespace, one primary action per screen.
- **Copy:** plain Australian English (colour, organisation). Format amounts with `Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' })`. Invent all copy. Never copy text, product names (e.g. Ezicover), rates, images or markup from zurich.com.au, and never hotlink Zurich assets.
- **General advice warning** on the quote result: "This is general information only and doesn't consider your objectives, financial situation or needs."
- **Accessibility:**
  - every input has a label
  - errors are linked with `aria-describedby`
  - focus rings are visible
  - status changes are announced with `aria-live="polite"`
  - the whole journey works by keyboard
  - axe reports no serious or critical violations

### Observability

- **Correlation ID:** middleware reads `x-correlation-id` or creates a UUID. It returns the ID as a response header, attaches it to a pino child logger, and passes it to mock MuleSoft calls and SNS message attributes. The Lambda logs it too.
- **Logs:** pino JSON to stdout. Redact cookies and auth headers. Never log first names or health answers.
- **Tracing:** start the OpenTelemetry Node SDK with auto-instrumentation (HTTP and AWS SDK) via `node --import ./otel.mjs .output/index` in the container. It exports to an ADOT collector sidecar (pinned image version) in the ECS task, which sends traces to X-Ray. The Lambda uses X-Ray active tracing.
- **Demo goal:** an X-Ray trace of the apply request, plus one CloudWatch Logs Insights query by correlationId that shows both the app's and the Lambda's log lines. Don't spend more than an hour trying to get a single trace through SNS and SQS; the correlation ID is enough. Put the query in your final report.

### Infrastructure (Terraform, `infra/`)

**Basics:**

- Region `ap-southeast-2`. `default_tags` with `Project = zurich-life-direct-demo`.
- S3 backend in the bootstrap bucket with `use_lockfile = true` (no DynamoDB lock table). Needs Terraform 1.11 or later.

**Network and entry:**

- **Network:** a new VPC with two public subnets in two availability zones and no NAT gateway. Tasks run in the public subnets with a public IP so they can pull from ECR. Their security group accepts traffic only from the ALB, on port 8080.
- **ALB:** health check on `/api/health`.
  - If I gave you a subdomain: an ACM certificate with DNS validation (output the records for me to add at my DNS provider), an HTTPS listener, an HTTP → HTTPS redirect, and `COOKIE_SECURE=true`.
  - If not: an HTTP listener only, and `COOKIE_SECURE=false`.
- **WAF v2 (regional) on the ALB:** block by default; allow `var.allowed_cidrs`. Changing the list must be a one-line tfvars change.

**Compute:**

- ECS cluster with one Fargate service: 1 task, 0.5 vCPU, 1 GB, x86_64.
- Containers: the app plus the ADOT collector sidecar. Logs go to CloudWatch with 7-day retention.
- `SESSION_SECRET` comes from an SSM SecureString generated with Terraform's `random_password`.
- The task role may only use DynamoDB on the table, `sns:Publish` on the topic, and X-Ray writes.

**Data, events and Lambda:**

- **ECR:** scan on push, keep the last 10 images.
- **DynamoDB:** on-demand, with TTL on `expiresAt`.
- **SNS → SQS:** the topic, the queue and its dead-letter queue, and a queue policy that lets SNS send to it.
- **Lambda:** `nodejs22.x`, arm64, 256 MB, 10-second timeout, active tracing, an event source mapping with `ReportBatchItemFailures`, and 7-day log retention.

**GitHub OIDC:** an OIDC provider and a deploy role trusted only by `repo:<owner>/<repo>:ref:refs/heads/main`. AdministratorAccess on this role is acceptable only because the account is isolated and throwaway; say so in a comment.

**Outputs:** app URL, ECR URL, deploy role ARN, and DNS validation records (if any).

**Cleanup:** no deletion protection and no backups anywhere, and nothing that would get in the way of closing the account.

### AWS account bootstrap (Phase 0)

1. Show me the command, then run it with my main profile: `aws organizations create-account --email <email> --account-name zurich-demo`. Poll `aws organizations describe-create-account-status` until it succeeds.
2. Add a `zurich-demo` profile to `~/.aws/config` that assumes `OrganizationAccountAccessRole` in the new account, with my main profile as `source_profile`. Show me the change first.
3. Write `infra/bootstrap.sh`, run with the zurich-demo profile only. It creates the Terraform state bucket (versioning on, encryption on, public access blocked) and a monthly AWS Budget that emails me at 80% and 100%. It must be safe to run twice.
4. The first deploy has a chicken-and-egg problem: CI needs the deploy role, and the ECS service needs an image. Work out the order (for example: apply ECR and the OIDC role first, push the first image from my machine, then the full apply) and put it in the Phase 3 report. After that, pushing to main deploys.

### CI/CD (GitHub Actions)

One workflow, `.github/workflows/ci-cd.yml`.

**On pull requests and pushes to main:**

- pnpm install with a frozen lockfile and caching
- lint, typecheck, unit tests, build
- Playwright E2E against DynamoDB Local (as a service container) with `EVENTS_MODE=inline`
- `terraform fmt -check` and `terraform validate`
- gitleaks
- Trivy filesystem scan (dependencies and Terraform misconfigurations), failing on HIGH or CRITICAL. Suppressions go only in `.trivyignore`, each with a one-line reason.

**On pushes to main only, after the checks pass:**

1. Assume the deploy role via OIDC (`permissions: id-token: write`).
2. Build the image (linux/amd64) and run a Trivy image scan.
3. Push to ECR, tagged with the commit SHA.
4. Build the Lambda zip.
5. Run `terraform apply -auto-approve -var image_tag=<sha>`.
6. Wait for the ECS service to be stable. The ALB health check is the smoke test, because the GitHub runner isn't on the WAF allowlist.

Use `concurrency` so deploys never overlap. Store the role ARN and region as repository variables, not secrets.

### Environment variables

Validate these at startup with Zod and fail fast with a clear message. Commit `.env.example`, never `.env`.

```
PORT=8080
AWS_REGION=ap-southeast-2
DYNAMODB_TABLE=zurich-demo
DYNAMODB_ENDPOINT=http://localhost:8000   # local only
AWS_ACCESS_KEY_ID=local                   # local only, for DynamoDB Local
AWS_SECRET_ACCESS_KEY=local               # local only, for DynamoDB Local
EVENTS_MODE=inline                        # inline | sns
SNS_TOPIC_ARN=
MULESOFT_BASE_URL=http://localhost:8080/api/mock-mulesoft
MOCK_MULESOFT_LATENCY_MS=300
MOCK_MULESOFT_FAIL_RATE=0
SESSION_SECRET=local-dev-only
COOKIE_SECURE=false
LOG_LEVEL=info
```

### Tests

**Unit (Vitest).** Configure Vitest's path aliases to match Modern.js's. Cover:

- rating maths
- the underwriting rule
- the Zod schemas
- cookie signing and checking (tampered and expired cookies are rejected)
- the MuleSoft client's timeout and retry
- the Lambda handler (valid, invalid and already-active messages, and a DynamoDB error becoming a batch item failure), with the DynamoDB client injected rather than mocked globally
- quote form validation for each step (React Testing Library)

**E2E (Playwright, Chromium only):**

- the happy path, with an axe check on each page: landing → quote with demo details → sign in → apply → received → My policies shows Processing, then Active with a policy number
- one referral path
- one mock MuleSoft failure path that shows the friendly error

Keep the test suite small and fast. No snapshot tests.

### Code style

- TypeScript strict. No `any`, and no `!` non-null shortcuts in server code.
- Zod at every boundary: browser → BFF, BFF ↔ mock MuleSoft, SQS messages, env.
- Small files, named exports, plain functions rather than classes.
- Comments only where the reason isn't obvious. No commented-out code, and no TODOs left at the end.
- The UI shows friendly errors, never stack traces.
- Small commits with clear messages.

### README and docs

- There are exactly two docs: `README.md` and `docs/decisions.md`. Copy `docs/phases/Phase 1/architecture.png` to `docs/architecture.png` for the README.
- The README is the template in PLAN.md, filled in, not extended. You may add one "First deploy" block of at most five commands.
- `docs/decisions.md` is one line per decision, 10 lines at most.
- Sentences under 20 words. No badges, emoji, "Features" lists or "Overview" sections.
- If a draft runs past one screen, cut it. No CHANGELOG, CONTRIBUTING, ADR folder or per-package READMEs.

## Phases

**Phase 0: setup**

- The AWS account, CLI profile and bootstrap script, each step with my OK.
- The private GitHub repo (ask first). Workspace, `.nvmrc`, `.gitignore` (with `doc/` in it), lint and format, `docker-compose.yml` with DynamoDB Local, and `pnpm db:init`.
- The Modern.js app with the BFF plugin, Tailwind v4, shadcn/ui, the Zurich theme, fonts, logo, demo banner, header and footer, the landing page and `/api/health`.
- Done when `pnpm dev` shows the branded landing page at `localhost:8080` and `/api/health` returns ok.

**Phase 1: quote journey**

- Mock MuleSoft rating and underwriting routes, the MuleSoft client, `POST /api/quotes` and quote storage.
- `/quote`: all three steps, the demo-details button and the result page.
- Unit tests for rating, schemas, the client and the form.
- Done when I can get a quote end to end locally and `pnpm test` passes.

**Phase 2: sign-in, apply, events**

- FingerprintJS mock sign-in, the session cookie and middleware, the sign-in dialog and the header state.
- `/apply`, `/apply/received` and `/policies` with polling; inline events; the policy-issuer code and its tests.
- Playwright E2E with axe.
- Terraform for DynamoDB, SNS, SQS + dead-letter queue, Lambda, ECR and SSM. Show me the plan and apply only after my OK. Then test the Lambda in AWS by writing a test item and publishing a test event.
- Done when the full happy path works locally, E2E passes, and the Lambda activates a test item in AWS.

**Phase 3: ship**

- Dockerfile: multi-stage, runs as a non-root user, and starts `node --import ./otel.mjs .output/index`.
- Terraform for the VPC, ALB, WAF, ECS with the ADOT sidecar, and the OIDC role. First deploy.
- The CI/CD workflow, the logging and tracing setup, `README.md` and `docs/decisions.md`.
- A final check against the definition of done.
- Done when everything below is true.

## Definition of done

- [ ] `pnpm dev` runs the whole journey offline (DynamoDB Local, inline events).
- [ ] The happy path works on the deployed URL from an allowlisted IP; any other IP gets a 403.
- [ ] A new application goes from Processing to Active within about 10 seconds, and the dead-letter queue is empty.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm e2e` pass locally and in CI, and pushing to main deploys.
- [ ] Trivy and gitleaks run in CI with no unexplained suppressions.
- [ ] axe reports no serious or critical issues on any page.
- [ ] The X-Ray trace and the Logs Insights query by correlationId both work.
- [ ] Every page has the demo banner and noindex. There's no real Zurich copy, rates or assets, and no real personal data.
- [ ] `README.md` and `docs/decisions.md` each fit on one screen.
- [ ] Every AWS resource is in the zurich-demo account. The only exceptions are the account itself and my CLI profile.
