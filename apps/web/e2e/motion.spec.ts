import { expect, test, type Page } from '@playwright/test';
import { animationsDone, heading } from './helpers';

const hero = 'Protect what matters most with Zurich';

// Every element in the page's main content that is less than fully opaque.
const faint = (page: Page) =>
  page.getByRole('main').evaluate((main) =>
    Array.from(main.querySelectorAll('*'))
      .filter((el) => Number(getComputedStyle(el).opacity) < 1)
      .map((el) => el.outerHTML.slice(0, 80)),
  );

// Scrolls to the end of the page half a screen at a time, letting the page render at each step, as
// someone scrolling does. (Jumping past a block without it ever being on screen leaves it waiting,
// until it's scrolled back to.)
async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    const twoFrames = () =>
      new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    while (window.scrollY + window.innerHeight < document.documentElement.scrollHeight - 1) {
      window.scrollBy(0, window.innerHeight / 2);
      await twoFrames();
    }
  });
}

// With JavaScript off entirely, nothing in main shows, with or without motion: Modern.js streams the
// page into place with a few lines of inline script. So this blocks the app's own scripts instead, as
// if they failed to load: the server's HTML must be all there and fully visible without them.
test.describe("when the app's JavaScript never arrives", () => {
  test('every home-page section is visible', async ({ page }) => {
    await page.route('**/static/js/**', (route) => route.abort());
    await page.goto('/');
    const main = page.getByRole('main');
    await expect(heading(page, hero)).toBeVisible();
    // The hero's entrance plays from the stylesheet alone, and ends fully opaque.
    await expect(heading(page, hero)).toHaveCSS('opacity', '1');
    for (const sectionHeading of await main.getByRole('heading', { level: 2 }).all()) {
      await expect(sectionHeading).toBeVisible();
    }
    for (const section of await main.locator('section, [data-reveal]').all()) {
      await expect(section).toHaveCSS('opacity', '1');
    }
    await expect(main.locator('[data-reveal="hidden"]')).toHaveCount(0);
  });
});

test('after scrolling to the end of the home page, every reveal has shown', async ({ page }) => {
  await page.goto('/');
  // With motion on, what starts below the screen waits for it.
  await expect(page.locator('[data-reveal="hidden"]').first()).toBeAttached();
  await scrollThrough(page);
  await expect(page.locator('[data-reveal="hidden"]')).toHaveCount(0);
  await animationsDone(page.getByRole('main'));
  expect(await faint(page)).toEqual([]);
});

// Frozen a quarter of the way in, a reveal is part faded in and part risen, and its photo is still
// settling. (If its waiting styles stayed on while it played, it would play invisibly from start to
// end, then appear all at once.)
test('a block coming into view fades, rises and settles in, rather than appearing at the end', async ({
  page,
}) => {
  await page.goto('/');
  const talk = page.getByRole('region', { name: 'Want to talk to us?' });
  await expect(talk).toHaveAttribute('data-reveal', 'hidden');
  const quarterWay = await talk.evaluate(async (section) => {
    section.scrollIntoView({ block: 'center' });
    const animations = await new Promise<Animation[]>((resolve) => {
      const started = () => {
        if (section.hasAttribute('data-revealing'))
          resolve(section.getAnimations({ subtree: true }));
        else requestAnimationFrame(started);
      };
      started();
    });
    for (const animation of animations) {
      animation.pause();
      animation.currentTime = Number(animation.effect?.getTiming().duration) / 4;
    }
    const photo = section.querySelector('[data-settle]');
    const block = new DOMMatrix(getComputedStyle(section).transform);
    const settle = new DOMMatrix(photo ? getComputedStyle(photo).transform : 'none');
    const state = {
      opacity: Number(getComputedStyle(section).opacity),
      rise: block.m42,
      scale: settle.a,
    };
    for (const animation of animations) animation.play();
    return state;
  });
  expect(quarterWay.opacity).toBeGreaterThan(0.2);
  expect(quarterWay.opacity).toBeLessThan(1);
  expect(quarterWay.rise).toBeGreaterThan(0);
  expect(quarterWay.rise).toBeLessThan(32);
  expect(quarterWay.scale).toBeGreaterThan(1);
  expect(quarterWay.scale).toBeLessThan(1.06);
  await expect(talk).toHaveAttribute('data-reveal', 'shown');
});

test('with reduced motion, the hero is in place at once and nothing waits', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  // Notes any reveal that is ever hidden, from the first moment the page exists.
  await page.addInitScript(() => {
    const scope = window as unknown as { revealHidden: boolean };
    scope.revealHidden = false;
    new MutationObserver(() => {
      if (document.querySelector('[data-reveal="hidden"]')) scope.revealHidden = true;
    }).observe(document, { subtree: true, attributes: true, attributeFilter: ['data-reveal'] });
  });
  await page.goto('/');
  const still = (selector: string) =>
    page
      .locator(selector)
      .first()
      .evaluate((el) => `${getComputedStyle(el).opacity} ${getComputedStyle(el).transform}`);
  expect(await still('main h1')).toBe('1 none');
  expect(await still('main section ul')).toBe('1 none');

  await scrollThrough(page);
  expect(
    await page.evaluate(() => (window as unknown as { revealHidden: boolean }).revealHidden),
  ).toBe(false);
  expect(await faint(page)).toEqual([]);
});

test('with motion on, each quote step moves focus to its heading, forward and back', async ({
  page,
}) => {
  await page.goto('/quote');
  await expect(heading(page, 'About you')).toBeVisible();
  await page.getByRole('button', { name: 'Use demo details' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(heading(page, 'Choose your cover')).toBeFocused();

  await page.getByRole('button', { name: 'Back' }).click();
  await expect(heading(page, 'About you')).toBeFocused();

  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(heading(page, 'Choose your cover')).toBeFocused();
  await page.getByRole('button', { name: 'See my price' }).click();
  await expect(heading(page, 'Your quote')).toBeFocused();

  await page.getByRole('button', { name: 'Change cover' }).click();
  await expect(heading(page, 'Choose your cover')).toBeFocused();
});
