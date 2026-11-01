import { expect, test, type Page } from '@playwright/test';
import { sitePassword } from '../playwright.config';
import { expectNoSeriousAxeViolations, heading } from './helpers';

// A visitor without the password: none of these tests start with the gate pass.
test.use({ storageState: { cookies: [], origins: [] } });

const favicon = (page: Page) => page.locator('link[rel="icon"]').getAttribute('href');

test('the server keeps everything behind the gate until the password is entered', async ({
  page,
  request,
}) => {
  const response = await page.goto('/quote?from=gate');
  expect(response?.status()).toBe(401);
  await expect(page).toHaveTitle('Private demo');
  await expect(heading(page, 'This demo is private')).toBeVisible();
  // No logo, no Zurich favicon, and no app script on the page.
  expect(await favicon(page)).toMatch(/^data:image\/svg\+xml,/);
  await expect(page.locator('script, [z-logo]')).toHaveCount(0);
  await expectNoSeriousAxeViolations(page);

  // Nothing else comes back without the pass either: not the APIs, not the app's code.
  expect((await request.get('/api/session')).status()).toBe(401);
  expect((await request.get('/static/js/index.js')).status()).toBe(401);
  expect((await request.get('/api/health')).status()).toBe(200);
  // A cookie made up in the browser doesn't get past it.
  await page
    .context()
    .addCookies([{ name: 'zld_gate', value: '9999999999.forged', domain: 'localhost', path: '/' }]);
  expect((await page.reload())?.status()).toBe(401);

  await page.getByLabel('Password').fill('not-the-password');
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('alert')).toHaveText("That password isn't right. Please try again.");
  await expect(page.getByLabel('Password')).toHaveAttribute('aria-invalid', 'true');

  await page.getByLabel('Password').fill(sitePassword);
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(heading(page, 'About you')).toBeVisible();
  expect(new URL(page.url()).pathname + new URL(page.url()).search).toBe('/quote?from=gate');
  expect(await favicon(page)).not.toMatch(/^data:image\/svg\+xml,/);
  // The pass is HttpOnly: page scripts can't read or copy it.
  expect(await page.evaluate(() => document.cookie)).not.toContain('zld_gate');
});
