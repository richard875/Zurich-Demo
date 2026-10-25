# Phase 4 report: audit and final polish

25 October 2026 · Claude Code, for Richard Everley

Phase 4 added no features. It checked everything built in Phases 1 to 3 and fixed what was wrong, in four steps on the `phase-4-audit` branch, with a stop for Richard after each. The full list is in `FINDINGS.md`; the scripts that repeat the audit are in `scripts/`; the full capture set is on the `phase-4-evidence` branch, kept off `main`.

## What was checked

- **Code:** every tracked source file, layer by layer, against the phase plans and briefs, with lint, types, unit, E2E and the Terraform tests.
- **Security:** a full-history secret scan; a search of files and history for account IDs, addresses, paths and keys; dependency audits; Trivy on the files, Terraform and a locally built image; local requests against every guard; the live site's response headers.
- **UI:** every page and state in the plan's matrix in Chromium and WebKit at 1440×900 and 390×844, spot checks at 1280, 768, 375 and 320, and Firefox at 1440: 479 captures, each checked with axe and for sideways scroll, button sizes and console errors.
- **Motion:** the Phase 3 catalogue in Chromium and WebKit at 1440 and 390, motion on and reduced, with fast scrolling, back and forward, 200% zoom, a frozen tab, keyboard focus and 4× CPU slowdown.
- **Final pass:** the whole site as a first-time visitor in desktop Chromium and WebKit, an iPhone-sized WebKit and an Android-sized Chromium, 17 checks each, one journey by keyboard alone.

## Findings by priority and outcome

| Priority | Found | Fixed | Accepted by Richard | Logged for after the demo |
| --- | --- | --- | --- | --- |
| P0 | 1 | 1 | 0 | 0 |
| P1 | 8 | 7 | 1 | 0 |
| P2 | 14 | 10 | 0 | 4 |
| P3 | 11 | 1 | 0 | 10 |
| **Total** | **34** | **19** | **1** | **14** |

## Notable fixes

- **Deploys work again.** A newly published dependency advisory had turned CI's scan red, so pushes to `main` stopped deploying; it is reviewed and accepted until an upgrade after the demo. The full-history secret scan is clean again.
- **No more stack traces.** A page that throws or fails to load shows the site's own error card, not the framework's developer screen.
- **Accessibility:** pages can be pinch-zoomed (Lighthouse accessibility 94–95 → 100 on every page); the name tooltip on Apply opens from a tap on an iPhone; Close buttons are 44px; with reduced motion nothing rotates and state changes take 150ms at most.
- **Correct behaviour under failure:** one quote now makes one application, even from a second tab; a failed sign-in check says so and offers Try again; an old price error no longer lingers; a failed poll keeps the policy list on screen; unknown API addresses answer in the API's JSON.
- **Docs:** README's steps are complete and checked on a fresh clone, the manifest and its PDF are current, and `decisions.md` is ten lines.

Each fix has a regression test where one makes sense: unit tests grew from 79 to 81 and E2E tests from 27 to 34. Before and after pairs are in `screenshots/`.

## Accepted or deferred

- **Accepted by Richard:** one pipeline item (F-02).
- **Deferred** as risky today or outside Phase 4's scope: returning to the visitor's place after Back (F-18), a dead-letter queue alarm (F-20), and the 320px sideways scroll from the same header as the accepted home-page case (F-15). Tab pills and header text links stay as designed (F-16).
- **Logged:** ten P3 items, such as an unused component, tests that could cover more states, and a too-quick Escape on the Help menu.

## Baseline and final measurements

The container restarted after the morning's baseline, and `main` itself measured slower afterwards, so the final numbers compare `main` and this branch built side by side and measured back to back: medians of 3 Lighthouse 13.5.0 runs, 6 for the home page on mobile.

| Page | First-load JS, KB gzip | Mobile LCP, ms | Mobile TBT, ms | Desktop LCP, ms |
| --- | --- | --- | --- | --- |
| Home | 271.1 → 271.6 | 6,480 → 6,310 | 539 → 643 | 1,585 → 1,598 |
| Quote | 305.5 → 306.7 | 4,674 → 4,524 | 728 → 743 | 979 → 944 |
| Apply | 296.6 → 297.9 | 4,906 → 4,894 | 662 → 664 | 943 → 940 |
| Received | 261.7 → 262.0 | 4,530 → 4,520 | 696 → 703 | 861 → 859 |
| My policies | 264.2 → 265.5 | 4,520 → 4,673 | 622 → 663 | 947 → 904 |

- **No worse:** LCP and CLS (unchanged at 0.001 to 0.002) on every page, within run-to-run spread; mobile LCP runs land on one of two levels in both builds. First-load JS grew by at most 1.3 KB, for the error card.
- **Mobile TBT** reads higher on the home page, but the runs overlap almost entirely (515–729ms on `main`, 497–717ms here), and nothing on that page's main thread changed beyond the error boundary.
- **Better:** Lighthouse accessibility is 100 on every page, up from 94–95. Full runs: `measurements-*.json`.
