// .output ships only the dependencies Modern.js traces from the server's imports. The gate page
// reads its fonts and icons from the design tokens at run time (server/gate-page.ts), which the
// tracer can't see, so the files it reads are copied in after the build.
import { copyFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

// Run from apps/web, as pnpm build:gate does.
const require = createRequire(join(process.cwd(), 'package.json'));
const from = dirname(require.resolve('@zurich/design-tokens/package.json'));
const to = '.output/node_modules/@zurich/design-tokens';

for (const file of [
  'package.json',
  'LICENSE.md',
  'dist/EmbeddedFonts.css',
  'dist/icons/line.css',
]) {
  mkdirSync(dirname(join(to, file)), { recursive: true });
  copyFileSync(join(from, file), join(to, file));
}
