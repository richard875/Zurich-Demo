import { readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const folder = resolve(__dirname, '../src/assets/zurich-direct');

describe('home-page photos', () => {
  it.each(readdirSync(folder))('%s is 250 KB or less', (file) => {
    expect(statSync(resolve(folder, file)).size).toBeLessThanOrEqual(250_000);
  });
});
