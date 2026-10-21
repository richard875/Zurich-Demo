import { PutCommand } from '@aws-sdk/lib-dynamodb';
import type { Quote, QuoteRequest } from '@shared/quote';
import { getDb, tableName } from './dynamo';

const QUOTE_TTL_SECONDS = 7 * 24 * 60 * 60;

export async function saveQuote(quote: Quote, inputs: QuoteRequest): Promise<void> {
  const createdAtSeconds = Math.floor(Date.parse(quote.createdAt) / 1000);
  await getDb().send(
    new PutCommand({
      TableName: tableName(),
      Item: {
        PK: `QUOTE#${quote.quoteId}`,
        SK: 'QUOTE',
        ...quote,
        inputs,
        expiresAt: createdAtSeconds + QUOTE_TTL_SECONDS,
      },
    }),
  );
}
