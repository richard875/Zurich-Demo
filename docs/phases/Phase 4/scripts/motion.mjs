// Phase 4 motion audit, against a running production build (default http://localhost:8090).
//   node "docs/phases/Phase 4/scripts/motion.mjs" <outDir> [--browsers chromium,webkit] [--sizes 1440x900,390x844] [--videos]
// For each browser, size and motion setting (on, reduced) it runs the home page and the quote journey and:
// - logs every CSS animation and transition that starts (animationstart / transitionrun), with its name or
//   property, duration, delay and easing, so anything outside the Phase 3 catalogue or the tokens shows up
// - with reduced motion, flags anything that moves (transform, translate, scale) or fades for over 150ms
// - checks that reveals never leave content hidden after a jump to the end, back and forward, 200% zoom and
//   a page frozen as a background tab is (Chromium), and that keyboard focus never rests on faded content
// - with --videos, records the runs (.webm) for review
// Chromium only: smoothness at 4x CPU slowdown (requestAnimationFrame gaps and long tasks while scrolling).
// Writes <outDir>/motion-<browser>-<width>-<on|reduced>.json and motion-cpu4x.json.
import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(here, '../../../../apps/web/package.json'));
const playwright = require('@playwright/test');

const args = process.argv.slice(2);
const outDir = args[0];
if (!outDir) throw new Error('usage: motion.mjs <outDir> [--browsers ..] [--sizes ..] [--videos]');
const option = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? fallback : args[index + 1];
};
const browsers = option('browsers', 'chromium,webkit').split(',');
const sizes = option('sizes', '1440x900,390x844').split(',').map((s) => s.split('x').map(Number));
const base = option('base', 'http://localhost:8090');
const videos = args.includes('--videos');

// The Phase 3 catalogue's names (globals.css keyframes, tw-animate-css enter/exit, Radix accordion) and
// the properties the transitions may move.
const CATALOGUE_ANIMATIONS = [
  'reveal', 'stage-rise', 'stage-media-settle', 'stage-shape-slide-in', 'pop', 'switch-fade', 'tab-text-rise',
  'enter', 'exit', 'pulse', 'accordion-down', 'accordion-up',
];
const TOKEN_MS = [100, 150, 200, 250, 300, 500, 600];

// Records every animation and transition that starts, in the page.
const recorder = () => {
  window.__motion = [];
  const describe = (el) => {
    const id = el.id ? `#${el.id}` : '';
    const cls = typeof el.className === 'string' ? `.${el.className.split(' ').filter(Boolean).slice(0, 2).join('.')}` : '';
    return `${el.tagName.toLowerCase()}${id}${cls}`.slice(0, 80);
  };
  const push = (kind, e) => {
    const s = getComputedStyle(e.target);
    const timing = kind === 'animation'
      ? { duration: s.animationDuration, delay: s.animationDelay, easing: s.animationTimingFunction, iterations: s.animationIterationCount }
      : { duration: s.transitionDuration, delay: s.transitionDelay, easing: s.transitionTimingFunction, properties: s.transitionProperty };
    window.__motion.push({ kind, name: kind === 'animation' ? e.animationName : e.propertyName, target: describe(e.target), t: Math.round(performance.now()), ...timing });
  };
  document.addEventListener('animationstart', (e) => push('animation', e), true);
  document.addEventListener('transitionrun', (e) => push('transition', e), true);
};

// The duration in ms that applies to one name or property, from a comma-separated computed list.
const pick = (list, index) => {
  const parts = String(list).split(',').map((p) => p.trim());
  return parts[Math.min(index, parts.length - 1)] ?? parts[0];
};
const ms = (value) => (value?.endsWith('ms') ? parseFloat(value) : parseFloat(value) * 1000);

