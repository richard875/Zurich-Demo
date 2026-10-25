# Build brief: Phase 4, audit and final polish

You're auditing the demo app in this repo and fixing what's wrong before it's shown. `docs/phases/Phase 4/PLAN.md` says **what** gets checked and why, with `phase-4-flow.png` beside it. This brief says **how**. If the two disagree, this brief wins.

The working rules in the Phase 1 to 3 briefs still apply (stop points, ask before touching AWS or GitHub, check installed library versions, short docs, focused diffs) unless this brief changes them. Those briefs say `doc/`; that folder is now `docs/phases/` and `docs/reference/`.

**Four rules above all others:**

1. **Find everything first.** Step 1 changes nothing.
2. **Fix defects, not designs.** No new features, no redesigns, no refactors for their own sake.
3. **The repo is public.** Nothing personal or sensitive goes into any file, commit message, pull request or screenshot.
4. **When in doubt, ask.** Pausing to ask is always better than guessing.

## Files

- Write only to the files you're fixing and to `docs/phases/Phase 4/`:
  - `FINDINGS.md`: the findings log (format below)
  - `REPORT.md`: the short Phase 4 report, written in Step 4
  - `screenshots/` and `recordings/`: the committed evidence (limits below)
  - `scripts/`: the capture and measurement scripts you write, so the audit can be repeated
- Keep everything else you produce **outside the repository**, for example in a sibling folder: the full capture matrix, raw recordings, Lighthouse output, and the details of any security finding that isn't fixed yet.
- Reference material, read-only:

| Path | What it is |
| --- | --- |
| `docs/phases/Phase 4/PLAN.md` | The Phase 4 plan, with `phase-4-flow.png` beside it |
| `docs/phases/Phase 4/pdf-style.css` | The stylesheet every plan PDF and the manifest PDF are printed with |
| `docs/phases/Phase 1/` to `Phase 3/` | The earlier plans and briefs: what each part of the app promised |
| `docs/phases/Phase 3/HANDOVER.md` | How the motion system works. Its status and commit hashes are out of date |
| `docs/phases/Phase 3/recordings/measure.mjs` and `record.mjs` | Phase 3's measurement and recording scripts, to reuse |
| `docs/reference/` | The saved Zurich Direct and zurich.com.au pages: the source of copy and design |

## Context

- Phases 1 to 3 are built, merged and deployed. The live site (its URL is in the README) runs Phase 3.
- **The demo is on Monday 26 October 2026.** Keep fixes small. If a fix is risky, say so and propose deferring it. Every commit leaves the branch deployable, so we can stop after any step.
- **History was rewritten into Conventional Commits.** Commit hashes quoted in older docs no longer exist; look commits up by message. Write commit messages the same way: `type(scope): lower-case summary`, with types such as `feat`, `fix`, `style`, `refactor`, `docs`, `test`, `ci`, `build` and `chore`, and scopes such as `web`, `home`, `header`, `quotes`, `apply`, `policies`, `motion`, `infra`, `ci`, `dev` and `security`.
- **Known and accepted; don't change them:**
  - the header's 40px Get a quote pill, against 44px for every other button
  - the home page's small sideways scroll at 320px wide
  - pages stay empty with JavaScript fully off, because Modern.js streams them into place
  - the Phase 1 to 3 documents are records; leave them as they are
- **Local setup:** use Node 22 (the repo's `.nvmrc`) and pnpm 11. Stop the dev server before `pnpm build` or `pnpm e2e`; both write to the same output folder.

## Before you start

Read `docs/phases/Phase 4/PLAN.md`, this brief, the Phase 1 to 3 briefs, the Phase 3 handover, `README.md` and the files in `docs/`. Skim the code under `apps/`, `functions/` and `infra/`. Then reply with:

1. Your plan for Step 1, including the browsers you'll install, the servers you'll run, how you'll reach each state in the matrix, and where your local evidence will live.
2. The plan's three open decisions (the deploy role's permissions, `docs/reference/` in a public repo, a note on the Phase 3 handover), and anything else you need answered. You can ask these now or at Stop 1.
3. Anything in this brief that doesn't fit the repo as it is.

Then wait for "go". Don't change anything before that.

## How to work with me

