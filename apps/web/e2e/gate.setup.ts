import { expect, test as setup } from '@playwright/test';
import { gatePass, sitePassword } from '../playwright.config';

setup('enter the site password', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Password').fill(sitePassword);
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page).toHaveTitle('Zurich Direct (demo)');
  await page.context().storageState({ path: gatePass });
});
