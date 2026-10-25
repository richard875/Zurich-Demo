// Phase 4 UI audit: captures every page and state in the plan's matrix and checks each capture.
//   node "docs/phases/Phase 4/scripts/capture.mjs" <outDir> [options]
//     --browsers chromium,webkit     (also: firefox)
//     --sizes 1440x900,390x844       (any WIDTHxHEIGHT; widths under 1024 run as a touch phone)
//     --only <regex>                 run only the scenarios whose name matches
//     --base http://localhost:8090   the normal production build
//     --fail http://localhost:8091   the copy whose mock MuleSoft always fails
// Needs both servers from apps/web/playwright.config.ts running on DynamoDB Local.
// Writes <outDir>/<browser>-<width>/<scenario>--<state>.png and <outDir>/report-<browser>-<width>.json.
// Each capture records axe issues, sideways scroll, buttons under 44px, console messages, page errors and
// failed requests. The hard states are reached without changing app code: Playwright's route interception
// holds a request (pending), delays it (loading) or fails it (error); "being reviewed" is the referred path.
import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(here, '../../../../apps/web/package.json'));
const playwright = require('@playwright/test');
const { default: AxeBuilder } = require('@axe-core/playwright');

const args = process.argv.slice(2);
const outDir = args[0];
if (!outDir) throw new Error('usage: capture.mjs <outDir> [--browsers ..] [--sizes ..] [--only ..]');
const option = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? fallback : args[index + 1];
};
const browsers = option('browsers', 'chromium,webkit').split(',');
const sizes = option('sizes', '1440x900,390x844')
  .split(',')
  .map((s) => s.split('x').map(Number));
const only = new RegExp(option('only', '.'));
const base = option('base', 'http://localhost:8090');
const failBase = option('fail', 'http://localhost:8091');
const run = Date.now().toString(36);

// Radix NavigationMenu's aria-hidden focus proxy; the E2E helpers leave it out of axe too.
const RADIX_FOCUS_PROXY = 'nav[aria-label="Main"] span[aria-hidden="true"][tabindex="0"]';
const HEALTH_ANSWERS = { heartCancerStroke: false, undiagnosedSymptoms: false, hazardousWork: false, overseasStay: false };
const DEMO_COVER = { dateOfBirth: '1990-06-15', smoker: false, state: 'NSW', lifeCover: 500000 };

// ---------- page helpers ----------

async function animationsDone(page) {
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((a) => a.effect?.getTiming().iterations !== Infinity)
        .map((a) => a.finished.catch(() => undefined)),
    ),
  );
  await page
    .waitForFunction(
      () =>
        Array.from(document.querySelectorAll('[data-reveal="hidden"]')).every((el) => {
          const { top, bottom } = el.getBoundingClientRect();
          return bottom <= 0 || top >= innerHeight * 0.9;
        }),
      null,
      { timeout: 5000 },
    )
    .catch(() => undefined);
}

// Scrolls through in half-screen steps so every reveal runs, then back to where it was.
async function revealAll(page) {
  await page.evaluate(async () => {
    if (!document.querySelector('[data-reveal="hidden"]')) return;
    if (document.querySelector('[role="dialog"]')) return;
    const start = scrollY;
    for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight / 2) {
      scrollTo(0, y);
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    }
    scrollTo(0, start);
  });
}

const heading = (page, name) => page.getByRole('heading', { level: 1, name });

// A held request: the route waits until release() is called, so the pending state can be captured.
async function hold(page, url, method = 'POST') {
  let release;
  const released = new Promise((resolve) => (release = resolve));
  await page.route(url, async (route) => {
    if (route.request().method() !== method) return route.fallback();
    await released;
    await route.fallback();
  });
  return () => release();
}

async function failWith(page, url, status, message, method) {
  await page.route(url, (route) =>
    method && route.request().method() !== method
      ? route.fallback()
      : route.fulfill({ status, contentType: 'application/json', body: JSON.stringify({ message }) }),
  );
}

