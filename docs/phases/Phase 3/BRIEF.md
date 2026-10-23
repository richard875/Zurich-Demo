# Build brief: Phase 3, motion

You're adding a small set of animations to the demo app in this repo. `docs/phases/Phase 3/PLAN.md` says **what** moves and why, with `motion-map.png` beside it. This brief (`docs/phases/Phase 3/BRIEF.md`) says **how**. If the two disagree, this brief wins.

The working rules from `docs/phases/Phase 1/BRIEF.md` and `docs/phases/Phase 2/BRIEF.md` still apply (stop points, ask before touching AWS or GitHub, check installed library versions, short docs, focused diffs) unless this brief changes them.

**The one rule above all others: don't overdo it.** If something isn't in the catalogue below, it doesn't move. When in doubt, leave it still and ask me.

## Files

- The repo root is the folder you're running in. `doc/` is gitignored and must stay that way.
- Don't edit, move or delete anything in `doc/`. The exceptions are `docs/phases/Phase 3/recordings/` and `docs/phases/Phase 3/screenshots/`, where you save your review recordings and screenshots.
- Reference material, read-only:

| Path | What it is |
| --- | --- |
| `docs/phases/Phase 3/PLAN.md` | The Phase 3 plan, with `motion-map.png` beside it |
| `docs/reference/Zurich Australia/Zurich Australia_files/818c46e31f6e4240.css` | zurich.com.au's stylesheet. Search for `stage` to see its hero keyframes and their timings |
| `docs/reference/Zurich Australia/Zurich Australia_files/182-01a4ac0de0fb5e11.js` | zurich.com.au's main script. Search for `0px 0px -10% 0px` to see how its card rows reveal |
| `docs/reference/Zurich Australia/Zurich Australia Page.png` and `Zurich Australia Mobile Page.png` | The pages those timings belong to |
| `docs/phases/Phase 2/BRIEF.md` | The design rules this phase must not break |
| `docs/phases/Phase 1/` | Phase 1 plan and brief |

## Context

- Phases 1 and 2 are built and deployed. Phase 3 is front-end work only. Nothing in the back end, Terraform or the pipeline changes.
- Nothing about copy, layout, spacing, colours, focus order or behaviour changes. Motion is added on top of the site as it is.
- Every step must leave the site working, so we can stop after any step and ship what's done.

## Before you start

Read `docs/phases/Phase 3/PLAN.md`, this brief, and the code under `apps/web/src`. Start with `routes/layout.tsx`, `routes/page.tsx`, `styles/globals.css`, `lib/use-hydrated.ts`, everything in `home/`, `components/page-band.tsx`, `components/promo-card.tsx`, `components/ui/`, `routes/quote/page.tsx`, `quote/quote-progress.tsx`, `policies/policy-card.tsx` and `e2e/helpers.ts`. Then reply with:

1. Your plan for Step 1, including the exact `motion` version you'll install.
2. A short sketch of how a reveal renders on the server and during hydration (see "Server rendering" below).
3. Anything in this brief that doesn't fit the code as it is.

Then wait for "go". Don't install anything or write code before that.

## How to work with me

