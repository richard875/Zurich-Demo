// Phase 3 review recordings, against a running build (default http://localhost:8090).
//   node "doc/Phase 3/recordings/record.mjs" <step> [baseUrl]
// For each page in the step: a .webm (and an .mp4, if ffmpeg is installed) scrolled top to bottom at a
// steady pace at 1440x900 and 375x812, with motion on and, where listed, reduced. Then a full-page
// screenshot of its final state in doc/Phase 3/screenshots/, named the same way.
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

const scenes = { 1: [{ ...lab, reduced: [false, true] }] };

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
      await scene.play(page, viewport);
      await page.waitForFunction(() => !document.querySelector('[data-reveal="hidden"]'));
      const video = page.video();
      await context.close();
      // The screenshot comes from a page that isn't recorded, scrolled through so every reveal has run.
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
