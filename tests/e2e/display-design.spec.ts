import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const displayRoutes = [
  '/', '/en', '/ru', '/blog', '/en/blog', '/ru/blog',
  '/blog/see-the-invisible', '/en/blog/math-you-can-move', '/ru/blog/paper-glider-experiment',
  '/programs', '/approach', '/trust', '/privacy', '/safety', '/terms', '/accessibility', '/demo', '/demo/lab', '/demo/guardian', '/demo/portfolio',
  '/portal', '/portal/subjects', '/portal/projects', '/portal/labs', '/portal/progress', '/portal/guardian',
];

test('display headings never end with a period', async ({ page }) => {
  for (const route of displayRoutes) {
    await page.goto(route);
    const headings = await page.locator('h1, h2, h3, h4, .m-hero-copy > p, .hero-description, .page-hero-scene .section-lead, .p-heading > div > p:not(.p-eyebrow)').allTextContents();
    expect(headings.map(value => value.trim()).filter(value => value.endsWith('.')), `Headings on ${route}`).toEqual([]);
  }
});

test('marketing languages have correct document language, links and localized stories', async ({ page }) => {
  test.setTimeout(60000);
  for (const [route, lang, title] of [
    ['/', 'es', 'La curiosidad'], ['/en', 'en', 'Curiosity'], ['/ru', 'ru', 'Любопытство'],
  ]) {
    await page.goto(route);
    await expect(page.locator('html')).toHaveAttribute('lang', lang);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(title);
    await expect(page.locator('.m-method-card')).toHaveCount(4);
    await expect(page.locator('.m-age-card')).toHaveCount(5);
    await expect(page.locator('.fx-bridge-preview')).toBeVisible();
    const href = lang === 'es' ? '/blog' : `/${lang}/blog`;
    await expect(page.getByRole('navigation', { name: /Navegación principal|Main navigation|Основная навигация/ }).getByRole('link', { name: /Revista|Journal|Журнал/ })).toHaveAttribute('href', href);
    await expect(page.locator('link[rel="alternate"][hreflang="ru"]')).toHaveAttribute('href', /\/ru$/);
  }
  for (const [route, lang] of [['/blog', 'es'], ['/en/blog', 'en'], ['/ru/blog', 'ru']]) {
    await page.goto(route);
    await expect(page.locator('html')).toHaveAttribute('lang', lang);
    await expect(page.locator('.m-story')).toHaveCount(4);
    await page.locator('.m-story').first().click();
    await page.waitForURL(new RegExp(`${route}/see-the-invisible$`), { timeout: 20000 });
    await expect(page.locator('html')).toHaveAttribute('lang', lang);
    await expect(page.locator('.m-article-challenge')).toBeVisible();
  }
});

test('marketing and product pages fit a narrow viewport', async ({ page }) => {
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    for (const route of ['/', '/en', '/ru', '/blog', '/ru/blog', '/programs', '/approach', '/trust', '/portal']) {
      await page.goto(route);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `Horizontal overflow on ${route} at ${width}px`).toBeLessThanOrEqual(1);
      if (route === '/portal') {
        const inset = await page.locator('.p-heading-mascot').evaluate(heading => {
          const content = heading.querySelector(':scope > div:first-child');
          return content ? content.getBoundingClientRect().left - heading.getBoundingClientRect().left : 0;
        });
        expect(inset).toBeGreaterThanOrEqual(16);
      }
      if (route === '/blog' && width === 390) {
        const height = await page.locator('.m-journal-hero').evaluate(element => element.getBoundingClientRect().height);
        expect(height).toBeLessThan(550);
      }
      if (process.env.VISUAL_AUDIT === '1' && width === 390 && ['/', '/ru', '/blog'].includes(route)) {
        for (const image of await page.locator('.m-story-image img').all()) {
          if (await image.isVisible()) await image.scrollIntoViewIfNeeded();
        }
        await page.evaluate(() => scrollTo(0, 0));
        await page.screenshot({ path: `test-results/marketing-mobile-${route === '/' ? 'es' : route.slice(1).replaceAll('/', '-')}.png`, fullPage: true });
      }
    }
  }
});

test('marketing artwork loads and desktop layout has no overflow', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const route of ['/', '/en', '/ru', '/blog', '/programs', '/approach', '/trust', '/portal']) {
    await page.goto(route);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), route).toBeLessThanOrEqual(1);
    if (route === '/') {
      await expect.poll(() => page.locator('.m-stage-object img').evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
      if (process.env.VISUAL_AUDIT === '1') {
        for (const image of await page.locator('.m-story-image img').all()) await image.scrollIntoViewIfNeeded();
        await page.evaluate(() => scrollTo(0, 0));
        await page.screenshot({ path: 'test-results/marketing-desktop-es.png', fullPage: true });
      }
    }
  }
});

test('localized landing and journal routes pass accessibility checks', async ({ page }) => {
  test.setTimeout(120000);
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/', '/en', '/ru', '/blog', '/en/blog', '/ru/blog', '/ru/blog/see-the-invisible']) {
      await page.goto(route);
      const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      expect(scan.violations, `${route} at ${width}px`).toEqual([]);
    }
  }
});

