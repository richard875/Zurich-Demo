import { defineConfig, devices } from '@playwright/test';

// Two copies of the production build (.output) on DynamoDB Local with inline events: a normal one, and one whose
// mock MuleSoft always fails, for the error path.
const serverEnv = (port: number, overrides: Record<string, string> = {}) => ({
  NODE_ENV: 'production',
  PORT: String(port),
  AWS_REGION: 'ap-southeast-2',
  DYNAMODB_TABLE: 'zurich-demo',
  DYNAMODB_ENDPOINT: process.env.DYNAMODB_ENDPOINT ?? 'http://localhost:8000',
  EVENTS_MODE: 'inline',
  MULESOFT_BASE_URL: `http://localhost:${port}/api/mock-mulesoft`,
  MOCK_MULESOFT_LATENCY_MS: '50',
  MOCK_MULESOFT_FAIL_RATE: '0',
  SESSION_SECRET: 'e2e-only-session-secret',
  COOKIE_SECURE: 'false',
  LOG_LEVEL: 'warn',
  ...overrides,
});

export const failingServerUrl = 'http://localhost:8091';

export default defineConfig({
  testDir: './e2e',
  // One worker: every test signs in as the same browser fingerprint, so they share a customer.
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL: 'http://localhost:8090', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'node .output/index',
      url: 'http://localhost:8090/api/health',
      env: serverEnv(8090),
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'node .output/index',
      url: `${failingServerUrl}/api/health`,
      env: serverEnv(8091, { MOCK_MULESOFT_FAIL_RATE: '1' }),
      reuseExistingServer: !process.env.CI,
    },
  ],
});
