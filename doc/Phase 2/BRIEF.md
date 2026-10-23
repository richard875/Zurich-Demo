# Build brief: Phase 2, Zurich Direct redesigned

You're updating the demo app in this repo. `doc/Phase 2/PLAN.md` says **what** changes and why. This brief (`doc/Phase 2/BRIEF.md`) says **how**. If the two disagree, this brief wins.

The working rules from `doc/Phase 1/BRIEF.md` still apply (phases with stop points, ask before touching AWS or GitHub, check installed library versions, short docs) unless this brief changes them.

## Files

- The repo root is the folder you're running in. `doc/` is gitignored and must stay that way.
- Don't edit, move or delete anything in `doc/`. The one exception is `doc/Phase 2/screenshots/`, where you save your review screenshots.
- Reference material, read-only:

| Path | What it is |
| --- | --- |
| `doc/Phase 2/PLAN.md` | The Phase 2 plan, with `home-wireframe.png` beside it |
| `doc/Zurich Direct/Zurich Direct.html` | Saved direct.zurich.com.au home page. **The source of all home-page copy** |
| `doc/Zurich Direct/Zurich Direct Page.png` | Full-page desktop screenshot of it (1920px wide) |
| `doc/Zurich Direct/Zurich Direct Mobile Page.png` | Full-page mobile screenshot of it (330px wide) |
| `doc/Zurich Direct/Zurich Direct_files/` | Its photos (used in the new home page) |
| `doc/Zurich Direct/Tabs/Tab 1.png` to `Tab 4.png` | Screenshots of Zurich Direct's four tabs. **The source of the copy for tabs 2–4** |
| `doc/Zurich Direct/Tabs/Tab 2 Image.jpg` to `Tab 4 Image.jpg` | The photos for tabs 2–4 (350×437, the size Zurich Direct serves them) |
| `doc/Zurich Australia/Zurich Australia.html` and `Zurich Australia_files/818c46e31f6e4240.css` | Saved zurich.com.au home page and its CSS. **The source of the design language** |
| `doc/Zurich Australia/Zurich Australia Page.png` | Full-page desktop screenshot of it (1920px wide) |
| `doc/Zurich Australia/Zurich Australia Mobile Page.png` | Full-page mobile screenshot of it (330px wide). **The source of the mobile layout.** The capture caught the quick-quote panel open beside the page. That panel isn't part of the page layout |
| `doc/Application Flows/` | The real Zurich Direct application flow. Reference only; don't rebuild the demo flow from it |
| `doc/Phase 1/` | Phase 1 plan and brief |

## Context

- Phase 1 is built and deployed. Phase 2 is front-end work only: design tokens, shared components, header, footer and the home page. Nothing in the back end, Terraform or the pipeline changes.
- Goal: make the demo read as "Zurich Direct, redesigned". Use Zurich Direct's home-page content, laid out in zurich.com.au's newer design language.
- Nothing changes after the demo.
- The application flow (quote steps, sign-in dialog, apply, received, My policies) keeps its steps, fields, copy, validation and behaviour. Only the shared changes and the three content fixes listed below touch it.

## Before you start

Read `doc/Phase 2/PLAN.md`, this brief, and the code under `apps/web/src`. Look at the desktop and mobile screenshots of both sites and the four tab screenshots. Then reply with:

1. Your plan for Step 1.
2. Anything in this brief that doesn't fit the code as it is.

Then wait for "go". Don't write code before that.

## How to work with me

- Work in the four steps at the end of this brief. After each step, stop and report in under 15 lines: what's done, what to look at, open questions.
- After each step, save screenshots to `doc/Phase 2/screenshots/` (Playwright, Chromium):
  - every page you changed, at 1440px and 375px
  - named `step<N>-<page>-<width>.png`, e.g. `step3-home-1440.png`
  - compare them against the reference screenshots (desktop at 1440px, mobile at 375px) and say in the report what still looks different
- Ask before you:
  - deploy, run `terraform apply`, or push
  - add a dependency
  - change anything in the application flow beyond what this brief lists
