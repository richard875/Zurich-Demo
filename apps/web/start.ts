// The production entry point: node .output/start.cjs
// Bundled to start.cjs at build time, because .output only ships the app's own dependencies.
// In AWS the session secret stays in Parameter Store, out of the Lambda's settings and Terraform
// state, so it's read here before the server starts. Local and CI runs set SESSION_SECRET (or use
// the default) and go straight to the server.
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';

async function loadSessionSecret(): Promise<void> {
  const name = process.env.SESSION_SECRET_PARAMETER;
  if (!name || process.env.SESSION_SECRET) return;
  const ssm = new SSMClient({ region: process.env.AWS_REGION });
  const { Parameter } = await ssm.send(
    new GetParameterCommand({ Name: name, WithDecryption: true }),
  );
  if (!Parameter?.Value) throw new Error(`Parameter ${name} has no value`);
  process.env.SESSION_SECRET = Parameter.Value;
}

loadSessionSecret()
  .then(() => import(pathToFileURL(join(__dirname, 'index.js')).href))
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
