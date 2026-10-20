import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';

test('the visual journal and subject artwork load on narrow screens without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Journal', exact: true })).toBeVisible();
  await expect.poll(() => page.locator('.learning-hero-art img').evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  for (const path of ['/programs', '/approach', '/trust']) {
    await page.goto(path);
    await expect.poll(() => page.locator('.page-hero-scene-art img').evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), path).toBe(true);
  }
  await page.goto('/');
  await page.getByRole('link', { name: 'Journal', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Little questions. Big discoveries.' })).toBeVisible();
  await expect(page.locator('.journal-card')).toHaveCount(3);
  await expect.poll(() => page.locator('.journal-card-image img').first().evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('link', { name: /Math you can turn, fold, and explain/ }).click();
  await expect(page.getByRole('heading', { name: 'Math you can turn, fold, and explain' })).toBeVisible();
  await expect.poll(() => page.locator('.journal-article-image img').evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

  await page.goto('/portal');
  await page.getByRole('button', { name: /^Mathematics\b/ }).click();
  await expect(page.locator('.p-photo-visual img')).toHaveAttribute('src', /math-vision\.webp/);
  await page.getByRole('button', { name: /^Science\b/ }).click();
  await expect(page.locator('.p-photo-visual img')).toHaveAttribute('src', /physics-vision\.webp/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

const firstCodeSolution = 'print("Hello, world!")\nprint("I can make things.")';
const lessonIds = [
  'programming-first-message', 'programming-variables', 'programming-repeat',
  'science-fair-test', 'science-paper-bridge', 'science-evidence',
  'mathematics-patterns', 'mathematics-fractions', 'mathematics-area',
  'language-precise-description', 'language-strong-sentence', 'language-short-story',
  'arts-patterns', 'arts-color-story', 'arts-design-brief',
];

test('the learning home changes subjects, remembers the choice and opens complete learning paths', async ({ page }) => {
  await page.goto('/portal');
  await expect(page.getByRole('heading', { name: 'What will you discover?' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Your first message', exact: true })).toBeVisible();
  await page.getByRole('button', { name: /^Mathematics\b/ }).click();
  await expect(page.getByRole('heading', { name: 'Find the rule', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Start learning', exact: true })).toHaveAttribute('href', '/portal/learn/mathematics-patterns');
  await page.reload();
  await expect(page.getByRole('button', { name: /^Mathematics\b/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('heading', { name: 'Find the rule', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'See learning paths', exact: true }).click();
  await expect(page).toHaveURL(/\/portal\/subjects$/);
  for (const title of ['Programming', 'Science', 'Mathematics', 'Language & writing', 'Arts & design']) {
    await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
  }
  await expect(page.locator('.p-path-list > li')).toHaveCount(15);
  await page.getByRole('link', { name: 'Your first message', exact: true }).click();
  await expect(page).toHaveURL(/\/portal\/learn\/programming-first-message$/);
  await expect(page.getByLabel('Your code', { exact: true })).toBeEditable();
});

test('coding work runs locally, survives reload, appears in progress and can be exported or cleared', async ({ page }) => {
  const externalMutations: string[] = [];
  page.on('request', request => {
    if (request.url().includes('/api/') && request.method() !== 'GET') externalMutations.push(request.url());
  });
  await page.goto('/portal/learn/programming-first-message');
  await page.getByLabel('Your code', { exact: true }).fill(firstCodeSolution);
  await page.reload();
  await expect(page.getByLabel('Your code', { exact: true })).toHaveValue(firstCodeSolution);
  await page.getByRole('button', { name: 'Run code', exact: true }).click();
  await expect(page.locator('.p-output pre')).toHaveText('Hello, world!\nI can make things.');
  await expect(page.getByText('Run finished · 2 output lines', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Check & record activity', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Activity recorded.' })).toBeVisible();
  await page.getByLabel('My reflection', { exact: false }).fill('The output follows the order of my two instructions.');
  await page.getByRole('link', { name: 'My progress', exact: true }).click();
  const entry = page.locator('.p-notebook-entry').filter({ has: page.getByRole('heading', { name: 'Your first message', exact: true }) });
  await expect(entry.getByText('Activity recorded', { exact: true })).toBeVisible();
  await expect(entry).toContainText(firstCodeSolution);
  await page.reload();
  await expect(entry.getByText('Activity recorded', { exact: true })).toBeVisible();

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export my work', exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('educationos-learning-work.json');
  const exported = JSON.parse(await readFile((await download.path())!, 'utf8'));
  expect(exported.syntheticPreview).toBe(true);
  expect(exported.lessons['programming-first-message']).toMatchObject({
    draftCode: firstCodeSolution,
    completed: true,
    reflection: 'The output follows the order of my two instructions.',
  });
  expect(externalMutations).toEqual([]);

  await page.getByRole('button', { name: 'Clear portal work', exact: true }).click();
  await page.getByRole('button', { name: 'Keep my work', exact: true }).click();
  await expect(entry.getByText('Activity recorded', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Clear portal work', exact: true }).click();
  await page.getByRole('button', { name: 'Clear all portal work', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'A blank page is a good beginning.', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'A blank page is a good beginning.', exact: true })).toBeVisible();
  expect(await page.evaluate(() => sessionStorage.getItem('educationos.portal.v1'))).toBeNull();
});

test('a maths attempt explains errors and records a corrected answer', async ({ page }) => {
  await page.goto('/portal/learn/mathematics-patterns');
  await page.getByRole('radio', { name: '14', exact: true }).check();
  await page.getByRole('button', { name: 'Check my answer', exact: true }).click();
  await expect(page.getByRole('main').getByRole('alert')).toContainText('Try another way.');
  await expect(page.getByRole('main').getByRole('alert')).toContainText('12 + 3 = 15');
  await page.getByRole('radio', { name: '15', exact: true }).check();
  await page.getByRole('button', { name: 'Check my answer', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Activity recorded.' })).toBeVisible();
  await page.getByRole('link', { name: 'My progress', exact: true }).click();
  await expect(page.locator('.p-notebook-entry').filter({ has: page.getByRole('heading', { name: 'Find the rule', exact: true }) })).toContainText('Activity recorded');
});

test('writing records the visible minimum-length requirement and science accepts an honest zero result', async ({ page }) => {
  await page.goto('/portal/learn/language-short-story');
  await page.getByLabel('What does the key change?', { exact: true }).fill('A key appeared beside the gate.');
  await page.getByRole('button', { name: 'Record my practice', exact: true }).click();
  await expect(page.getByRole('main').getByRole('alert')).toContainText('You have 6 words.');
  await expect(page.getByRole('main').getByRole('alert')).toContainText('40');
  const story = 'A curious explorer found a small silver key beside the locked garden gate. The plants inside looked thirsty, but nobody knew where the gardener had gone. She chose to ask a neighbour before opening anything. Together they found the owner, watered the flowers, and made a plan to care for the garden each morning.';
  await page.getByLabel('What does the key change?', { exact: true }).fill(story);
  await page.getByRole('button', { name: 'Record my practice', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Activity recorded.' })).toContainText('not writing quality');

  await page.goto('/portal/learn/science-paper-bridge');
  await page.getByLabel('Flat bridge: seconds held (0–60)', { exact: true }).fill('0');
  await page.getByLabel('Folded bridge: seconds held (0–60)', { exact: true }).fill('0');
  await page.getByLabel('What happened?', { exact: true }).fill('Both paper bridges slipped before supporting the block.');
  await page.getByRole('button', { name: 'Record my practice', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Activity recorded.' })).toContainText('does not verify the experiment');
  await page.reload();
  await expect(page.getByLabel('Flat bridge: seconds held (0–60)', { exact: true })).toHaveValue('0');
  await page.getByRole('link', { name: 'My progress', exact: true }).click();
  await expect(page.locator('.p-notebook-entry').filter({ hasText: 'A problem, a choice, a change' })).toContainText('Activity recorded');
  await expect(page.locator('.p-notebook-entry').filter({ hasText: 'Build, test, notice' })).toContainText('Activity recorded');
});

test('the app host serves only the portal and keeps clean paths, policy redirects and crawler boundaries', async ({ request }) => {
  const appHeaders = { Host: 'app.educationos.space' };
  const appHome = await request.get('/', { headers: appHeaders });
  expect(appHome.status()).toBe(200);
  expect(appHome.headers()['x-robots-tag']).toBe('noindex, nofollow');
  expect(await appHome.text()).toMatch(/<h1[^>]*>What will you discover\?/);
  expect(await appHome.text()).toContain('href="/subjects"');

  // The two surfaces share decorative assets; the portal router must not
  // rewrite their paths into missing learner pages.
  for (const host of ['app.educationos.space', 'educationos.space']) {
    const image = await request.get('/images/learning-objects.webp', { headers: { Host: host } });
    expect(image.status(), `${host} learning image`).toBe(200);
    expect(image.headers()['content-type']).toContain('image/webp');
  }

  const cleanPath = await request.get('/portal/subjects?from=home', { headers: appHeaders, maxRedirects: 0 });
  expect(cleanPath.status()).toBe(308);
  const redirect = new URL(cleanPath.headers().location);
  expect(redirect.hostname).toBe('app.educationos.space');
  expect(redirect.pathname).toBe('/subjects');
  expect(redirect.search).toBe('?from=home');

  const privacy = await request.get('/privacy?from=guardian', { headers: appHeaders, maxRedirects: 0 });
  expect(privacy.status()).toBe(308);
  expect(privacy.headers().location).toBe('https://educationos.space/privacy?from=guardian');
  expect(privacy.headers()['x-robots-tag']).toBe('noindex, nofollow');
  const robots = await request.get('/robots.txt', { headers: appHeaders });
  expect(await robots.text()).toContain('Disallow: /');
  expect(await robots.text()).not.toContain('Sitemap:');
  const sitemap = await request.get('/sitemap.xml', { headers: appHeaders });
  expect(sitemap.status()).toBe(404);
  expect(sitemap.headers()['x-robots-tag']).toBe('noindex, nofollow');
  expect(await sitemap.text()).not.toContain('<urlset');

  const publicHome = await request.get('/', { headers: { Host: 'educationos.space', 'x-educationos-portal-host': 'true' } });
  expect(publicHome.status()).toBe(200);
  expect(await publicHome.text()).toContain('Big ideas');
  expect(await publicHome.text()).not.toMatch(/<h1[^>]*>What will you discover\?/);
});

test('all portal pages fit narrow and wide screens, including every activity type', async ({ page }) => {
  test.setTimeout(180000);
  const routes = ['/portal', '/portal/subjects', '/portal/projects', '/portal/progress', '/portal/guardian', ...lessonIds.map(id => `/portal/learn/${id}`)];
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator('main h1')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${route} overflows at ${width}px`).toBe(true);
      if (width === 390 && route.includes('/learn/')) {
        await page.getByRole('button', { name: 'Activity', exact: true }).click();
        await expect(page.getByRole('region', { name: 'Activity workspace', exact: true })).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${route} activity overflows at ${width}px`).toBe(true);
      }
    }
  }
});

test('code, mobile choices and dark progress pass automated accessibility checks', async ({ page }) => {
  test.setTimeout(120000);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/portal/learn/programming-first-message');
  let scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(scan.violations, 'desktop coding workspace').toEqual([]);
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.goto('/portal/learn/mathematics-patterns');
  await page.getByRole('button', { name: 'Activity', exact: true }).click();
  scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(scan.violations, 'mobile choice workspace').toEqual([]);
  await page.goto('/portal/progress');
  await page.getByRole('button', { name: 'Switch to dark theme', exact: true }).click();
  await expect(page.locator('.p-portal')).toHaveAttribute('data-theme', 'dark');
  scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(scan.violations, 'dark progress workspace').toEqual([]);
});
