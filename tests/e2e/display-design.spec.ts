import { expect, test } from '@playwright/test';

const displayRoutes = [
  '/', '/programs', '/approach', '/trust', '/blog',
  '/blog/see-the-invisible', '/blog/math-you-can-move', '/blog/paper-glider-experiment',
  '/demo', '/demo/lab', '/demo/guardian', '/demo/portfolio',
  '/portal', '/portal/subjects', '/portal/projects', '/portal/labs', '/portal/progress', '/portal/guardian',
];

test('display headings never end with a period', async ({ page }) => {
  for (const route of displayRoutes) {
    await page.goto(route);
    const headings = await page.locator('h1, h2, h3, h4, .hero-description, .page-hero-scene .section-lead, .p-heading > div > p:not(.p-eyebrow)').allTextContents();
    const violations = headings.map(value => value.trim()).filter(value => value.endsWith('.'));
    expect(violations, `Headings on ${route}`).toEqual([]);
  }
});

test('mobile artwork and sections fit the viewport', async ({ page }) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const route of ['/', '/programs', '/approach', '/trust', '/blog', '/portal']) {
    await page.goto(route);
    await page.locator('main').first().waitFor();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `Horizontal overflow on ${route}`).toBeLessThanOrEqual(1);
    if (route === '/portal') {
      const inset = await page.locator('.p-heading-mascot').evaluate((heading) => {
        const content = heading.querySelector(':scope > div:first-child');
        return content ? content.getBoundingClientRect().left - heading.getBoundingClientRect().left : 0;
      });
      expect(inset, 'Portal welcome copy keeps its inner margin').toBeGreaterThanOrEqual(16);
    }
    const visibleArt = page.locator('main img[src*="cutout"], main img[src*="mascot"]');
    if (await visibleArt.count()) {
      const first = visibleArt.first();
      await first.scrollIntoViewIfNeeded();
      await expect(first).toHaveJSProperty('complete', true);
      expect(await first.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
    }
    if (process.env.VISUAL_AUDIT === '1') {
      await page.screenshot({ path: `test-results/visual-${route === '/' ? 'home' : route.slice(1).replaceAll('/', '-')}.png`, fullPage: true });
      if (route === '/') await page.locator('.learning-bento').screenshot({ path: 'test-results/visual-mobile-bento.png' });
      if (route === '/portal') await page.locator('.p-heading-mascot').screenshot({ path: 'test-results/visual-mobile-mascot.png' });
    }
  }
});

test('desktop artwork loads without layout overflow', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const route of ['/', '/programs', '/approach', '/trust', '/blog', '/portal']) {
    await page.goto(route);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `Horizontal overflow on ${route}`).toBeLessThanOrEqual(1);
    if (route === '/' && process.env.VISUAL_AUDIT === '1') {
      await page.locator('.hero').screenshot({ path: 'test-results/visual-desktop-hero.png' });
      await page.locator('.learning-bento').screenshot({ path: 'test-results/visual-desktop-bento.png' });
    }
    if (route === '/portal' && process.env.VISUAL_AUDIT === '1') {
      await page.locator('.p-heading-mascot').screenshot({ path: 'test-results/visual-desktop-mascot.png' });
    }
  }
});
