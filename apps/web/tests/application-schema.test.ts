import { describe, expect, it } from 'vitest';
import { applicationRequestSchema } from '../shared/application';

const application = {
  quoteId: '6f1c2f6e-3c1a-4b8e-9f0a-2d4c6e8a0b1c',
  answers: {
    heartCancerStroke: false,
    undiagnosedSymptoms: false,
    hazardousWork: false,
    overseasStay: false,
  },
};

describe('application request', () => {
  it('takes the quote and the health answers', () => {
    expect(applicationRequestSchema.parse(application)).toEqual(application);
  });

  it('turns away a first name, or anything else it does not expect', () => {
    for (const extra of [{ firstName: 'Sam' }, { name: 'Sam' }]) {
      expect(applicationRequestSchema.safeParse({ ...application, ...extra }).success).toBe(false);
    }
  });
});