// Signs the context in as a fresh demo customer, through the API, without the dialog.
async function signInFresh(context, label) {
  const visitorId = `audit${run}${label}${Date.now().toString(36)}`.replace(/[^A-Za-z0-9]/g, '').slice(0, 64);
  const response = await context.request.post(`${base}/api/session`, {
    headers: { origin: base },
    data: { visitorId },
  });
  if (!response.ok()) throw new Error(`sign-in failed: ${response.status()}`);
}

// Puts a priced quote in the tab's sessionStorage, as finishing step 2 does.
async function seedQuote(context, page, incomeProtection = null) {
  const response = await context.request.post(`${base}/api/quotes`, {
    headers: { origin: base },
    data: { ...DEMO_COVER, incomeProtection },
  });
  const quote = await response.json();
  const { dateOfBirth, smoker, state, lifeCover } = DEMO_COVER;
  const value = JSON.stringify({
    state: {
      aboutYou: { dateOfBirth, smoker, state },
      cover: { lifeCover, incomeProtection },
      quote,
      incomeProtectionPreset: null,
    },
    version: 0,
  });
  await page.goto(`${base}/`);
  await page.evaluate((v) => sessionStorage.setItem('zld-quote', v), value);
  return quote;
}

async function applyThroughApi(context, quoteId, answers = HEALTH_ANSWERS) {
  const response = await context.request.post(`${base}/api/applications`, {
    headers: { origin: base },
    data: { quoteId, answers },
  });
  if (!response.ok()) throw new Error(`apply failed: ${response.status()}`);
}

// ---------- capture and checks ----------