- Work on a branch from `main`, named `phase-4-audit`. Pushing that branch is fine.
- Work in the four steps below. After each step, stop and report in under 15 lines: what you did, the counts by priority, what to look at, and your questions.
- Ask before you:
  - push to or merge into `main`, or deploy
  - run any Terraform or AWS command, including a read-only `terraform plan`
  - change any AWS or GitHub setting, or the CI workflow
  - add, remove or upgrade a dependency
  - change copy, layout, colours or behaviour beyond fixing a defect
  - do anything on the live site other than load pages and read response headers
- Installing extra Playwright browsers (WebKit and Firefox) locally is fine. CI stays on Chromium unless I say otherwise.
- Don't rewrite history or force-push.

## The findings log

`docs/phases/Phase 4/FINDINGS.md` is one table, newest priority first:

| ID | Area | Priority | Where | What's wrong | Evidence | Outcome |
| --- | --- | --- | --- | --- | --- | --- |
| F-01 | UI | P1 | Page, browser and width | One line on what's wrong | `screenshots/f-01-before.png` | Fixed in `fix(scope): …` |

- **Areas:** code, security, UI, motion, docs, final pass.
- **Priorities:**
  - **P0:** breaks the demo, loses data, or is a security risk
  - **P1:** visibly wrong, misleading, inaccessible or out of date
  - **P2:** polish, or a matter of taste
  - **P3:** a refactor or nice-to-have, logged for after the demo
- **Outcome:** every entry ends as fixed (with its commit message), accepted by me, or logged for later.
- **Security findings:** while one is unfixed, its row says only its ID, area, priority, layer and "Details withheld until fixed". Tell me the details in the chat and keep them in your local evidence folder. Once it's fixed, replace the row with a one-line, category-level summary.

## Step 1: Audit (read-only)

### 1a. Baseline

- Run `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm e2e`, and record the results.
- Measure a production build the way Phase 3 did: first-load JavaScript on each page, and Lighthouse LCP, CLS, TBT and accessibility on mobile and desktop (median of 3 runs). These are the numbers the end of Phase 4 is compared with.

### 1b. Code review

Work through the plan's "Code review and correctness" table, layer by layer. Check behaviour against what the phase plans and briefs promised. Confirm or rule out the plan's four leads first:

1. There's a page-not-found route but no error page. What does a visitor see when a page throws, or the server returns a 500?
2. `.gitleaksignore` names a commit and `doc/` paths that no longer exist. Does a full-history scan report those findings again?
3. Are the four `minimumReleaseAgeExclude` lines in `pnpm-workspace.yaml` still needed?
4. `components/icon-link.tsx` isn't imported anywhere. Is there other dead code?

### 1c. Security review

Work through the plan's "Security review" table. At least:

- **Secrets and personal data:** run gitleaks over the full history (its container image is fine). Search tracked files and history for 12-digit account IDs, email addresses, IP addresses outside the documentation ranges, local home-folder paths, private keys and access keys.
- **Dependencies:** `pnpm audit --prod`, Trivy on the filesystem, the Terraform and a locally built image. For every `.trivyignore` entry, check whether a fix now exists.
- **The app:** read the session, same-origin, rate-limit, body-limit, logging and error-handling code. Confirm each behaviour with a test or a local request, not by reading alone.
- **The live site:** read its response headers for the home page, an API route and a static asset. Nothing more.

### 1d. UI audit

- **Servers:** a local production build on DynamoDB Local, plus the second copy whose mock MuleSoft always fails, as in `playwright.config.ts`.
- **Browsers and sizes:** Chromium and WebKit at 1440×900 and 390×844 for every state. Spot checks at 1280, 768, 375 and 320 pixels wide, and Firefox at 1440.
- **States:** capture every state in the plan's matrix. Reach the hard ones without changing app code: Playwright's route interception can delay a response (loading), hold it (submitting) or fail it (failed to load). Use the referred path for "being reviewed".
- **Overlays:** check hover, keyboard and touch for every one, including the Apply page's info tooltip.
- **The checklist:** check every capture against the plan's checklist. Log anything that fails it. Lay each page's captures side by side, so inconsistencies between pages show.

### 1e. Motion audit

- Record every motion in the Phase 3 catalogue at 1440 and 390 pixels wide, in Chromium and WebKit, with motion on and with reduced motion.
- Run through the plan's motion checks. Include fast scrolling, jumping to the end with the keyboard, back and forward, zoom, and a tab left in the background then brought back.
- Confirm Motion is still used only for the quote step transition.

### 1f. Docs audit

Read the four reader-facing documents against the plan's table and log what's wrong. Don't edit them yet.