function judge(events, reduced) {
  const notes = [];
  for (const e of events) {
    let index = 0;
    if (e.kind === 'transition') {
      const props = String(e.properties).split(',').map((p) => p.trim());
      index = Math.max(0, props.indexOf(e.name) === -1 ? props.indexOf('all') : props.indexOf(e.name));
    }
    const duration = ms(pick(e.duration, index));
    const delay = ms(pick(e.delay, index));
    const moves = ['transform', 'translate', 'scale', 'rotate'].includes(e.name) || ['reveal', 'stage-rise', 'stage-media-settle', 'stage-shape-slide-in', 'pop', 'tab-text-rise'].includes(e.name);
    if (e.kind === 'animation' && !CATALOGUE_ANIMATIONS.includes(e.name)) notes.push(`not in catalogue: animation ${e.name} on ${e.target}`);
    if (e.kind === 'animation' && e.name !== 'pulse' && duration > 600) notes.push(`over 600ms: ${e.name} ${duration}ms on ${e.target}`);
    if (e.kind === 'transition' && duration > 600) notes.push(`over 600ms: transition ${e.name} ${duration}ms on ${e.target}`);
    if (duration > 0 && e.name !== 'pulse' && !TOKEN_MS.includes(Math.round(duration))) notes.push(`off-token duration: ${e.kind} ${e.name} ${duration}ms on ${e.target}`);
    if (e.name !== 'pulse' && duration + delay > 1000) notes.push(`still moving after 1s: ${e.name} ${duration}+${delay}ms on ${e.target}`);
    if (reduced && duration > 0 && moves) notes.push(`moves with reduced motion: ${e.kind} ${e.name} ${duration}ms on ${e.target}`);
    if (reduced && duration > 150 && e.name !== 'pulse') notes.push(`over 150ms with reduced motion: ${e.kind} ${e.name} ${duration}ms on ${e.target}`);
  }
  return [...new Set(notes)];
}

const frames = (page, n = 2) => page.evaluate((count) => new Promise((resolve) => {
  let left = count;
  const tick = () => (--left <= 0 ? resolve() : requestAnimationFrame(tick));
  requestAnimationFrame(tick);
}), n);

// Nothing on screen or above it is still waiting, revealing or faint after the given settle time.
async function hiddenContent(page, settleMs = 1500) {
  await page.waitForTimeout(settleMs);
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('[data-reveal]'))
      .filter((el) => el.getBoundingClientRect().top < innerHeight)
      .filter((el) => el.dataset.reveal !== 'shown' || parseFloat(getComputedStyle(el).opacity) < 1)
      .map((el) => `${el.tagName.toLowerCase()} ${el.dataset.reveal} opacity=${getComputedStyle(el).opacity} top=${Math.round(el.getBoundingClientRect().top)}`),
  );
}

async function steadyScroll(page) {
  for (;;) {
    const left = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight - scrollY);
    if (left <= 1) return;
    await page.evaluate((by) => scrollBy(0, by), Math.min(left, 27));
    await page.waitForTimeout(33);
  }
}

