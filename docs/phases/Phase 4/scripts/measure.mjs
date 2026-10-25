// Phase 4 performance baseline and final check, run against a production build (`pnpm build`, then start .output).
//   node "docs/phases/Phase 4/scripts/measure.mjs" <label> [baseUrl] [outDir]
// Writes <outDir>/measurements-<label>.json (outDir defaults to this folder):
// - first-load JavaScript per page, gzipped, split into before and after the load event
// - Lighthouse LCP, CLS, TBT and the accessibility score per page, mobile and desktop, the median of 3 runs each
// Extends Phase 3's measure.mjs (home only) to every page a signed-out visitor can open.
// Lighthouse won't audit a page answered with a 404, so the not-found page gets the JavaScript count only.
// Uses the web app's Playwright and Lighthouse 13.5.0 through npx; CHROME_PATH picks the browser.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(here, '../../../../apps/web/package.json'));
const { chromium } = require('@playwright/test');

const label = process.argv[2] ?? 'run';
const base = process.argv[3] ?? 'http://localhost:8090';
const outDir = process.argv[4] ?? here;
const chromePath = process.env.CHROME_PATH ?? '/opt/pw-browsers/chromium';
const kb = (bytes) => Math.round(bytes / 10.24) / 100;

const pages = {
  home: '/',
  quote: '/quote?step=1',
  apply: '/apply',
  received: '/apply/received',
  policies: '/policies',
  notFound: '/no-such-page',
};

async function firstLoadJavaScript(path) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const scripts = [];
  let loaded = false;
  page.on('load', () => (loaded = true));
  page.on('response', async (response) => {
    if (response.request().resourceType() !== 'script') return;
    const afterLoad = loaded;
    const body = await response.body().catch(() => Buffer.alloc(0));
    scripts.push({ file: new URL(response.url()).pathname, afterLoad, gzipKB: kb(gzipSync(body, { level: 9 }).length) });
  });
  await page.goto(new URL(path, base).href, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await browser.close();
  const total = (list) => Math.round(list.reduce((sum, s) => sum + s.gzipKB, 0) * 100) / 100;
  return {
    firstLoadKB: total(scripts.filter((s) => !s.afterLoad)),
    afterLoadKB: total(scripts.filter((s) => s.afterLoad)),
    scripts,
  };
}

// The first element snippet anywhere in an audit's details: Lighthouse 13 names the LCP element there.
function snippet(details) {
  if (!details || typeof details !== 'object') return null;
  if (details.type === 'node' && details.snippet) return details.snippet;
  for (const value of Object.values(details)) {
    const found = snippet(value);
    if (found) return found;
  }
  return null;
}

function lighthouse(path, preset) {
  const dir = mkdtempSync(join(tmpdir(), 'lh-'));
  const runs = [];
  for (let run = 0; run < 3; run += 1) {
    const out = join(dir, `${preset}-${run}.json`);
    const args = [
      '-y',
      'lighthouse@13.5.0',
      new URL(path, base).href,
      '--quiet',
      '--only-categories=performance,accessibility',
      '--output=json',
      `--output-path=${out}`,
      '--chrome-flags=--headless=new --no-sandbox --disable-gpu',
      ...(preset === 'desktop' ? ['--preset=desktop'] : []),
    ];
    const result = spawnSync('npx', args, { stdio: 'inherit', env: { ...process.env, CHROME_PATH: chromePath } });
    if (result.status !== 0) throw new Error(`Lighthouse failed (${path}, ${preset}, run ${run + 1})`);
    const { audits, categories } = JSON.parse(readFileSync(out, 'utf8'));
    runs.push({
      lcpMs: Math.round(audits['largest-contentful-paint'].numericValue),
      cls: Math.round(audits['cumulative-layout-shift'].numericValue * 1000) / 1000,
      tbtMs: Math.round(audits['total-blocking-time'].numericValue),
      accessibility: Math.round(categories.accessibility.score * 100),
      lcpElement: snippet(audits['lcp-breakdown-insight']?.details),
    });
  }
  const median = (key) => runs.map((r) => r[key]).sort((a, b) => a - b)[1];
  return {
    median: { lcpMs: median('lcpMs'), cls: median('cls'), tbtMs: median('tbtMs'), accessibility: median('accessibility') },
    runs,
  };
}

const result = { label, base, measuredAt: new Date().toISOString(), pages: {} };
const out = join(outDir, `measurements-${label}.json`);
for (const [name, path] of Object.entries(pages)) {
  const audited = name !== 'notFound';
  result.pages[name] = {
    path,
    javascript: await firstLoadJavaScript(path),
    mobile: audited ? lighthouse(path, 'mobile') : null,
    desktop: audited ? lighthouse(path, 'desktop') : null,
  };
  writeFileSync(out, `${JSON.stringify(result, null, 2)}\n`);
}
const summary = Object.fromEntries(
  Object.entries(result.pages).map(([name, p]) => [
    name,
    { firstLoadKB: p.javascript.firstLoadKB, afterLoadKB: p.javascript.afterLoadKB, mobile: p.mobile?.median, desktop: p.desktop?.median },
  ]),
);
console.log(JSON.stringify(summary, null, 2));
