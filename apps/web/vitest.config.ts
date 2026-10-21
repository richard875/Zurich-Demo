import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

const fromHere = (path: string) => `${resolve(__dirname, path)}/`;

// Same aliases as tsconfig.json, which Modern.js reads.
export default defineConfig({
  // tsconfig keeps JSX as-is for Modern.js's bundler, so tests compile it themselves.
  oxc: { jsx: { runtime: 'automatic' } },
  resolve: {
    alias: [
      { find: /^@\//, replacement: fromHere('src') },
      { find: /^@api\//, replacement: fromHere('api/lambda') },
      { find: /^@shared\//, replacement: fromHere('shared') },
    ],
  },
  test: {
    include: ['{src,api,shared}/**/*.test.{ts,tsx}'],
    setupFiles: ['./vitest.setup.ts'],
  },
});
