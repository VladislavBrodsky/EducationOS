import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('detail photography meets one frame without inset seams or overlapping controls', async ({ page }) => {
  test.setTimeout(120000);
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const section of ['approach', 'programs', 'trust']) {
      await page.goto(`/en/${section}`);
      const figure = page.locator('.m-detail-hero-visual');
      const frame = figure.locator('.m-detail-hero-art');
      const photo = frame.locator('img');
      await photo.evaluate((image: HTMLImageElement) => image.decode());
      const bounds = await frame.boundingBox();
      const imageBounds = await photo.boundingBox();
      expect(Math.abs(bounds!.width - bounds!.height)).toBeLessThan(2);
      expect(Math.abs(bounds!.x - imageBounds!.x)).toBeLessThan(2);
      expect(Math.abs(bounds!.y - imageBounds!.y)).toBeLessThan(2);
      expect(Math.abs(bounds!.width - imageBounds!.width)).toBeLessThan(3);
      expect(Math.abs(bounds!.height - imageBounds!.height)).toBeLessThan(3);
      await expect(frame.locator('button, .fx-shine-border, .m-detail-orbit')).toHaveCount(0);
      const caption = figure.locator('figcaption');
      await expect(caption).toBeVisible();
      expect((await caption.boundingBox())!.y).toBeGreaterThanOrEqual(bounds!.y + bounds!.height);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if ([390, 1440].includes(width)) {
        await figure.screenshot({ path: `artifacts/hero-fix/${section}-${width}.png`, animations: 'disabled' });
      }
    }
  }
  for (const path of ['/approach', '/ru/approach']) {
    await page.goto(path);
    await expect(page.locator('.m-detail-hero-visual figcaption')).toBeVisible();
    expect((await new AxeBuilder({ page }).include('.m-detail-hero').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
  }
});
