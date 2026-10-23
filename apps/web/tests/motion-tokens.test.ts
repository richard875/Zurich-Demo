import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { distance, duration, ease, stagger } from '@/motion/tokens';

const css = readFileSync(resolve(__dirname, '../src/styles/globals.css'), 'utf8');

const token = (name: string) => {
  const match = css.match(new RegExp(`--${name}:\\s*([^;]+);`));
  if (!match?.[1]) throw new Error(`--${name} is missing from globals.css`);
  return match[1].trim();
};
const ms = (name: string) => Number(token(name).replace(/ms$/, '')) / 1000;
const px = (name: string) => Number(token(name).replace(/px$/, ''));

describe('motion tokens', () => {
  it('match between globals.css and motion/tokens.ts', () => {
    expect({
      press: ms('motion-press'),
      state: ms('motion-state'),
      switchIn: ms('motion-switch-in'),
      switchOut: ms('motion-switch-out'),
      enter: ms('motion-enter'),
      settle: ms('motion-settle'),
      confirm: ms('motion-confirm'),
    }).toEqual(duration);
    expect(ms('motion-stagger')).toBe(stagger);
    expect({ rise: px('motion-rise'), nudge: px('motion-nudge') }).toEqual(distance);
    expect(token('ease-entrance')).toBe(`cubic-bezier(${ease.entrance.join(', ')})`);
    // CSS's ease-in-out is cubic-bezier(0.42, 0, 0.58, 1).
    expect(token('ease-state')).toBe('ease-in-out');
    expect(ease.state).toEqual([0.42, 0, 0.58, 1]);
  });

  it('keep every duration at 600ms or less', () => {
    for (const seconds of Object.values(duration)) expect(seconds).toBeLessThanOrEqual(0.6);
  });
});
