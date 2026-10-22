import { describe, expect, it } from 'vitest';
import type { RatingRequest } from '../api/lambda/_lib/mulesoft-contract';
import { rate } from '../api/lambda/mock-mulesoft/_rating';

const base: RatingRequest = {
  age: 36,
  smoker: false,
  state: 'NSW',
  lifeCoverSumInsured: 500_000,
  incomeProtectionMonthlyBenefit: null,
};

describe('rate', () => {
  it('prices life cover per $1,000 for the age band', () => {
    const result = rate(base);
    expect(result.life.monthlyPremiumCents).toBe(5_500); // 500 x 11c
    expect(result.incomeProtection).toBeNull();
    expect(result.monthlyPremiumCents).toBe(5_500);
    expect(result.yearlyPremiumCents).toBe(66_000);
  });

  it('adds a 1.5x smoker loading', () => {
    expect(rate({ ...base, smoker: true }).life.monthlyPremiumCents).toBe(8_250);
  });

  it('takes 5% off income protection when both covers are chosen', () => {
    const result = rate({ ...base, incomeProtectionMonthlyBenefit: 5_000 });
    expect(result.incomeProtection).toEqual({ monthlyPremiumCents: 7_600, discountCents: 400 });
    expect(result.monthlyPremiumCents).toBe(13_100);
    expect(result.yearlyPremiumCents).toBe(157_200);
  });

  it('rounds each premium to whole cents', () => {
    // 15 x 135c x 1.5 = 3037.5c, which rounds to 3038c, and the discount (151.9c) to 152c.
    const result = rate({
      ...base,
      age: 30,
      smoker: true,
      incomeProtectionMonthlyBenefit: 1_500,
    });
    expect(result.incomeProtection).toEqual({ monthlyPremiumCents: 2_886, discountCents: 152 });
  });

  it('uses the first and last age bands at 18 and 60', () => {
    expect(rate({ ...base, age: 18 }).life.monthlyPremiumCents).toBe(3_000);
    expect(rate({ ...base, age: 60 }).life.monthlyPremiumCents).toBe(32_500);
  });

  it('ignores the state', () => {
    expect(rate({ ...base, state: 'WA' })).toEqual(rate(base));
  });
});
