// Creates the app's table in DynamoDB Local. Safe to run more than once.
import {
  CreateTableCommand,
  DescribeTableCommand,
  DescribeTimeToLiveCommand,
  DynamoDBClient,
  ResourceNotFoundException,
  UpdateTimeToLiveCommand,
} from '@aws-sdk/client-dynamodb';

const tableName = process.env.DYNAMODB_TABLE ?? 'zurich-demo';
const endpoint = process.env.DYNAMODB_ENDPOINT ?? 'http://localhost:8000';

// Fixed local credentials so this never picks up a real AWS profile.
const client = new DynamoDBClient({
  endpoint,
  region: 'ap-southeast-2',
  credentials: { accessKeyId: 'local', secretAccessKey: 'local' },
});

async function tableExists(): Promise<boolean> {
  try {
    await client.send(new DescribeTableCommand({ TableName: tableName }));
    return true;
  } catch (error) {
    if (error instanceof ResourceNotFoundException) return false;
    throw error;
  }
}

async function main(): Promise<void> {
  if (await tableExists()) {
    console.log(`Table ${tableName} already exists at ${endpoint}`);
  } else {
    await client.send(
      new CreateTableCommand({
        TableName: tableName,
        BillingMode: 'PAY_PER_REQUEST',
        AttributeDefinitions: [
          { AttributeName: 'PK', AttributeType: 'S' },
          { AttributeName: 'SK', AttributeType: 'S' },
        ],
        KeySchema: [
          { AttributeName: 'PK', KeyType: 'HASH' },
          { AttributeName: 'SK', KeyType: 'RANGE' },
        ],
      }),
    );
    console.log(`Created table ${tableName} at ${endpoint}`);
  }

  const ttl = await client.send(new DescribeTimeToLiveCommand({ TableName: tableName }));
  if (ttl.TimeToLiveDescription?.TimeToLiveStatus !== 'ENABLED') {
    await client.send(
      new UpdateTimeToLiveCommand({
        TableName: tableName,
        TimeToLiveSpecification: { AttributeName: 'expiresAt', Enabled: true },
      }),
    );
    console.log('Enabled TTL on expiresAt');
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`db:init failed: ${message}`);
  console.error(`Is DynamoDB Local running at ${endpoint}? Try: docker compose up -d`);
  process.exit(1);
});
