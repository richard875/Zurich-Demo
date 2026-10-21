// Lambda entry point: wires the real DynamoDB client and logger into the handler.
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import pino from 'pino';
import { z } from 'zod';
import { createHandler } from './handler';

const env = z
  .object({
    DYNAMODB_TABLE: z.string().min(1),
    LOG_LEVEL: z
      .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
      .default('info'),
  })
  .parse(process.env);

export const handler = createHandler({
  db: DynamoDBDocumentClient.from(new DynamoDBClient({})),
  tableName: env.DYNAMODB_TABLE,
  log: pino({
    level: env.LOG_LEVEL,
    base: { service: 'policy-issuer' },
    timestamp: pino.stdTimeFunctions.isoTime,
  }),
});
