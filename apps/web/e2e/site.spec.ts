import { expect, test, type Page } from '@playwright/test';
import { animationsDone, expectNoSeriousAxeViolations, heading } from './helpers';

const incomeProtection = (page: Page) =>
  page.getByRole('checkbox', { name: /Add Ezicover Income Protection/ });

async function chooseQuote(page: Page, option: string) {
  await page.getByRole('banner').getByRole('button', { name: 'Get a quote' }).click();
  const chooser = page.getByRole('dialog', {
    name: 'Need life insurance only or both life insurance and income protection?',
  });
  await expect(chooser).toBeVisible();
  await animationsDone(chooser);
  return { chooser, choose: () => chooser.getByRole('link', { name: option }).click() };
}

test('the quote chooser presets income protection and keeps About you answers', async ({
  page,
}) => {
  await page.goto('/quote');
  await page.getByRole('button', { name: 'Use demo details' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(heading(page, 'Choose your cover')).toBeVisible();

  // A full page load: the home page hasn't read the saved answers yet.
  await page.goto('/');
  const both = await chooseQuote(page, 'Get life insurance and income protection');
  await expectNoSeriousAxeViolations(page);
  await both.choose();
  await expect(heading(page, 'About you')).toBeVisible();
  await expect(page).toHaveURL(/\/quote\?step=1$/);
  await expect(page.getByLabel('Date of birth')).toHaveValue('1990-06-15');
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(incomeProtection(page)).toBeChecked();

  const lifeOnly = await chooseQuote(page, 'Get life insurance only');
  await lifeOnly.choose();
  await expect(heading(page, 'About you')).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(incomeProtection(page)).not.toBeChecked();
});

test('every page has the demo strip and noindex', async ({ page }) => {
  for (const path of ['/', '/quote', '/apply', '/apply/received', '/policies']) {
    await page.goto(path);
    await expect(page.getByRole('note')).toContainText(
      'This is a Demo site and not the live Zurich Direct site.',
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex,nofollow',
    );
  }
});

test('Help & information opens from the keyboard and Esc closes it', async ({ page }) => {
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'Help & information' });
  await trigger.focus();
  await page.keyboard.press('Enter');
  const whyZurich = page
    .getByRole('navigation', { name: 'Main' })
    .getByRole('link', { name: /Why Zurich\?/ });
  await expect(whyZurich).toBeVisible();
  await expect(whyZurich).toHaveAttribute('target', '_blank');
  await expectNoSeriousAxeViolations(page);

  await page.keyboard.press('Escape');
  await expect(whyZurich).toBeHidden();
  await expect(trigger).toBeFocused();
});

test.describe('at 375px', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('the Menu button opens the sheet, and Esc closes it and returns focus', async ({ page }) => {
    await page.goto('/');
    const menuButton = page.getByRole('button', { name: 'Menu' });
    await menuButton.click();
    const sheet = page.getByRole('dialog', { name: 'Menu' });
    await expect(sheet).toBeVisible();
    await expect(sheet.getByRole('link', { name: 'My policies' })).toBeVisible();
    await animationsDone(sheet);
    await expectNoSeriousAxeViolations(page);

    await page.keyboard.press('Escape');
    await expect(sheet).toBeHidden();
    await expect(menuButton).toBeFocused();
  });

  test('the footer groups open and close as accordions', async ({ page }) => {
    await page.goto('/');
    const footer = page.getByRole('contentinfo');
    const support = footer.getByRole('button', { name: 'Support' });
    const claims = footer.getByRole('link', { name: /Making a claim/ });
    await expect(support).toHaveAttribute('aria-expanded', 'false');
    await expect(claims).toBeHidden();

    await support.click();
    await expect(claims).toBeVisible();
    await support.click();
    await expect(claims).toBeHidden();
  });
});