- Work in the four steps at the end of this brief. After each step, stop and report in under 15 lines: what's done, what to look at, open questions.
- Screenshots can't show motion, so after each step record it (Playwright, Chromium, `recordVideo`):
  - each changed page, scrolled top to bottom at a steady pace, at 1440×900 and 375×812
  - from Step 2 on, the home page once more with reduced motion on
  - named `step<N>-<page>-<width>.webm`, e.g. `step2-home-1440.webm`, in `docs/phases/Phase 3/recordings/`
  - if `ffmpeg` is installed, an `.mp4` of each as well (QuickTime can't play `.webm`)
  - a screenshot of each page's final state in `docs/phases/Phase 3/screenshots/`, named the same way
  - keep the recording script out of the app: `docs/phases/Phase 3/recordings/record.mjs` is fine
- Ask before you:
  - deploy, run `terraform apply`, or push
  - add any dependency other than `motion`
  - change copy, layout, spacing, colours, focus order or behaviour
- No GSAP, no other animation library, no Lottie, no new CSS framework.
- Keep diffs focused. Don't refactor code you don't need to touch.

## Fixed decisions

- **Library:** `motion` (Motion for React), not `framer-motion`. Use the current 14.x (14.6.0 on 23 October 2026; check with `npm view motion version`) and pin it exactly, with no caret, like the Modern.js packages.
- **Imports:** `motion/react` and `motion/react-m`.
- **Bundle:** wrap the app once in `LazyMotion` with `strict`, and use the `m` component everywhere, never `motion.div`. Load `domAnimation` asynchronously (a function returning a dynamic import), so its features arrive after the first render. No `domMax`: no layout animations and no drag.
- **Who does what:**
  - CSS (Tailwind v4 and `tw-animate-css`, both installed): the stage entrance, hover and press, tab switching, the Help menu, loading to content, and the confirm pops.
  - Motion: reveals, staggers, the photo settle inside a reveal, and the quote step transition. Nothing else.
- **Reduced motion:** everything sits behind it. CSS uses `motion-safe:`. Motion uses `MotionConfig reducedMotion="user"`, plus `useReducedMotion()` wherever the reduced version is different (reveals have no hidden state at all).
- **Only opacity and transform animate.** The existing colour and shadow transitions on hover stay as they are.

## Motion tokens

Put these in `apps/web/src/styles/globals.css` (easings in Tailwind's `--ease-*` namespace, the rest as custom properties), and mirror them in `apps/web/src/motion/tokens.ts` for Motion (seconds, and easings as arrays). One source of truth per value; nothing hard-coded in components.

| Token | Value | Used for |
| --- | --- | --- |
| `--ease-entrance` | `cubic-bezier(0, 0, 0, 1)` | Every entrance and reveal. zurich.com.au's own curve |
| `--ease-sheet-in`, `--ease-sheet-out` | Unchanged | Sheets and the dialog |
| `--ease-state` | `ease-in-out` | Hover, colour and state changes |
| `--motion-press` | 100ms | A button being pressed |
| `--motion-state` | 200ms | Hover, colour and state changes; the Help menu |
| `--motion-switch-in`, `--motion-switch-out` | 250ms, 150ms | Tab panels and quote steps |
| `--motion-enter` | 500ms | Stage entrance and sections |
| `--motion-settle` | 600ms | Cards, photos and the hover zoom |
| `--motion-stagger` | 120ms | Each item in a row after the one before |
| `--motion-rise` | 32px | How far sections and cards rise |
| `--motion-nudge` | 4px | Arrows on hover |

Values used in only one place live in their keyframes, not as tokens: the hero rises (64px, 30px, 24px), the photo settle (scale 1.06 to 1), the hover zoom (1.04), the tab text rise (8px), the step slide (24px) and the pop (scale 0.6 to 1).

Hard limits: no single animation over 600ms, nothing still moving 1 second after it started, and no permanent `will-change`.

## Server rendering

This is the part most likely to go wrong, so get it right in Step 1. The site is server-rendered and streamed (`server.ssr: true` in `modern.config.ts`), so its HTML shows before React hydrates.

- **The server's HTML is always fully visible.** Motion renders a component's `initial` values as inline styles on the server, so a reveal must never put a hidden `initial` into server HTML.
- **CSS stage entrances** play from the stylesheet alone, before hydration. That's fine, and it's why they're CSS.
- **A reveal works like this:**
  1. On the server and during hydration, it renders exactly what the page renders today: no inline opacity or transform. Use `useHydrated()` from `lib/use-hydrated.ts`.
  2. After hydration, with reduced motion on, it does nothing more.
  3. Otherwise, if it is entirely below the bottom of the screen, it goes to its hidden state instantly: opacity 0 and translated down by `--motion-rise`, or opacity 0 only below `md`. Anything on screen or above it stays as it is, so nothing visible ever flickers.
  4. When 10% of it is on screen, ignoring the bottom 10% of the screen (zurich.com.au's trigger), it animates to shown, once.
  5. If anything inside it gets focus while it's hidden, it shows at once.
  6. It carries `data-reveal="hidden"` or `data-reveal="shown"`, so tests can wait on it.
- **No extra boxes.** Where wrapping would add an element that changes a grid or flex layout (a card in a grid, for example), put the motion on the existing element instead.

## Building blocks

New files go in `apps/web/src/motion/`. Keep each one small.

- **`tokens.ts`:** the tokens above.
- **`motion-provider.tsx`:** `LazyMotion` (strict, async `domAnimation`) and `MotionConfig` (`reducedMotion="user"`, default transition: `--ease-entrance` over `--motion-enter`). Mounted once in `routes/layout.tsx`.
- **`reveal.tsx`:** a single-element reveal, and a group that staggers its items by `--motion-stagger` from `md` up. Below `md`, each item in a group reveals on its own as it arrives, with no stagger. A group's heading counts as its first item.
- **Settle:** a photo inside a revealing section scales from 1.06 to 1 over `--motion-settle` as the section reveals. Its frame clips it (`overflow-hidden`), so the rounded corners stay put.
- **`step-transition.tsx`:** `AnimatePresence` with `mode="wait"` and `initial={false}`, keyed by step. Going forward, the new step slides in from 24px right; going back, from 24px left. The old step fades out over `--motion-switch-out`, the new one fades in over `--motion-switch-in`. With reduced motion, opacity only.
- **CSS keyframes in `globals.css`:**
  - `stage-rise`: from a set opacity and a set distance, both CSS variables, to in place. The headline starts at 10% opacity; everything else at 0.
  - `stage-media-settle`: scale 1.06 to 1, with no opacity change.
  - `pop`: scale 0.6 to 1, with an overshoot of 8% at most.
  - Keep `stage-shape-slide-in` as it is.

## The catalogue, file by file

The plan's catalogue has seven motions. This is where each one goes.

### Home page

- **`home/hero.tsx` (1, stage entrance):**
  - The photo gets a clipping frame and settles with `stage-media-settle` over 600ms, starting at once. Its opacity never changes: it's the largest paint on desktop.
  - The headline rises 64px from 10% opacity. The bullets rise 30px and the button 24px, from 0. All three take 500ms on `--ease-entrance`, starting at 0.2s.
  - Animate a wrapper around the Get a quote button, not the button itself, so it doesn't fight the press scale.
  - The shapes stay as they are. Phones get the same entrance.
- **`home/brand-band.tsx`:**
  - `IntroStatement` (2, reveal).
  - `BrandBand`: the text reveals (2), the round photo settles (4), and the shapes slide in with `stage-shape-slide-in` when the band reveals.
- **`home/products.tsx` (3, stagger):** the heading, then the three product cards.
- **`home/cover-tabs.tsx`:**
  - The whole section reveals (2).
  - Switching tabs (6), in CSS: the newly active panel fades in over 250ms and its text block rises 8px. The old panel disappears at once, as now. Keep the one-cell grid, `forceMount`, `invisible` and the below-`md` `hidden`, so the section's height and accessibility stay exactly as they are.
- **`home/benefits.tsx` (3, stagger):** the heading, then the three benefits.
- **`home/promos.tsx` (2 and 4):** the Talk to us and Home loan cards reveal, and their photos settle. `PromoCard` also serves the received and 404 pages, where it uses the stage entrance instead (a prop is fine).
- **`home/articles.tsx` (3, stagger):** the heading, then the three article cards, then the Education hub button with the last card.
- **`home/offer-terms.tsx` (2, reveal):** the accordion keeps its own open and close.
- **`components/article-card.tsx` (5, hover):** on hover, the photo eases to 1.04 inside its frame over 600ms on `--ease-entrance`. The tag stays on top and doesn't scale.

### Shared controls

- **`components/ui/button.tsx` (5, press):**
  - Every button dips to 98% while pressed (`motion-safe:active:`) over `--motion-press`. Add `transform` to its transition list.
  - An arrow-right icon inside a button nudges 4px right on hover; the Back button's arrow-left nudges 4px left. Match the quote chooser cards' existing nudge.
  - Don't change sizes, colours or shadows.
- **`components/site/site-header.tsx` (6, Help menu):** the Help & information panel fades in while dropping 8px over 200ms, and fades out over 150ms. With reduced motion, it fades only.
- **Loading to content (6):** on the quote, apply and My policies pages, the content that replaces a `LoadingPanel` fades in over 200ms. The panels keep their pulse.

### Flow pages

- **`components/page-band.tsx` (1, stage entrance):** the band's text rises 32px and fades in over 500ms from 0.2s, with the heading from 10% opacity. It plays when the band mounts, not on every quote step.
- **`routes/quote/page.tsx` (6, steps):** wrap the step content in the step transition. The focus move to the heading and the scroll to the top must still happen on every step, exactly as now.
- **`quote/quote-progress.tsx` (7, confirm):** when a step becomes done, its tick pops over 300ms and the line before the current step fills from the left. Build the line as a track with a fill that scales, so only transform animates.
- **`policies/policy-card.tsx` and `routes/policies/page.tsx` (7, confirm):** when a policy turns from Processing to Active while the page is open, its pill crossfades from Lemon to Mint over 300ms and its tick pops. The page already tracks the previous statuses for its announcement; reuse that. Policies that are already active when the page loads don't pop.
- **`routes/apply/received/page.tsx` and `routes/$.tsx` (1 and 7):** the card enters with the stage entrance (rises 32px and fades in over 500ms). On the received page, the icon then pops, 300ms after the card lands.

### Not animated

The header, footer and demo strip; form fields, labels, hints and error messages (errors appear at once); text inside a paragraph (no letter or word effects); numbers and prices (no counting up); anything tied to the scroll position (no parallax, no scroll listeners); moving between pages; focus rings.

**Kept as they are:** the sheets, the sign-in dialog, the accordions, the chevrons and the loading pulses.

## Accessibility

- **Reduced motion** follows the plan's catalogue on every page: nothing moves; reveals and entrances show at once; state changes may crossfade for 150ms at most. Check it in Playwright (`page.emulateMedia({ reducedMotion: 'reduce' })`) and with macOS's Reduce motion setting.
- **Focus:** animation never moves or delays the element that has focus. A reveal shows at once when something inside it gets focus. Each quote step still moves focus to its heading.
- **Screen readers:** content waiting to reveal is transparent, not removed, so the reading order doesn't change.
- **axe:** before any axe check on a page with reveals, scroll through it so every reveal has run, then wait for the animations to finish. Extend `animationsDone` in `e2e/helpers.ts` to also wait for every `[data-reveal]` in view to be `shown`. Half-transparent text fails contrast, and Motion's animations don't always show up in `getAnimations()`.

## Performance

- **Measure first.** In Step 1, before changing anything, record a baseline from a production build (`pnpm build`, then start it): the home page's first-load JavaScript (gzipped, from the build output), and Lighthouse LCP, CLS and TBT on mobile and desktop (median of 3 runs each). Measure the same way at the end of Step 4 and put both in your report.
- **Budgets:**
  - first-load JavaScript grows by 10 KB gzipped at most; Motion's features load after the first render
  - LCP no worse on desktop or mobile. On desktop it's the hero photo; on phones it may be the headline. Neither starts transparent
  - CLS no worse
  - reveals stay smooth with Chrome DevTools' 4× CPU slowdown
- No scroll listeners. Reveals use Motion's in-view detection, which shares one `IntersectionObserver`.

## Tests

- **Keep** every existing unit, E2E and axe test passing, including the cover tabs test.
- **New E2E:**
  - With JavaScript off (`javaScriptEnabled: false`), every home-page section heading is visible and every section has opacity 1.
  - After scrolling the home page to the end in steps, no `[data-reveal]` is `hidden` and nothing has opacity below 1.
  - With reduced motion, the hero headline and bullets have opacity 1 and no transform as soon as the page loads, and no `[data-reveal]` is ever `hidden`.
  - With motion on, each quote step still moves focus to its heading, going forward and back.
- **New unit test:** the server render (`renderToString`) of a reveal contains no `opacity` or `transform` styles.
- No snapshot tests, and no fixed sleeps: wait on states and attributes.

## README and decisions

- **README:** under "Where things are", one line for `apps/web/src/motion` (animation tokens and building blocks). It must still fit on one screen.
- **`docs/decisions.md`:** two lines.
  - "Motion for scroll reveals and the quote steps, CSS for everything else; no GSAP, because there are no timelines or scroll scenes to justify it."
  - "Animation timing and easing come from zurich.com.au; reduced motion turns movement off, and no content waits on JavaScript."

## Steps

**Step 1: Foundations**

- Baseline measurements, then install `motion`.
- Tokens, the motion provider, the reveal and group, the settle, the step transition and the CSS keyframes.
- A temporary `/motion-lab` page that shows all seven motions with real components (a product card row, a promo card, the tabs, a button with an arrow, a quote progress, a status pill). Record it. Delete it at the end of Step 4.
- Done when the lab works at both widths, with motion on and with reduced motion, the lab's server HTML has no hidden styles, and `pnpm typecheck` passes.

**Step 2: Home page**

- Motions 1 to 5 on the home page: the hero, every section, the cards, the article hover and the button press and nudge.
- Done when the home page matches the catalogue at 1440px and 375px, the reduced-motion recording shows nothing moving, and the existing E2E tests pass.

**Step 3: Flow and controls**

- Motions 6 and 7, the flow pages' bands, the received and 404 cards, and the Help menu.
- Record one full run at each width: home, quote steps 1 to 3, sign in, apply, received, My policies.
- Done when the journey E2E tests pass with motion on.

**Step 4: Finish**

- The new tests, the after measurements, README and decisions. Delete the lab page.
- Deploy only after I say go, by pushing to main. The pipeline does the rest; there are no Terraform changes.
- Done when everything below is true.

## Definition of done

- [ ] The seven motions are in place, where the catalogue says, and nothing else moves
- [ ] Every animation uses the tokens, and none runs longer than 600ms
- [ ] With reduced motion, nothing moves on any page
- [ ] With JavaScript off, every section is visible
- [ ] The server's HTML has no hidden styles, and nothing already on screen flickers during hydration
- [ ] Each quote step still moves focus to its heading; tabs, menus and sheets still work by keyboard
- [ ] LCP and CLS are no worse on desktop or mobile, and first-load JavaScript has grown by 10 KB gzipped at most
- [ ] axe finds no serious or critical issues, checked after animations finish
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm e2e` pass locally and in CI
- [ ] README and `docs/decisions.md` are updated, and each still fits on one screen
- [ ] The lab page is gone, and the recordings for each step are in `docs/phases/Phase 3/recordings/`