- `radix-ui` (already installed) has the Tabs, Accordion, Dialog and NavigationMenu primitives you need, so no new UI libraries.
- Keep diffs focused. Don't refactor code you don't need to touch.

## Fixed decisions

- **Name:** the app becomes "Zurich Direct (demo)": page titles, `modern.config.ts` title and description, README.
- **No Harbour Bank:** delete `harbour-bank-mark.tsx` and every reference to Harbour Bank.
- **Copy comes word for word from `doc/Zurich Direct/Zurich Direct.html`,** including the bold phrases. Keep the Australian spelling and the curly quotes. Don't invent offers, prices or product features.
  - Two small edits are allowed. The product-card teaser lines drop their trailing "with..." (e.g. "Help care for the people who depend on you – even if you're not around"). Headings and tab labels get sentence case (e.g. "Key considerations for couples"). The bold lead-ins inside the tabs keep their original case.
- **Tabs:** tab 1's copy comes from the saved HTML. Tabs 2–4 come from the screenshots in `doc/Zurich Direct/Tabs/`, transcribed in "Tab copy" below. Where the transcription and a screenshot differ, the screenshot wins. Their photos are the `Tab N Image.jpg` files in the same folder, and their Learn more links are in Home section 5.
- **Not built:** any page we don't build links to the real page.
  - Use `target="_blank" rel="noopener noreferrer"`, an external-link icon, and visually hidden "(opens in a new tab)".
  - The URLs are in the saved HTML. Home Loan Protection links to `https://www.zurich.com.au/home-loan-protection`.
- **Phone numbers** are real Zurich Direct numbers, as `tel:` links: Sales 1800 394 268, Customer Care 1800 025 015.
- **No income-protection-only quote.** The demo's rating needs life cover, so the quote chooser offers two options, not three.
- **The site stays public,** as it is now: no password, no IP allowlist. Keep the demo strip on every page, `noindex` and the footer's design-concept line.

## Design tokens (`apps/web/src/styles/globals.css`)

Measured from the saved zurich.com.au page.

- **New colours:** `--color-lime: #e1ee92`, `--color-mint: #a6e9ab`, `--color-powder-pink: #ffc5ea`.
- **Container:** a `Container` component, `mx-auto max-w-[1158px] px-4 sm:px-6`, gives 1110px of content on desktop. The flow pages keep their current narrower form column.
- **Corners:**

| Element | Radius |
| --- | --- |
| Buttons, tags, tab pills | fully rounded |
| Form inputs and selects | 8px (was 4px) |
| Card photos and article cards | 16px |
| Hero photo and promo cards | 24px |

- **Type:** Zurich Sans everywhere. Ogg only for emphasised words (see Headline).

| Use | Size / line height / weight |
| --- | --- |
| Hero H1 | 60px / 1.16 / 300 from md; 48px at sm; 44px below |
| Section H2 | 36px / 1.16 / 500 (32px on mobile) |
| List section H2 (Education hub articles) | 44px / 1.16 / 300 (32px on mobile) |
| Card H3 | 32px / 1.25 / 500 (24px on mobile) |
| Marketing body | 20px / 30px |
| Form and small body | 16px / 24px (unchanged) |
| Utility links, dates, legal | 14px |
| Article title | 18px / 600 |

- **Text colour:** Dark Blue for text, Zurich Blue for links and primary actions, white on Zurich Blue. Never white on Mid Blue (3.2:1 contrast).
- **Focus ring:** keep the current 3px Dark Blue outline. On Zurich Blue backgrounds, use a white outline instead.
- **Rule change:** drop Phase 1's "no more than three background colours per page" rule. The live site uses more.

## Components

New components go in `apps/web/src/components/`. Keep each one small.

- **Button** (`ui/button.tsx`):
  - Make it a pill (`rounded-full`), 48px tall, `px-6`, 18px regular weight, `shadow-sm` with `hover:shadow-md`.
  - Variants:
    - `default`: Zurich Blue, hover Dark Blue
    - `inverse`: white with Zurich Blue text, for blue backgrounds
    - `outline`: 2px Zurich Blue border on white
    - `ghost` and `link`: unchanged
  - Sizes: `sm` is 40px with 16px text. Add `lg`, 56px and full width, for the quote chooser links.
