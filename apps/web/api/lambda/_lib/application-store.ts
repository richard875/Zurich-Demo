import { randomUUID } from 'node:crypto';
import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { policySchema, type Policy } from '@shared/application';
import type { Quote } from '@shared/quote';
import { getDb, tableName } from './dynamo';

const customerKey = (customerId: string) => `CUSTOMER#${customerId}`;

// The first name is stored with the application but never logged. Health answers aren't stored.
export async function saveApplication(input: {
  customerId: string;
  quote: Quote;
  firstName: string;
  status: 'PROCESSING' | 'REFERRED';
}): Promise<{ applicationId: string; sk: string }> {
  const applicationId = randomUUID();
  const createdAt = new Date().toISOString();
  // createdAt leads the sort key, so a customer's applications sort newest first.
  const sk = `APP#${createdAt}#${applicationId}`;

  await getDb().send(
    new PutCommand({
      TableName: tableName(),
      Item: {
        PK: customerKey(input.customerId),
        SK: sk,
        applicationId,
        quoteId: input.quote.quoteId,
        firstName: input.firstName,
        lifeCover: input.quote.life.sumInsured,
        incomeProtection: input.quote.incomeProtection?.monthlyBenefit ?? null,
        monthlyPremiumCents: input.quote.monthlyPremiumCents,
        yearlyPremiumCents: input.quote.yearlyPremiumCents,
        status: input.status,
        createdAt,
        updatedAt: createdAt,
      },
      ConditionExpression: 'attribute_not_exists(PK)',
    }),
  );
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
