import { randomInt } from 'node:crypto';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import type { ApplicationSubmitted } from './event';

// The one DynamoDB call this needs, so tests can pass a fake client.
export interface PolicyTable {
  send(command: UpdateCommand): Promise<unknown>;
}

export interface IssuePolicyDeps {
  db: PolicyTable;
  tableName: string;
}

export type IssueOutcome =
  { outcome: 'issued'; policyNumber: string } | { outcome: 'already-processed' };

export const newPolicyNumber = () => `ZLD-${String(randomInt(0, 100_000_000)).padStart(8, '0')}`;

// Moves a PROCESSING application to ACTIVE with a policy number. Safe to run twice for the same
// event: once the status has moved on, the condition fails and that counts as done.
export async function issuePolicy(
  event: ApplicationSubmitted,
  { db, tableName }: IssuePolicyDeps,
): Promise<IssueOutcome> {
  const policyNumber = newPolicyNumber();
  try {
    await db.send(
      new UpdateCommand({
        TableName: tableName,
        Key: { PK: `CUSTOMER#${event.customerId}`, SK: event.sk },
        UpdateExpression: 'SET #status = :active, policyNumber = :policyNumber, updatedAt = :now',
        ConditionExpression: '#status = :processing',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: {
          ':active': 'ACTIVE',
          ':processing': 'PROCESSING',
          ':policyNumber': policyNumber,
          ':now': new Date().toISOString(),
        },
      }),
    );
    return { outcome: 'issued', policyNumber };
  } catch (error) {
    if (error instanceof Error && error.name === 'ConditionalCheckFailedException') {
      return { outcome: 'already-processed' };
    }
    throw error;
  }
}