async function runSetup(browserName, [width, height], reduced) {
  const phone = width < 1024;
  const browser = await playwright[browserName].launch();
  const contextOptions = {
    viewport: { width, height },
    deviceScaleFactor: phone ? 2 : 1,
    ...(phone && browserName !== 'firefox' ? { isMobile: true, hasTouch: true } : {}),
    reducedMotion: reduced ? 'reduce' : 'no-preference',
    baseURL: base,
    ...(videos ? { recordVideo: { dir: join(outDir, 'video', `${browserName}-${width}-${reduced ? 'reduced' : 'on'}`), size: { width: Math.min(width, 1280), height: Math.round(Math.min(width, 1280) * height / width) } } } : {}),
  };
  const context = await browser.newContext(contextOptions);
  await context.addInitScript(recorder);
  const page = await context.newPage();
  const consoleLog = [];
  page.on('console', (m) => ['error', 'warning'].includes(m.type()) && consoleLog.push(`${m.type()}: ${m.text().slice(0, 200)}`));
  page.on('pageerror', (e) => consoleLog.push(`pageerror: ${e.message.slice(0, 200)}`));
  const result = { browser: browserName, width, reduced, checks: {}, events: {}, notes: {} };
  const collect = async (label) => {
    const events = await page.evaluate(() => window.__motion.splice(0));
    result.events[label] = events;
    result.notes[label] = judge(events, reduced);
  };

  // 1. Load and a steady scroll to the end: what plays, and whether reveals finish.
  await page.goto('/');
  await page.waitForTimeout(1200);
  await collect('home-load');
  result.checks.reducedHiddenEver = reduced
    ? await page.evaluate(() => document.querySelectorAll('[data-reveal="hidden"]').length)
    : null;
  await steadyScroll(page);
  result.checks.afterSteadyScroll = await hiddenContent(page);
  await collect('home-scroll');

  // 2. Jump to the end with the keyboard from a fresh load.
  await page.goto('/');
  await page.waitForTimeout(300);
  await page.locator('body').click({ position: { x: 5, y: Math.round(height / 2) } }).catch(() => undefined);
  await page.keyboard.press('End');
  result.checks.afterEndKey = await hiddenContent(page);
  await page.evaluate(() => scrollTo(0, 0));
  result.checks.afterEndKeyBackToTop = await hiddenContent(page);
  await collect('home-end-key');

  // 3. Back and forward: scroll halfway, leave, come back.
  await page.goto('/');
  await page.waitForTimeout(300);
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight / 2));
  await page.waitForTimeout(800);
  await page.goto('/quote?step=1');
  await page.goBack();
  result.checks.afterBack = await hiddenContent(page);
  result.checks.scrollAfterBack = await page.evaluate(() => Math.round(scrollY));
  await page.goForward();
  await page.goBack();
  result.checks.afterBackForwardBack = await hiddenContent(page);
  await collect('home-back-forward');

  // 4. A frozen background tab (Chromium): a reveal starts, the page is frozen for 2s, then resumes.
  if (browserName === 'chromium') {
    await page.goto('/');
    await page.waitForTimeout(300);
    const cdp = await context.newCDPSession(page);
    await page.evaluate(() => document.querySelector('[data-reveal="hidden"]')?.scrollIntoView({ block: 'center' }));
    await frames(page, 2);
    await cdp.send('Page.setWebLifecycleState', { state: 'frozen' });
    await new Promise((r) => setTimeout(r, 2000));
    await cdp.send('Page.setWebLifecycleState', { state: 'active' });
    result.checks.afterFrozenTab = await hiddenContent(page);
    await collect('home-frozen-tab');
  }

  // 5. Keyboard focus never rests on faded or moving content.
  await page.goto('/');
  await page.waitForTimeout(300);
  const faint = [];
  for (let i = 0; i < 70; i += 1) {
    await page.keyboard.press('Tab');
    await frames(page, 1);
    const state = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      let opacity = 1;
      let waiting = false;
      for (let node = el; node && node !== document.documentElement; node = node.parentElement) {
        opacity *= parseFloat(getComputedStyle(node).opacity);
        if (node.dataset?.reveal === 'hidden' && !node.hasAttribute('data-revealing')) waiting = true;
      }
      return { label: `${el.tagName.toLowerCase()} ${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30)}`, opacity, waiting };
    });
    if (state && (state.opacity < 0.99 || state.waiting)) faint.push(`${state.label} opacity=${state.opacity.toFixed(2)} waiting=${state.waiting}`);
  }
  result.checks.faintFocus = faint;
  await collect('home-keyboard');

  // 6. The quote journey's switches: steps forward and back, the progress pop, the chooser.
  await page.goto('/quote?step=1');
  await page.getByRole('button', { name: 'Use demo details' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('heading', { level: 1, name: 'Choose your cover' }).waitFor();
  await page.waitForTimeout(800);
  await page.getByRole('button', { name: 'Back' }).click();
  await page.getByRole('heading', { level: 1, name: 'About you' }).waitFor();
  await page.waitForTimeout(800);
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'See my price' }).click();
  await page.getByRole('heading', { level: 1, name: 'Your quote' }).waitFor();
  await page.waitForTimeout(800);
  await collect('quote-steps');

  // 7. Tabs on the home page, and (desktop) the Help menu.
  await page.goto('/');
  const tabs = page.getByRole('tab');
  await tabs.first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  await page.evaluate(() => window.__motion.splice(0));
  await tabs.nth(1).click();
  await page.waitForTimeout(600);
  if (!phone) {
    await page.evaluate(() => scrollTo(0, 0));
    await page.getByRole('button', { name: 'Help & information' }).click();
    await page.waitForTimeout(500);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
  }
  await collect('tabs-and-menu');

  // 8. 200% zoom (desktop): the same page at half the CSS width, scrolled through.
  if (!phone) {
    await page.setViewportSize({ width: width / 2, height: height / 2 });
    await page.goto('/');
    await page.waitForTimeout(300);
    await steadyScroll(page);
    result.checks.zoom200AfterScroll = await hiddenContent(page);
    result.checks.zoom200Sideways = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    await collect('home-zoom-200');
  }

  result.console = consoleLog;
  await context.close();
  await browser.close();
  return result;
}

