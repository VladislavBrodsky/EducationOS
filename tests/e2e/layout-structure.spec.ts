import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const guides = ['/privacy', '/safety', '/terms', '/accessibility'];

test('policy guides keep title, contents and reading column coherent across widths', async ({ page }) => {
  test.setTimeout(90000);
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of guides) {
      await page.goto(route);
      const title = page.getByRole('heading', { level: 1 });
      await expect(title).toBeVisible();
      const contents = page.getByRole('navigation', { name: 'On this page' });
      await expect(contents).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${route} at ${width}`).toBe(true);
      const headings = await page.locator('article h2').count();
      expect(await contents.locator('a').count()).toBe(headings);
      const link = contents.locator('a').last();
      const href = await link.getAttribute('href');
      await link.click();
      await expect(page).toHaveURL(new RegExp(`${href}$`));
      const target = page.locator(href!);
      await expect(target).toBeInViewport();
      expect((await target.boundingBox())!.y).toBeGreaterThanOrEqual(0);
    }
  }
});

test('policy reading guide and disclosure retain accessible navigation', async ({ page }) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/privacy');
    expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
    await page.screenshot({ path: `artifacts/ui-refinement/privacy-${width}.png`, fullPage: true });
  }
});

test('translated method and journal headings remain readable through tablet breakpoints', async ({ page }) => {
  test.setTimeout(90000);
  for (const width of [320, 390, 800, 1024]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of ['/ru', '/ru/blog']) {
      await page.goto(route);
      const headings = page.locator('.m-method-card h3, .m-story h2, .m-story h3');
      await expect(headings.first()).toBeVisible();
      const clipped = await headings.evaluateAll(elements => elements.filter(element => element.scrollWidth > element.clientWidth + 1).map(element => element.textContent));
      expect(clipped, `${route} at ${width}px`).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  }
});
