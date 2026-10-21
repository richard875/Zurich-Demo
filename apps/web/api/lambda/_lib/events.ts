import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import type { Logger } from 'pino';
import { applicationSubmittedSchema, issuePolicy, type ApplicationSubmitted } from 'policy-issuer';
import { getDb, tableName } from './dynamo';
import { getEnv } from './env';

// Matches the SQS delivery delay in AWS, so Processing is visible locally too.
const INLINE_DELAY_MS = 3000;

let sns: SNSClient | undefined;

export async function publishApplicationSubmitted(
  event: ApplicationSubmitted,
  log: Logger,
): Promise<void> {
  const env = getEnv();
  const body = JSON.stringify(applicationSubmittedSchema.parse(event));

  if (env.EVENTS_MODE === 'sns') {
    sns ??= new SNSClient({ region: env.AWS_REGION });
    await sns.send(
      new PublishCommand({
        TopicArn: env.SNS_TOPIC_ARN,
        Message: body,
        MessageAttributes: {
          correlationId: { DataType: 'String', StringValue: event.correlationId },
        },
      }),
    );
    log.info({ applicationId: event.applicationId }, 'ApplicationSubmitted published');
    return;
  }

  // Inline mode stands in for SNS -> SQS -> Lambda in local dev and CI. It runs the Lambda's
  // issuing code in-process, validating the message the way the Lambda does.
  setTimeout(() => {
    const received = applicationSubmittedSchema.parse(JSON.parse(body));
    issuePolicy(received, { db: getDb(), tableName: tableName() })
      .then((result) =>
        log.info(
          { applicationId: received.applicationId, ...result },
          'inline policy issuer finished',
        ),
      )
      .catch((error: unknown) => log.error({ err: error }, 'inline policy issuer failed'));
  }, INLINE_DELAY_MS);
}
