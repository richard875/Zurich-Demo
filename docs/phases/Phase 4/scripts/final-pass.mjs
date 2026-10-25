// Phase 4 Step 3: the whole site as a first-time visitor, in four setups (desktop Chromium, desktop
// WebKit, an iPhone-sized WebKit and an Android-sized Chromium), against a running production build.
//   node "docs/phases/Phase 4/scripts/final-pass.mjs" <outDir> [--only <setup regex>]
// Walks the brief's six journeys, records every check as pass or fail, and saves a screenshot at each
// milestone. Writes <outDir>/final-pass.json and <outDir>/<setup>/*.png.
import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(here, '../../../../apps/web/package.json'));
const { chromium, webkit, devices } = require('@playwright/test');

const outDir = process.argv[2];
if (!outDir) throw new Error('usage: final-pass.mjs <outDir> [--only <setup regex>]');
const onlyIndex = process.argv.indexOf('--only');
const only = new RegExp(onlyIndex === -1 ? '.' : process.argv[onlyIndex + 1]);
const base = 'http://localhost:8090';
const failBase = 'http://localhost:8091';
const run = Date.now().toString(36);

const setups = [
  { name: 'desktop-chromium', type: chromium, options: { viewport: { width: 1440, height: 900 } }, desktop: true },
  { name: 'desktop-webkit', type: webkit, options: { viewport: { width: 1440, height: 900 } }, desktop: true },
  { name: 'iphone-webkit', type: webkit, options: devices['iPhone 15'], desktop: false },
  { name: 'android-chromium', type: chromium, options: devices['Pixel 7'], desktop: false },
];

const h1 = (page, name) => page.getByRole('heading', { level: 1, name });
const T = 15_000;

