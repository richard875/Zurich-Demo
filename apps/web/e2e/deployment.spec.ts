import { expect, test } from '@playwright/test';

test('production responses protect session data, reject unsafe API requests and cache assets', async ({
  page,
  request,
  baseURL,
}) => {
  const violations: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error' && /content security policy/i.test(message.text())) {
      violations.push(message.text());
    }
  });
  const home = await page.goto('/');
  expect(home?.headers()['cache-control']).toBe('no-store');
  expect(home?.headers()['content-security-policy']).toContain("default-src 'self'");
  await expect(
    page.getByRole('button', { name: 'Get a quote', exact: true }).first(),
  ).toBeVisible();
  const session = await request.get('/api/session');
  expect(session.headers()['cache-control']).toBe('no-store');
  expect(session.headers()['x-content-type-options']).toBe('nosniff');
  expect((await request.get('/api/policies')).status()).toBe(401);
  expect((await request.post('/api/mock-mulesoft/rating', { data: {} })).status()).toBe(404);
  for (const origin of ['https://untrusted.example', 'https://localhost:8090']) {
    expect(
      (
        await request.post('/api/session', {
          headers: { origin },
          data: { visitorId: 'demo-browser-123' },
        })
      ).status(),
    ).toBe(403);
  }
  expect(
    (
      await request.post('/api/quotes', {
        headers: { origin: baseURL ?? '' },
        data: { oversized: 'x'.repeat(17 * 1024) },
      })
    ).status(),
  ).toBe(413);
  const asset = await page.locator('script[src^="/static/"]').first().getAttribute('src');
  expect(asset).toBeTruthy();
  const response = await request.get(asset ?? '', { headers: { 'accept-encoding': 'gzip' } });
  expect(response.headers()['content-encoding']).toBe('gzip');
  expect(response.headers()['cache-control']).toBe('public, max-age=31536000, immutable');
  expect((await request.get(`${asset}.map`)).status()).toBe(404);
  expect((await request.get('/static/js/builder-runtime.js.map')).status()).toBe(404);
  expect(violations).toEqual([]);
});
