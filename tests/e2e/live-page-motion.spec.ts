import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('method steps and lab actions stay readable and accessible in every language', async ({ page }) => {
  test.setTimeout(90000);
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const locale of ['en', 'es', 'ru']) {
      await page.goto(`/${locale}/approach`);
      const list = page.locator('ol[data-animated-list]');
      await list.scrollIntoViewIfNeeded();
      await expect(list.locator(':scope > li')).toHaveCount(7);
      await expect(list.locator('h2')).toHaveCount(7);
      const action = page.locator('.m-detail-action a');
      await action.focus();
      await expect(action).toBeFocused();
      await expect(action).toHaveAttribute('href', '/demo/lab');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
    }
  }
});

test('homepage motion leaves native vertical scrolling and keyboard navigation available', async ({ page }) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/en');
    const ribbon = page.locator('[data-marquee]');
    await ribbon.scrollIntoViewIfNeeded();
    const before = await page.evaluate(() => scrollY);
    await page.mouse.move(8, 400);
    await page.mouse.wheel(0, 700);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before + 200);
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await ribbon.scrollIntoViewIfNeeded();
    await ribbon.getByRole('region').focus();
    await expect(ribbon).toHaveAttribute('data-motion', 'static');
    await expect(ribbon.getByRole('list')).toBeVisible();
  }
});

test('method steps and call to action remain available without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL, viewport: { width: 390, height: 844 } });
  try {
    const page = await context.newPage();
    await page.goto('/en/approach');
    await expect(page.locator('ol[data-animated-list] > li')).toHaveCount(7);
    await expect(page.locator('.m-detail-action a')).toHaveAttribute('href', '/demo/lab');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  } finally { await context.close(); }
});
