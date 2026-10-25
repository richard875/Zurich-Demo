// Summarises capture.mjs reports: every capture with axe issues, sideways scroll, small buttons or console
// messages, grouped so the same issue on many captures reads once.
//   node "docs/phases/Phase 4/scripts/summarise.mjs" <captureDir> [...more dirs]
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// Requests the capture script fails or holds on purpose, and the console line each one causes.
const expected = [
  /^http 500: (POST|GET) \/api\/(session|policies)$/,
  /^http 502: POST \/api\/applications$/,
  /^http 404: GET \/no-such-page$/,
  /^http 500: GET \/quote$/,
  /^http 502: POST \/api\/quotes$/,
  /Failed to load resource: the server responded with a status of (404|500|502)/,
];

const issues = new Map();
const add = (kind, detail, where) => {
  const key = `${kind}: ${detail}`;
  if (!issues.has(key)) issues.set(key, new Set());
  issues.get(key).add(where);
};

for (const dir of process.argv.slice(2)) {
  for (const file of readdirSync(dir).filter((f) => f.startsWith('report-'))) {
    const report = JSON.parse(readFileSync(join(dir, file), 'utf8'));
    const setup = `${report.browser}-${report.size[0]}`;
    for (const s of report.scenarios) {
      if (s.error) add('scenario error', s.error, `${setup} ${s.scenario}`);
      for (const shot of s.shots) {
        const where = `${setup} ${s.scenario}--${shot.state}`;
        for (const a of shot.axe?.serious ?? []) add('axe serious', a, where);
        for (const a of shot.axe?.other ?? []) add('axe minor', a.replace(/: .*/, ''), where);
        if (shot.sidewaysScroll) add('sideways scroll', `${shot.scrollWidth}>${shot.clientWidth} ${shot.wideElements.slice(0, 2).join(' ; ')}`, where);
        for (const b of shot.smallButtons ?? []) add('under 44px', b.replace(/ \d+x\d+$/, (m) => m), where);
        for (const line of shot.log) if (!expected.some((r) => r.test(line))) add('console', line.split('\n')[0].slice(0, 160), where);
      }
    }
  }
}

for (const [key, where] of [...issues].sort()) {
  const list = [...where];
  console.log(`${key}\n    ${list.length}x: ${list.slice(0, 6).join(', ')}${list.length > 6 ? ' …' : ''}`);
}
