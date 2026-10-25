# Phase 4 findings

Step 1 audit of `main` at `a024dfe`, 25 October 2026. Newest priority first. Evidence paths are under `docs/phases/Phase 4/evidence/` on the `phase-4-evidence` branch, which holds the full capture set; the scripts that produce it are in `scripts/`.

**Step 2 (25 October 2026):** the P0, the code and UI P1s and most P2s are fixed, each with a regression test where one makes sense. Lint, types, 81 unit tests and 34 E2E tests pass. The docs P1s wait for Step 4, when the documents are updated last.

**Step 3 (25 October 2026):** the whole site as a first-time visitor in desktop Chromium, desktop WebKit, an iPhone-sized WebKit and an Android-sized Chromium: 17 checks each covering every section, tab, accordion and menu, external links, the chooser and product-card quotes, back, forward and refresh, sign in, apply, Processing to Active, the referred and MuleSoft-down paths, a second tab, signing out mid-journey, signed-out pages, an unknown address, and one whole journey by keyboard (desktop). All pass; one new P3 (F-34). Script: `scripts/final-pass.mjs`.

| ID | Area | Priority | Where | What's wrong | Evidence | Outcome |
| --- | --- | --- | --- | --- | --- | --- |
| F-01 | Security | P0 | Dependencies | CI's dependency scan began failing on a newly published advisory, so pushes to `main` stopped deploying. Reviewed and accepted with a reason until a planned upgrade after the demo | Local Trivy filesystem and image scans pass | Fixed in `fix(security): accept a reviewed dependency advisory until after the demo`; the upgrade is logged for after the demo |
| F-02 | Security | P1 | Pipeline | Details withheld until fixed | Reported in the chat | Accepted by Richard |
| F-03 | Security | P1 | Secret scanning | A full-history scan re-reported the reviewed reference-page items, because the history rewrite changed the commit they're tied to | gitleaks over every branch: no leaks | Fixed in `fix(security): point reviewed secret-scan exceptions at the rewritten history` |
| F-04 | Code | P1 | Every page, all browsers | No error page. A page that throws while rendering, or a script chunk that fails to load, shows React Router's developer screen with a stack trace ("Unexpected Application Error!", "Hey developer"). | `captures/chromium-1440/server-error--client-render-throws.jpg` | Fixed in `fix(web): show an error card when a page fails to render or load`; before and after: `screenshots/f-04-*.jpg` |
| F-05 | UI | P1 | Every page, phones | The viewport meta tag (Modern.js's default) sets `maximum-scale=1, user-scalable=no`, so nobody can pinch-zoom. Fails WCAG 1.4.4; it's why Lighthouse accessibility is 94 to 95. | `measurements-baseline.json`; axe `meta-viewport` on every capture | Fixed in `fix(web): let visitors pinch-zoom every page`; renders pixel-identical in Chromium and WebKit |
| F-06 | UI | P1 | Apply, WebKit 390 (iPhone) | Tapping the info icon beside First name never opens its tooltip: the button cancels `pointerdown`, and WebKit then fires no `click` for the tap. Chromium touch works. Checked in WebKit emulation only. | `reports/captures-report-webkit-390.json` (apply-touch-tooltip) | Fixed in `fix(apply): open the name info tooltip from a tap in Safari`; before and after: `screenshots/f-06-*.jpg` |
| F-07 | Docs | P1 | `README.md` | First deploy misses two steps: logging Docker in to ECR before the push, and pointing Terraform at the `zurich-demo` profile. On a clean checkout `pnpm e2e` also needs `pnpm --filter web exec playwright install chromium`. | Read against `infra/` and the workflow | Open (Step 4) |
| F-08 | Docs | P1 | `docs/AI_MANIFEST.md` and its PDF | "91 commits in 37 hours" is out of date (110 commits on `main` over about 85 hours, before Phase 4). The PDF still says `doc/` where the markdown says `docs/`. "Inputs in `docs/`: emails, the job description" names files the repo doesn't hold. | Text of both files | Open (Step 4) |
| F-09 | Docs | P1 | `docs/decisions.md` | 13 lines, against the 10-line limit. | The file | Open (Step 4) |
| F-10 | Code | P2 | `POST /api/applications` | The BFF accepts any number of applications for one quote. The page guards against a double click, but the same quote applied from a second tab makes a second policy. | Two local requests with one quote: two Active policies | Fixed in `fix(apply): make each quote produce one application` |
| F-11 | Code | P2 | Apply and My policies | If the session check fails, the page says "Checking you're signed in…" for ever, with no error or retry. | Local probe with `/api/session` failing | Fixed in `fix(web): say when the sign-in check fails, with a way to retry`; before and after: `screenshots/f-11-*.jpg` |
| F-12 | Code | P2 | Quote step 2 | After "We couldn't work out your price", going Back and Continue again shows the old error before the visitor has retried. | Local probe on the failing build | Fixed in `fix(quotes): clear a failed price when the visitor leaves the cover step`; before and after: `screenshots/f-12-*.jpg` |
| F-13 | Code | P2 | My policies | If one 2-second poll fails while a policy is Processing, the list is replaced by the error message. | `policies/page.tsx` read; TanStack keeps the data but the page checks `isSuccess` | Fixed in `fix(policies): keep the list on screen when one poll fails`; before and after: `screenshots/f-13-*.jpg` |
| F-14 | Code | P2 | `/api/<unknown>` | Unknown API addresses return Modern.js's unbranded HTML 404 page, not the `{ message }` JSON the other routes use. | Local request | Fixed in `fix(web): answer unknown API addresses with the API's JSON 404` |
| F-15 | UI | P2 | Every page, 320px | The header's Get a quote pill and Menu button make every page 6px wider than the screen. Accepted for the home page, but it's the header, so it's every page. | `reports/captures-spot-report-chromium-320.json` | Logged for after the demo: the same header as the accepted home-page scroll, so it's left as it is |
| F-16 | UI | P2 | Home tabs, sheets, dialog, header | Controls under 44px: cover tab pills 36px tall, the sheets' and dialog's Close 40×40, the header's Sign in and Sign out text buttons 20px tall (desktop). | `reports/*.json` (`smallButtons`) | Close buttons fixed in `fix(web): make the sheets' and sign-in dialog's Close buttons 44px` (`screenshots/f-16-*.jpg`); the tab pills and the header's text links are left as designed |
| F-17 | Motion | P2 | Help & information menu, tabs, buttons | With reduced motion, the Help menu's chevron still rotates over 200ms, and colour changes take 200ms against the 150ms cap. | `motion/motion-chromium-1440-reduced.json` | Fixed in `fix(motion): stop chevrons turning and cap state changes at 150ms with reduced motion`; notes before and after: `screenshots/f-17-motion-notes.json` |
| F-18 | UI | P2 | Home page, Back button, both engines | Going Back to the home page from another page lands at the top, not where the visitor was. | `motion/motion-*-on.json` (`scrollAfterBack` 0) | Logged for after the demo: `ScrollRestoration` can't restore a lazy-loaded page's position without reworking how routes load |
| F-19 | UI | P2 | Footer and demo strip | "A Richard Everley's Production" reads wrongly (perhaps "A Richard Everley production"). The strip's "This is a Demo site" capitalises Demo mid-sentence. | `captures/chromium-1440/home--full.jpg` | Fixed in `fix(web): correct the demo strip's capital and the footer credit's grammar`; before and after: `screenshots/f-19-*.jpg` |
| F-20 | Code | P2 | `infra/events.tf` | There's no CloudWatch alarm on the dead-letter queue, which the plan lists. Adding one is an infrastructure change. | Terraform read | Logged for after the demo: an infrastructure and cost change |
| F-21 | Code | P2 | `pnpm-workspace.yaml` | The four `minimumReleaseAgeExclude` lines are no longer needed: `pnpm install --frozen-lockfile` passes without them. | Local install in a scratch copy | Fixed in `chore(dev): drop release-age exclusions that are no longer needed` |
| F-22 | Code | P2 | `.trivyignore` | One entry no longer matches anything in the filesystem or image scans, and a comment calls Modern.js 3.10.1 the latest (3.10.3 is, bundling the same packages, so the other entries still apply). | Local Trivy scans | Fixed in `chore(security): remove a scan exception that no longer matches anything` |
| F-23 | Docs | P2 | `docs/architecture.png` | Accurate, but its editable source isn't kept beside it, and ECR, SSM Parameter Store and the ACM certificate aren't shown. | The image and `infra/` | Open (Step 4) |
| F-24 | Code | P3 | `components/icon-link.tsx` | Imported nowhere. No other unused modules. | Import search | Logged |
| F-25 | Code | P3 | BFF validation | A 400 response carries the raw Zod issue list as its message. The browser shows its own wording, so visitors never see it. | Local request | Logged |
| F-26 | UI | P3 | Every page | The demo strip sits outside any landmark (axe "region", moderate). | `reports/*.json` | Logged |
| F-27 | Motion | P3 | Home | The cover tab pills fade their focus ring in over 200ms. Tabbing in the first 0.7s can land on the hero's Get a quote while it is still rising. | `motion/motion-*-on.json` | Logged |
| F-28 | Code | P3 | My policies, Apply | A failed load shows its error only after three retries, about 7 seconds. | Capture with `/api/policies` failing | Logged |
| F-29 | Code | P3 | Dependencies | `pnpm audit --prod` also lists a moderate issue in a build-time CSS tool and a low one in a serialiser the app uses only for data. | Local audit | Logged |
| F-30 | Code | P3 | `infra/ecs.tf` | The tracing sidecar's image is pinned by tag, not digest. | Terraform read | Logged |
| F-31 | Code | P3 | Tests | No E2E test covers the 404 status, sign out, loading or failed states, or WebKit. | Test list | Logged |
| F-32 | Docs | P3 | `docs/phases/Phase 3/HANDOVER.md` | Says Phase 3 isn't deployed. Richard approved a one-line note that it shipped. | The file | Open (Step 4) |
| F-33 | UI | P3 | Firefox | Firefox warns about glyph boxes in the Ogg font from the design-tokens package. Nothing visible. | `reports/captures-firefox-report-firefox-1440.json` | Logged |
| F-34 | Final pass | P3 | Help & information menu, desktop, both engines | An Escape pressed within about 200ms of clicking the menu open is lost: Radix's hover-open timer, started as the pointer arrives, opens it again. At a person's pace, and from the keyboard, Escape closes it. | Probe of Escape at 0 to 500ms after the click | Logged for after the demo |

## What was checked

- **Checks:** lint, typecheck, 79 unit tests and 27 E2E tests pass; Terraform format, validate and the mock-provider test pass.
- **UI:** every state in the plan's matrix in Chromium and WebKit at 1440×900 and 390×844; spot checks at 1280, 768, 375 and 320 (Chromium) and 768 and 375 (WebKit); Firefox at 1440. 479 captures, each with axe, sideways scroll, button sizes and console.
- **Motion:** Chromium and WebKit at 1440 and 390, motion on and reduced: what plays and for how long, fast scrolling, End key, back and forward, 200% zoom, a frozen background tab (Chromium), keyboard focus, and 4× CPU. Motion is used only by the quote step transition.
- **Ruled out:** the one serious axe contrast hit (the Help menu captured mid-fade; clean once settled); the header's missing external-link icons, the product-card teasers and the footer credit (deliberate commits); console errors from the audit's own fast navigations.

## Baseline (production build, cloud container's Chromium 156)

| Page | First-load JS (gzip) | Mobile LCP / CLS / TBT | Desktop LCP / CLS / TBT | Accessibility |
| --- | --- | --- | --- | --- |
| Home | 271.1 KB | 6,701ms / 0.001 / 421ms | 1,446ms / 0.001 / 96ms | 95 |
| Quote | 305.5 KB | 4,531ms / 0.001 / 743ms | 907ms / 0.002 / 98ms | 95 |
| Apply | 296.6 KB | 4,971ms / 0.002 / 627ms | 962ms / 0.002 / 104ms | 94 |
| Received | 261.7 KB | 5,946ms / 0.001 / 696ms | 906ms / 0.001 / 85ms | 94 |
| My policies | 264.2 KB | 4,665ms / 0.001 / 594ms | 942ms / 0.002 / 92ms | 94 |
| Page not found | 261.5 KB | Lighthouse won't audit a 404 | | |

Medians of 3 Lighthouse 13.5.0 runs; full runs in `measurements-baseline.json`. The home and quote runs overlapped briefly with other audit work, so their TBT may read high. The final measurement will repeat all six pages the same way.
