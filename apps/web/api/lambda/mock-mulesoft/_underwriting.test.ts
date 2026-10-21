import { describe, expect, it } from 'vitest';
import { underwrite } from './_underwriting';

const answers = (...values: boolean[]) =>
  values.map((answer, index) => ({ questionId: `q${index + 1}`, answer }));

describe('underwrite', () => {
  it('accepts when every answer is no', () => {
    expect(underwrite({ answers: answers(false, false, false, false) })).toEqual({
      decision: 'ACCEPT',
    });
  });

  it('refers when any answer is yes', () => {
    expect(underwrite({ answers: answers(false, false, true, false) })).toEqual({
      decision: 'REFER',
    });
  });
});
