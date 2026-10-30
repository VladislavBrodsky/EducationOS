import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function openPreview(page: Page, name: string) {
  await page.getByRole('searchbox', { name: 'Search components' }).fill(name);
  await page.getByRole('link', { name: `Preview ${name}`, exact: true }).click();
  const preview = page.locator('[data-component-previews]');
  await preview.scrollIntoViewIfNeeded();
  await expect(preview.getByRole('heading', { level: 2 })).toHaveText(name);
  return preview;
}

const overflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth - innerWidth);

test('the component studio distinguishes working previews from the full official catalog', async ({ page }) => {
  await page.goto('/components');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('EducationOS component studio');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  const cards = page.locator('[data-component-card]');
  await expect(cards).toHaveCount(77);
  await expect(page.getByRole('status')).toHaveText('77 of 77 components');
  await page.getByRole('button', { name: 'Live previews', exact: true }).click();
  await expect(cards).toHaveCount(16);
  await expect(cards.getByText('Official reference', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'All', exact: true }).click();
  await page.getByRole('combobox', { name: 'Filter by category' }).selectOption('Device Mocks');
  await expect(cards).toHaveCount(3);
  for (const card of await cards.all()) {
    await expect(card.getByText('Official reference', { exact: true })).toBeVisible();
    await expect(card.getByRole('link')).toHaveAttribute('href', /^https:\/\/magicui\.design\/docs\/components\//);
    await expect(card.getByRole('link')).toHaveAttribute('rel', /noreferrer/);
  }
  await page.getByRole('searchbox', { name: 'Search components' }).fill('no such educational component');
  await expect(cards).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'No matching components' })).toBeVisible();
  await page.getByRole('button', { name: 'Reset filters' }).click();
  await expect(cards).toHaveCount(77);
});

test('rolling topics stop for focus, global pause and offscreen readers without cloning controls', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/components');
  const marquee = page.locator('[data-component-previews] [data-marquee]');
  await marquee.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  await expect(marquee).toHaveAttribute('data-motion', 'running');
  const track = marquee.locator('[data-marquee-track]');
  const initial = await track.evaluate(element => getComputedStyle(element).transform);
  await expect.poll(() => track.evaluate(element => getComputedStyle(element).transform)).not.toBe(initial);
  const clone = marquee.locator('[data-marquee-clone]');
  await expect(clone).toHaveAttribute('aria-hidden', 'true');
  await expect(clone).toHaveAttribute('inert', '');
  await expect(clone.locator('[id], a[href], button, input, select, textarea, [tabindex]')).toHaveCount(0);
  await expect(marquee.getByRole('listitem')).toHaveCount(4);
  await marquee.hover();
  await expect(marquee).toHaveAttribute('data-motion', 'paused');
  await marquee.getByRole('region').focus();
  await expect(marquee).toHaveAttribute('data-motion', 'static');
  await expect(clone).toBeHidden();
  await marquee.getByRole('region').press('ArrowRight');
  await expect(marquee.getByRole('region')).toBeFocused();
  await page.getByRole('button', { name: 'Pause animations', exact: true }).click();
  await expect(page.locator('.m-main')).toHaveAttribute('data-motion', 'paused');
  await page.mouse.move(0, 0);
  await expect(marquee).toHaveAttribute('data-motion', 'paused');
  await expect(track).toHaveCSS('animation-play-state', 'paused');
  await page.getByRole('button', { name: 'Resume animations', exact: true }).click();
  await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
  await marquee.scrollIntoViewIfNeeded();
  await expect(marquee).toHaveAttribute('data-motion', 'running');
  await page.locator('footer').scrollIntoViewIfNeeded();
  await expect(marquee).toHaveAttribute('data-motion', 'paused');
});

test('word rotation reserves its layout and has stable accessible text while paused', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/components');
  const preview = await openPreview(page, 'Word Rotate');
  const words = preview.locator('[data-word-rotate]');
  await expect(words).toHaveAttribute('data-motion', 'running');
  await expect(words.locator('[aria-live]')).toHaveCount(0);
  await expect(words.locator(':scope > span').first()).toHaveText('curiosity, experiments, possibilities');
  await expect(words.locator('[aria-hidden="true"] [data-active="true"]')).toHaveCount(1);
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  const bounds = await words.boundingBox();
  const first = await words.getAttribute('data-word-index');
  await expect.poll(() => words.getAttribute('data-word-index'), { timeout: 6000 }).not.toBe(first);
  // Preserve readable contrast even in the middle of the incoming-word transition.
  const activeWord = words.locator('[data-active="true"]');
  await activeWord.evaluate(element => {
    for (const animation of element.getAnimations()) { animation.pause(); animation.currentTime = 140; }
  });
  await expect(activeWord).toHaveCSS('opacity', '1');
  expect(Math.abs((await words.boundingBox())!.width - bounds!.width)).toBeLessThanOrEqual(1);
  await page.getByRole('button', { name: 'Pause animations', exact: true }).click();
  await words.scrollIntoViewIfNeeded();
  await expect(words).toHaveAttribute('data-motion', 'static');
  const resting = await words.getAttribute('data-word-index');
  await page.waitForTimeout(2800); // Longer than the component's default 2500 ms cycle.
  await expect(words).toHaveAttribute('data-word-index', resting!);
  const scan = await new AxeBuilder({ page }).include('[data-component-previews]').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(scan.violations).toEqual([]);
});