- **IconLink:** 20px Zurich Blue text after a 24px Zurich Blue circle holding a white chevron. Its `external` variant swaps the circle for the external-link icon and adds the new-tab attributes.
- **Headline:** renders an `h1`–`h4` (an `as` prop). Any `<em>` inside renders in Ogg, not italic: `<Headline as="h2">Want to <em>talk</em> to us?</Headline>`.
- **PromoCard:** 24px corners with `overflow-hidden`.
  - From md, two equal columns: the colour panel (`mint` or `pink` prop) and a photo filling its half. Below md: the panel, then the photo.
  - The panel holds a Headline, 20px body, and actions pinned to the bottom left, with 48px padding (24px on mobile).
- **ProductCard:**
  - photo with 16px corners, 3:2 crop
  - 14px semibold teaser line, H3, 20px description
  - IconLink, then a Button
  - no border or shadow
- **ArticleCard:**
  - The whole card is one external link.
  - Photo with 16px corners and a Tag at its top left, then a 14px medium date, then the 18px semibold title.
- **Tag:** a pill, 14px, Zurich Blue background, white text.
- **Tabs:** Radix Tabs. The tab list is a row of pills; the active pill is filled Zurich Blue, the others are outlined. Below md the row scrolls sideways instead of wrapping: scroll snap, hidden scrollbar, the active pill scrolled into view. Arrow keys move between tabs.
- **Accordion:** Radix Accordion, with Dove dividers above and below, a plus/minus icon and 16px content.
- **Shapes:** decorative, `aria-hidden` SVG circles, quarter circles and dots in Light Blue, Sky Blue, white and Dark Blue. They sit beside the hero photo and the lime band's photo, like zurich.com.au's. Draw them yourself; don't copy Zurich's SVGs.
- **Sheet:** a Radix Dialog that slides in from the right. Used by the mobile menu and the quote chooser.
  - 480px wide, full screen below sm
  - traps focus, closes on Esc and on the overlay, and returns focus to the trigger
- **Icons:**
  - Use `@zurich/design-tokens` icons through `ZurichIcon`.
  - Find the names you need in the package: chevron, external link, phone, person, menu, close, plus, minus, and something for rewards, a Will and a phone/portal.
  - Import only the icon sets you use, and extend the `ZurichIconName` union.

## Photos

- **Source:** `doc/Zurich Direct/Zurich Direct_files/`, plus the three tab photos in `doc/Zurich Direct/Tabs/`. Copy resized versions into `apps/web/src/assets/zurich-direct/`.
- **Size:** each file 250 KB or less, at most 1600px on the long edge. Use macOS `sips` or `sharp` as a dev dependency (ask first). Commit only the resized files.
- **Tab photos:** the tab 2–4 photos are 350×437 and need no cropping or resizing. Never display them wider than 350px. Crop the tab 1 photo to the same 350:437 shape so all four match.
- **Markup:**
  - give every `<img>` explicit `width` and `height` so nothing shifts on load
  - load the hero eagerly and everything else with `loading="lazy"`
  - write meaningful `alt` text for the people photos
  - give the decorative shapes no alt

| Use | File |
| --- | --- |
| Hero | `2parentsandchild-image-square.jpg` (square) |
| Product: Ezicover Life Insurance | `direct-life-insurance-teaser.jpeg` |
| Product: Ezicover Income Protection | `direct-income-protection-teaser.jpeg` |
| Product: Home Loan Protection, and the Home Loan Protection promo card | `first-home-couple-1000px.jpg` |
| Lime band (circle crop) | `test1.jfif` |
| Tab 1 photo | `father-daughter-windfarm-1825218389.jpg`, cropped to 350:437 (sharper than the 350px copy in the same folder) |
| Tab 2 photo | `doc/Zurich Direct/Tabs/Tab 2 Image.jpg` |
| Tab 3 photo | `doc/Zurich Direct/Tabs/Tab 3 Image.jpg` |
| Tab 4 photo | `doc/Zurich Direct/Tabs/Tab 4 Image.jpg` |
| Talk to us promo card | `working-with-daughter.png` (2.2 MB today: convert to JPEG) |
| Article: Why is a Will important? | `benefits-of-writing-a-will-online.jpg` |
| Article: The benefits of writing a Will online | `couple-with-pet.jpeg` |
| Article: Do I need life cover, income protection – or both? | `father-daughter-windfarm-1825218389.jpg` |