// Smoothness at 4x CPU slowdown, after hydration: scroll the home page 150px every two frames.
async function cpu4x() {
  const out = [];
  for (const rate of [1, 4]) {
    const browser = await playwright.chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate });
    await page.goto(base);
    await page.waitForSelector('[data-reveal="hidden"]', { state: 'attached', timeout: 15000 });
    const measured = await page.evaluate(async () => {
      const gaps = [];
      const longTasks = [];
      new PerformanceObserver((list) => list.getEntries().forEach((e) => longTasks.push(Math.round(e.duration)))).observe({ type: 'longtask' });
      let last = performance.now();
      const max = document.documentElement.scrollHeight - innerHeight;
      for (let y = 0; y <= max; y += 150) {
        scrollTo(0, y);
        for (let f = 0; f < 2; f += 1) {
          await new Promise((r) => requestAnimationFrame(r));
          const now = performance.now();
          gaps.push(now - last);
          last = now;
        }
      }
      const ended = performance.now();
      while (document.querySelector('[data-reveal="hidden"]') && performance.now() - ended < 5000) await new Promise((r) => requestAnimationFrame(r));
      gaps.sort((a, b) => a - b);
      const q = (p) => Math.round(gaps[Math.floor((gaps.length - 1) * p)] * 10) / 10;
      return { frames: gaps.length, p50: q(0.5), p95: q(0.95), max: q(1), longTasks, revealsDoneAfterMs: Math.round(performance.now() - ended), stillHidden: document.querySelectorAll('[data-reveal="hidden"]').length };
    });
    out.push({ rate, ...measured });
    await browser.close();
  }
  return out;
}

mkdirSync(outDir, { recursive: true });
for (const name of browsers) {
  for (const size of sizes) {
    for (const reduced of [false, true]) {
      const result = await runSetup(name, size, reduced);
      const label = `${name}-${size[0]}-${reduced ? 'reduced' : 'on'}`;
      writeFileSync(join(outDir, `motion-${label}.json`), `${JSON.stringify(result, null, 2)}\n`);
      const notes = Object.values(result.notes).flat();
      const hidden = Object.entries(result.checks).filter(([, v]) => Array.isArray(v) && v.length).map(([k]) => k);
      console.log(`${label}: ${notes.length} notes, problems in [${hidden.join(', ')}], console ${result.console.length}`);
    }
  }
}
if (browsers.includes('chromium')) {
  const result = await cpu4x();
  writeFileSync(join(outDir, 'motion-cpu4x.json'), `${JSON.stringify(result, null, 2)}\n`);
  console.log('cpu', JSON.stringify(result.map(({ longTasks, ...r }) => ({ ...r, longTasks: longTasks.length }))));
}
