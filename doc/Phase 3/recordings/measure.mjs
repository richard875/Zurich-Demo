// Phase 3 performance check, run against a production build (`pnpm build`, then start .output).
//   node "doc/Phase 3/recordings/measure.mjs" <label> [baseUrl]
// Writes doc/Phase 3/recordings/measurements-<label>.json:
// - the home page's JavaScript, gzipped, split into what loads before the load event and after it
// - Lighthouse LCP, CLS and TBT on mobile and desktop, the median of 3 runs each
// Uses the web app's Playwright and Lighthouse 13.5.0 through npx; CHROME_PATH picks the browser.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(here, '../../../apps/web/package.json'));
const { chromium } = require('@playwright/test');

const label = process.argv[2] ?? 'run';
const base = process.argv[3] ?? 'http://localhost:8090';
const chromePath = process.env.CHROME_PATH ?? '/opt/pw-browsers/chromium';
const kb = (bytes) => Math.round(bytes / 10.24) / 100;

async function homeJavaScript() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const scripts = [];
  let loaded = false;
  page.on('load', () => (loaded = true));
  page.on('response', async (response) => {
    if (response.request().resourceType() !== 'script') return;
    const afterLoad = loaded;
    const body = await response.body().catch(() => Buffer.alloc(0));
    const file = new URL(response.url()).pathname;
    scripts.push({ file, afterLoad, gzipKB: kb(gzipSync(body, { level: 9 }).length) });
  });
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await browser.close();
  const total = (list) => Math.round(list.reduce((sum, s) => sum + s.gzipKB, 0) * 100) / 100;
  const firstLoad = scripts.filter((s) => !s.afterLoad);
  const later = scripts.filter((s) => s.afterLoad);
  return { firstLoadKB: total(firstLoad), afterLoadKB: total(later), scripts };
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

function lighthouse(preset) {
  const dir = mkdtempSync(join(tmpdir(), 'lh-'));
  const runs = [];
  for (let run = 0; run < 3; run += 1) {
    const out = join(dir, `${preset}-${run}.json`);
    const args = [
      '-y',
      'lighthouse@13.5.0',
      base,
      '--quiet',
      '--only-categories=performance',
      '--output=json',
      `--output-path=${out}`,
      '--chrome-flags=--headless=new --no-sandbox --disable-gpu',
      ...(preset === 'desktop' ? ['--preset=desktop'] : []),
    ];
    const env = { ...process.env, CHROME_PATH: chromePath };
    const result = spawnSync('npx', args, { stdio: 'inherit', env });
    if (result.status !== 0) throw new Error(`Lighthouse failed (${preset}, run ${run + 1})`);
    const { audits } = JSON.parse(readFileSync(out, 'utf8'));
    runs.push({
      lcpMs: Math.round(audits['largest-contentful-paint'].numericValue),
      cls: Math.round(audits['cumulative-layout-shift'].numericValue * 1000) / 1000,
      tbtMs: Math.round(audits['total-blocking-time'].numericValue),
      lcpElement: snippet(audits['lcp-breakdown-insight']?.details),
    });
  }
  const median = (key) => runs.map((r) => r[key]).sort((a, b) => a - b)[1];
  return { median: { lcpMs: median('lcpMs'), cls: median('cls'), tbtMs: median('tbtMs') }, runs };
}

const result = {
  label,
  base,
  measuredAt: new Date().toISOString(),
  javascript: await homeJavaScript(),
  mobile: lighthouse('mobile'),
  desktop: lighthouse('desktop'),
};
writeFileSync(join(here, `measurements-${label}.json`), `${JSON.stringify(result, null, 2)}\n`);
console.log(
  JSON.stringify(
    {
      firstLoadKB: result.javascript.firstLoadKB,
      afterLoadKB: result.javascript.afterLoadKB,
      mobile: result.mobile.median,
      desktop: result.desktop.median,
    },
    null,
    2,
  ),
);