## Around the page

**Demo strip** (above everything, not sticky, never dismissible):

- A Dark Blue strip with white 14px text and a Lemon "Demo" tag.
- Text: "Design concept, not the live Zurich Direct site. Fake data, mock sign-in."
- Keep the existing E2E check working by updating its expected text.

**Header** (sticky, both rows):

- **Utility bar:** Zurich White, 40px tall, right-aligned 14px Zurich Blue links:
  - Contact us ↗ (`https://direct.zurich.com.au/info/contact`)
  - Make a claim ↗ (`https://direct.zurich.com.au/info/claims`)
  - Sign in, with a person icon. It opens the existing sign-in dialog.
  - Signed in, Sign in is replaced by "Demo customer · device 3f9a" and a Sign out link. Keep that exact text pattern; the E2E tests read it.
- **Main bar:** white, 64px tall, bottom border Dove.
  - The logo (existing `z-logo`) on the left links home.
  - Nav (16px Dark Blue, 2px Zurich Blue underline on hover and for the current page):
    - Life insurance ↗
    - Income protection ↗
    - Home loan protection ↗
    - Help & information (menu)
    - My policies
  - On the right, a "Get a quote" pill opens the quote chooser.
- **Help & information** is a Radix NavigationMenu panel with two columns, all external:
  - **Choosing cover:** Help choosing my cover, Why Zurich?, FAQs, Education hub
  - **Support:** Making a claim, Contact us, Documents & forms, COVID-19, Loving Life rewards program
- **Below 1024px:** the utility bar is hidden and the header is one white bar. The logo sits on the left; a `sm` Get a quote pill and a Menu button (hamburger icon) sit on the right. The Menu button opens a full-screen Sheet with the nav, the Help & information links (grouped), the utility links and the sign-in state.

**Quote chooser** (Sheet):

- Opened by every "Get a quote" button on the marketing pages.
- Heading (32px light): "Need life insurance only or both life insurance and income protection?"
- Line: "Get a 5% discount on Ezicover Income Protection insurance if you purchase it with Ezicover Life Insurance."
- Two `lg` pill links:
  - "Get life insurance and income protection"
  - "Get life insurance only"
- Both go to `/quote?step=1` with income protection preset on or off for the cover step.
  - Do this through the existing journey store with the smallest change that works.
  - Keep existing "About you" answers.
  - Don't change the step rules.
- The product cards' "Get an online quote" buttons skip the chooser and preset the same way: Life → off, Income Protection → on.

**Footer** (Zurich Blue, white text, 64px top padding, 48px bottom):

- Four groups under 16px headings, with 18px links:
  - **Our cover:** Ezicover Life Insurance ↗, Ezicover Income Protection ↗, Home Loan Protection ↗
  - **Help & information:** Help choosing my cover, Why Zurich?, FAQs, Education hub, COVID-19 (all ↗)
  - **Support:** Making a claim, Contact us, Documents & forms, Loving Life rewards program (all ↗)
  - **Talk to us:** Sales 1800 394 268, Customer Care 1800 025 015 (`tel:`)
- A divider, then Legal ↗, Privacy ↗ and Disclaimer ↗, right-aligned (URLs from the saved HTML).
- Three 14px paragraphs:
  - the Ezicover disclaimer, word for word from the saved Zurich Direct footer
  - the Acknowledgement of Country, word for word from the saved zurich.com.au footer
  - "© 2026 Zurich Australia · Design concept, not the live Zurich Direct site."
