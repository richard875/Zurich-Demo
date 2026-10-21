import { z } from 'zod';

// The .env.example values, so `pnpm dev` and the tests run without a .env file.
// Production (NODE_ENV=production) gets no defaults and must set every variable.
const localDefaults = {
  PORT: '8080',
  AWS_REGION: 'ap-southeast-2',
  DYNAMODB_TABLE: 'zurich-demo',
  DYNAMODB_ENDPOINT: 'http://localhost:8000',
  EVENTS_MODE: 'inline',
  MULESOFT_BASE_URL: 'http://localhost:8080/api/mock-mulesoft',
  SESSION_SECRET: 'local-dev-only',
  COOKIE_SECURE: 'false',
};

const blankAsUndefined = (value: unknown) => (value === '' ? undefined : value);

const envSchema = z
  .object({
    PORT: z.coerce.number().int().positive(),
    AWS_REGION: z.string().min(1),
    DYNAMODB_TABLE: z.string().min(1),
    DYNAMODB_ENDPOINT: z.preprocess(blankAsUndefined, z.string().url().optional()),
    EVENTS_MODE: z.enum(['inline', 'sns']),
    SNS_TOPIC_ARN: z.preprocess(blankAsUndefined, z.string().startsWith('arn:aws:sns:').optional()),
    MULESOFT_BASE_URL: z.string().url(),
    MOCK_MULESOFT_LATENCY_MS: z.coerce.number().int().min(0).default(300),
    MOCK_MULESOFT_FAIL_RATE: z.coerce.number().min(0).max(1).default(0),
    SESSION_SECRET: z.string().min(12),
    COOKIE_SECURE: z.enum(['true', 'false']).transform((value) => value === 'true'),
    LOG_LEVEL: z
      .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
      .default('info'),
  })
  .refine((env) => env.EVENTS_MODE !== 'sns' || env.SNS_TOPIC_ARN !== undefined, {
    message: 'is required when EVENTS_MODE=sns',
    path: ['SNS_TOPIC_ARN'],
  });

export type Env = z.infer<typeof envSchema>;

function parseEnv(): Env {
  const source =
    process.env.NODE_ENV === 'production' ? process.env : { ...localDefaults, ...process.env };
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const problems = result.error.issues
      .map((issue) => `  ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment variables:\n${problems}`);
  }
  return result.data;
}

let cached: Env | undefined;

// Read on first use, not at import: `modern build` imports the BFF modules without production env vars.
// The server config calls this at startup, so a bad value still stops the server straight away.
export function getEnv(): Env {
  cached ??= parseEnv();
  return cached;
}
