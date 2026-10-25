import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('hero entry leads to a localized challenge with honest progress and a clean share link', async ({ page }) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    const payloads: ShareData[] = [];
    let cancelled = false;
    Object.defineProperty(window, '__sharedChallenges', { value: payloads });
    Object.defineProperty(navigator, 'share', { configurable: true, value: async (payload: ShareData) => {
      if (!cancelled) { cancelled = true; throw new DOMException('Cancelled', 'AbortError'); }
      payloads.push(payload);
    } });
  });
  for (const path of ['/', '/en', '/ru']) {
    await page.goto(`${path}?source=preview`);
    await page.locator('.m-stage-card').click();
    const challenge = page.locator('#paper-bridge-challenge');
    await expect(challenge).toBeFocused();
    expect((await challenge.boundingBox())!.y).toBeGreaterThanOrEqual(82);
    await expect(challenge.locator('.fx-task-progress [aria-current=step]')).toContainText('1');
    await expect(challenge.locator('.fx-task-share')).toHaveCount(0);
    await challenge.locator('[data-answer=folded]').click();
    await expect(challenge.locator('.fx-task-progress [data-completed=true]')).toHaveCount(1);
    await challenge.locator('select').selectOption('material');
    await challenge.locator('button[type=submit]').click();
    await expect(challenge.getByRole('alert')).toBeVisible();
    await expect(challenge.locator('.fx-task-share')).toHaveCount(0);
    await challenge.locator('select').selectOption('shape');
    await challenge.locator('button[type=submit]').click();
    await expect(challenge.locator('.fx-task-progress [data-completed=true]')).toHaveCount(2);
    const sharing = challenge.locator('.fx-task-share .m-share');
    await expect(sharing.getByRole('button')).toBeInViewport();
    await sharing.getByRole('button').click();
    await expect(sharing.getByRole('status')).toBeEmpty();
    await expect(sharing.getByRole('button')).toBeEnabled();
    await sharing.getByRole('button').click();
    await expect(sharing.getByRole('status')).not.toBeEmpty();
    const payloads = await page.evaluate(() => (window as unknown as { __sharedChallenges: ShareData[] }).__sharedChallenges);
    expect(payloads).toHaveLength(1);
    expect(payloads[0].url).toBe(`https://educationos.space${path === '/' ? '/' : path}#paper-bridge-challenge`);
    expect(Object.keys(payloads[0]).sort()).toEqual(['title', 'url']);
    expect((await new AxeBuilder({ page }).include('#paper-bridge-challenge').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
    await challenge.locator('select').selectOption('supports');
    await expect(challenge.locator('.fx-task-share')).toHaveCount(0);
    await expect(challenge.locator('.fx-task-progress [data-completed=true]')).toHaveCount(1);
  }
});

test('challenge sharing recovers from denied clipboard access with a selectable clean link', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.addInitScript(() => {
    let writes = 0;
    Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async (value: string) => {
      if (writes++) throw new DOMException('Denied', 'NotAllowedError');
      Object.defineProperty(window, '__copiedChallenge', { configurable: true, value });
    } } });
  });
  await page.goto('/en?source=preview');
  const challenge = page.locator('#paper-bridge-challenge');
  await challenge.locator('[data-answer=folded]').click();
  await challenge.locator('select').selectOption('shape');
  await challenge.locator('button[type=submit]').click();
  const sharing = challenge.locator('.m-share');
  await sharing.getByRole('button').click();
  await expect(sharing.getByRole('status')).toHaveText('Link copied');
  expect(await page.evaluate(() => (window as unknown as { __copiedChallenge: string }).__copiedChallenge)).toBe('https://educationos.space/en#paper-bridge-challenge');
  await sharing.getByRole('button').click();
  await expect(sharing.getByRole('status')).toHaveText('Copy the link to share it');
  const input = sharing.getByLabel('Link to share');
  await expect(input).toHaveValue('https://educationos.space/en#paper-bridge-challenge');
  await input.focus();
  expect(await input.evaluate((element: HTMLInputElement) => element.selectionEnd! - element.selectionStart!)).toBe((await input.inputValue()).length);
  expect((await new AxeBuilder({ page }).include('#paper-bridge-challenge').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
});