- **Below md:** the four groups become accordions with a chevron (Radix Accordion, all closed by default), as on zurich.com.au's mobile footer. Below them come the legal links, centred, then the three paragraphs.

## The home page (`apps/web/src/routes/page.tsx`)

Ten sections in this order; the wireframe is `doc/Phase 2/home-wireframe.png`. Split them into components under `apps/web/src/home/`. Leave 64px of vertical space between sections (40px on mobile).

1. **Hero:**
   - A full-bleed Zurich Blue band, with two columns from md.
   - Left:
     - white H1 "<em>Protect</em> what matters most with Zurich"
     - the two offer bullets in white 20px, with their bold phrases
     - an `inverse` "Get a quote" pill
   - Right: the hero photo, square with 24px corners. On desktop it hangs about 64px below the blue band (zurich.com.au's overlap), with Shapes at its lower left.
   - Below md: the band holds the text, with Shapes at its bottom-right corner. The photo sits directly under the band, full bleed (edge to edge), with square corners and no overlap, as on zurich.com.au's mobile page.
2. **Intro statement:** centred, at most 900px wide, 24px (20px on mobile) Dark Blue. The brand statement's first paragraph: "At Zurich, we believe it should be easy…"
3. **Products:**
   - H2 "Choose the product that suits your needs".
   - Three ProductCards in a 3/2/1 column grid: Ezicover Life Insurance, Ezicover Income Protection, Zurich Home Loan Protection.
   - Each card has its teaser line, description, an external "Learn more about…" IconLink, and its button:
     - "Get an online quote" for Life and Income Protection
     - an `outline` "Find out more" ↗ for Home Loan Protection
4. **Lime band:**
   - Full-bleed Lime.
   - Left: Headline H2 "Zurich Ezicover. You've got <em>this.</em>", then the brand statement's second paragraph ("With Ezicover, you'll enjoy…") in 20px.
   - Right: the hands photo as a circle, with Shapes.
5. **Help choosing your cover:**
   - H2 "Help choosing your cover", then Tabs with Zurich Direct's four labels.
   - Each panel has its lead paragraph (bold opening words), the numbered points with their bold lead-ins, an external "Learn more" IconLink, and that tab's photo.
   - Photo layout: 350:437, 16px corners, at most 350px wide. It sits to the right of the text from md, and under the text below md.
   - Copy: tab 1 from the saved HTML, tabs 2–4 from "Tab copy" below.
   - Learn more links (all open in a new tab):
     - Tab 1: `https://direct.zurich.com.au/info/education-hub/life-cover-income-protection-or-both`
     - Tab 2: `https://direct.zurich.com.au/info/education-hub/life-insurance-for-couples`
     - Tab 3: `https://direct.zurich.com.au/info/education-hub/when-to-review-your-life-insurance`
     - Tab 4: `https://direct.zurich.com.au/info/education-hub/how-does-life-insurance-underwriting-work`
6. **Benefits:**
   - Full-bleed Zurich White.
   - Headline H2 "Get <em>more</em> out of your life and income insurance", then three columns. Each has a 48px Zurich Blue circle with a white icon, a 20px semibold title and the body text:
     - Exclusive rewards program, with Loving Life as an external link
     - Complimentary legal Will from Willed
     - Access to My Zurich
7. **Talk to us:**
   - A mint PromoCard: Headline H2 "Want to <em>talk</em> to us?", then the body text with both numbers as `tel:` links.
   - Buttons: a `default` "Get a quote" that opens the chooser, and an `outline` "Call 1800 394 268".
   - Photo on the right.
8. **Education hub articles:**
   - Headline H2 "Protect those who <em>matter</em> most" (list style, 44px light).
   - Three ArticleCards with their tag, date and title, linking out.
   - Then an `outline` "Education hub" ↗ pill.
9. **Home Loan Protection:**
   - A pink PromoCard: Headline H2 "Stress less about your <em>mortgage</em> with Zurich Home Loan Protection."
   - A `default` "Learn more" ↗ pill (`https://direct.zurich.com.au/hlp`).
   - Photo on the right.
10. **Offer terms:** an Accordion, collapsed by default: "* Offer terms and important information". Inside, the six paragraphs word for word, with their links external.

## Tab copy

Transcribed from `doc/Zurich Direct/Tabs/Tab 2.png` to `Tab 4.png` and checked against OCR. **Bold** marks the bold text in the screenshots. Tab 1's copy is in the saved HTML.

**Tab 2: Key Considerations for Couples**

**Balance in relationships** is crucial. But often only the main breadwinner has life insurance, leaving the partner handling unpaid domestic or child-rearing duties uncovered.

1. **Value of Unpaid Work:** Childcare and housework are vital but often undervalued economically.
2. **Gender Gap in Unpaid Work:** Primary caregivers, usually women, see a big rise in unpaid work after the first child.
3. **Economic Impact:** In Australia, unpaid work is valued at $565 billion, or 33.9% of GDP, with women doing most of it.
4. **Need for Dual Coverage:** Both partners need life insurance for financial security. It covers mortgage payments, home maintenance, debts, and children’s education.
5. **Benefits of Joint Life Insurance:** Joint policies offer simpler applications, potential discounts, and convenience. This results in cheaper premiums and comprehensive cover.

**Tab 3: When to Review Your Life Insurance**

**Life insurance needs change** as your life evolves. Here are key milestones for reviewing your cover:

1. **Young and Single:** Income protection covers bills if you’re unable to work due to illness or injury. Buying life insurance early means lower premiums.
2. **Getting Married:** Ensure financial security for your partner with life insurance and income protection.
3. **Having Children:** Protect your family with life insurance and income protection for financial support if you can’t work.
4. **Buying a House:** Reassess coverage to ensure your family can pay off the mortgage in case of illness, injury, or death.
5. **Starting Over:** Update insurance and beneficiaries after major life changes like losing a spouse, divorce, remarrying, or starting a new family.

**Tab 4: Understanding Life Insurance Underwriting**

**Underwriting** looks at your health, age, job, and hobbies to assess risk.

1. **Application Process:** Answer questions honestly. You may need a medical exam or records to avoid future claim issues.
2. **Risk Assessment:** Underwriters estimate the likelihood of claims to decide if you can be insured and on what terms.
3. **Factors Considered:** Health, age, and occupation are key. Smokers and those with risky hobbies or jobs may face higher premiums. Accurate information ensures better pricing.
4. **High-Risk Assessments:** High-risk individuals may face higher premiums, exclusions, or be declined. Check the Product Disclosure Statement for details.
5. **Policy Reviews:** Life changes like new jobs or quitting smoking can prompt policy reviews. Annual reviews and life events may allow cover adjustments. Always check your Product Disclosure Statement.

Each of tabs 2–4 ends with "Learn more", like tab 1. The links are in Home section 5.

## Mobile

Below md (768px), follow `doc/Zurich Australia/Zurich Australia Mobile Page.png`. The section specs above already cover each part. In summary:

- **Header (below 1024px):** one white bar: logo; `sm` Get a quote pill; Menu button. No utility bar.
- **Hero:** text in the blue band; full-bleed photo directly under it, square corners.
- **Sections:** one column, 16px side padding, 40px between sections, in page order.
- **Lime band and promo cards:** text or panel first, then the photo. Promo cards keep their 24px corners.
- **Tabs:** the pill row scrolls sideways, and the photo sits under the text.
- **Sheets:** on phones (below sm), the quote chooser and the menu are full screen, with the pills stacked.
- **Footer:** link groups as accordions, then the legal links, centred, and the three paragraphs.
- **Width:** no sideways scrolling at 375px or 320px.

## Application flow touch-ups

Only these:

- The flow pages get the new demo strip, header, footer, pill buttons and 8px inputs automatically. Check that nothing breaks at 375px and 1440px.
- **Bundle discount 10% → 5%:**
  - `BUNDLE_DISCOUNT` in `api/lambda/mock-mulesoft/_rating.ts`
  - the "save 10%" line in `src/quote/cover-form.tsx`
  - the "10% bundle discount" line in `src/quote/quote-summary.tsx`
  - the unit tests
  - the E2E test's expected price (`$112.60` today), which you recompute and update
- **Product names:** where the flow names a cover, use "Ezicover Life Insurance" and "Ezicover Income Protection".
- **First month free:** add one line to the quote result: "Your first month is free." The price shown doesn't change.

## Tests

- **Keep** all existing unit and E2E tests passing, updated for the 5% discount and the new demo-strip text.
- **New E2E on the home page:**
  - every section's heading is visible
  - "Get a quote" opens the chooser, and "Get life insurance only" lands on step 1; after step 1, the cover step shows income protection off
  - at 375px, the Menu button opens the sheet, and Esc closes it and returns focus
  - at 375px, the footer groups open and close as accordions
  - the tabs change with arrow keys, and each of the four shows its own opening line and photo
  - the accordion opens with Enter
- **axe** with no serious or critical violations: on the home page, with the chooser open, with the Help & information menu open, and with the mobile sheet open.
- **External links:** a test that every external link on the home page has `target="_blank"` and the hidden "(opens in a new tab)" text.
- No snapshot tests.

## README and decisions

- **README:** update the title and the one-line description to Zurich Direct. It still fits on one screen.
- **`docs/decisions.md`:** keep the existing "Public URL, no IP allowlist" line. Add one line each, 10 lines at most in total:
  - "Real Zurich Direct copy and photos; the site stays public, labelled as a demo on every page."
  - "Only the home page is rebuilt; other links go to the real site."
  - "Pill buttons and rounder corners everywhere, to match zurich.com.au."
  - "5% bundle discount, to match Zurich Direct's copy."

## Steps

**Step 1: Foundations**

- Tokens, Container, Button variants, IconLink, Headline, PromoCard, ProductCard, ArticleCard, Tag, Tabs, Accordion, Shapes, Sheet, icons, resized photos.
- Build a temporary `/__components` page that shows each one, screenshot it, then delete the page at the end of Step 3.
- Done when every component renders at 1440px and 375px and `pnpm typecheck` passes.

**Step 2: Around the page**

- Demo strip, header (utility bar, main bar, Help & information menu, mobile sheet), quote chooser, footer, removal of Harbour Bank.
- Done when every existing page shows the new chrome, the chooser presets the cover step, and the existing E2E tests pass.

**Step 3: Home page**

- The ten sections, with the copy and photos above, including all four tabs.
- Done when the home page matches the wireframe at 1440px and follows the Mobile section at 375px, next to the desktop and mobile references.

**Step 4: Finish**

- Flow touch-ups and the 5% discount, tests, README, decisions.
- Deploy only after I say go, by pushing to main. The pipeline does the rest; there are no Terraform changes.
- Done when everything below is true.

## Definition of done

- [ ] The home page has all ten sections, in order, with Zurich Direct's copy.
- [ ] At 1440px, side-by-side screenshots read as zurich.com.au's design language: hero, cards, promo cards, header, footer.
- [ ] At 375px, the page follows zurich.com.au's mobile patterns: the menu sheet works, the hero photo is full width under the band, sections stack, the footer groups are accordions, and there's no sideways scrolling.
- [ ] All four tabs show their own copy and photo.
- [ ] Quote → apply → My policies passes E2E with the 5% prices.
- [ ] axe finds no serious or critical issues on the home page, or with the chooser, the Help & information menu or the mobile sheet open.
- [ ] Menu, chooser, tabs and accordion all work by keyboard, and focus stays inside open sheets.
- [ ] Every home-page photo is 250 KB or less and lazy below the fold, with no layout shift.
- [ ] Every external link is marked and opens in a new tab.
- [ ] Every page has the demo strip and `noindex`, and Harbour Bank appears nowhere.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm e2e` pass locally and in CI.
- [ ] README and `docs/decisions.md` are updated, and each still fits on one screen.