async function runSetup(setup) {
  const dir = join(outDir, setup.name);
  mkdirSync(dir, { recursive: true });
  const browser = await setup.type.launch();
  const context = await browser.newContext({ ...setup.options, baseURL: base });
  // Each setup is its own first-time visitor: the sign-in carries a fresh visitor ID.
  const visitorId = `final${run}${setup.name.replace(/[^a-z]/g, '')}`.slice(0, 64);
  await context.route('**/api/session', (route) =>
    route.request().method() === 'POST'
      ? route.continue({ postData: JSON.stringify({ visitorId }) })
      : route.fallback(),
  );
  const results = [];
  const problems = [];
  const watch = (page) => {
    page.on('console', (m) => m.type() === 'error' && problems.push(`console: ${m.text().slice(0, 200)}`));
    page.on('pageerror', (e) => problems.push(`pageerror: ${e.message.slice(0, 200)}`));
    page.on('response', (r) => r.status() >= 500 && problems.push(`http ${r.status()} ${new URL(r.url()).pathname}`));
  };
  let page = await context.newPage();
  watch(page);
  let shotCount = 0;
  const shot = async (label) => {
    shotCount += 1;
    await page.screenshot({ path: join(dir, `${String(shotCount).padStart(2, '0')}-${label}.png`) });
  };
  const check = async (name, fn) => {
    const before = problems.length;
    try {
      await fn();
      results.push({ name, ok: true, problems: problems.slice(before) });
    } catch (error) {
      results.push({ name, ok: false, error: String(error.message).split('\n')[0].slice(0, 300), problems: problems.slice(before) });
      await shot(`FAIL-${name.replace(/[^a-z0-9]+/gi, '-').slice(0, 40)}`).catch(() => undefined);
    }
  };
  const openQuoteChooser = async () => {
    await page.getByRole('banner').getByRole('button', { name: 'Get a quote' }).click();
    const chooser = page.getByRole('dialog', { name: /Need life insurance only/ });
    await chooser.waitFor();
    return chooser;
  };

  // 1. Land on the home page and read every section; open every tab, accordion and menu.
  await check('home: every section heading shows as the page is read', async () => {
    await page.goto('/');
    await h1(page, /Protect/).waitFor();
    await shot('home-top');
    const headings = await page.getByRole('heading', { level: 2 }).all();
    for (const heading of headings) {
      if (!(await heading.isVisible())) continue;
      await heading.scrollIntoViewIfNeeded();
    }
    await page.waitForTimeout(1200);
    const faint = await page.evaluate(() =>
      Array.from(document.querySelectorAll('[data-reveal]')).filter((el) => el.dataset.reveal !== 'shown').length,
    );
    if (faint) throw new Error(`${faint} sections still waiting after reading to the end`);
  });
  await check('home: each cover tab shows its own panel', async () => {
    const tabs = page.getByRole('tab');
    const count = await tabs.count();
    if (count !== 4) throw new Error(`${count} tabs`);
    const firstLines = new Set();
    for (let i = 0; i < count; i += 1) {
      await tabs.nth(i).click();
      const panel = page.getByRole('tabpanel');
      await panel.waitFor();
      firstLines.add((await panel.locator('p').first().textContent())?.slice(0, 40));
    }
    if (firstLines.size !== 4) throw new Error('panels repeat');
  });
  await check('home: the offer terms open and close', async () => {
    const terms = page.getByRole('button', { name: /Offer terms/ });
    await terms.scrollIntoViewIfNeeded();
    await terms.click();
    if ((await terms.getAttribute('aria-expanded')) !== 'true') throw new Error('did not open');
    await shot('offer-terms');
    await terms.click();
    if ((await terms.getAttribute('aria-expanded')) !== 'false') throw new Error('did not close');
  });
  if (setup.desktop) {
    await check('home: Help & information opens and closes', async () => {
      await page.evaluate(() => scrollTo(0, 0));
      const trigger = page.getByRole('button', { name: 'Help & information' });
      await trigger.click();
      const faqs = page.getByRole('banner').getByRole('link', { name: /^FAQs/ });
      await faqs.waitFor();
      await shot('help-menu');
      // At a person's pace: an Escape within about 200ms of the click is lost (F-34).
      await page.waitForTimeout(400);
      await page.keyboard.press('Escape');
      await faqs.waitFor({ state: 'hidden' });
    });
  } else {
    await check('home: the Menu sheet opens and closes', async () => {
      await page.evaluate(() => scrollTo(0, 0));
      await page.getByRole('button', { name: 'Menu' }).click();
      const sheet = page.getByRole('dialog', { name: 'Menu' });
      await sheet.waitFor();
      await shot('menu');
      await sheet.getByRole('button', { name: 'Close' }).click();
      await sheet.waitFor({ state: 'hidden' });
    });
    await check('home: each footer group opens and closes', async () => {
      const triggers = page.getByRole('contentinfo').getByRole('button');
      const count = await triggers.count();
      if (count !== 4) throw new Error(`${count} footer groups`);
      for (let i = 0; i < count; i += 1) {
        await triggers.nth(i).scrollIntoViewIfNeeded();
        await triggers.nth(i).click();
        if ((await triggers.nth(i).getAttribute('aria-expanded')) !== 'true') throw new Error(`group ${i + 1} did not open`);
        await triggers.nth(i).click();
      }
    });
  }
  await check('home: every external link opens in a new tab and says so', async () => {
    const bad = await page.evaluate(() =>
      Array.from(document.querySelectorAll('a[href^="http"]'))
        .filter((a) => {
          const external = new URL(a.href).origin !== location.origin;
          return external && (a.target !== '_blank' || !/noopener/.test(a.rel) || !a.textContent.includes('(opens in a new tab)'));
        })
        .map((a) => a.href),
    );
    if (bad.length) throw new Error(`not marked: ${bad.slice(0, 3).join(', ')}`);
    const link = page.getByRole('link', { name: /Learn more about Ezicover Life Insurance/ });
    const [popup] = await Promise.all([context.waitForEvent('page'), link.click()]);
    if (!popup.url().startsWith('http')) throw new Error('no new tab');
    await popup.close();
  });

  // 2. A quote from the chooser and from a product card; change cover; back and forward.
  await check('quote: the chooser starts a quote with income protection on', async () => {
    await page.goto('/');
    const chooser = await openQuoteChooser();
    await chooser.getByRole('link', { name: 'Get life insurance and income protection' }).click();
    await h1(page, 'About you').waitFor();
    await page.getByRole('button', { name: 'Use demo details' }).click();
    await page.getByRole('button', { name: 'Continue' }).click();
    await h1(page, 'Choose your cover').waitFor();
    if (!(await page.getByRole('checkbox', { name: /Add Ezicover Income Protection/ }).isChecked())) throw new Error('income protection off');
    await shot('cover-step');
  });
  await check('quote: price, change cover, back and forward', async () => {
    const slider = page.getByRole('slider').first();
    await slider.focus();
    await page.keyboard.press('ArrowRight');
    await page.getByRole('button', { name: 'See my price' }).click();
    await h1(page, 'Your quote').waitFor({ timeout: T });
    const price = await page.getByText(/a month$/).first().textContent();
    await shot('quote-result');
    await page.getByRole('button', { name: 'Change cover' }).click();
    await h1(page, 'Choose your cover').waitFor();
    await page.goBack();
    await h1(page, 'Your quote').waitFor();
    await page.goBack();
    await h1(page, 'Choose your cover').waitFor();
    await page.goForward();
    await h1(page, 'Your quote').waitFor();
    if (!(await page.getByText(price ?? '').first().isVisible())) throw new Error('price changed after back and forward');
  });
  await check('quote: refreshing mid-journey keeps the answers', async () => {
    await page.reload();
    await h1(page, 'Your quote').waitFor();
    await page.goto('/quote?step=2');
    await page.reload();
    await h1(page, 'Choose your cover').waitFor();
  });
  await check('quote: a product card starts a quote with income protection off', async () => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Get an online quote' }).first().click();
    await h1(page, 'About you').waitFor();
    if ((await page.getByLabel('Date of birth').inputValue()) !== '1990-06-15') throw new Error('answers lost');
    await page.getByRole('button', { name: 'Continue' }).click();
    await h1(page, 'Choose your cover').waitFor();
    if (await page.getByRole('checkbox', { name: /Add Ezicover Income Protection/ }).isChecked()) throw new Error('income protection on');
  });

  // 5 (part). Signed out, /apply and /policies ask for a sign-in.
  await check('signed out: /apply and /policies ask for a sign-in', async () => {
    await page.goto('/apply');
    await page.getByText('Sign in to apply.').waitFor({ timeout: T });
    await page.goto('/policies');
    await page.getByText('Sign in to see your policies.').waitFor({ timeout: T });
    await shot('policies-signed-out');
  });

  // 3. Sign in, apply, Application received, My policies, and the policy turns Active.
  await check('journey: sign in, apply, received, Processing then Active', async () => {
    await page.goto('/quote?step=2');
    await page.getByRole('button', { name: 'See my price' }).click();
    await h1(page, 'Your quote').waitFor({ timeout: T });
    await page.getByRole('button', { name: 'Apply now' }).click();
    const dialog = page.getByRole('dialog', { name: 'Sign in to apply (demo)' });
    await dialog.waitFor();
    await shot('sign-in');
    await dialog.getByRole('button', { name: 'Continue' }).click();
    await h1(page, 'Apply for cover').waitFor({ timeout: T });
    await page.getByRole('button', { name: 'Submit application' }).waitFor();
    for (const group of await page.getByRole('group', { name: /^\d\. / }).all()) await group.getByRole('radio', { name: 'No' }).check();
    await page.getByRole('checkbox', { name: /My answers are true/ }).check();
    await shot('apply');
    await page.getByRole('button', { name: 'Submit application' }).click();
    await h1(page, 'Application received').waitFor({ timeout: T });
    const top = await page.evaluate(() => Math.round(scrollY));
    if (top > 0) throw new Error(`received page opened scrolled to ${top}`);
    await shot('received');
    await page.getByRole('link', { name: 'View my policies' }).click();
    await h1(page, 'My policies').waitFor();
    const newest = page.getByRole('main').getByRole('listitem').first();
    await newest.getByTestId('policy-status').filter({ hasText: 'Processing' }).waitFor({ timeout: T });
    await shot('processing');
    await newest.getByTestId('policy-status').filter({ hasText: 'Active' }).waitFor({ timeout: 20_000 });
    await shot('active');
  });

  // 4. The referred path and the MuleSoft-down path.
  await check('journey: a yes answer is referred and shows as Being reviewed', async () => {
    await page.goto('/quote?step=1');
    await page.getByRole('button', { name: 'Use demo details' }).click();
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('button', { name: 'See my price' }).click();
    await page.getByRole('button', { name: 'Apply now' }).click({ timeout: T });
    await h1(page, 'Apply for cover').waitFor({ timeout: T });
    await page.getByRole('button', { name: 'Submit application' }).waitFor();
    const groups = await page.getByRole('group', { name: /^\d\. / }).all();
    for (const [i, group] of groups.entries()) await group.getByRole('radio', { name: i === 0 ? 'Yes' : 'No' }).check();
    await page.getByRole('checkbox', { name: /My answers are true/ }).check();
    await page.getByRole('button', { name: 'Submit application' }).click();
    await page.getByText("We'll be in touch").waitFor({ timeout: T });
    await shot('referred');
    await page.goto('/policies');
    await page.getByTestId('policy-status').filter({ hasText: 'Being reviewed' }).first().waitFor({ timeout: T });
  });
  await check('journey: with MuleSoft down the price step says so kindly', async () => {
    const down = await context.newPage();
    watch(down);
    await down.goto(`${failBase}/quote?step=1`);
    await down.getByRole('button', { name: 'Use demo details' }).click();
    await down.getByRole('button', { name: 'Continue' }).click();
    await down.getByRole('button', { name: 'See my price' }).click();
    await down.getByRole('alert').filter({ hasText: "We couldn't work out your price" }).waitFor({ timeout: T });
    await down.screenshot({ path: join(dir, 'mulesoft-down.png') });
    await down.close();
    // The failing copy's 502s are expected.
    for (let i = problems.length - 1; i >= 0; i -= 1) if (/(http 50[23]|status of 50[23])/.test(problems[i])) problems.splice(i, 1);
  });

  // 5. Second tab with the same quote, sign out mid-journey, unknown address.
  await check('edge: the same quote applied from a second tab is turned away kindly', async () => {
    await page.goto('/quote?step=1');
    await page.getByRole('button', { name: 'Use demo details' }).click();
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('button', { name: 'See my price' }).click();
    await h1(page, 'Your quote').waitFor({ timeout: T });
    // A duplicated tab carries the same sessionStorage, so the same quote.
    const [second] = await Promise.all([context.waitForEvent('page'), page.evaluate(() => window.open(location.href))]);
    watch(second);
    await second.waitForLoadState();
    await h1(second, 'Your quote').waitFor({ timeout: T });
    for (const tab of [page, second]) {
      await tab.goto('/apply');
      await tab.getByRole('button', { name: 'Submit application' }).waitFor({ timeout: T });
      for (const group of await tab.getByRole('group', { name: /^\d\. / }).all()) await group.getByRole('radio', { name: 'No' }).check();
      await tab.getByRole('checkbox', { name: /My answers are true/ }).check();
    }
    await page.getByRole('button', { name: 'Submit application' }).click();
    await h1(page, 'Application received').waitFor({ timeout: T });
    await second.getByRole('button', { name: 'Submit application' }).click();
    await second.getByText("You've already applied with this quote").waitFor({ timeout: T });
    await second.screenshot({ path: join(dir, 'second-tab.png') });
    await second.close();
    for (let i = problems.length - 1; i >= 0; i -= 1) if (/409/.test(problems[i])) problems.splice(i, 1);
  });
  await check('edge: signing out mid-journey hides the application', async () => {
    await page.goto('/quote?step=1');
    await page.getByRole('button', { name: 'Use demo details' }).click();
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('button', { name: 'See my price' }).click();
    await page.getByRole('button', { name: 'Apply now' }).click({ timeout: T });
    await h1(page, 'Apply for cover').waitFor({ timeout: T });
    if (setup.desktop) {
      await page.getByRole('button', { name: 'Sign out' }).click();
    } else {
      await page.getByRole('button', { name: 'Menu' }).click();
      await page.getByRole('dialog', { name: 'Menu' }).getByRole('button', { name: 'Sign out' }).click();
      await page.getByRole('dialog', { name: 'Menu' }).getByRole('button', { name: 'Close' }).click();
    }
    await page.getByText('Sign in to apply.').waitFor({ timeout: T });
    await shot('signed-out-mid-journey');
  });
  await check('edge: an unknown address shows Page not found with a 404', async () => {
    const response = await page.goto('/no-such-page');
    if (response?.status() !== 404) throw new Error(`status ${response?.status()}`);
    await h1(page, /Page not/).waitFor();
    await shot('not-found');
    for (let i = problems.length - 1; i >= 0; i -= 1) if (/404/.test(problems[i])) problems.splice(i, 1);
  });

  // 6. One whole journey by keyboard alone (desktop setups).
  if (setup.desktop) {
    await check('keyboard: chooser, quote, sign in, apply and My policies by keyboard alone', async () => {
      // A fresh tab and journey; the visitor is signed out from the step before.
      await page.goto('/');
      await page.evaluate(() => sessionStorage.clear());
      await page.goto('/');
      const tabTo = async (matches, limit = 80) => {
        for (let i = 0; i < limit; i += 1) {
          await page.keyboard.press('Tab');
          const label = await page.evaluate(() => {
            const el = document.activeElement;
            return el ? `${el.getAttribute('role') ?? el.tagName.toLowerCase()}|${(el.getAttribute('aria-label') || el.textContent || '').trim()}` : '';
          });
          if (matches.test(label)) return label;
        }
        throw new Error(`never reached ${matches}`);
      };
      await tabTo(/^button\|Get a quote$/);
      await page.keyboard.press('Enter');
      await tabTo(/^a\|Get life insurance only/);
      await page.keyboard.press('Enter');
      await h1(page, 'About you').waitFor();
      await tabTo(/^button\|Use demo details$/);
      await page.keyboard.press('Enter');
      await tabTo(/^button\|Continue/);
      await page.keyboard.press('Enter');
      await h1(page, 'Choose your cover').waitFor();
      await tabTo(/^button\|See my price/);
      await page.keyboard.press('Enter');
      await h1(page, 'Your quote').waitFor({ timeout: T });
      await tabTo(/^button\|Apply now/);
      await page.keyboard.press('Enter');
      await page.getByRole('dialog', { name: 'Sign in to apply (demo)' }).waitFor();
      await tabTo(/^button\|Continue$/, 10);
      await page.keyboard.press('Enter');
      await h1(page, 'Apply for cover').waitFor({ timeout: T });
      await page.getByRole('button', { name: 'Submit application' }).waitFor();
      for (let q = 0; q < 4; q += 1) {
        await tabTo(/^radio\|No$/);
        await page.keyboard.press('Space');
      }
      await tabTo(/^checkbox\|/);
      await page.keyboard.press('Space');
      await tabTo(/^button\|Submit application$/);
      await page.keyboard.press('Enter');
      await h1(page, 'Application received').waitFor({ timeout: T });
      await tabTo(/^a\|View my policies/);
      await page.keyboard.press('Enter');
      await h1(page, 'My policies').waitFor();
      await page.getByTestId('policy-status').first().waitFor();
      await shot('keyboard-policies');
    });
  }

  await browser.close();
  return { setup: setup.name, results, unexplained: problems };
}

mkdirSync(outDir, { recursive: true });
const report = [];
for (const setup of setups.filter((s) => only.test(s.name))) {
  const result = await runSetup(setup);
  report.push(result);
  const failed = result.results.filter((r) => !r.ok);
  console.log(`${setup.name}: ${result.results.length - failed.length}/${result.results.length} passed`);
  for (const f of failed) console.log(`  FAIL ${f.name}: ${f.error}`);
  for (const r of result.results) for (const p of r.problems) console.log(`  note (${r.name}): ${p}`);
}
writeFileSync(join(outDir, 'final-pass.json'), `${JSON.stringify(report, null, 2)}\n`);
