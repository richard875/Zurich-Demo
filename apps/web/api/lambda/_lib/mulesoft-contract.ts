// The BFF's contract with the (mock) MuleSoft APIs. The mock implements it;
// the BFF validates every response against it.
import { z } from 'zod';
import { MAX_AGE, MIN_AGE, STATES } from '@shared/quote';

const cents = z.number().int().nonnegative();

export const ratingRequestSchema = z.object({
  age: z.number().int().min(MIN_AGE).max(MAX_AGE),
  smoker: z.boolean(),
  state: z.enum(STATES),
  lifeCoverSumInsured: z.number().int().positive(),
  incomeProtectionMonthlyBenefit: z.number().int().positive().nullable(),
});

export const ratingResponseSchema = z.object({
  ratingVersion: z.string(),
  life: z.object({ monthlyPremiumCents: cents }),
  incomeProtection: z.object({ monthlyPremiumCents: cents, discountCents: cents }).nullable(),
  monthlyPremiumCents: cents,
  yearlyPremiumCents: cents,
});

export const underwritingRequestSchema = z.object({
  answers: z.array(z.object({ questionId: z.string().min(1), answer: z.boolean() })).min(1),
});

export const underwritingResponseSchema = z.object({
  decision: z.enum(['ACCEPT', 'REFER']),
});

export type RatingRequest = z.infer<typeof ratingRequestSchema>;
export type RatingResponse = z.infer<typeof ratingResponseSchema>;
export type UnderwritingRequest = z.infer<typeof underwritingRequestSchema>;
export type UnderwritingResponse = z.infer<typeof underwritingResponseSchema>;
