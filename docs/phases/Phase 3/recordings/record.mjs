// Phase 3 review recordings, against a running build (default http://localhost:8090).
//   node "docs/phases/Phase 3/recordings/record.mjs" <step> [baseUrl]
// For each page in the step: a .webm (and an .mp4, if ffmpeg is installed) scrolled top to bottom at a
// steady pace at 1440x900 and 375x812, with motion on and, where listed, reduced. Then a full-page
// screenshot of its final state in docs/phases/Phase 3/screenshots/, named the same way.
import { spawnSync } from 'node:child_process';
import { mkdirSync, renameSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const shots = join(here, '../screenshots');
const require = createRequire(join(here, '../../../apps/web/package.json'));
const { chromium } = require('@playwright/test');

const step = process.argv[2] ?? '1';
const base = process.argv[3] ?? 'http://localhost:8090';
const widths = [
  { width: 1440, height: 900 },
  { width: 375, height: 812 },
];
const pause = (page, ms) => page.waitForTimeout(ms);

// Scrolls at about 800px a second until the target's top is a third of the way down the screen, or
// to the bottom of the page without a target.
async function scrollTo(page, selector) {
  for (;;) {
    const remaining = await page.evaluate((sel) => {
      const max = document.documentElement.scrollHeight - innerHeight;
      const target = sel
        ? document.querySelector(sel).getBoundingClientRect().top + scrollY - innerHeight / 3
        : max;
      return Math.min(target, max) - scrollY;
    }, selector);
    if (remaining <= 1) return;
    await page.evaluate((by) => scrollBy(0, by), Math.min(remaining, 27));
    await pause(page, 33);
  }
}

const lab = {
  name: 'motion-lab',
  path: '/motion-lab',
  async play(page, { width }) {
    await pause(page, 1500);
    for (const id of ['lab-reveal', 'lab-stagger', 'lab-settle']) {
      await scrollTo(page, `#${id}`);
      await pause(page, 1200);
    }
    await scrollTo(page, '#lab-press');
    const buttons = page.locator('#lab-press button');
    for (const index of [0, 1]) {
      if (width > 768) await buttons.nth(index).hover();
      await pause(page, 500);
      const box = await buttons.nth(index).boundingBox();
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await pause(page, 400);
      await page.mouse.up();
      await pause(page, 400);
    }
    await scrollTo(page, '#lab-tabs');
    for (const index of [1, 2, 0]) {
      await page.locator('#lab-tabs [role="tab"]').nth(index).click();
      await pause(page, 900);
    }
    await scrollTo(page, '#lab-steps');
    for (const name of ['Continue', 'Continue', 'Back', 'Back']) {
      await page.locator('#lab-steps').getByRole('button', { name }).click();
      await pause(page, 1000);
    }
    await scrollTo(page, '#lab-loading');
    await page.locator('#lab-loading').getByRole('button', { name: 'Load again' }).click();
    await pause(page, 2000);
    await scrollTo(page, '#lab-pill');
    await page.locator('#lab-pill').getByRole('button', { name: 'Activate' }).click();
    await pause(page, 1200);
    await scrollTo(page, '#lab-received');
    await page.locator('#lab-received').getByRole('button', { name: 'Replay' }).click();
    await pause(page, 1500);
    await scrollTo(page);
    await pause(page, 1000);
  },
};

// Holds a press on the target for a moment and lets go. The click it makes is cancelled before the
// page sees it, so nothing is followed.
async function press(page, locator) {
  await page.evaluate(() =>
    document.addEventListener(
      'click',
      (event) => {
        event.preventDefault();
        event.stopPropagation();
      },
      { capture: true, once: true },
    ),
  );
  const box = await locator.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await pause(page, 400);
  await page.mouse.down();
  await pause(page, 400);
  await page.mouse.up();
  await pause(page, 300);
}

const home = {
  name: 'home',
  path: '/',
  async play(page, { width }) {
    await pause(page, 1500);
    for (const id of ['products-heading', 'brand-heading', 'cover-tabs-heading']) {
      await scrollTo(page, `#${id}`);
      await pause(page, 1200);
      if (id === 'products-heading') {
        await press(page, page.getByRole('link', { name: 'Get an online quote' }).first());
      }
    }
    for (const id of ['benefits-heading', 'talk-heading', 'articles-heading']) {
      await scrollTo(page, `#${id}`);
      await pause(page, 1200);
    }
    if (width > 768) {
      await page.locator('article.group').first().hover();
      await pause(page, 1200);
      await page.mouse.move(10, 10);
      await pause(page, 800);
    }
    await scrollTo(page, '#home-loan-heading');
    await pause(page, 1200);
    await scrollTo(page);
    await pause(page, 1000);
  },
};

const heading = (page, name) => page.getByRole('heading', { level: 1, name }).waitFor();

// The app keeps the scroll position when it moves to another page (only the quote steps scroll to
// the top), so the recording jumps to the top as each page opens, to show its entrance.
async function opened(page, name) {
  await heading(page, name);
  await page.evaluate(() => scrollTo(0, 0));
}

// One full run: home (a tab switch and, on desktop, the Help menu), the quote chooser, quote steps 1
// to 3 with a step back, sign in, apply, received, and My policies until the policy turns active.
const journey = {
  name: 'journey',
  path: '/',
  crossesPages: true,
  async play(page, { width, shot }) {
    await pause(page, 1500);
    await scrollTo(page, '#cover-tabs-heading');
    await pause(page, 900);
    const tabs = page.getByRole('tablist', { name: 'Help choosing your cover' }).getByRole('tab');
    for (const index of [1, 2]) {
      await tabs.nth(index).click();
      await pause(page, 1000);
    }
    await shot('home');
    if (width >= 1024) {
      await page.getByRole('button', { name: 'Help & information' }).click();
      await pause(page, 1200);
      await page.keyboard.press('Escape');
      await pause(page, 600);
    }
    await page.getByRole('banner').getByRole('button', { name: 'Get a quote' }).click();
    await pause(page, 1000);
    await page.getByRole('link', { name: 'Get life insurance and income protection' }).click();
    await heading(page, 'About you');
    await pause(page, 1500);
    await page.getByRole('button', { name: 'Use demo details' }).click();
    await pause(page, 600);
    await page.getByRole('button', { name: 'Continue' }).click();
    await heading(page, 'Choose your cover');
    await pause(page, 1200);
    await page.getByRole('button', { name: 'Back' }).click();
    await heading(page, 'About you');
    await pause(page, 1000);
    await page.getByRole('button', { name: 'Continue' }).click();
    await heading(page, 'Choose your cover');
    await pause(page, 1000);
    await page.getByRole('button', { name: 'See my price' }).click();
    await heading(page, 'Your quote');
    await pause(page, 1500);
    await shot('quote');
    await page.getByRole('button', { name: 'Apply now' }).click();
    const dialog = page.getByRole('dialog', { name: 'Sign in to apply (demo)' });
    await dialog.waitFor();
    await pause(page, 1000);
    await dialog.getByRole('button', { name: 'Continue' }).click();
    await opened(page, 'Apply for cover');
    await pause(page, 1500);
    for (const question of await page.getByRole('group', { name: /^\d\. / }).all()) {
      await question.getByRole('radio', { name: 'No' }).check();
    }
    await page.getByRole('checkbox', { name: /My answers are true/ }).check();
    await pause(page, 600);
    await shot('apply');
    await page.getByRole('button', { name: 'Submit application' }).click();
    await opened(page, 'Application received');
    await pause(page, 2000);
    await shot('received');
    await page.getByRole('link', { name: 'View my policies' }).click();
    await opened(page, 'My policies');
    await page
      .getByRole('main')
      .getByRole('listitem')
      .first()
      .getByTestId('policy-status')
      .filter({ hasText: 'Active' })
      .waitFor({ timeout: 20_000 });
    await pause(page, 2000);
    await shot('policies');
  },
};

const scenes = {
  1: [{ ...lab, reduced: [false, true] }],
  2: [{ ...home, reduced: [false, true] }],
  3: [{ ...journey, reduced: [false, true] }],
};

const ffmpeg = spawnSync('ffmpeg', ['-version']).status === 0;
mkdirSync(shots, { recursive: true });
const browser = await chromium.launch();
for (const scene of scenes[step] ?? []) {
  for (const viewport of widths) {
    for (const reduced of scene.reduced ?? [false]) {
      const name = `step${step}-${scene.name}-${viewport.width}${reduced ? '-reduced' : ''}`;
      const context = await browser.newContext({
        viewport,
        reducedMotion: reduced ? 'reduce' : 'no-preference',
        recordVideo: { dir: here, size: viewport },
      });
      const page = await context.newPage();
      await page.goto(`${base}${scene.path}`);
      // A scene that crosses pages takes a screenshot of each as it goes, at the size of the screen
      // (a full-page screenshot would resize the recording).
      const shot = (label) =>
        page.screenshot({
          path: join(shots, `step${step}-${label}-${viewport.width}${reduced ? '-reduced' : ''}.png`),
        });
      await scene.play(page, { ...viewport, shot });
      await page.waitForFunction(() => !document.querySelector('[data-reveal="hidden"]'));
      const video = page.video();
      await context.close();
      // Otherwise the screenshot comes from a page that isn't recorded, scrolled through so every
      // reveal has run.
      if (!scene.crossesPages) {
        const still = await browser.newPage({
          viewport,
          reducedMotion: reduced ? 'reduce' : 'no-preference',
        });
        await still.goto(`${base}${scene.path}`, { waitUntil: 'networkidle' });
        await scrollTo(still);
        await still.waitForFunction(() => !document.querySelector('[data-reveal="hidden"]'));
        await pause(still, 1000);
        await still.screenshot({ path: join(shots, `${name}.png`), fullPage: true });
        await still.close();
      }
      // Playwright encodes near-lossless; with ffmpeg, a VP9 re-encode keeps the look at a quarter of
      // the size (these files are committed), and an .mp4 is made for QuickTime.
      const raw = join(here, `${name}.raw.webm`);
      renameSync(await video.path(), ffmpeg ? raw : join(here, `${name}.webm`));
      if (ffmpeg) {
        const encode = (args) => spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', raw, ...args]);
        encode(['-c:v', 'libvpx-vp9', '-crf', '34', '-b:v', '0', '-row-mt', '1', '-deadline', 'good',
          '-cpu-used', '4', join(here, `${name}.webm`)]);
        encode(['-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
          join(here, `${name}.mp4`)]);
        rmSync(raw);
      }
      console.log(`recorded ${name}`);
    }
  }
}
await browser.close();
