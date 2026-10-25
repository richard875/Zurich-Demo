import { randomUUID } from 'node:crypto';
import { TransactionCanceledException } from '@aws-sdk/client-dynamodb';
import { QueryCommand, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { policySchema, type Policy } from '@shared/application';
import type { Quote } from '@shared/quote';
import { getDb, tableName } from './dynamo';
import { QUOTE_TTL_SECONDS } from './quote-store';

const customerKey = (customerId: string) => `CUSTOMER#${customerId}`;

// Thrown when the quote already has an application, from another tab say.
export class QuoteAlreadyUsedError extends Error {}

// An application holds the cover and its price, never a name or the health answers.
export async function saveApplication(input: {
  customerId: string;
  quote: Quote;
  status: 'PROCESSING' | 'REFERRED';
}): Promise<{ applicationId: string; sk: string }> {
  const applicationId = randomUUID();
  const createdAt = new Date().toISOString();
  // createdAt leads the sort key, so a customer's applications sort newest first.
  const sk = `APP#${createdAt}#${applicationId}`;

  const quoteCreatedSeconds = Math.floor(Date.parse(input.quote.createdAt) / 1000);

  // The application and a marker on its quote are written together, and the marker can only be
  // written once, so each quote makes one application.
  try {
    await getDb().send(
      new TransactWriteCommand({
        TransactItems: [
          {
            Put: {
              TableName: tableName(),
              Item: {
                PK: customerKey(input.customerId),
                SK: sk,
                applicationId,
                quoteId: input.quote.quoteId,
                lifeCover: input.quote.life.sumInsured,
                incomeProtection: input.quote.incomeProtection?.monthlyBenefit ?? null,
                monthlyPremiumCents: input.quote.monthlyPremiumCents,
                yearlyPremiumCents: input.quote.yearlyPremiumCents,
                status: input.status,
                createdAt,
                updatedAt: createdAt,
              },
              ConditionExpression: 'attribute_not_exists(PK)',
            },
          },
          {
            Put: {
              TableName: tableName(),
              Item: {
                PK: `QUOTE#${input.quote.quoteId}`,
                SK: 'APPLIED',
                applicationId,
                expiresAt: quoteCreatedSeconds + QUOTE_TTL_SECONDS,
              },
              ConditionExpression: 'attribute_not_exists(PK)',
            },
          },
        ],
      }),
    );
  } catch (error) {
    const quoteTaken =
      error instanceof TransactionCanceledException &&
      error.CancellationReasons?.[1]?.Code === 'ConditionalCheckFailed';
    if (quoteTaken) throw new QuoteAlreadyUsedError();
    throw error;
  }
  return { applicationId, sk };
}

export async function listApplications(customerId: string): Promise<Policy[]> {
  const { Items = [] } = await getDb().send(
    new QueryCommand({
      TableName: tableName(),
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
      ExpressionAttributeValues: { ':pk': customerKey(customerId), ':prefix': 'APP#' },
      ScanIndexForward: false,
      Limit: 50,
    }),
  );
  return Items.map((item) => policySchema.parse({ policyNumber: null, ...item }));
}
