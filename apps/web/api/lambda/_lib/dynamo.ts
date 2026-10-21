import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { getEnv } from './env';

let documentClient: DynamoDBDocumentClient | undefined;

export function getDb(): DynamoDBDocumentClient {
  if (!documentClient) {
    const env = getEnv();
    // DynamoDB Local accepts any credentials. Fixed ones stop the SDK picking up a real AWS profile.
    const client = new DynamoDBClient(
      env.DYNAMODB_ENDPOINT
        ? {
            region: env.AWS_REGION,
            endpoint: env.DYNAMODB_ENDPOINT,
            credentials: { accessKeyId: 'local', secretAccessKey: 'local' },
          }
        : { region: env.AWS_REGION },
    );
    documentClient = DynamoDBDocumentClient.from(client, {
      marshallOptions: { removeUndefinedValues: true },
    });
  }
  return documentClient;
}

export const tableName = () => getEnv().DYNAMODB_TABLE;
