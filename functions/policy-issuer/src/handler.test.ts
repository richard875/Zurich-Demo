import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import type { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import type { SQSEvent, SQSRecord } from 'aws-lambda';
import pino from 'pino';
import { describe, expect, it, vi } from 'vitest';
import type { ApplicationSubmitted } from './event';
import { createHandler } from './handler';

const event: ApplicationSubmitted = {
  type: 'ApplicationSubmitted',
  customerId: 'cust_0123456789abcdef',
  sk: 'APP#2026-10-24T09:00:00.000Z#6f1c2f6e-3c1a-4b8e-9f0a-2d4c6e8a0b1c',
  applicationId: '6f1c2f6e-3c1a-4b8e-9f0a-2d4c6e8a0b1c',
  correlationId: 'corr-12345678',
};

function record(messageId: string, body: unknown): SQSRecord {
  return {
    messageId,
    body: typeof body === 'string' ? body : JSON.stringify(body),
    messageAttributes: {
      correlationId: {
        stringValue: 'corr-12345678',
        dataType: 'String',
        stringListValues: [],
        binaryListValues: [],
      },
    },
  } as unknown as SQSRecord;
}

const sqsEvent = (...records: SQSRecord[]): SQSEvent => ({ Records: records });

function setup(send: (command: UpdateCommand) => Promise<unknown>) {
  const db = { send: vi.fn(send) };
  const handler = createHandler({ db, tableName: 'test-table', log: pino({ level: 'silent' }) });
  return { db, handler };
}

describe('policy issuer handler', () => {
  it('activates a processing application with a ZLD policy number', async () => {
    const { db, handler } = setup(async () => ({}));
    await expect(handler(sqsEvent(record('m1', event)))).resolves.toEqual({
      batchItemFailures: [],
    });

    const input = db.send.mock.calls[0]?.[0].input;
    expect(input).toMatchObject({
      TableName: 'test-table',
      Key: { PK: 'CUSTOMER#cust_0123456789abcdef', SK: event.sk },
      ConditionExpression: '#status = :processing',
    });
    expect(input?.ExpressionAttributeValues?.[':active']).toBe('ACTIVE');
    expect(input?.ExpressionAttributeValues?.[':policyNumber']).toMatch(/^ZLD-\d{8}$/);
  });

  it('treats an application that is already active as done', async () => {
    const { handler } = setup(async () => {
      throw new ConditionalCheckFailedException({
        message: 'The conditional request failed',
        $metadata: {},
      });
    });
    await expect(handler(sqsEvent(record('m1', event)))).resolves.toEqual({
      batchItemFailures: [],
    });
  });

  it('reports an invalid message as a failure without touching DynamoDB', async () => {
    const { db, handler } = setup(async () => ({}));
    const result = await handler(
      sqsEvent(
        record('bad-json', '{not json'),
        record('bad-shape', { ...event, customerId: 'nope' }),
      ),
    );
    expect(result.batchItemFailures).toEqual([
      { itemIdentifier: 'bad-json' },
      { itemIdentifier: 'bad-shape' },
    ]);
    expect(db.send).not.toHaveBeenCalled();
  });

  it('reports a DynamoDB error as a failure for that message only', async () => {
    const { handler } = setup(async (command) => {
      if (command.input.Key?.SK === event.sk) throw new Error('ProvisionedThroughputExceeded');
      return {};
    });
    const other = { ...event, sk: 'APP#2026-10-24T09:01:00.000Z#other' };
    const result = await handler(sqsEvent(record('fails', event), record('works', other)));
    expect(result.batchItemFailures).toEqual([{ itemIdentifier: 'fails' }]);
  });
});
