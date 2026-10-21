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
    // Server-side tests live in tests/, outside api/ and shared/, so Modern.js doesn't ship them.
    include: ['src/**/*.test.tsx', 'tests/**/*.test.ts'],
    setupFiles: ['./vitest.setup.ts'],
  },
});