test('reduced motion keeps localized ribbons static and leaves interactive subjects unique', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const [route, label] of [['/en', 'Ways to explore'], ['/', 'Formas de explorar'], ['/ru', 'Способы исследовать']]) {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(route);
    const marquee = page.locator('[data-marquee]');
    await marquee.scrollIntoViewIfNeeded();
    await expect(marquee.getByRole('list', { name: label, exact: true })).toBeVisible();
    await expect(marquee).toHaveAttribute('data-motion', 'static');
    await expect(marquee.locator('[data-marquee-clone]')).toBeHidden();
    await expect(marquee.getByRole('button')).toHaveCount(0);
    await expect(marquee.locator('[data-marquee-track]')).toHaveCSS('animation-name', 'none');
    const words = page.locator('[data-word-rotate]');
    await expect(words).toHaveAttribute('data-word-index', '0');
    await expect(words).toHaveAttribute('data-motion', 'static');
    await expect(page.locator('.m-worlds-choices button')).toHaveCount(8);
    expect(await overflow(page)).toBeLessThanOrEqual(1);
  }
  await page.goto('/components');
  await expect(page.locator('[data-marquee]')).toHaveAttribute('data-motion', 'static');
  const scan = await new AxeBuilder({ page }).include('[data-component-previews]').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(scan.violations).toEqual([]);
});

test('the decorative reading line tracks the document without presenting a learning score', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/en/blog/see-the-invisible');
  const progress = page.locator('[data-scroll-progress]');
  await expect(progress).toHaveAttribute('aria-hidden', 'true');
  await expect(progress).toHaveAttribute('data-ready', 'true');
  await expect(progress).toHaveAttribute('data-motion', 'static');
  expect(await progress.getAttribute('role')).toBeNull();
  expect(await progress.getAttribute('aria-valuenow')).toBeNull();
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await expect.poll(() => progress.evaluate(element => Number((element as HTMLElement).style.getPropertyValue('--reading-progress')))).toBe(0);
  await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
  await expect.poll(() => progress.evaluate(element => Number((element as HTMLElement).style.getPropertyValue('--reading-progress')))).toBeGreaterThan(.95);
});

test('gallery and rolling topics fit small and large screens with keyboard browsing', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/components', '/en']) {
      await page.goto(route);
      expect(await overflow(page), `${route} at ${width}`).toBeLessThanOrEqual(1);
      const marquee = page.locator('[data-marquee]');
      await marquee.scrollIntoViewIfNeeded();
      const region = marquee.getByRole('region');
      await region.focus();
      await region.press('ArrowRight');
      await expect(region).toBeFocused();
      await expect(marquee.getByRole('list')).toBeVisible();
      expect(await overflow(page), `Focused ribbon on ${route} at ${width}`).toBeLessThanOrEqual(1);
    }
  }
});

test('server HTML keeps topics and documentation readable without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  try {
    for (const route of ['/en', '/components']) {
      await page.goto(route);
      const marquee = page.locator('[data-marquee]');
      await expect(marquee).toHaveAttribute('data-ready', 'false');
      await expect(marquee).toHaveAttribute('data-motion', 'static');
      await expect(marquee.getByRole('list')).toBeVisible();
      await expect(marquee.locator('[data-marquee-clone]')).toBeHidden();
      await expect(marquee.getByRole('button')).toHaveCount(0);
      await expect(marquee.locator('[data-marquee-track]')).toHaveCSS('animation-name', 'none');
      expect(await overflow(page)).toBeLessThanOrEqual(1);
    }
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('EducationOS component studio');
    await expect(page.locator('[data-component-card]')).toHaveCount(77);
    await expect(page.getByRole('link', { name: 'Official Marquee documentation', exact: true })).toHaveAttribute('href', 'https://magicui.design/docs/components/marquee');
    await expect(page.locator('[data-scroll-progress]')).toBeHidden();
  } finally { await context.close(); }
});
