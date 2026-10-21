import { post as postQuote } from '@api/quotes';
import { quoteSchema, type Quote, type QuoteRequest } from '@shared/quote';
import { friendlyError } from '@/lib/friendly-error';

export async function requestQuote(request: QuoteRequest): Promise<Quote> {
  let body: unknown;
  try {
    body = await postQuote({ data: request });
  } catch (error) {
    throw new Error(friendlyError(error), { cause: error });
  }
  const parsed = quoteSchema.safeParse(body);
  if (!parsed.success) throw new Error('Something went wrong. Please try again.');
  return parsed.data;
}
