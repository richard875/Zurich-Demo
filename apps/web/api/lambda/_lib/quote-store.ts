import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { z } from 'zod';
import { quoteSchema, type Quote, type QuoteRequest } from '@shared/quote';
import { getDb, tableName } from './dynamo';

const QUOTE_TTL_SECONDS = 7 * 24 * 60 * 60;

const keyFor = (quoteId: string) => ({ PK: `QUOTE#${quoteId}`, SK: 'QUOTE' });

export async function saveQuote(quote: Quote, inputs: QuoteRequest): Promise<void> {
  const createdAtSeconds = Math.floor(Date.parse(quote.createdAt) / 1000);
  await getDb().send(
    new PutCommand({
      TableName: tableName(),
      Item: {
        ...keyFor(quote.quoteId),
        ...quote,
        inputs,
        expiresAt: createdAtSeconds + QUOTE_TTL_SECONDS,
      },
    }),
  );
}

const storedQuoteSchema = quoteSchema.extend({ expiresAt: z.number() });

// DynamoDB removes expired items lazily, so the expiry is checked here as well.
export async function getQuote(quoteId: string): Promise<Quote | null> {
  const { Item } = await getDb().send(
    new GetCommand({ TableName: tableName(), Key: keyFor(quoteId) }),
  );
  const parsed = storedQuoteSchema.safeParse(Item);
  if (!parsed.success || parsed.data.expiresAt * 1000 < Date.now()) return null;
  return quoteSchema.parse(parsed.data);
}
