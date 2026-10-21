import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';

export async function expectNoSeriousAxeViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page }).analyze();
  const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(
    serious.map((v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(' ')).join(', ')})`),
  ).toEqual([]);
}

export const heading = (page: Page, name: string) => page.getByRole('heading', { level: 1, name });

export async function getQuoteWithDemoDetails(page: Page, { checkAxe = false } = {}) {
  await page.goto('/quote');
  await expect(heading(page, 'About you')).toBeVisible();
  if (checkAxe) await expectNoSeriousAxeViolations(page);

  await page.getByRole('button', { name: 'Use demo details' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(heading(page, 'Choose your cover')).toBeVisible();
  await page.getByRole('checkbox', { name: /Add income protection/ }).check();
  if (checkAxe) await expectNoSeriousAxeViolations(page);

  await page.getByRole('button', { name: 'See my price' }).click();
}

export async function signInAndApply(page: Page, { answerYes = false, checkAxe = false } = {}) {
  await page.getByRole('button', { name: 'Apply now' }).click();
  const dialog = page.getByRole('dialog', { name: 'Sign in to apply (demo)' });
  await expect(dialog).toBeVisible();
  // Let the fade-in finish, or axe measures contrast on half-transparent text.
  await dialog.evaluate((el) =>
    Promise.all(el.getAnimations({ subtree: true }).map((animation) => animation.finished)),
  );
  if (checkAxe) await expectNoSeriousAxeViolations(page);
  await dialog.getByRole('button', { name: 'Continue' }).click();

  await expect(heading(page, 'Apply for cover')).toBeVisible();
  await page.getByLabel('First name').fill('Sam');
  const questions = page.getByRole('group', { name: /^\d\. / });
  await expect(questions).toHaveCount(4);
  for (const [index, question] of (await questions.all()).entries()) {
    const answer = answerYes && index === 1 ? 'Yes' : 'No';
    await question.getByRole('radio', { name: answer }).check();
  }
  await page.getByRole('checkbox', { name: /My answers are true/ }).check();
  if (checkAxe) await expectNoSeriousAxeViolations(page);

  await page.getByRole('button', { name: 'Submit application' }).click();
  await expect(heading(page, 'Application received')).toBeVisible();
}
