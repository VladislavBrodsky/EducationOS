import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const previews = ['Marquee', 'Word Rotate', 'Scroll Progress', 'Animated List', 'Blur Fade', 'Ripple Button', 'Interactive Hover Button', 'Terminal', 'Dot Pattern', 'Grid Pattern', 'Orbiting Circles', 'Shine Border', 'Magic Card', 'Bento Grid', 'Progressive Blur', 'Shimmer Button'];

test('every local component preview renders within phone and desktop bounds', async ({ page }) => {
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/components');
    for (const name of previews) {
      await page.getByRole('searchbox', { name: 'Search components' }).fill(name);
      await page.getByRole('link', { name: `Preview ${name}`, exact: true }).click();
      const preview = page.locator('[data-component-previews]');
      await expect(preview.getByRole('heading', { level: 2 })).toHaveText(name);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name} at ${width}`).toBe(true);
      if (name === 'Ripple Button' || name === 'Shimmer Button') {
        await preview.getByRole('button', { name: name === 'Ripple Button' ? /Try the ripple/ : /A subtle shimmer/ }).click();
        await expect(preview.locator('[data-preview-feedback]')).toHaveText('Preview interactions: 1');
      }
      if (['Marquee', 'Terminal', 'Bento Grid', 'Magic Card', 'Word Rotate'].includes(name)) {
        await preview.screenshot({ path: `artifacts/magicui/${name.toLowerCase().replaceAll(' ', '-')}-${width}.png`, animations: 'disabled' });
      }
    }
  }
});

test('the whole component studio has accessible filters, cards and reading order', async ({ page }) => {
  test.setTimeout(60000);
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/components');
    const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(scan.violations).toEqual([]);
    await page.screenshot({ path: `artifacts/magicui/component-studio-${width}.png` });
  }
});