async function checks(page, ignoreRequests) {
  const result = await page.evaluate(() => {
    const doc = document.documentElement;
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none';
    };
    const small = Array.from(document.querySelectorAll('[data-slot="button"], button'))
      .filter(visible)
      .map((el) => ({ el, r: el.getBoundingClientRect() }))
      .filter(({ r }) => r.height < 44 || r.width < 44)
      .map(({ el, r }) => `${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 40)} ${Math.round(r.width)}x${Math.round(r.height)}`);
    const wide = Array.from(document.querySelectorAll('body *'))
      .filter(visible)
      .filter((el) => el.getBoundingClientRect().right > doc.clientWidth + 1)
      .slice(0, 5)
      .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).split(' ').slice(0, 3).join('.')} right=${Math.round(el.getBoundingClientRect().right)}`);
    return {
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
      sidewaysScroll: doc.scrollWidth > doc.clientWidth,
      wideElements: wide,
      smallButtons: [...new Set(small)],
      focused: document.activeElement && document.activeElement !== document.body
        ? `${document.activeElement.tagName.toLowerCase()} ${(document.activeElement.textContent || '').trim().slice(0, 40)}`
        : null,
    };
  });
  let axe = { serious: [], other: [] };
  try {
    const { violations } = await new AxeBuilder({ page }).exclude(RADIX_FOCUS_PROXY).analyze();
    const describe = (v) => `${v.impact} ${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 4).join(' | ')}`;
    axe = {
      serious: violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map(describe),
      other: violations.filter((v) => !['serious', 'critical'].includes(v.impact)).map(describe),
    };
  } catch (error) {
    axe = { error: String(error.message).slice(0, 200) };
  }
  return { ...result, axe, ignoreRequests };
}

async function runScenario(browserType, browserName, [width, height], scenario, dir) {
  const phone = width < 1024;
  const browser = await browserType.launch();
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: phone ? 2 : 1,
    ...(phone && browserName !== 'firefox' ? { isMobile: true, hasTouch: true } : {}),
    baseURL: base,
    reducedMotion: scenario.reducedMotion ? 'reduce' : 'no-preference',
  });
  const page = await context.newPage();
  const log = [];
  page.on('console', (m) => {
    if (['error', 'warning'].includes(m.type())) log.push(`console.${m.type()}: ${m.text().slice(0, 300)}`);
  });
  page.on('pageerror', (e) => log.push(`pageerror: ${String(e.message).slice(0, 300)}`));
  page.on('requestfailed', (r) => log.push(`requestfailed: ${r.method()} ${new URL(r.url()).pathname} ${r.failure()?.errorText}`));
  page.on('response', (r) => {
    if (r.status() >= 400) log.push(`http ${r.status()}: ${r.request().method()} ${new URL(r.url()).pathname}`);
  });

  const shots = [];
  const shot = async (state, { full = false, settle = true, locator } = {}) => {
    if (settle) {
      await page.evaluate(() => document.fonts.ready);
      if (full) await revealAll(page);
      await animationsDone(page);
    }
    // A full-page capture draws the sticky header where the page is scrolled to, so start at the top.
    if (full) await page.evaluate(() => scrollTo(0, 0));
    const file = `${scenario.name}--${state}.png`;
    const target = locator ?? page;
    await target.screenshot({ path: join(dir, file), ...(locator ? {} : { fullPage: full }), animations: 'disabled', caret: 'hide' });
    shots.push({ state, file, url: page.url().replace(/^https?:\/\/[^/]+/, ''), log: log.splice(0), ...(await checks(page)) });
  };

  let error = null;
  try {
    await scenario.run({ page, context, shot, phone, width, browserName });
  } catch (e) {
    error = String(e.message).split('\n')[0].slice(0, 300);
    await page.screenshot({ path: join(dir, `${scenario.name}--ERROR.png`) }).catch(() => undefined);
  }
  await browser.close();
  return { scenario: scenario.name, error, shots, trailingLog: log };
}

// ---------- the matrix ----------

const scenarios = [
  {
    name: 'home',
    async run({ page, shot, phone }) {
      await page.goto('/');
      await heading(page, /Protect/).waitFor();
      await shot('top');
      await shot('full', { full: true });
      // The four cover tabs.
      const tabs = page.getByRole('tab');
      const count = await tabs.count();
      for (let i = 0; i < count; i += 1) {
        await tabs.nth(i).click();
        const section = page.locator('section', { has: page.getByRole('tablist') });
        await section.scrollIntoViewIfNeeded();
        await shot(`tab-${i + 1}`, { locator: section });
      }
      // Offer terms open.
      const terms = page.getByRole('button', { name: /Offer terms/ });
      await terms.scrollIntoViewIfNeeded();
      await terms.click();
      await shot('offer-terms-open', { locator: page.locator('[data-slot="accordion"]', { has: terms }) });
      await page.evaluate(() => scrollTo(0, 0));
      if (!phone) {
        await page.getByRole('button', { name: 'Help & information' }).hover();
        await page.getByRole('link', { name: /FAQs/ }).first().waitFor();
        await shot('help-menu-hover');
        await page.mouse.move(5, 500);
        await page.keyboard.press('Escape');
      }
      await page.getByRole('button', { name: 'Get a quote', exact: true }).first().click();
      await page.getByRole('dialog').waitFor();
      await shot('quote-chooser-open');
      await page.keyboard.press('Escape');
      if (phone) {
        await page.getByRole('button', { name: 'Menu' }).click();
        await page.getByRole('dialog').waitFor();
        await shot('mobile-menu-open');
        await page.keyboard.press('Escape');
      }
    },
  },
  {
    name: 'home-signed-in',
    async run({ page, context, shot, phone }) {
      await signInFresh(context, 'header');
      await page.goto('/');
      await page.getByText(/^Customer [0-9a-f]{4}$/).first().waitFor({ state: phone ? 'attached' : 'visible' });
      await shot('header-signed-in');
      if (phone) {
        await page.getByRole('button', { name: 'Menu' }).click();
        await page.getByRole('dialog').waitFor();
        await shot('mobile-menu-signed-in');
      }
    },
  },
  {
    name: 'quote-1',
    async run({ page, shot }) {
      await page.goto('/quote?step=1');
      await heading(page, 'About you').waitFor();
      await shot('empty', { full: true });
      await page.getByRole('button', { name: 'Continue' }).click();
      await page.getByText('Enter your date of birth').waitFor();
      await shot('errors-empty', { full: true });
      await page.getByLabel('Date of birth').fill('2015-01-01');
      await page.getByRole('button', { name: 'Continue' }).click();
      await page.getByText(/aged 18 to 60/).first().waitFor();
      await shot('errors-age', { full: true });
      await page.getByRole('button', { name: 'Use demo details' }).click();
      await shot('demo-details', { full: true });
    },
  },
  {
    name: 'quote-2',
    async run({ page, shot }) {
      await page.goto('/quote?step=1');
      await page.getByRole('button', { name: 'Use demo details' }).click();
      await page.getByRole('button', { name: 'Continue' }).click();
      await heading(page, 'Choose your cover').waitFor();
      await shot('life-only', { full: true });
      await page.getByRole('checkbox', { name: /Add Ezicover Income Protection/ }).check();
      await shot('with-income-protection', { full: true });
      const sliders = page.getByRole('slider');
      for (let i = 0; i < (await sliders.count()); i += 1) await sliders.nth(i).press('Home');
      await shot('sliders-min', { full: true });
      for (let i = 0; i < (await sliders.count()); i += 1) await sliders.nth(i).press('End');
      await shot('sliders-max', { full: true });
      const release = await hold(page, '**/api/quotes');
      await page.getByRole('button', { name: 'See my price' }).click();
      await page.getByRole('button', { name: /Working out your price/ }).waitFor();
      await shot('working-out-price', { settle: false });
      release();
      await heading(page, 'Your quote').waitFor();
      await shot('max-quote', { full: true });
    },
  },
  {
    name: 'quote-2-mulesoft-down',
    async run({ page, shot }) {
      await page.goto(`${failBase}/quote?step=1`);
      await page.getByRole('button', { name: 'Use demo details' }).click();
      await page.getByRole('button', { name: 'Continue' }).click();
      await heading(page, 'Choose your cover').waitFor();
      await page.getByRole('button', { name: 'See my price' }).click();
      await page.getByText(/couldn't work out your price/).waitFor({ timeout: 15000 });
      await shot('error', { full: true });
    },
  },
  {
    name: 'quote-3',
    async run({ page, shot }) {
      for (const ip of [false, true]) {
        await page.goto('/quote?step=1');
        await page.getByRole('button', { name: 'Use demo details' }).click();
        await page.getByRole('button', { name: 'Continue' }).click();
        await heading(page, 'Choose your cover').waitFor();
        const box = page.getByRole('checkbox', { name: /Add Ezicover Income Protection/ });
        if (ip) await box.check();
        else await box.uncheck();
        await page.getByRole('button', { name: 'See my price' }).click();
        await heading(page, 'Your quote').waitFor();
        await shot(ip ? 'with-income-protection' : 'life-only', { full: true });
      }
    },
  },
  {
    name: 'sign-in-dialog',
    async run({ page, context, shot }) {
      await seedQuote(context, page);
      await page.goto('/quote?step=3');
      await heading(page, 'Your quote').waitFor();
      await page.getByRole('button', { name: 'Apply now' }).click();
      const dialog = page.getByRole('dialog', { name: /Sign in to apply/ });
      await dialog.waitFor();
      await shot('ready');
      // Failed first, then signing in: releasing the held request signs in for real.
      await failWith(page, '**/api/session', 500, "We couldn't sign you in just now. Please try again.", 'POST');
      await dialog.getByRole('button', { name: 'Continue' }).click();
      await dialog.getByRole('alert').waitFor();
      await shot('failed');
      await page.unroute('**/api/session');
      const release = await hold(page, '**/api/session');
      await dialog.getByRole('button', { name: 'Continue' }).click();
      await dialog.getByRole('button', { name: /Signing in/ }).waitFor();
      await shot('signing-in', { settle: false });
      release();
      await heading(page, 'Apply for cover').waitFor();
    },
  },
  {
    name: 'apply',
    async run({ page, context, shot }) {
      await page.goto('/apply');
      await page.getByText('Sign in to apply.').waitFor();
      await shot('signed-out', { full: true });
      await signInFresh(context, 'apply');
      await page.goto('/apply');
      await page.getByText('You need a quote before you can apply.').waitFor();
      await shot('no-quote', { full: true });
      // Loading: the session check is held.
      const releaseSession = await hold(page, '**/api/session', 'GET');
      await page.goto('/apply');
      await page.getByText(/Checking you're signed in/).waitFor();
      await shot('loading', { settle: false });
      releaseSession();
      await page.unroute('**/api/session');
      await seedQuote(context, page);
      await page.goto('/apply');
      await heading(page, 'Apply for cover').waitFor();
      await page.getByRole('button', { name: 'Submit application' }).waitFor();
      await shot('ready', { full: true });
      await page.getByRole('button', { name: 'Submit application' }).click();
      await page.getByText('Answer yes or no').first().waitFor();
      await shot('errors', { full: true });
      const tip = page.getByRole('button', { name: "Why can't I change my name?" });
      await tip.scrollIntoViewIfNeeded();
      await tip.click();
      await page.getByRole('tooltip').waitFor();
      await shot('tooltip-open');
      await page.keyboard.press('Escape');
      for (const group of await page.getByRole('group', { name: /^\d\. / }).all()) await group.getByRole('radio', { name: 'No' }).check();
      await page.getByRole('checkbox', { name: /My answers are true/ }).check();
      // Failed first, then submitting: releasing the held request submits for real.
      await failWith(page, '**/api/applications', 502, "We couldn't send your application just now. Please try again in a moment.");
      await page.getByRole('button', { name: 'Submit application' }).click();
      await page.getByText(/couldn't send your application/).waitFor();
      await shot('failed', { full: true });
      await page.unroute('**/api/applications');
      const release = await hold(page, '**/api/applications');
      await page.getByRole('button', { name: 'Submit application' }).click();
      await page.getByRole('button', { name: /Sending your application/ }).waitFor();
      await shot('submitting', { settle: false });
      release();
      await heading(page, 'Application received').waitFor();
    },
  },
  {
    name: 'apply-touch-tooltip',
    async run({ page, context, shot, phone }) {
      if (!phone) return;
      await signInFresh(context, 'tip');
      await seedQuote(context, page);
      await page.goto('/apply');
      const tip = page.getByRole('button', { name: "Why can't I change my name?" });
      await tip.waitFor();
      await tip.tap();
      await page.getByRole('tooltip').waitFor();
      await shot('tapped');
    },
  },
  {
    name: 'received',
    async run({ page, context, shot }) {
      await signInFresh(context, 'received');
      for (const answerYes of [false, true]) {
        await seedQuote(context, page);
        await page.goto('/apply');
        await heading(page, 'Apply for cover').waitFor();
        await page.getByRole('button', { name: 'Submit application' }).waitFor();
        const groups = await page.getByRole('group', { name: /^\d\. / }).all();
        for (const [i, group] of groups.entries()) await group.getByRole('radio', { name: answerYes && i === 1 ? 'Yes' : 'No' }).check();
        await page.getByRole('checkbox', { name: /My answers are true/ }).check();
        await page.getByRole('button', { name: 'Submit application' }).click();
        await heading(page, 'Application received').waitFor();
        await shot(answerYes ? 'being-reviewed' : 'processing', { full: true });
      }
    },
  },
  {
    name: 'policies',
    async run({ page, context, shot }) {
      await page.goto('/policies');
      await page.getByText('Sign in to see your policies.').waitFor();
      await shot('signed-out', { full: true });
      await signInFresh(context, 'policies');
      await page.goto('/policies');
      await page.getByText("You haven't applied for cover yet.").waitFor();
      await shot('none-yet', { full: true });
      // Loading: the list is held.
      const release = await hold(page, '**/api/policies', 'GET');
      await page.goto('/policies');
      await page.getByText(/Loading your policies/).waitFor();
      await shot('loading', { settle: false });
      release();
      await page.unroute('**/api/policies');
      // Failed to load.
      await failWith(page, '**/api/policies', 500, "We couldn't load your policies just now. Please try again.", 'GET');
      await page.goto('/policies');
      await page.getByText(/couldn't load your policies/).waitFor({ timeout: 15000 });
      await shot('failed', { full: true });
      await page.unroute('**/api/policies');
      // Referred, then processing, then active.
      const referred = await seedQuote(context, page);
      await applyThroughApi(context, referred.quoteId, { ...HEALTH_ANSWERS, hazardousWork: true });
      const accepted = await seedQuote(context, page, 4000);
      await applyThroughApi(context, accepted.quoteId);
      await page.goto('/policies');
      await page.getByTestId('policy-status').filter({ hasText: 'Processing' }).waitFor();
      await shot('processing-and-reviewed', { full: true });
      await page.getByTestId('policy-status').filter({ hasText: 'Processing' }).waitFor({ state: 'detached', timeout: 15000 });
      await shot('active-and-reviewed', { full: true });
    },
  },
  {
    name: 'not-found',
    async run({ page, shot }) {
      const response = await page.goto('/no-such-page');
      await heading(page, /Page not/).waitFor();
      await shot(`unknown-address-${response?.status()}`, { full: true });
    },
  },
  {
    // A server error on a page: the document itself comes back 500, as when rendering throws.
    name: 'server-error',
    async run({ page, shot }) {
      await page.route('**/quote?step=1', (route) =>
        route.request().resourceType() === 'document'
          ? route.fulfill({ status: 500, contentType: 'text/plain', body: 'Internal Server Error' })
          : route.fallback(),
      );
      await page.goto('/quote?step=1');
      await shot('document-500', { settle: false });
      await page.unroute('**/quote?step=1');
      // A page that throws while rendering in the browser: a saved quote from an older shape.
      await page.goto('/');
      await page.evaluate(() =>
        sessionStorage.setItem(
          'zld-quote',
          JSON.stringify({ state: { aboutYou: { dateOfBirth: '1990-06-15', smoker: false, state: 'NSW' }, cover: null, quote: { quoteId: 'x' } }, version: 0 }),
        ),
      );
      await page.goto('/quote?step=3');
      await page.waitForTimeout(1500);
      await shot('client-render-throws', { settle: false });
    },
  },
];

// ---------- run ----------

mkdirSync(outDir, { recursive: true });
for (const name of browsers) {
  for (const size of sizes) {
    const dir = join(outDir, `${name}-${size[0]}`);
    mkdirSync(dir, { recursive: true });
    const report = { browser: name, size, base, startedAt: new Date().toISOString(), scenarios: [] };
    for (const scenario of scenarios.filter((s) => only.test(s.name))) {
      const result = await runScenario(playwright[name], name, size, scenario, dir);
      report.scenarios.push(result);
      const issues = result.shots.filter((s) => s.axe?.serious?.length || s.sidewaysScroll || s.log.length).length;
      console.log(`${name} ${size[0]} ${scenario.name}: ${result.shots.length} shots, ${issues} with notes${result.error ? `, ERROR ${result.error}` : ''}`);
    }
    writeFileSync(join(outDir, `report-${name}-${size[0]}.json`), `${JSON.stringify(report, null, 2)}\n`);
  }
}
