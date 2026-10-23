# Phase 3 (Motion): handover

| | |
| --- | --- |
| **Project** | Zurich Direct (demo): `richard875/Zurich-Demo` |
| **Phase** | 3: Motion (`docs/phases/Phase 3/PLAN.md`, `docs/phases/Phase 3/BRIEF.md`, `docs/phases/Phase 3/motion-map.png`) |
| **Branch** | `claude/eloquent-turing-4qzu0o` (pushed) |
| **Written** | 23 October 2026, at the end of the build session (all times below are UTC) |
| **Status** | All four steps built, tested and pushed. **Not deployed. CI not yet run.** |

This document is for whoever picks Phase 3 up next: Richard, or a new Claude Code session. It records what was built, why, how it works, what was decided along the way, how it was verified, and what is left. Read section 1 first; the rest is reference.

---

## Contents

1. [Status at a glance and what to do next](#1-status-at-a-glance-and-what-to-do-next)
2. [Git state](#2-git-state)
3. [Background: the brief and its rules](#3-background-the-brief-and-its-rules)
4. [Decisions log](#4-decisions-log)
5. [Deviations from the brief](#5-deviations-from-the-brief)
6. [Architecture of the motion system](#6-architecture-of-the-motion-system)
7. [The catalogue, mapped to the code](#7-the-catalogue-mapped-to-the-code)
8. [What deliberately does not move](#8-what-deliberately-does-not-move)
9. [Every file changed](#9-every-file-changed)
10. [Tests](#10-tests)
11. [Performance](#11-performance)
12. [Other verification done](#12-other-verification-done)
13. [Review material: recordings, screenshots and scripts](#13-review-material-recordings-screenshots-and-scripts)
14. [Working in the cloud container: environment workarounds](#14-working-in-the-cloud-container-environment-workarounds)
15. [Known issues, risks and gotchas](#15-known-issues-risks-and-gotchas)
16. [Definition of done: checklist](#16-definition-of-done-checklist)
17. [How to extend the motion system](#17-how-to-extend-the-motion-system)
18. [Command cheat sheet](#18-command-cheat-sheet)
19. [Appendix: commits and timeline](#19-appendix-commits-and-timeline)

---

## 1. Status at a glance and what to do next

### Status

| Area | State |
| --- | --- |
| Step 1: Foundations | Done. Baseline measured, Motion installed, tokens, building blocks, temporary lab (since deleted) |
| Step 2: Home page | Done. Hero entrance, reveals, staggers, settles, hover and press |
| Step 3: Flow and controls | Done. Tab switch, Help menu, loading fades, quote steps, progress, policy pill, bands, received and 404 cards |
| Step 4: Finish | Done. New tests, final measurements, README, decisions, lab deleted |
| Local checks | `pnpm lint`, `pnpm typecheck`, `pnpm test` (79 tests: 75 web + 4 policy-issuer) and `pnpm e2e` (22 tests) all pass |
| Budgets | All met: first-load JS +1.4 KB (budget +10 KB); LCP and CLS no worse on mobile or desktop |
| CI | **Not run.** The workflow only runs on pull requests and pushes to `main`. Richard said he will run it himself |
| Deploy | **Not done, and not authorised for Claude.** Deploying is a push to `main` |
| Branch vs `main` | 10 commits ahead, 0 behind: `main` can fast-forward to it |

### What to do next, in order

1. **Run CI.** Either open a pull request from `claude/eloquent-turing-4qzu0o` into `main` (runs the `app`, `terraform` and `security` jobs, no deploy), or push to `main` (runs the same jobs, then the `deploy` job). `main` already contains Richard's `.gitleaksignore` fix (`20cb235`), and it has been merged into the branch (`78973e1`), so gitleaks should pass.
2. **Deploy** when CI is green: fast-forward `main` to the branch and push. The pipeline builds the image, applies Terraform, waits for ECS and smoke-tests `/api/health`. There are no Terraform changes in Phase 3.
3. **Optional, after 08:17 UTC on 23 October 2026:** remove the four `minimumReleaseAgeExclude` lines from `pnpm-workspace.yaml` (section 15.9). Not required; they are harmless.
4. **Optional follow-up:** reset scroll to the top on page navigation, a pre-existing bug (section 15.2). A ready-written task for it was suggested in the session.
5. **Optional tidy-up:** `docs/decisions.md` is now 12 lines; Phases 1 and 2 capped it at 10 (section 15.12).

### Quick start for a new Claude Code session

- Read this file, then `docs/phases/Phase 3/BRIEF.md` (the "how") and `docs/phases/Phase 3/PLAN.md` (the "what"). The working rules in `docs/phases/Phase 1/BRIEF.md` and `docs/phases/Phase 2/BRIEF.md` still apply.
- **Do not deploy, push to `main`, run `terraform apply` or touch AWS without Richard's explicit go.** Pushing to the feature branch was allowed.
- **Do not add dependencies** other than `motion` without asking. Do not change copy, layout, spacing, colours, focus order or behaviour without asking.
- The restraint rule: if a motion isn't in the catalogue (section 7), nothing moves. When in doubt, leave it still and ask.
- If you are in a fresh cloud container, section 14 explains how to get E2E tests, recordings and Lighthouse running.

---

## 2. Git state

- **Branch:** `claude/eloquent-turing-4qzu0o`, pushed to `origin`.
- **Base:** `main` at `f8cbe87` ("docs: track project plans and reference assets"), where the plan said `fa66ba4`; `main` had moved on by two code commits and one docs commit before Phase 3 started (none touched what Phase 3 changed, apart from adding the apply page's info tooltip).
- **`main` today:** `20cb235` ("fix(ci): ignore reviewed archived-site Gitleaks findings", Richard, adds `.gitleaksignore`). Merged into the branch as `78973e1`, with a merge commit (no rebase or force-push).
- **Ahead/behind:** the branch is 10 commits ahead of `origin/main` and 0 behind (11 counting this handover's commit). `main` can fast-forward.
- **Size of the Phase 3 code change:** 39 files under `apps/`, `README.md`, `docs/`, `pnpm-lock.yaml` and `pnpm-workspace.yaml`: +1,239 / −263 lines. Plus review material in `docs/phases/Phase 3/` (about 52 MB of recordings and 22 MB of screenshots; `doc/` is tracked in git since `f8cbe87`).
- The full commit list is in section 19.

---

## 3. Background: the brief and its rules

**Goal (PLAN.md):** a small, consistent set of animations so the redesign feels finished, without changing what any page says or how the flow works. Each animation must help someone notice, follow or get feedback; none may hold back content or call attention to itself.

**Rules that shaped everything:**

- A few named patterns, reused. Short and small: most moves finish in a fraction of a second over a short distance. **Only opacity and transform animate.**
- **Once, not forever.** Nothing loops, bounces or auto-plays (the existing loading pulses excepted).
- **Content first.** Every page reads correctly with animation off: with reduced motion, without JavaScript, and in tests.
- **No single animation over 600ms, and nothing still moving 1 second after it started.** No permanent `will-change`.
- **On phones (below 768px)**, sections and cards fade in place: no rise and no stagger.
- **Reduced motion:** nothing moves. Entrances and reveals show at once. State changes may crossfade for 150ms at most.
- **Server rendering:** the server's HTML is always fully visible; a reveal hides something only after hydration, and only while it is still below the screen.
- **Budgets:** home-page first-load JS grows by 10 KB gzipped at most; LCP and CLS no worse on mobile or desktop (Lighthouse, median of 3); reveals smooth at 4× CPU slowdown.
- **Out of scope:** parallax, scroll-jacking, pinned scenes, number counters, carousels, page-transition choreography, cursor effects, 3D and Lottie. No GSAP.

**Working rules from Phases 1 and 2 that still apply:** stop after each step and report in under 15 lines; ask before deploying, `terraform apply`, pushing (to `main`), adding a dependency, or changing copy, layout, spacing, colours, focus order or behaviour; check installed library versions rather than writing from memory; keep diffs focused; short docs (README and `docs/decisions.md` must each fit on one screen); no snapshot tests; no fixed sleeps in tests.

---

## 4. Decisions log

### 4.1 Questions raised before starting, and Richard's answers

The brief asked for a Step 1 plan, the exact `motion` version, a sketch of server rendering, and anything that didn't fit. These were raised, and answered as follows:

| # | Question | Answer | What was done |
| --- | --- | --- | --- |
| 1 | `doc/` is tracked in git now (brief said gitignored). Commit recordings? | Yes; Richard removed it from `.gitignore` himself and confirmed there is no PII | Recordings, screenshots and scripts are committed under `docs/phases/Phase 3/` |
| 2 | May the feature branch be pushed after each step? | Yes | Pushed after every step |
| 3 | Lighthouse isn't installed; Docker isn't running (no DynamoDB Local) | "You can run anything you want" | `npx lighthouse@13.5.0`; DynamoDB Local from AWS's jar with the container's Java (section 14) |
| 4 | Tailwind v4's `scale-*`/`translate-*` set the `scale`/`translate` properties, not `transform`; press (100ms) and colour (200ms) need per-property durations | "Go anything you want" | A `press` utility with a per-property transition list (section 6.12) |
| 5 | Existing hover and colour transitions run on Tailwind's default 150ms, not the 200ms `ease-in-out` token | "Whatever makes the site best looking" | Tailwind's `--default-transition-duration` and `--default-transition-timing-function` now point at the tokens, so every unspecified transition runs 200ms `ease-in-out` |
| 6 | Two existing motions are in neither the catalogue nor the "kept" list: the slider thumb's 110% hover scale and the info tooltip's fade-and-grow | "Whatever makes the site best looking" | Both kept as they were |
| 7 | Reduced-motion cap is 150ms, but the Help menu (200ms), step fade-in (250ms) and loading fade (200ms) are longer | "Sure" | With reduced motion all three fade over 150ms (`--motion-switch-out`) |
| 8 | The received page would run past 1 second (500ms card + 300ms gap + 300ms pop) | "Sure" | Card rises from 0s; icon pops 200ms after it lands (delay 700ms), done at 1.0s |
| 9 | 300ms (pop, progress line, pill crossfade) isn't a token | Not answered | Added `--motion-confirm: 300ms` as proposed |
| 10 | The Lemon-to-Mint pill crossfade is a colour change | "Sure" | A Lemon layer fades out over the Mint pill (opacity only); label and icon swap at once |
| 11 | Lime band shapes: toggling the CSS slide-in would flash them | "Sure" (to driving them with Motion) | Superseded by option B: they now slide in from CSS, keyed to the band's reveal, as the brief originally intended |
| 12 | Plan says reveals take 600ms; brief's tokens say sections 500, cards 600 | "Sure" (follow the brief) | Sections 500ms (`--motion-enter`), group items and photos 600ms (`--motion-settle`) |
| 13 | Minor fit notes (photo clipping frames, step slide clipping at 375px, Products 2+1 at md, tab fade only after first switch, `animationsDone` must skip looping pulses) | "Sure" | All done as described |

### 4.2 The Motion budget problem and option B (after Step 1)

After Step 1, Motion's real first-load cost on the home page was about **+17.6 KB gzipped** (budget +10 KB) and **mobile LCP was ~225ms worse**, even after deferring Motion's features until after the `load` event. The cause is in section 11.3: Rspack cannot split `motion-dom`'s large `VisualElement.mjs` module between chunks, so Motion's core lands in the first load wherever `LazyMotion` or any `m` component is used.

Two options were put to Richard:

- **A:** keep Motion for reveals and relax the budgets to about 20 KB and a small LCP cost.
- **B (recommended):** do reveals, staggers and settles in CSS, driven by one small in-view hook, and keep Motion only for the quote step transition.

**Richard chose B.** Result: home first-load JS +2.2 KB at Step 2 and +1.4 KB at the end, with LCP no worse.

### 4.3 Decisions during Steps 2 to 4

- **Focus and reveals (Step 2, found in testing):** keyboard focus inside a waiting or revealing block shows it at once; pointer focus does not (section 6.4.7). Two bugs were found and fixed on the way: focus resting on a faint card mid-stagger, and a click lost when the card jumped between mousedown and mouseup.
- **Per-element animation variables (Step 3, found in testing):** `--stage-delay` and `--pop-delay` were silently ignored because they sat inside Tailwind `--animate-*` theme values, which the browser resolves once at `:root`. Fixed by making `animate-stage-rise` and `animate-pop` `@utility` rules (section 15.4).
- **Scroll position across pages (Step 3, found while recording):** pre-existing; left alone as out of scope and queued as a separate task (section 15.2).
- **JavaScript fully off (Step 4):** with JavaScript disabled, `main` is empty, before and after Phase 3, because Modern.js streams the page into place with inline script. Richard: "normally we all have JS turned on... do what you think is best, as long as the website is all normal when rendered normally." Decision: keep streaming SSR; the E2E test blocks the app's own scripts instead (section 10.2).
- **Reveal trigger area (Step 4):** extended far above the screen so a block scrolled past before it was watched (or in one jump) counts as reached (section 6.4.5).
- **CI (Step 4):** Richard will run it himself.

---

## 5. Deviations from the brief

Every place the build differs from `docs/phases/Phase 3/BRIEF.md`, and why:

| Brief says | Built | Why |
| --- | --- | --- |
| Motion for reveals, staggers, the settle inside a reveal, and the quote step transition | Motion **only** for the quote step transition. Reveals, staggers, settles and the lime band's shapes are CSS, triggered by `motion/reveal.tsx` | Option B (section 4.2): Motion's first-load cost under Rspack broke the JS and LCP budgets |
| `LazyMotion` wraps the app once, mounted in `routes/layout.tsx` | `MotionProvider` (still `LazyMotion` strict + async `domAnimation` + `MotionConfig reducedMotion="user"`) wraps only `StepTransition`, so only the quote page loads Motion | Same; `routes/layout.tsx` is back to its pre-Phase 3 content |
| `useReducedMotion()` from Motion where the reduced version differs | Motion's hook is used in `StepTransition`; reveals use their own `matchMedia` hook | Reveals no longer use Motion |
| `motion/tokens.ts` mirrors all tokens | Mirrors only what Motion uses (durations and easings) | The rest (stagger, rise, nudge) is used only by CSS; keeping dead exports would add code with no user |
| Durations: Switch 250/150ms, Help menu 200ms, loading fade 200ms | With reduced motion, all of these are 150ms | The brief's own reduced-motion cap is 150ms (agreed, item 7) |
| Received icon pops 300ms after the card lands | Card starts at 0s (no 0.2s delay); icon pops 200ms after it lands (700ms delay) | The 1-second limit (agreed, item 8) |
| No 300ms token | `--motion-confirm: 300ms` added | Used by the pop, the progress line fill and the pill crossfade (item 9) |
| E2E: "With JavaScript off (`javaScriptEnabled: false`), every section is visible" | The test blocks `**/static/js/**` (the app's own scripts) instead | With JavaScript fully off, Modern.js's streamed content never leaves its hidden container (section 15.1). Richard's call (section 4.3) |
| `docs/decisions.md` line: "Motion for scroll reveals and the quote steps, CSS for everything else; no GSAP…" | "Motion for the quote steps, CSS for everything else, reveals included; no GSAP, because there are no timelines or scroll scenes to justify it." | Matches option B |
| `docs/decisions.md`: two more lines | Done, so it is now 12 lines | Phases 1 and 2 said 10 lines at most; the Phase 3 brief only says "fits on one screen" (section 15.12) |
| Hover and colour transitions "stay as they are" | Retimed from Tailwind's default 150ms to the 200ms `ease-in-out` token, site-wide | Richard: "whatever makes the site best looking" (item 5); also satisfies "every animation uses the tokens" |
| Record every step | Steps 1 to 3 recorded; Step 4 not recorded | Step 4 changed nothing visible (lab deleted, tests, docs, one trigger constant) |
| Lime band shapes via Motion (agreed item 11) | CSS keyed to the band's reveal (`[data-reveal-shapes]`) | Option B made the CSS route clean; this is what the brief originally asked for |

---

## 6. Architecture of the motion system

### 6.1 Overview

```
styles/globals.css
  ├─ tokens (:root --motion-*, @theme --ease-*), Tailwind transition defaults → 200ms ease-in-out
  ├─ keyframes: reveal, stage-rise, stage-media-settle, pop, switch-fade, tab-text-rise
  │             (+ the pre-existing stage-shape-slide-in, unchanged)
  ├─ utilities: animate-stage-rise, animate-pop, press, nudge
  └─ component rules: [data-reveal…] states, [data-switched] tab panels

motion/reveal.tsx  ── decides WHEN (hydration, below-the-screen check, one IntersectionObserver,
                      focus, completion). Renders plain elements with data attributes; CSS animates.
motion/loaded.tsx  ── fades content in when it replaces a loading panel (tw-animate-css classes)
motion/step-transition.tsx + motion-provider.tsx + features.ts + tokens.ts
                   ── the only Motion code: the quote steps' cross-fade and slide
```

Everything that plays on load (hero, flow-page band, received and 404 cards) is **pure CSS** and needs nothing but the stylesheet. Reveals need JavaScript to *hide* anything, so without the app's JavaScript nothing is ever hidden. Motion is loaded **only on the quote page**, and its features chunk only after the `load` event.

### 6.2 Tokens

Defined in `apps/web/src/styles/globals.css`. Easings live in Tailwind's `--ease-*` theme namespace (so `ease-entrance` and `ease-state` utilities exist); the rest are plain custom properties on `:root`.

| Token | Value | Used for | Mirrored in `motion/tokens.ts` |
| --- | --- | --- | --- |
| `--ease-entrance` | `cubic-bezier(0, 0, 0, 1)` | Every entrance and reveal (zurich.com.au's curve) | `ease.entrance` `[0, 0, 0, 1]` |
| `--ease-state` | `ease-in-out` | Hover, colour and state changes; also Tailwind's default transition easing | `ease.state` `[0.42, 0, 0.58, 1]` |
| `--ease-sheet-in`, `--ease-sheet-out` | unchanged (pre-existing) | Sheets and the dialog | no |
| `--motion-press` | 100ms | A button being pressed | `duration.press` |
| `--motion-state` | 200ms | Hover, colour, state changes, the Help menu, loading fade; Tailwind's default transition duration | `duration.state` |
| `--motion-switch-in` | 250ms | Tab panels and quote steps fading in | `duration.switchIn` |
| `--motion-switch-out` | 150ms | Fading out; every reduced-motion fade | `duration.switchOut` |
| `--motion-enter` | 500ms | Stage entrance and section reveals | `duration.enter` |
| `--motion-settle` | 600ms | Group items, photo settles, the article hover zoom | `duration.settle` |
| `--motion-confirm` | 300ms | Pop, progress line fill, pill crossfade (**added**, not in the brief) | `duration.confirm` |
| `--motion-stagger` | 120ms | Each group item after the one before | no (CSS only) |
| `--motion-rise` | 32px | How far sections and cards rise | no (CSS only) |
| `--motion-nudge` | 4px | Arrows on hover | no (CSS only) |

`apps/web/tests/motion-tokens.test.ts` fails if the CSS and TypeScript values drift, if any duration exceeds 600ms, or if a three-item stagger plus a settle (`3 × 120 + 600 = 960ms`) reaches 1 second.

Tailwind's `--default-transition-duration: var(--motion-state)` and `--default-transition-timing-function: var(--ease-state)` (in `@theme`) mean every `transition-*` utility without its own duration or easing runs 200ms `ease-in-out`. That retimed the pre-existing colour/shadow transitions (buttons, tabs, inputs, selects, checkboxes, radios, the chooser card), the chevrons, the slider thumb and the chooser's arrow nudge from 150ms to 200ms.

Values used in only one place live in their keyframes or components, as the brief asks: hero rises 64/30/24px (as `--stage-rise` overrides on the elements), photo settle 1.06, hover zoom 1.04, tab text rise 8px, step slide 24px (`SLIDE` in `step-transition.tsx`), pop 0.6 → 1.08 → 1.

### 6.3 Keyframes and utilities (`globals.css`)

| Name | Kind | What it does |
| --- | --- | --- |
| `reveal` | keyframe | From opacity 0 and `translateY(var(--reveal-rise))` to the element's own values |
| `stage-rise` | keyframe | From `opacity: var(--stage-opacity, 0)` and `translateY(var(--stage-rise, var(--motion-rise)))` |
| `stage-media-settle` | keyframe + theme `--animate-stage-media-settle` | From `scale(1.06)`, no opacity change; 600ms entrance ease |
| `pop` | keyframe | `scale(0.6)` → `scale(1.08)` at 60% → own value (8% overshoot) |
| `switch-fade`, `tab-text-rise` | keyframes | From opacity 0; from `translateY(8px)` |
| `stage-shape-slide-in` | keyframe + theme (pre-existing, **unchanged**) | Shapes fade in sliding 72px from the left, 500ms from 0.1s |
| `animate-stage-rise` | `@utility` | `stage-rise var(--motion-enter) var(--ease-entrance) var(--stage-delay, 0.2s) both` |
| `animate-pop` | `@utility` | `pop var(--motion-confirm) var(--ease-entrance) var(--pop-delay, 0s) both` |
| `press` | `@utility` | Transition list `color, background-color, box-shadow, scale` at 200/200/200/100ms; `scale: 0.98` on `:active` (motion-safe) |
| `nudge` | `@utility` | `i[icon='arrow-right:line']` moves 4px right and `arrow-left` 4px left on hover (hover-capable devices, motion-safe) |

The new keyframes are top-level (not inside `@theme`) so Tailwind always emits them. `animate-stage-rise` and `animate-pop` are `@utility` rules rather than `--animate-*` theme values on purpose (section 15.4).

### 6.4 Reveals: `apps/web/src/motion/reveal.tsx`

**Exports:** `Reveal`, `RevealGroup`, `RevealItem`, `Settle`.

#### 6.4.1 Phases and attributes

Each `Reveal` and each `RevealItem` inside a group is a `RevealElement` with a phase:

| Phase | Meaning | `data-reveal` | `data-revealing` | Looks |
| --- | --- | --- | --- | --- |
| `still` | Server HTML; also anything on screen or above it at hydration | `shown` | — | As without motion |
| `hidden` | Was entirely below the screen when checked; waiting | `hidden` | — | Transparent, 32px low (in place below md) |
| `revealing` | Triggered; CSS animation running | `hidden` | present | Animating in |
| `shown` | All its animations (and its parts') finished | `shown` | — | As without motion |

`data-reveal` stays `hidden` until the reveal has **finished**, so a test waiting for `shown` never checks contrast on half-transparent text. Other attributes: `data-reveal-parts` (only marked children move), `data-reveal-item` (600ms instead of 500ms), and an inline `style="--reveal-index: n"` set **only while revealing in a group** (never on the server).

#### 6.4.2 Server rendering and hydration

- On the server and during hydration, every reveal renders the same element and classes the page had before Phase 3, plus `data-reveal="shown"`. No inline styles. `src/motion/reveal.test.tsx` checks this with `renderToString`.
- `useHydrated()` (`lib/use-hydrated.ts`, `useSyncExternalStore` with a `false` server snapshot) and an own `useReducedMotion()` (`matchMedia`, `false` server snapshot) gate everything.
- After hydration, a layout effect measures once: `getBoundingClientRect().top >= innerHeight` means entirely below the screen, so the phase becomes `hidden`. **Anything on screen or above is never touched**, so nothing visible flickers. On client-side navigation (not hydration) the same check runs before first paint.
- If the app's JavaScript never arrives, hydration never happens and nothing is ever hidden. CSS stage entrances still play from the stylesheet.

#### 6.4.3 CSS states (`@layer components` in `globals.css`)

- `[data-reveal]` sets `--reveal-rise: 0px` and `--reveal-duration: var(--motion-enter)`; from `width >= 48rem` (md) `--reveal-rise: var(--motion-rise)` (32px). `[data-reveal-item]` sets `--reveal-duration: var(--motion-settle)`.
- **Inside `@media screen and (prefers-reduced-motion: no-preference)` only:**
  - Hidden: `[data-reveal='hidden']:not([data-reveal-parts])` and `[data-reveal='hidden'] [data-reveal-part]` get `opacity: 0; transform: translateY(var(--reveal-rise))`; `[data-settle]` children get `scale(1.06)`; `[data-reveal-shapes]` children get `opacity: 0`.
  - Revealing: the same targets get `animation: reveal var(--reveal-duration) var(--ease-entrance) calc(var(--reveal-index, 0) * var(--motion-stagger)) both`; `[data-settle]` gets `stage-media-settle`; `[data-reveal-shapes]` gets `stage-shape-slide-in`.
- So **with reduced motion, or when printing, nothing is hidden or animated**, even if the phase says `hidden` (for example if someone switches reduced motion on mid-session).

#### 6.4.4 Groups and staggers

- `RevealGroup` (renders the existing `section`/`div`; never fades itself, so a coloured band stays put) provides context `{ stagger: wide, triggered }`.
- **From md:** the group watches itself; when 10% of the group is reached, `triggered` becomes true, and every item still `hidden` starts revealing with `--reveal-index` = its `index` → delay `index × 120ms`. Index 0 is the heading.
- **Below md:** each item watches itself and reveals on its own, with no delay and no rise (fade only).
- `RevealItem` outside a group renders a plain element (inert). That's why `ProductCard` and `ArticleCard` can always render a `RevealItem` (`as="article"`, so a card in a grid gets no extra box).

#### 6.4.5 The trigger (one shared observer)

- One module-level `IntersectionObserver` for every reveal and group: `threshold: 0.1`, `rootMargin: '100000px 0px -10% 0px'`. Callbacks are stored per element in a `WeakMap`; each element is unobserved after it first enters. No scroll listeners.
- zurich.com.au's trigger is "10% on screen, ignoring the bottom tenth" (`threshold 0.1`, `rootMargin '0px 0px -10% 0px'`, from its `182-01a4ac0de0fb5e11.js`). The huge top margin keeps that for anything arriving from below, and also counts a block **already scrolled past** as reached (one jump, or a slow phone where the observer started after the page had scrolled). Without it, such a block would wait until scrolled back to.
- Observers are only attached to `hidden` elements (and to groups from md), after hydration, without reduced motion.

#### 6.4.6 Completion

When a reveal starts, an effect calls `element.getAnimations({ subtree: true })` (which flushes style, so the just-applied CSS animations are included), filters out infinite ones, and waits for every `finished` promise (rejections ignored). Then the phase becomes `shown`. If nothing animates, it becomes `shown` immediately, which fails safe.

#### 6.4.7 Focus

- If something inside a `hidden` or `revealing` block takes focus **and the focused element matches `:focus-visible`** (keyboard, or script), the block jumps straight to `shown`, so focus never rests on something faint or moving.
- Focus from a pointer click (not `:focus-visible`) leaves it alone, so nothing jumps from under the pointer between mousedown and mouseup. Without this, a click on a card in the middle of its reveal was lost: Playwright's "Income Protection card" test caught it.
- Verified: tabbing through the whole home page at 1440 (40 focus stops inside reveals) and 375 (58 stops), every stop is fully shown.

#### 6.4.8 Parts, settle and shapes

- `<Reveal parts>` sets `data-reveal-parts`: the element itself doesn't fade; only descendants marked `data-reveal-part` fade and rise. Used by the lime band so the lime background stays put while the text comes in.
- `Settle` renders `<div data-settle>`: a photo inside a revealing block scales 1.06 → 1 over 600ms, no fade. Its frame must clip it (`overflow-hidden`; frames also carry `isolate`, which helps Safari clip transformed children to rounded corners).
- `data-reveal-shapes` on a wrapper: the band's shapes are transparent while waiting and slide in with `stage-shape-slide-in` (72px, 500ms from 0.1s) as the band reveals.

### 6.5 Loading to content: `apps/web/src/motion/loaded.tsx`

- `useWasLoading(loading)` remembers (via `useState`'s initial value) whether a loading panel was showing when the component mounted.
- `<Loaded fade={wasLoading}>` wraps the content that replaces a loading panel in a `div` with `animate-in fade-in duration-(--motion-state) ease-entrance motion-reduce:duration-(--motion-switch-out)` (tw-animate-css). Content that was ready from the start (cached data on a later client-side visit) gets no class and just appears.
- Used in: `routes/quote/page.tsx` (the step content, around `StepTransition`), `routes/apply/page.tsx` (the "you need a quote" message and the form), `session/require-session.tsx` (the signed-out message), `routes/policies/page.tsx` (error, empty message or list). A loading panel replacing a loading panel doesn't fade.

### 6.6 Quote steps (the only Motion): `motion/step-transition.tsx`, `motion-provider.tsx`, `features.ts`, `tokens.ts`

- **Library:** `motion@14.6.0`, pinned exactly in `apps/web/package.json`. It brings `framer-motion`, `motion-dom` and `motion-utils` 14.6.0 into the lockfile as its own dependencies; the app imports only from `motion/react` and `motion/react-m`.
- **`MotionProvider`:** `LazyMotion` with `strict` (so `motion.*` components throw; only `m.*` is allowed) and `features` = a function that waits for the window `load` event, then `import('./features')` (which re-exports `domAnimation`). Inside it, `MotionConfig reducedMotion="user"` with a default transition of `--ease-entrance` over 500ms. Until the features arrive, a step change happens instantly.
- **`StepTransition`:** wraps its children in `MotionProvider` → `AnimatePresence mode="wait" initial={false}` → `m.div key={step}`.
  - Forward (higher step): the old step fades out over 150ms (`ease-in-out`), then the new one fades in over 250ms (entrance ease) sliding from 24px right. Back: from 24px left. Direction is derived from the previous step with the "state from previous render" pattern.
  - The first step shown doesn't animate (`initial={false}`). The slide's final transform is cleared (`transitionEnd`).
  - With reduced motion (Motion's `useReducedMotion()`), both directions only fade, 150ms each.
  - The `m.div` has `overflow-clip [overflow-clip-margin:1rem]`, so the 24px slide never widens the page at 375px while focus rings (up to 1rem outside) still show.
- **In the quote page:** the heading lives in the band, outside the transition, so the existing effect that scrolls to the top and focuses the heading on every step change runs exactly as before (verified forward and back; covered by an E2E test).
- Motion's opacity and transform animations run through the browser's animation API, so they appear in `getAnimations()` and the E2E helpers wait for them.

### 6.7 Cover tabs switch

- `components/ui/tabs.tsx`: `Tabs` keeps a `switched` state, set on the first `onValueChange`, and renders `data-switched` on the Radix root.
- CSS: `[data-switched] [data-slot='tabs-content'][data-state='active']` animates `switch-fade` over 250ms (entrance ease); its `[data-slot='tab-text']` child rises 8px (`tab-text-rise`, motion-safe only). With reduced motion the panel only fades, over 150ms.
- The first panel never fades on load. The old panel disappears at once. The one-cell grid, `forceMount`, `invisible` and below-md `hidden` are untouched, so the section's height and accessibility are unchanged.
- `home/cover-tabs.tsx` marks each panel's text block `data-slot="tab-text"`.

### 6.8 Help & information menu

`components/site/site-header.tsx`, on `NavigationMenu.Content` (Radix keeps it mounted for the exit animation): `data-open:animate-in fade-in ease-entrance`, `motion-safe:data-open:slide-in-from-top-2 duration-(--motion-state)` (fades in dropping 8px over 200ms), `motion-reduce:data-open:duration-(--motion-switch-out)` (fade only, 150ms), `data-closed:animate-out fade-out duration-(--motion-switch-out) ease-state` (fades out over 150ms). The chevron's existing rotate is kept.

### 6.9 Quote progress: `quote/quote-progress.tsx`

- The line between steps is now a track (`bg-white/40`, `overflow-hidden`) with a fill (`origin-left bg-white`) that is `scale-x-0` or `scale-x-100`. Only the filled state carries `motion-safe:transition-[scale] duration-(--motion-confirm) ease-entrance`, so the line fills from the left over 300ms when a step is completed and empties at once going back. On first render nothing animates.
- A `{ step, doneFrom }` state (updated during render when `step` changes) records the first step that has just become done. Only those ticks get `motion-safe:animate-pop`. Arriving on a step (page load, refresh, redirect) or going back pops nothing.

### 6.10 Policy status pill: `policies/policy-card.tsx`, `routes/policies/page.tsx`

- The page's existing announcement hook became `useActivations(policies)`. It still keeps the previous statuses in a ref and announces "Your policy … is now active." once, and now also collects the IDs of policies that went from `PROCESSING` to `ACTIVE` while the page was open. It runs as a **layout** effect so the pill never paints one frame of plain Mint before its crossfade.
- `PolicyCard` takes `justActivated`. When true, an `aria-hidden` Lemon layer (`absolute inset-0 -z-10` inside an `isolate overflow-hidden` pill) fades out over 300ms (`animate-out fade-out`, fill forwards), and the tick pops. The label swaps at once. With reduced motion the layer isn't rendered and nothing moves. Policies already active when the page loads never pop.

### 6.11 Stage entrances (CSS, on load)

| Where | What |
| --- | --- |
| `home/hero.tsx` | Photo in a new clipping frame (`isolate overflow-hidden md:-mb-16 md:rounded-promo`; the overhang and corners moved from the `img` to the frame) settles with `stage-media-settle` over 600ms from 0s; **its opacity never changes** (it's the LCP element on desktop and mobile). Headline: `[--stage-opacity:0.1] [--stage-rise:64px] motion-safe:animate-stage-rise`. Bullets: `[--stage-rise:30px]`. A new wrapper `div` around the Get a quote button rises 24px (so the button's own press dip doesn't fight it). All three 500ms from 0.2s. Shapes unchanged. Phones get the same entrance. Done by 0.7s |
| `components/page-band.tsx` | The text column gets `motion-safe:*:animate-stage-rise [&>h1]:[--stage-opacity:0.1]`: each direct child (progress, heading, lead) rises 32px over 500ms from 0.2s, the heading from 10% opacity. Plays when the band mounts, not on quote step changes (the band stays mounted) |
| `components/promo-card.tsx` with `stage` | Received and 404 pages: the whole card rises 32px and fades in over 500ms from **0s** (`[--stage-delay:0s]`) |
| `routes/apply/received/page.tsx` | The icon circle pops with `[--pop-delay:700ms] motion-safe:animate-pop` (200ms after the card lands, done at 1.0s) |

### 6.12 Hover and press

- **Buttons** (`components/ui/button.tsx`): the base class's `transition-[color,background-color,box-shadow]` became `press nudge`. Every button (including `asChild` links) dips to 98% while pressed (100ms), colours keep 200ms, and an arrow-right icon nudges 4px right on hover; arrow-left (the Back button) nudges 4px left. Sizes, colours and shadows unchanged.
- **Article cards** (`components/article-card.tsx`): the photo's frame (`relative isolate overflow-hidden rounded-card`; corners moved from the `img`) clips the photo, which eases to `scale-104` on card hover (`transition-[scale] duration-(--motion-settle) ease-entrance motion-safe:group-hover:scale-104`). The tag stays on top and doesn't scale.
- The quote chooser cards' existing nudge and shadow are unchanged apart from the 200ms retiming.

---

## 7. The catalogue, mapped to the code

| # | Motion | Where | Mechanism | Reduced motion |
| --- | --- | --- | --- | --- |
| 1 | Stage entrance | Home hero; band on quote, apply and My policies; received and 404 cards | CSS on load (`animate-stage-rise`, `stage-media-settle`, existing shapes slide) | Everything in place at once (`motion-safe:`) |
| 2 | Reveal | Intro statement, lime band text, cover tabs section, Talk to us and Home loan cards, offer terms | `Reveal` + CSS | Never hidden |
| 3 | Stagger | Products (heading + 3 cards), Benefits (heading + 3), Articles (heading + 3 cards + Education hub button with the last card) | `RevealGroup` / `RevealItem` + CSS; md and up only | Never hidden |
| 4 | Settle | Lime band's round photo and shapes; promo cards' photos | `Settle` / `data-reveal-shapes` inside a reveal | No movement |
| 5 | Hover and press | Every button; article cards; quote chooser cards (existing) | `press`, `nudge` utilities; `group-hover:scale-104` | Colour and shadow only |
| 6 | Switch | Cover tabs; quote steps; loading → content; Help menu | CSS `[data-switched]`; Motion `StepTransition`; `Loaded`; tw-animate on Radix states | Opacity only, 150ms |
| 7 | Confirm | Quote progress; My policies pill; received icon | CSS `animate-pop`, scaled fill, Lemon layer | Instant swap |

Motion map (`docs/phases/Phase 3/motion-map.png`): header, footer and demo strip still; no block has more than three motions.

---

## 8. What deliberately does not move

- The header, footer and demo strip (the Help menu panel aside).
- Form fields, labels, hints and error messages (errors appear at once).
- Text inside a paragraph (no letter or word effects); numbers and prices (no counting up).
- Anything tied to scroll position (no parallax, no scroll listeners); moving between pages; focus rings.
- The hero photo's opacity.
- **Kept as they were (pre-existing):** the sheets (quote chooser, mobile menu), the sign-in dialog, the accordions (offer terms, mobile footer), the chevrons, the loading and Processing pulses, the slider thumb's hover scale, and the apply page's info tooltip fade-and-grow. All are behind `motion-safe:` or `motion-reduce` handling already; the last two were explicitly kept at Richard's say (item 6).

---

## 9. Every file changed

All paths under `apps/web/` unless stated.

**New**

| File | Purpose |
| --- | --- |
| `src/motion/reveal.tsx` | Reveal, RevealGroup, RevealItem, Settle; the shared observer; phases; focus rules (section 6.4) |
| `src/motion/loaded.tsx` | `useWasLoading`, `Loaded` (section 6.5) |
| `src/motion/step-transition.tsx` | The quote steps' Motion transition (section 6.6) |
| `src/motion/motion-provider.tsx` | `LazyMotion` strict + features after `load` + `MotionConfig` |
| `src/motion/features.ts` | Re-exports `domAnimation` for the lazy chunk |
| `src/motion/tokens.ts` | Durations and easings for Motion |
| `src/motion/reveal.test.tsx` | Server render of reveals has no opacity/transform/inline styles |
| `tests/motion-tokens.test.ts` | CSS ↔ TS tokens in step; ≤600ms; stagger inside 1s |
| `e2e/motion.spec.ts` | Four new E2E tests (section 10.2) |

**Changed**

| File | Change |
| --- | --- |
| `src/styles/globals.css` | Tokens, transition defaults, keyframes, utilities, reveal and tab-switch rules |
| `src/components/ui/button.tsx` | `press nudge` instead of the colour/shadow transition list |
| `src/components/ui/tabs.tsx` | `data-switched` after the first change |
| `src/components/site/site-header.tsx` | Help panel in/out animation classes |
| `src/components/page-band.tsx` | Stage entrance on the band's text |
| `src/components/promo-card.tsx` | `stage` prop; photo cell `overflow-hidden` + `Settle` |
| `src/components/product-card.tsx` | Renders `RevealItem as="article"`; `revealIndex` prop |
| `src/components/article-card.tsx` | `RevealItem as="article"`; `revealIndex`; clipping frame and hover zoom |
| `src/home/hero.tsx` | Stage entrance; photo frame; button wrapper |
| `src/home/brand-band.tsx` | `IntroStatement` in a `Reveal`; `BrandBand` as `Reveal parts` with text part, shapes wrapper and settling photo in a round frame |
| `src/home/products.tsx`, `benefits.tsx`, `articles.tsx` | `RevealGroup` with indexed items |
| `src/home/cover-tabs.tsx` | Section is a `Reveal`; text block `data-slot="tab-text"` |
| `src/home/promos.tsx` | Both sections are `Reveal`s |
| `src/home/offer-terms.tsx` | Wrapped in a `Reveal` (the diff is large only because of re-indentation) |
| `src/quote/quote-progress.tsx` | Track and fill; pop for steps just done |
| `src/routes/quote/page.tsx` | `Loaded` + `StepTransition` around the step content |
| `src/routes/apply/page.tsx` | `Loaded` around the message and form (diff mostly re-indentation) |
| `src/routes/apply/received/page.tsx` | `stage` cards; icon pop at 700ms |
| `src/routes/$.tsx` | `stage` card |
| `src/routes/policies/page.tsx` | `useActivations` (layout effect, activated IDs); `Loaded` |
| `src/policies/policy-card.tsx` | `justActivated`: Lemon layer and tick pop |
| `src/session/require-session.tsx` | `Loaded` around the signed-out message |
| `e2e/helpers.ts` | Axe waits for reveals and animations; `revealAll`; looping animations skipped |
| `package.json` | `"motion": "14.6.0"` |
| `../../pnpm-lock.yaml` | Motion and its three packages |
| `../../pnpm-workspace.yaml` | `minimumReleaseAgeExclude` for the four day-old packages (added by pnpm itself) |
| `../../README.md` | "apps/web/src/motion: animation tokens and building blocks" under "Where things are" |
| `../../docs/decisions.md` | Two lines (section 5) |

**Unchanged on purpose:** `src/routes/layout.tsx` (Motion was mounted there in Step 1 and removed again with option B), all back-end, Terraform and pipeline files. **Deleted:** `src/routes/motion-lab/page.tsx` (the temporary lab).

---

## 10. Tests

### 10.1 Unit (Vitest)

- `src/motion/reveal.test.tsx`: `renderToString` of a `Reveal` (with a `Settle`) and a `RevealGroup` with two items: exactly three `data-reveal="shown"`, and no `opacity`, `transform`, `style=` or `data-revealing` anywhere.
- `tests/motion-tokens.test.ts`: tokens match between `globals.css` and `tokens.ts`; every duration ≤ 0.6s; `3 × stagger + settle < 1s`.
- Totals: web 75 (72 before Phase 3), policy-issuer 4.

### 10.2 E2E (Playwright, `e2e/motion.spec.ts`)

| Test | How it works |
| --- | --- |
| When the app's JavaScript never arrives, every home-page section is visible | `page.route('**/static/js/**', abort)`. Hero heading visible and ends at opacity 1 (its CSS entrance still plays); every `h2` visible; every `section` and `[data-reveal]` at opacity 1; no `[data-reveal="hidden"]`. See section 15.1 for why not `javaScriptEnabled: false` |
| After scrolling to the end, every reveal has shown | Asserts something is waiting first (motion on), scrolls half a screen at a time letting two frames render at each step (`scrollThrough`), then: no `hidden` reveals, animations done, and **no element in `main` with opacity below 1** |
| With reduced motion, the hero is in place at once and nothing waits | `emulateMedia({ reducedMotion: 'reduce' })`; an init script's `MutationObserver` records if any reveal is **ever** hidden; hero `h1` and bullets read `opacity 1, transform none` straight after load; scroll through; flag still false; nothing faint |
| With motion on, each quote step moves focus to its heading, forward and back | 1 → 2 → 1 → 2 → 3 → 2 (Change cover), asserting `toBeFocused()` on each step's `h1` |

Stability: the four new tests passed 20 of 20 runs (`--repeat-each=5`), and the whole suite 44 of 44 (`--repeat-each=2`).

### 10.3 Helper changes (`e2e/helpers.ts`)

- `expectNoSeriousAxeViolations(page)` now calls `revealAll(page)` and `animationsDone(page.locator('body'))` before analysing, so axe checks contrast on a settled page.
- `revealAll(page)`: if any reveal is waiting and no dialog is open, scrolls through the page in half-screen steps (50ms each), then restores the scroll position. Skipped while a dialog is open (the page behind can't scroll, and waiting reveals are fully transparent, which axe ignores).
- `animationsDone(locator)`: waits for every **finite** animation's `finished` (rejections ignored; the loading and Processing pulses loop forever and would hang it), then for every `[data-reveal="hidden"]` in the trigger area (above the bottom tenth of the screen) to become `shown`.

### 10.4 Pre-existing tests

All 18 pre-existing E2E tests pass with motion on, including the journey (quote → sign in → apply → Processing → Active), the referral and MuleSoft-failure paths, the cover tabs keyboard test, the chooser presets, Help menu, mobile menu and footer accordions, every axe check, the CLS test (< 0.05) and the 375px no-sideways-scroll test.

---

## 11. Performance

### 11.1 Method

- Production build (`pnpm build`), served from `.output` on port 8090 with the E2E environment (section 14.3).
- `docs/phases/Phase 3/recordings/measure.mjs <label>`: loads `/` at 1440×900 in Chromium and gzips (level 9) every script response, split into before and after the `load` event; then Lighthouse 13.5.0 (`npx`), performance only, 3 runs each mobile (default, simulated throttling) and desktop (`--preset=desktop`), medians. Results in `docs/phases/Phase 3/recordings/measurements-<label>.json`, including per-run values and the LCP element.
- **These numbers come from the cloud container's Chromium 141; they compare only with each other**, not with a laptop or production.

### 11.2 Results

| | Baseline (before Phase 3) | Step 1 (Motion everywhere) | Step 2 (option B) | **Final** | Budget |
| --- | --- | --- | --- | --- | --- |
| Home first-load JS (gzip) | 269.37 KB | 286.92 KB + 19.13 KB after load | 271.57 KB | **270.77 KB (+1.40)** | +10 KB |
| Mobile LCP | 6,395ms | 6,620ms | 6,322ms | **6,340ms** | no worse |
| Mobile CLS | 0.006 | 0.006 | 0.003 | **0.003** | no worse |
| Mobile TBT | 400ms | 436ms | 347ms | **426ms** (runs 402/426/497; baseline 487/400/386) | — |
| Desktop LCP | 1,388ms | 1,455ms | 1,381ms | **1,382ms** | no worse |
| Desktop CLS | 0.003 | 0.003 | 0.002 | **0.002** | no worse |
| Desktop TBT | 24ms | 27ms | 9ms | **12ms** | — |
| LCP element | hero `img` | hero `img` | hero `img` | **hero `img`** (mobile and desktop) | not transparent |

The Step 1 figures include the temporary lab's chunk-splitting overhead. Before Motion's features were deferred to after `load`, Step 1 measured 306 KB of JS, mobile LCP 6,705ms and TBT 484ms. Mobile TBT varies between runs by more than the final difference.

### 11.3 Why Motion cost so much (the option B evidence)

- Motion's docs suggest about 5 KB at first render with `LazyMotion` and `m`. Bundled alone with esbuild, the pieces measured (gzip): `LazyMotion` + `MotionConfig` 0.85 KB; four `m` elements 5.35 KB; plus `useReducedMotion` 5.77 KB; plus `AnimatePresence` 7.72 KB; `domAnimation` features 27.68 KB.
- In this app's Rspack build, the entry chunk gained about **29 KB raw of `motion-dom`** (≈ 10 KB gzip), led by `render/VisualElement.mjs` and its graph (values, keyframe resolver, colour types, frame loop). `LazyMotion` imports `setFeatureDefinitions`, and every `m` component imports `getFeatureDefinitions`, both from `VisualElement.mjs`. Rspack places whole modules, so the `VisualElement` class (needed later by the features chunk) went to the first load with them. esbuild drops unused statements inside a module, which is why its numbers looked small.
- Without the lab, steady-state Step 1 would have been about +16.9 KB first-load (entry +10.9, `m` runtime chunk +4.7, page +0.9, index +0.3).
- With option B, Motion lives only in async chunks that the quote page loads; the home page's first load is back to the baseline vendor chunk plus about 1.4 KB of reveal code and CSS.

### 11.4 Smoothness at 4× CPU slowdown

Measured with CDP `Emulation.setCPUThrottlingRate`, at 1440×900, **after hydration** (waiting for a reveal to be hidden), scrolling the home page 150px every two frames, recording `requestAnimationFrame` gaps and long tasks:

| | Frames | p50 | p95 | Max | Long tasks | All reveals shown after scroll ends |
| --- | --- | --- | --- | --- | --- | --- |
| 1× CPU | 73 | 16.7ms | 16.8ms | 16.8ms | none | 532ms |
| 4× CPU | 73 | 16.7ms | 16.7ms | 33.3ms | none | 546ms |
| 1× CPU (re-run for this handover) | 73 | 16.7ms | 16.7ms | 16.8ms | none | 540ms |
| 4× CPU (re-run for this handover) | 73 | 16.7ms | 16.8ms | 33.3ms | none | 525ms |

At 60 frames a second, 16.7ms is every frame on time; 33.3ms is one dropped frame. The "shown after" times are about one 500ms section reveal: the last blocks (the Home loan card, then the offer terms) come into view as the scroll ends, so the time is mostly their animation playing, not waiting.

Reveals animate only opacity and transform, which the browser composites. The only long task seen at 4× (≈170–190ms) is hydration, when measured from page load; it predates Phase 3.

The script (`cpu4x.mjs`) lived in the session's scratchpad, not the repo. To repeat it: in Playwright, for each rate, open a 1440×900 page, call `Emulation.setCPUThrottlingRate` through a CDP session, load `/`, wait for `[data-reveal="hidden"]` to exist (hydration done), then in the page scroll by 150px every two `requestAnimationFrame`s to the end while recording frame gaps and `longtask` entries, and finally time how long until no `[data-reveal="hidden"]` remains.

---

## 12. Other verification done

- Server HTML of the home page: 19 reveals, all `data-reveal="shown"`, no inline opacity/transform styles. Diffed against the baseline HTML: only the expected markup differences (photo frames, wrappers, data attributes).
- Reveal states before and after scrolling, at 1440 and 375, motion on and reduced: the intro statement (on screen at 1440) is never touched; everything below waits hidden (32px low at 1440; opacity only at 375); after scrolling everything is `shown` with no transform left on it; with reduced motion nothing is ever hidden; no console errors or hydration warnings.
- Animation timings read back with `getAnimations()`: hero text 500ms from 0.2s, photo 600ms from 0s; band text 500ms from 0.2s; 404 card 500ms from 0s; received card from 0s and icon pop 300ms from 700ms; quote steps exit 150ms opacity, enter 250ms opacity + transform; reduced motion 150ms opacity only both ways; Help menu 200ms in, 150ms out (reduced 150ms); progress fill 300ms; tab panel 250ms + text rise only after a switch.
- Focus: heading focused and page at the top after every quote step, forward and back, with motion on and reduced.
- Article hover: photo `scale` 1.04 on hover, tag unscaled. Buttons: transition list `color, background-color, box-shadow, scale` at `0.2s, 0.2s, 0.2s, 0.1s`.
- Reviewed contact sheets of every recording frame by frame (hero entrance, stagger order, band, tabs, steps, pill crossfade, received pop, reduced motion fully static).

---

## 13. Review material: recordings, screenshots and scripts

All under `docs/phases/Phase 3/` (tracked in git).

### 13.1 Recordings (`recordings/`, about 52 MB)

Each take exists as `.webm` (VP9, re-encoded at CRF 34 to about a quarter of Playwright's near-lossless output) and `.mp4` (H.264, for QuickTime).

| Step | Takes | What they show |
| --- | --- | --- |
| 1 | `step1-motion-lab-{1440,375}[-reduced]` | The temporary lab (now deleted): all seven motions side by side |
| 2 | `step2-home-{1440,375}[-reduced]` | Home page scrolled top to bottom, a button press, an article hover (1440) |
| 3 | `step3-journey-{1440,375}[-reduced]` | Home (tab switch, Help menu at 1440), chooser, quote steps 1 → 2 → 1 → 2 → 3, sign in, apply, received, My policies until Active |

### 13.2 Screenshots (`screenshots/`, about 22 MB)

- Step 1 and 2: full-page final state of the lab and home page, each width, motion on and reduced.
- Step 3: viewport screenshots of `home`, `quote`, `apply`, `received` and `policies`, each width, motion on and reduced.

### 13.3 Scripts

- **`recordings/measure.mjs <label> [baseUrl]`**: the performance method in section 11.1. Uses the web app's Playwright and `npx lighthouse@13.5.0`; set `CHROME_PATH` if Chromium isn't at `/opt/pw-browsers/chromium`.
- **`recordings/record.mjs <step> [baseUrl]`**: records the scenes for a step at 1440×900 and 375×812 (and reduced where listed), re-encodes, writes screenshots. Scenes: `1` = lab (**obsolete: `/motion-lab` is deleted**), `2` = home, `3` = journey. The journey jumps to the top of the apply, received and policies pages as they open (section 15.2). The press helper cancels its own click so it never navigates.
- Both live in `docs/phases/`, which ESLint, Prettier and Docker ignore.

---

## 14. Working in the cloud container: environment workarounds

None of this is in the repo; it's what a fresh Claude Code cloud container needed. On a normal machine use `docker compose up -d` and the README.

### 14.1 What was missing and how it was solved

| Problem | Workaround |
| --- | --- |
| No `node_modules` | `pnpm install --frozen-lockfile` |
| Docker daemon not running (no DynamoDB Local) | Downloaded AWS's DynamoDB Local from `https://s3.us-west-2.amazonaws.com/dynamodb-local/dynamodb_local_latest.tar.gz` (the CloudFront URLs returned 403), ran it with the container's Java: `java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -inMemory -sharedDb -port 8000`, then `DYNAMODB_ENDPOINT=http://localhost:8000 pnpm db:init` (in-memory: re-run after every restart) |
| No IPv6: Modern.js's generated `.output/index.js` listens on `::` (hard-coded) and fails with `EAFNOSUPPORT` | A preload, `node --import <scratch>/ipv4.mjs .output/index`, that rewrites `listen({ host: '::' })` to `0.0.0.0`. For `pnpm e2e` / `npx playwright test`, pass it as `NODE_OPTIONS="--import=<scratch>/ipv4.mjs"` so Playwright's web servers get it |
| Playwright 1.64.1 expects Chromium build 1248 (Chrome 156) and ffmpeg 1013; the container has build 1194 (Chrome 141) and ffmpeg 1011. The brief/environment say not to run `playwright install` | Symlinks: `/opt/pw-browsers/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell` → the 1194 headless shell; `/opt/pw-browsers/chromium-1248/chrome-linux64/chrome` → the 1194 Chrome; `/opt/pw-browsers/ffmpeg-1013/ffmpeg-linux` → **`/usr/bin/ffmpeg`** (the bundled 1011 rejects an option 1.64 passes) |
| Lighthouse not installed; ignores `--chrome-path` | `npx -y lighthouse@13.5.0` with `CHROME_PATH=/opt/pw-browsers/chromium` in the environment (`measure.mjs` does this) |

CI is unaffected: the workflow installs its own Chromium (`playwright install --with-deps chromium`) and runs DynamoDB Local as a service container on a dual-stack runner.

### 14.2 The IPv4 preload

```js
// Local-only: this container has no IPv6, and Modern.js's server listens on '::'.
import net from 'node:net';
const listen = net.Server.prototype.listen;
net.Server.prototype.listen = function (...args) {
  if (args[0] && typeof args[0] === 'object' && args[0].host === '::') args[0] = { ...args[0], host: '0.0.0.0' };
  return listen.apply(this, args);
};
```

### 14.3 Serving the production build (same environment as `playwright.config.ts`)

```sh
cd apps/web
NODE_ENV=production PORT=8090 APP_ORIGIN=http://localhost:8090 AWS_REGION=ap-southeast-2 \
DYNAMODB_TABLE=zurich-demo DYNAMODB_ENDPOINT=http://localhost:8000 AWS_ACCESS_KEY_ID=local \
AWS_SECRET_ACCESS_KEY=local EVENTS_MODE=inline MULESOFT_BASE_URL=http://localhost:8090/api/mock-mulesoft \
MOCK_MULESOFT_LATENCY_MS=50 MOCK_MULESOFT_FAIL_RATE=0 SESSION_SECRET=e2e-only-session-secret \
COOKIE_SECURE=false LOG_LEVEL=warn node --import <scratch>/ipv4.mjs .output/index
```

Playwright reuses a server already on 8090 locally (`reuseExistingServer: !CI`) and starts its own failing-MuleSoft server on 8091.

**Tip:** stop that server with `pkill -f '[i]pv4.mjs .output/index'`. The bracket stops `pkill -f` from matching (and killing) the shell running the command, which happened once.

---

## 15. Known issues, risks and gotchas

### 15.1 JavaScript fully off shows an empty page (pre-existing)

Modern.js streams each route into `<div hidden id="modern-js-S:0">` and moves it into `main` with an inline `$RC(...)` script. With JavaScript disabled, `main` stays empty (and the footer stays hidden by the existing `main:has(> template)` rule), exactly as before Phase 3. With JavaScript on, those inline lines run as the HTML streams, independent of the app bundles, so a slow or failed bundle never hides content. Making JavaScript-off work would mean non-streaming SSR (`server.ssr` string mode), which risks the `entry.tsx` workaround that keeps React `useId` values (and so Radix's `aria-*` ids) matching between server and browser. **Decision: leave it** (Richard agreed: a normal browser has JavaScript on).

### 15.2 Scroll position carries across pages (pre-existing, not fixed)

Nothing resets scroll on client-side navigation; only the quote page scrolls itself to the top on step changes. After submitting the long apply form, `/apply/received` opens scrolled to its bottom, and "View my policies" opens `/policies` scrolled down, out of sight of the newest policy (and of the received card's entrance and the pill's crossfade). Fixing it changes behaviour, so it was left out of Phase 3 and suggested as a separate task: reset to the top on path changes (not on `?step=` changes, which the quote page manages), keep back/forward restoration, add an E2E check that the received page opens at scroll 0.

### 15.3 Motion's real bundle cost under Rspack

Section 11.3. If Motion is ever used outside the quote page again (for example, another `m` component in a shared component or the layout), expect around 15 KB gzipped to move into that page's first load. Keep Motion confined to `StepTransition` unless the budget changes.

### 15.4 Tailwind theme values resolve variables at `:root`

A `--animate-*` theme value like `stage-rise … var(--stage-delay, 0.2s) …` is a custom property defined on `:root`; the browser substitutes `var(--stage-delay)` **there**, so an element's own `[--stage-delay:0s]` is ignored. Variables used inside **keyframes** (`--stage-opacity`, `--stage-rise`, `--reveal-rise`) are fine, because keyframes resolve against the animated element. That's why `animate-stage-rise` and `animate-pop` are `@utility` rules (their `animation` declaration is on the element). Any future per-element animation variable must follow the same pattern.

### 15.5 Tailwind v4 individual transform properties

`scale-*`, `translate-*` and `rotate-*` set the CSS `scale`, `translate` and `rotate` properties, not `transform`. Transition lists must name those properties (`press` lists `scale`; `nudge` transitions `translate`). Keyframes here use `transform`; avoid putting a keyframe `transform` and a utility `translate` on the same element without checking they compose as intended.

### 15.6 Reveals and focus

The `:focus-visible` distinction (section 6.4.7) is deliberate and was found the hard way. Don't simplify it to "any focus shows at once" (it breaks pointer clicks mid-reveal) or "only while waiting" (it leaves keyboard focus on faint, staggering cards).

### 15.7 Reveals and fast scrolling

A block that is never on screen during a rendered frame can't be seen by an `IntersectionObserver`. The `100000px` top margin makes "scrolled past" count as reached. Tests must scroll in steps that let frames render (`scrollThrough` in `motion.spec.ts`); calling `scrollIntoViewIfNeeded` on one element after another made a test flaky.

### 15.8 Motion features arrive after `load`

On the quote page, a step change before the window `load` event happens instantly (no transition). In practice `load` fires long before anyone finishes step 1.

### 15.9 pnpm 11's minimum release age

pnpm 11 refuses packages younger than a day by default, and checks the lockfile in `pnpm install --frozen-lockfile` too. When `motion@14.6.0` (published 22 October 2026 08:17 UTC) was added, pnpm wrote exact-version exclusions for `motion`, `framer-motion`, `motion-dom` and `motion-utils` 14.6.0 into `pnpm-workspace.yaml`. They are needed until 23 October 2026 08:17 UTC and harmless after. To remove them later: delete the `minimumReleaseAgeExclude` block, run `pnpm install --frozen-lockfile` to confirm the policy passes, commit.

### 15.10 `getAnimations()` includes finished animations

Animations with `fill-mode: both` stay "relevant" after finishing and still appear in `getAnimations()` (their `finished` promise is already resolved, so waiting on them is instant). Infinite animations never resolve, so helpers must skip them.

### 15.11 E2E helper side effects

`expectNoSeriousAxeViolations` now scrolls the page (when reveals are waiting and no dialog is open) and restores the scroll position. If a future test depends on the exact scroll position across an axe check, keep that in mind.

### 15.12 `docs/decisions.md` is 12 lines

Phases 1 and 2 set a 10-line maximum; the Phase 3 brief asked for two more lines and only requires "fits on one screen". If the 10-line rule matters, merge two of the older lines.

### 15.13 Things that are fine but might surprise

- The stage entrances replay on client-side navigation (for example logo → home), because they play when the element mounts. That's the brief's "plays when the band mounts".
- Products is 2 + 1 cards between md and lg, so its third card's stagger plays below the fold at those widths.
- The hero, lime band and article photo frames carry `isolate` to help Safari clip transformed children to rounded corners.
- `record.mjs`'s step 1 scene points at the deleted `/motion-lab`.
- The cloud container's Lighthouse numbers come from Chromium 141; production may differ in absolute terms.

---

## 16. Definition of done: checklist

From `docs/phases/Phase 3/BRIEF.md`:

- [x] The seven motions are in place where the catalogue says, and nothing else moves (pre-existing kept motions as listed in section 8).
- [x] Every animation uses the tokens, and none runs longer than 600ms (unit test enforces durations; longest sequence 0.96s).
- [x] With reduced motion, nothing moves on any page (only fades of 150ms or less remain; E2E covers the home page; checked by hand on the flow pages).
- [~] With JavaScript off, every section is visible: **met in spirit, not literally** (section 15.1). The test blocks the app's scripts; with JavaScript fully disabled the page was already empty before Phase 3. Accepted by Richard.
- [x] The server's HTML has no hidden styles, and nothing already on screen flickers during hydration.
- [x] Each quote step still moves focus to its heading; tabs, menus and sheets still work by keyboard.
- [x] LCP and CLS are no worse on desktop or mobile, and first-load JavaScript has grown by 10 KB gzipped at most (+1.4 KB).
- [x] axe finds no serious or critical issues, checked after animations finish.
- [~] `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm e2e` pass **locally**; **CI not yet run** (Richard will run it).
- [x] README and `docs/decisions.md` are updated, and each still fits on one screen (decisions is 12 lines, section 15.12).
- [x] The lab page is gone, and the recordings for each step are in `docs/phases/Phase 3/recordings/` (Step 4 changed nothing visible, so it has none).

---

## 17. How to extend the motion system

**Add a reveal to a block:** wrap it (or render it) as `<Reveal>`; pass `as="section"` and the section's `aria-labelledby` if it replaces a `section`. Don't wrap a grid or flex item in an extra box; render the item itself as `RevealItem as="…"` instead.

**Add a staggered row:** make the section a `<RevealGroup as="section">`; give the heading `<RevealItem index={0}>` and each card `index={1…n}` (cards that already render `RevealItem`, like `ProductCard` and `ArticleCard`, take `revealIndex`). Keep `n × 120ms + 600ms` under 1 second (n ≤ 3 items after the heading).

**Keep a coloured band still while its contents come in:** `<Reveal parts>` and mark the moving children `data-reveal-part`. Photos inside get `<Settle>` in a clipping frame; decorative shapes get a `data-reveal-shapes` wrapper.

**Add an on-load entrance:** `motion-safe:animate-stage-rise`, with `[--stage-rise:…]`, `[--stage-opacity:…]` and `[--stage-delay:…]` as needed. Never fade the LCP element from 0.

**Add a token:** add it to `:root` (or `@theme` for an easing) in `globals.css`; if Motion needs it, mirror it in `motion/tokens.ts` and the test in `tests/motion-tokens.test.ts`.

**Use Motion somewhere new:** only inside a `MotionProvider` (`LazyMotion` strict means `m.*` only), and measure the first-load JS first (section 15.3).

**Always:** opacity and transform only; `motion-safe:` (or a reduced-motion branch capped at 150ms opacity); check the 600ms and 1-second limits; check focus; run the four motion E2E tests.

---

## 18. Command cheat sheet

```sh
# Install and check (repo root)
pnpm install --frozen-lockfile
pnpm lint && pnpm typecheck && pnpm test

# Local dev (normal machine)
docker compose up -d && pnpm dev            # http://localhost:8080

# Production build and E2E (normal machine)
pnpm e2e                                    # builds, inits the table, runs Playwright

# E2E in the cloud container (after section 14 setup, DynamoDB Local running)
pnpm --filter web build
cd apps/web && NODE_OPTIONS="--import=<scratch>/ipv4.mjs" npx playwright test
npx playwright test e2e/motion.spec.ts --repeat-each=5   # flakiness check

# Measurements and recordings (server running on 8090)
node "docs/phases/Phase 3/recordings/measure.mjs" <label>
node "docs/phases/Phase 3/recordings/record.mjs" <2|3>

# Deploy (only with Richard's go): main fast-forwards to the branch
git checkout main && git merge --ff-only claude/eloquent-turing-4qzu0o && git push origin main
```

---

## 19. Appendix: commits and timeline

All on 23 October 2026 (UTC).

| Time | Commit | Message |
| --- | --- | --- |
| 02:02 | — | Baseline measured on `f8cbe87` |
| 02:32 | `0335d83` | Add motion foundations: tokens, Motion provider, reveals and a temporary lab |
| 02:32 | `251dbfd` | Add Phase 3 step 1 recordings, baseline measurements and their scripts |
| 02:37 | `e4b20e3` | Load Motion's features after the page has loaded |
| — | — | Step 1 report: budget problem; Richard chooses option B |
| 03:08 | `47c3b6f` | Animate the home page: stage entrance, reveals, staggers, settles, hover and press (includes the switch to CSS reveals) |
| 03:08 | `8295cfe` | Add Phase 3 step 2 recordings and measurements |
| — | — | Container restarted; DynamoDB Local and the server re-created |
| 03:31 | `405e790` | Animate the flow pages and controls: switches, steps, confirmations and entrances |
| 03:31 | `dedab63` | Add Phase 3 step 3 journey recordings and screenshots |
| 03:55 | `030b44b` | Finish Phase 3: motion tests, docs, and the lab page gone |
| 03:55 | `e2b9197` | Add Phase 3 final measurements |
| 04:00 | `78973e1` | Merge main into the Phase 3 branch (brings in `20cb235`, Richard's `.gitleaksignore`) |
| — | (this file) | Add the Phase 3 handover |

**Session-level notes**

- A separate task was suggested in the session for the scroll-reset bug (section 15.2). Its prompt is self-contained if it needs re-creating.
- Nothing in AWS, Terraform or GitHub settings was touched. No pull request was opened.
