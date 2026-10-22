import { expect, test } from '@playwright/test';
import { expectNoSeriousAxeViolations, heading } from './helpers';

const offerTerms = '* Offer terms and important information';

test('every section is there, in order', async ({ page }) => {
  await page.goto('/');
  await expect(heading(page, 'Protect what matters most with Zurich')).toBeVisible();
  await expect(page.getByText(/^At Zurich, we believe it should be easy/)).toBeVisible();
  const sections = page.getByRole('main').getByRole('heading', { level: 2 });
  await expect(sections).toHaveText([
    'Choose the product that suits your needs',
    'Zurich Ezicover. You’ve got this.',
    'Help choosing your cover',
    'Get more out of your life and income insurance',
    'Want to talk to us?',
    'Protect those who matter most',
    'Stress less about your mortgage with Zurich Home Loan Protection.',
    offerTerms,
  ]);
});

test('the cover tabs change with arrow keys, each with its own opening line and photo', async ({
  page,
}) => {
  await page.goto('/');
  const tabs: [string, string, RegExp][] = [
    ['Life cover, income protection, or both?', 'Life cover and income protection', /turbines/],
    ['Key considerations for couples', 'Balance in relationships', /moving box/],
    ['When to review your life insurance', 'Life insurance needs change', /hammock/],
    ['Understanding life insurance underwriting', 'Underwriting', /laptop screen/],
  ];
  const tablist = page.getByRole('tablist', { name: 'Help choosing your cover' });
  await tablist.getByRole('tab', { selected: true }).focus();
  for (const [index, [label, lead, photo]] of tabs.entries()) {
    if (index > 0) await page.keyboard.press('ArrowRight');
    await expect(tablist.getByRole('tab', { name: label })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    const panel = page.getByRole('tabpanel', { name: label });
    await expect(panel.locator('strong').first()).toHaveText(lead);
    await expect(panel.getByRole('img')).toHaveAttribute('alt', photo);
  }
});

test('the offer terms open with Enter', async ({ page }) => {
  await page.goto('/');
  const terms = page.getByRole('button', { name: offerTerms });
  await expect(terms).toHaveAttribute('aria-expanded', 'false');
  await terms.focus();
  await page.keyboard.press('Enter');
  await expect(terms).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByText(/^\*This offer is available to any Policyholder/)).toBeVisible();
  await expectNoSeriousAxeViolations(page);
});

test('every external link opens in a new tab and says so', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: offerTerms }).click();
  const external = await page.locator('a[href^="http"]').all();
  expect(external.length).toBeGreaterThan(30);
  for (const link of external) {
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(link.locator('.sr-only')).toHaveText(/\(opens in a new tab\)/);
  }
});

test('the Income Protection card starts a quote with income protection on', async ({ page }) => {
  await page.goto('/');
  await page
    .getByRole('article')
    .filter({ has: page.getByRole('heading', { name: 'Ezicover Income Protection' }) })
    .getByRole('link', { name: 'Get an online quote' })
    .click();
  await expect(heading(page, 'About you')).toBeVisible();
  await page.getByRole('button', { name: 'Use demo details' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(
    page.getByRole('checkbox', { name: /Add Ezicover Income Protection/ }),
  ).toBeChecked();
});

test('photos reserve their space, and only the hero loads eagerly', async ({ page }) => {
  await page.goto('/');
  const photos = await page
    .getByRole('main')
    .locator('img')
    .evaluateAll((images) =>
      images.map((image) => ({
        alt: image.getAttribute('alt'),
        size: Boolean(image.getAttribute('width') && image.getAttribute('height')),
        loading: image.getAttribute('loading'),
      })),
    );
  expect(photos.length).toBeGreaterThanOrEqual(10);
  for (const photo of photos) {
    expect(photo.alt).toBeTruthy();
    expect(photo.size).toBe(true);
  }
  expect(photos.filter((photo) => photo.loading !== 'lazy').map((photo) => photo.alt)).toEqual([
    'A mother and father laughing as they hug their young daughter',
  ]);
});

test('nothing jumps while the page and its photos load', async ({ page }) => {
  await page.addInitScript(() => {
    const scope = window as unknown as { layoutShift: number };
    scope.layoutShift = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as unknown as { value: number }[]) {
        scope.layoutShift += entry.value;
      }
    }).observe({ type: 'layout-shift', buffered: true });
  });
  await page.goto('/', { waitUntil: 'networkidle' });
  // Scroll through so every lazy photo loads.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  });
  await page.waitForLoadState('networkidle');
  const shift = await page.evaluate(
    () => (window as unknown as { layoutShift: number }).layoutShift,
  );
  // 0.1 is the "good" Cumulative Layout Shift threshold; the page measures about 0.002.
  expect(shift).toBeLessThan(0.05);
});

test.describe('at 375px', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('the home page has no sideways scroll and no serious axe issues', async ({ page }) => {
    await page.goto('/');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBe(0);
    await expectNoSeriousAxeViolations(page);
  });
});
