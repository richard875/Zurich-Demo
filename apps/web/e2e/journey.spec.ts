import { expect, test } from '@playwright/test';
import { failingServerUrl } from '../playwright.config';
import {
  expectNoSeriousAxeViolations,
  getQuoteWithDemoDetails,
  heading,
  signInAndApply,
} from './helpers';

test('quote, sign in and apply, then the policy goes from Processing to Active', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('note')).toContainText(
    'Design concept, not the live Zurich Direct site.',
  );
  await expectNoSeriousAxeViolations(page);

  await getQuoteWithDemoDetails(page, { checkAxe: true });
  await expect(heading(page, 'Your quote')).toBeVisible();
  await expect(page.getByText('$115.80')).toBeVisible();
  await expect(page.getByText('Your first month is free.')).toBeVisible();
  await expect(page.getByText('This is general information only')).toBeVisible();
  await expectNoSeriousAxeViolations(page);

  await signInAndApply(page, { checkAxe: true });
  await expect(page.getByText('We’re setting up your policy now.')).toBeVisible();
  await expectNoSeriousAxeViolations(page);

  await page.getByRole('link', { name: 'View my policies' }).click();
  await expect(heading(page, 'My policies')).toBeVisible();
  await expect(page.getByText(/^Demo customer · device [0-9a-f]{4}$/)).toBeVisible();
  const newest = page.getByRole('main').getByRole('listitem').first();
  await expect(newest.getByTestId('policy-status')).toHaveText('Processing');
  await expectNoSeriousAxeViolations(page);

  await expect(newest.getByTestId('policy-status')).toHaveText('Active', { timeout: 15_000 });
  await expect(newest.getByTestId('policy-number')).toHaveText(/^ZLD-\d{8}$/);
});

test('a yes to a health question is referred for review', async ({ page }) => {
  await getQuoteWithDemoDetails(page);
  await expect(heading(page, 'Your quote')).toBeVisible();
  await signInAndApply(page, { answerYes: true });
  await expect(page.getByText('We’ll be in touch')).toBeVisible();
  await expect(page.getByRole('link', { name: 'View my policies' })).toHaveCount(0);
});

test.describe('when mock MuleSoft is down', () => {
  test.use({ baseURL: failingServerUrl });

  test('the quote step shows a friendly error', async ({ page }) => {
    await getQuoteWithDemoDetails(page);
    await expect(page.getByRole('alert')).toHaveText(
      'We couldn’t work out your price just now. Please try again in a moment.',
    );
    await expect(heading(page, 'Choose your cover')).toBeVisible();
    await expectNoSeriousAxeViolations(page);
  });
});
