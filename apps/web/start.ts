// The production entry point: node .output/start.cjs
// Bundled to start.cjs at build time, because .output only ships the app's own dependencies.
// In AWS the session secret and the site password stay in Parameter Store, out of the Lambda's
// settings and Terraform state, so they're read here before the server starts. Local and CI runs
// set SESSION_SECRET and SITE_PASSWORD themselves (or use the defaults) and go straight to the
// server.
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { GetParametersCommand, SSMClient } from '@aws-sdk/client-ssm';

// Each variable, and the variable naming the parameter that holds it.
const secrets = {
  SESSION_SECRET: 'SESSION_SECRET_PARAMETER',
  SITE_PASSWORD: 'SITE_PASSWORD_PARAMETER',
};

async function loadSecrets(): Promise<void> {
  const wanted = Object.entries(secrets).flatMap(([variable, parameterVariable]) => {
    const name = process.env[parameterVariable];
    return name && !process.env[variable] ? [{ variable, name }] : [];
  });
  if (wanted.length === 0) return;
  const ssm = new SSMClient({ region: process.env.AWS_REGION });
  const { Parameters = [] } = await ssm.send(
    new GetParametersCommand({ Names: wanted.map(({ name }) => name), WithDecryption: true }),
  );
  for (const { variable, name } of wanted) {
    const value = Parameters.find((parameter) => parameter.Name === name)?.Value;
    if (!value) throw new Error(`Parameter ${name} has no value`);
    process.env[variable] = value;
  }
}

loadSecrets()
  .then(() => import(pathToFileURL(join(__dirname, 'index.js')).href))
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
