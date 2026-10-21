import { randomUUID } from 'node:crypto';
import { Api, Data, Post } from '@modern-js/plugin-bff/server';
import { useHonoContext } from '@modern-js/server-runtime';
import { ageOn, quoteRequestSchema, todayInSydney, type Quote } from '@shared/quote';
import { ratingResponseSchema, type RatingRequest } from './_lib/mulesoft-contract';
import { postToMulesoft } from './_lib/mulesoft-client';
import { saveQuote } from './_lib/quote-store';
import { errorResponse } from './_lib/responses';

export const post = Api(Post('/quotes'), Data(quoteRequestSchema), async ({ data }) => {
  const c = useHonoContext();
  const correlationId = c.get('correlationId');
  const log = c.get('logger');

  const age = ageOn(data.dateOfBirth, todayInSydney());
  const ratingRequest: RatingRequest = {
    age,
    smoker: data.smoker,
    state: data.state,
    lifeCoverSumInsured: data.lifeCover,
    incomeProtectionMonthlyBenefit: data.incomeProtection,
  };
  const rating = await postToMulesoft('/rating', ratingRequest, ratingResponseSchema, {
    correlationId,
    log,
  });
  if (!rating.ok) {
    return errorResponse(
      502,
      'We couldn’t work out your price just now. Please try again in a moment.',
    );
  }

  const { incomeProtection } = rating.data;
  const quote: Quote = {
    quoteId: randomUUID(),
    createdAt: new Date().toISOString(),
    age,
    smoker: data.smoker,
    state: data.state,
    life: { sumInsured: data.lifeCover, monthlyPremiumCents: rating.data.life.monthlyPremiumCents },
    incomeProtection:
      incomeProtection && data.incomeProtection !== null
        ? { monthlyBenefit: data.incomeProtection, ...incomeProtection }
        : null,
    monthlyPremiumCents: rating.data.monthlyPremiumCents,
    yearlyPremiumCents: rating.data.yearlyPremiumCents,
  };

  try {
    await saveQuote(quote, data);
  } catch (error) {
    log.error({ err: error }, 'saving quote failed');
    return errorResponse(500, 'We couldn’t save your quote just now. Please try again.');
  }

  log.info(
    { quoteId: quote.quoteId, monthlyPremiumCents: quote.monthlyPremiumCents },
    'quote created',
  );
  return quote;
});
