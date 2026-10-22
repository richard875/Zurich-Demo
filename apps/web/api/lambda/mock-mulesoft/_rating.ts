// Invented demo rates. They are not Zurich's, or anyone's, real pricing.
import type { RatingRequest, RatingResponse } from '../_lib/mulesoft-contract';

export const RATING_VERSION = 'demo-rates-2026-10';

// Monthly rates in cents: per $1,000 of life cover, and per $100 of monthly income protection benefit.
export const AGE_BANDS = [
  { from: 18, to: 24, lifeCentsPer1000: 6, incomeCentsPer100: 110 },
  { from: 25, to: 29, lifeCentsPer1000: 7, incomeCentsPer100: 120 },
  { from: 30, to: 34, lifeCentsPer1000: 8, incomeCentsPer100: 135 },
  { from: 35, to: 39, lifeCentsPer1000: 11, incomeCentsPer100: 160 },
  { from: 40, to: 44, lifeCentsPer1000: 16, incomeCentsPer100: 200 },
  { from: 45, to: 49, lifeCentsPer1000: 25, incomeCentsPer100: 260 },
  { from: 50, to: 54, lifeCentsPer1000: 40, incomeCentsPer100: 340 },
  { from: 55, to: 60, lifeCentsPer1000: 65, incomeCentsPer100: 450 },
] as const;

export const SMOKER_LOADING = 1.5;
export const BUNDLE_DISCOUNT = 0.05;

// State is accepted but doesn't change the price.
export function rate(request: RatingRequest): RatingResponse {
  const band = AGE_BANDS.find((b) => request.age >= b.from && request.age <= b.to);
  if (!band) throw new Error(`No rate for age ${request.age}`);

  const loading = request.smoker ? SMOKER_LOADING : 1;
  const lifeMonthly = Math.round(
    (request.lifeCoverSumInsured / 1000) * band.lifeCentsPer1000 * loading,
  );

  const benefit = request.incomeProtectionMonthlyBenefit;
  let incomeProtection: RatingResponse['incomeProtection'] = null;
  if (benefit !== null) {
    const fullPremium = Math.round((benefit / 100) * band.incomeCentsPer100 * loading);
    const bothCoversChosen = request.lifeCoverSumInsured > 0;
    const discount = bothCoversChosen ? Math.round(fullPremium * BUNDLE_DISCOUNT) : 0;
    incomeProtection = { monthlyPremiumCents: fullPremium - discount, discountCents: discount };
  }

  const monthly = lifeMonthly + (incomeProtection?.monthlyPremiumCents ?? 0);
  return {
    ratingVersion: RATING_VERSION,
    life: { monthlyPremiumCents: lifeMonthly },
    incomeProtection,
    monthlyPremiumCents: monthly,
    yearlyPremiumCents: monthly * 12,
  };
}
