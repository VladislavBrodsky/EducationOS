import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('journal copy, artwork and caption have separate space at every breakpoint', async ({ page }) => {
  test.setTimeout(90000);
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of ['/blog', '/en/blog', '/ru/blog']) {
      await page.goto(route);
      const hero = page.locator('.m-journal-hero');
      const picture = hero.locator('.m-journal-hero-art');
      await picture.locator('img').evaluate((img: HTMLImageElement) => img.decode());
      const art = (await picture.boundingBox())!;
      const caption = (await hero.locator('figcaption').boundingBox())!;
      const copy = (await hero.locator(':scope > div:first-child').boundingBox())!;
      expect(caption.y).toBeGreaterThanOrEqual(art.y + art.height);
      expect(width > 760 ? art.x >= copy.x + copy.width : art.y >= copy.y + copy.height).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if (route === '/en/blog') {
        expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
        await page.locator('main img').evaluateAll(images => Promise.all(images.map(image => { const img = image as HTMLImageElement; img.loading = 'eager'; return img.decode().catch(() => undefined); })));
        await page.screenshot({ path: `artifacts/visual-system/journal-${width}.png`, fullPage: true });
      }
    }
  }
});

test('the challenge border accent finishes and respects reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/en');
  const beam = page.locator('[data-border-beam]');
  await beam.scrollIntoViewIfNeeded();
  await expect(beam).toHaveAttribute('data-motion', 'running');
  await expect.poll(() => beam.evaluate(el => el.getAnimations({ subtree: true }).filter(animation => animation.playState === 'running').length), { timeout: 6500 }).toBe(0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(beam).toHaveAttribute('data-motion', 'static');
  expect(await beam.evaluate(el => el.getAnimations({ subtree: true }).length)).toBe(0);
});

test('shared typography and controls retain accessible contrast on adult and learner pages', async ({ page }) => {
  test.setTimeout(90000);
  for (const route of ['/studio', '/demo/guardian', '/portal/progress']) {
    await page.setViewportSize({ width: 390, height: 1000 });
    await page.goto(route);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
    if (route === '/portal/progress') {
      await page.getByRole('button', { name: /dark/i }).click();
      expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
    }
  }
});