test('article language switch keeps the story and sharing uses the selected language', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'share', { configurable: true, value: async () => undefined }));
  await page.goto('/blog/see-the-invisible');
  await page.getByRole('navigation', { name: 'Language / Idioma / Язык' }).getByRole('link', { name: 'Русский' }).click();
  await expect(page).toHaveURL(/\/ru\/blog\/see-the-invisible$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Как увидеть');
  await page.getByRole('button', { name: 'Поделиться историей' }).click();
  await expect(page.getByRole('status')).toHaveText('Отправлено');
});

test('age, method, and trust pages preserve locale and label English-only destinations', async ({ page }) => {
  test.setTimeout(120000);
  await page.setViewportSize({ width: 390, height: 844 });
  for (const section of ['programs', 'approach', 'trust']) {
    for (const [prefix, lang] of [['', 'es'], ['/en', 'en'], ['/ru', 'ru']]) {
      const route = `${prefix}/${section}`;
      await page.goto(route);
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
      await expect(page.locator('main h1')).toBeVisible();
      await expect(page.locator(`link[rel="canonical"]`)).toHaveAttribute('href', new RegExp(`${route}$`));
      await expect(page.locator('link[rel="alternate"][hreflang="ru"]')).toHaveAttribute('href', new RegExp(`/ru/${section}$`));
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), route).toBeLessThanOrEqual(1);
    }
    await page.goto(`/${section}`);
    await page.getByRole('navigation', { name: 'Language / Idioma / Язык' }).getByRole('link', { name: 'Русский' }).click();
    await expect(page).toHaveURL(new RegExp(`/ru/${section}$`));
  }
  await page.goto('/ru/trust');
  await expect(page.getByText('Подробная информация на английском').first()).toBeVisible();
  await expect(page.locator('.m-detail-trust-card')).toHaveCount(6);
  for (const route of ['/programs', '/ru/approach', '/ru/trust']) {
    await page.goto(route);
    const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(scan.violations, route).toEqual([]);
  }
});

test('landing cards open the matching detail in the selected language', async ({ page }) => {
  await page.goto('/');
  await page.locator('.m-age-card').nth(2).click();
  await expect(page).toHaveURL(/\/programs#stage-3$/);
  await expect(page.locator('#stage-3 h2')).toHaveText('Inventores');

  await page.goto('/ru');
  await page.locator('.m-method-card').nth(1).click();
  await expect(page).toHaveURL(/\/ru\/approach#step-3$/);
  await expect(page.locator('#step-3 h2')).toHaveText('Представить варианты');

  for (const [card, destination] of [
    ['Observar', 'Observar'],
    ['Imaginar', 'Imaginar posibilidades'],
    ['Experimentar', 'Hacer una prueba justa'],
    ['Explicar', 'Reflexionar sobre la evidencia'],
  ]) {
    await page.goto('/');
    await page.locator('.m-method-card').filter({ has: page.getByRole('heading', { name: card, exact: true }) }).click();
    await expect(page.getByRole('heading', { name: destination, exact: true })).toBeVisible();
  }
});

test('marketing navigation has comfortable targets without crowding narrow screens', async ({ page }) => {
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/', '/en', '/ru']) {
      await page.goto(route);
      const metrics = await page.locator('.m-header a, .m-footer-links a').evaluateAll(links => links.filter(link => link.getClientRects().length > 0).map(link => {
        const box = link.getBoundingClientRect();
        return { label: link.getAttribute('aria-label') ?? link.textContent, width: box.width, height: box.height };
      }));
      for (const metric of metrics) {
        expect(metric.width, `${route}: ${metric.label} at ${width}px`).toBeGreaterThanOrEqual(44);
        expect(metric.height, `${route}: ${metric.label} at ${width}px`).toBeGreaterThanOrEqual(44);
      }
      expect(await page.locator('.m-nav').evaluate(nav => nav.scrollWidth - nav.clientWidth)).toBeLessThanOrEqual(1);
      const brand = await page.locator('.m-header .m-brand').boundingBox();
      const languages = await page.locator('.m-language').boundingBox();
      expect(brand!.x + brand!.width).toBeLessThanOrEqual(languages!.x);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    }
  }
});

test('English policy and demo navigation keeps readers in English', async ({ page }) => {
  for (const route of ['/privacy', '/safety', '/terms', '/accessibility']) {
    await page.goto(route);
    await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Approach', exact: true })).toHaveAttribute('href', '/en/approach');
    await expect(page.locator('.site-header .brand')).toHaveAttribute('href', '/en');
  }
  await page.goto('/demo');
  await page.getByRole('link', { name: 'EducationOS home', exact: true }).click();
  await expect(page).toHaveURL(/\/en$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('journal headings describe the page hierarchy', async ({ page }) => {
  await page.goto('/blog');
  await expect(page.locator('.m-story h2')).toHaveCount(4);
  await expect(page.locator('.m-story h3')).toHaveCount(0);
  await page.goto('/');
  await expect(page.locator('.m-story h3')).toHaveCount(3);
});

test('marketing pages expose a share image in each language', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', '/icon.svg');
  for (const route of ['/', '/en', '/ru', '/blog', '/en/blog', '/ru/blog', '/programs', '/en/approach', '/ru/trust']) {
    await page.goto(route);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://educationos.space/images/curiosity-hero.webp');
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', 'https://educationos.space/images/curiosity-hero.webp');
  }
  await page.goto('/ru/blog/see-the-invisible');
  const articleImage = await page.locator('meta[property="og:image"]').getAttribute('content');
  expect(articleImage).toContain('/images/');
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', articleImage!);
});