**Stop 1.** Report the counts by priority and area, every P0, the P1s, and the decisions you need. I triage the list and tell you what to fix.

## Step 2: Fix P0 and P1

- P0 first, then P1, one finding per commit.
- Make the smallest change that fixes it, in the style of the code around it.
- Add a regression test wherever behaviour was wrong: a unit test, or an E2E test in the existing files.
- For every UI or motion fix, save a before and after pair from the same browser, size and state.
- Update the finding's outcome as you go.
- When all of them are done, every check passes again: lint, types, unit, E2E.

**Stop 2.** Report, with the before and after pairs.

## Step 3: Final pass

Go through the whole site as a first-time visitor in four setups: desktop Chromium, desktop WebKit, an iPhone-sized WebKit and an Android-sized Chromium.

1. Land on the home page and read every section. Open every tab, accordion and menu. Every external link opens in a new tab and says so.
2. Get a quote from the chooser and from a product card. Change cover, and go back and forward between steps.
3. Sign in, apply, see Application received, then My policies, and watch the policy turn Active.
4. Take the referred path and the MuleSoft-down path.
5. Refresh mid-journey. Use back and forward. Open the quote in a second tab. Sign out mid-journey. Open `/apply` and `/policies` signed out. Try an unknown address.
6. Do one whole journey by keyboard alone.

Log and fix what you find (P0 and P1), plus any P2s I approved at Stop 1.

**Stop 3.** Report.

## Step 4: Docs and report

Update the documents last, so they describe the final state:

- **`README.md`:**
  - no longer than today
  - every command checked on a fresh clone of the branch
  - versions match `.nvmrc` and `package.json`
  - the first-deploy steps complete and in order
  - what it says CI does matches the workflow
- **`docs/AI_MANIFEST.md`:**
  - Fix facts only: the commit, test and hour counts. Count hours from the first commit to the last.
  - It stays one A4 page, in my voice. Show me any wording change before you make it.
  - Claude Code's section must still be true.
- **`docs/AI Development Manifest.pdf`:**
  - Regenerate it whenever the manifest changes: Chromium's print to PDF, A4, with `docs/phases/Phase 4/pdf-style.css`.
  - Margins 18mm top, 16mm sides, 20mm bottom, and a centred "page / pages" footer.
  - Keep the file name. Check that it's one page and matches the markdown word for word.
  - Run any markdown converter temporarily (for example with `pnpm dlx`); don't add it to the project.
- **`docs/architecture.png`:**
  - If it's accurate, leave it.
  - If it needs a change, rebuild it in today's style from an editable source saved beside it (an SVG or HTML file), and export the PNG from that.
- **`docs/decisions.md`:**
  - at most 10 lines, one decision and its reason per line
  - every line still true; overlapping lines merged; the most important first
- **`docs/phases/Phase 4/REPORT.md`:**
  - no more than two pages
  - what was checked (pages, states, browsers, sizes)
  - findings by priority and outcome
  - the notable fixes
  - what I accepted or deferred
  - baseline against final measurements
  - nothing about any weakness that isn't fixed

Then open a pull request from `phase-4-audit` into `main`, and make sure CI passes.

**Stop 4.** I review, merge and deploy. After the deploy, load every page on the live site, read the response headers and report.

## Evidence limits

- **Committed** under `docs/phases/Phase 4/`, 20 MB at most in total:
  - before and after pairs for fixed UI and motion issues (PNG or JPEG, 300 KB each at most)
  - at most six short MP4 recordings (2 MB each at most)
  - the findings log, the report and the scripts
- **Kept local:** everything else.
- No screenshot may show a browser profile, an OS user name, a local path or developer tools.

## Definition of done

- [ ] Every finding has a priority and an outcome: fixed, accepted by me, or logged for later
- [ ] No P0 or P1 is left open
- [ ] Every page and state in the plan's matrix has been checked in Chromium and WebKit at 1440 and 390 pixels wide, with the spot checks done
- [ ] Every motion has been checked with motion on and reduced, and nothing outside the catalogue moves
- [ ] Every fixed bug has a regression test where one makes sense
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm e2e` pass locally, and CI passes on the pull request
- [ ] The full-history secret scan is clean, and no tracked file holds personal data or account details
- [ ] README, the manifest and its PDF, the architecture diagram and the decisions file are correct, current and within their lengths
- [ ] Final measurements are no worse than the baseline
- [ ] `FINDINGS.md` and `REPORT.md` describe no unfixed weakness, and the committed evidence is under 20 MB
