import { Api, Data, Post } from '@modern-js/plugin-bff/server';
import { useHonoContext } from '@modern-js/server-runtime';
import { applicationRequestSchema, type ApplicationResult } from '@shared/application';
import { QuoteAlreadyUsedError, saveApplication } from './_lib/application-store';
import { publishApplicationSubmitted } from './_lib/events';
import { postToMulesoft } from './_lib/mulesoft-client';
import { underwritingResponseSchema } from './_lib/mulesoft-contract';
import { getQuote } from './_lib/quote-store';
import { errorResponse } from './_lib/responses';

export const post = Api(Post('/applications'), Data(applicationRequestSchema), async ({ data }) => {
  const c = useHonoContext();
  const customerId = c.get('customerId');
  const correlationId = c.get('correlationId');
  const log = c.get('logger');
  // The session middleware already returns 401 here; this narrows the type.
  if (!customerId) return errorResponse(401, 'Please sign in to continue.');

  try {
    const quote = await getQuote(data.quoteId);
    if (!quote) return errorResponse(404, 'Your quote has expired. Please get a new quote.');

    const answers = Object.entries(data.answers).map(([questionId, answer]) => ({
      questionId,
      answer,
    }));
    const underwriting = await postToMulesoft(
      '/underwriting',
      { answers },
      underwritingResponseSchema,
      {
        correlationId,
        log,
      },
    );
    if (!underwriting.ok) {
      return errorResponse(
        502,
        "We couldn't send your application just now. Please try again in a moment.",
      );
    }

    const status = underwriting.data.decision === 'ACCEPT' ? 'PROCESSING' : 'REFERRED';
    const { applicationId, sk } = await saveApplication({ customerId, quote, status });
    if (status === 'PROCESSING') {
      await publishApplicationSubmitted(
        { type: 'ApplicationSubmitted', customerId, sk, applicationId, correlationId },
        log,
      );
    }

    log.info({ applicationId, quoteId: quote.quoteId, status }, 'application saved');
    const result: ApplicationResult = { applicationId, status };
    return result;
  } catch (error) {
    if (error instanceof QuoteAlreadyUsedError) {
      return errorResponse(
        409,
        "You've already applied with this quote. Get a new quote to apply again.",
      );
    }
    log.error({ err: error }, 'saving application failed');
    return errorResponse(500, "We couldn't save your application just now. Please try again.");
  }
});
