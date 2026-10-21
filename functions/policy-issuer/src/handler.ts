import type { SQSBatchResponse, SQSEvent } from 'aws-lambda';
import type { Logger } from 'pino';
import { applicationSubmittedSchema, type ApplicationSubmitted } from './event';
import { issuePolicy, type IssuePolicyDeps } from './issue-policy';

function parseMessage(body: string): ApplicationSubmitted | null {
  try {
    const result = applicationSubmittedSchema.safeParse(JSON.parse(body));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

// Each failed message is reported back to SQS, which retries it and, after three receives,
// moves it to the dead-letter queue. Invalid messages fail too, so they end up there for inspection.
export function createHandler({ log, ...deps }: IssuePolicyDeps & { log: Logger }) {
  return async (event: SQSEvent): Promise<SQSBatchResponse> => {
    const batchItemFailures: SQSBatchResponse['batchItemFailures'] = [];

    for (const record of event.Records) {
      const message = parseMessage(record.body);
      const correlationId =
        message?.correlationId ?? record.messageAttributes.correlationId?.stringValue;
      const recordLog = log.child({
        messageId: record.messageId,
        correlationId,
        applicationId: message?.applicationId,
      });

      if (!message) {
        recordLog.error('invalid ApplicationSubmitted message');
        batchItemFailures.push({ itemIdentifier: record.messageId });
        continue;
      }

      try {
        const result = await issuePolicy(message, deps);
        recordLog.info(
          result,
          result.outcome === 'issued' ? 'policy issued' : 'application already processed',
        );
      } catch (error) {
        recordLog.error({ err: error }, 'issuing policy failed');
        batchItemFailures.push({ itemIdentifier: record.messageId });
      }
    }

    return { batchItemFailures };
  };
}
