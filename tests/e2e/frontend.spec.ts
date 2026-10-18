import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, readFile } from 'node:fs/promises';
const screenshotDir = 'artifacts/screenshots';

test('marketing, trust and legal pages render with accessible landmarks', async ({ page }) => {
  for (const path of ['/', '/programs', '/approach', '/trust', '/privacy', '/terms', '/safety', '/accessibility']) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByRole('main')).toHaveCount(1);
    const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(scan.violations, JSON.stringify(scan.violations)).toEqual([]);
  }
});

test('seven-step mission records evidence, exports, switches age groups and clears safely', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/demo/lab');
  await expect(page.getByRole('combobox', { name: 'Explore an age group' })).toBeEnabled();
  await page.getByRole('button', { name: 'Next step', exact: true }).click();
  await expect(page.locator('#demo-step-error')).toContainText('sentence');
  await page.getByLabel('What do you notice?').fill('The flat paper sags under the same light block.');
  await page.getByRole('button', { name: 'Next step', exact: true }).click();
  await page.getByLabel('Describe the tradeoff').fill('I want a bridge that lasts longer while using only one paper sheet.');
  await page.getByRole('button', { name: 'Next step', exact: true }).click();
  await page.getByLabel('Idea 01', { exact: true }).fill('Fold an accordion shape to support the same block.');
  await page.getByLabel('Idea 02', { exact: true }).fill('Curve the sheet into a small supporting arch.');
  await page.getByRole('button', { name: 'Next step', exact: true }).click();
  await page.getByLabel('Make your prediction').fill('If I fold the sheet into ridges, I predict it will stand longer.');
  await page.getByRole('button', { name: 'Next step', exact: true }).click();
  await page.getByLabel('Flat paper / baseline').fill('3.2');
  await page.getByLabel('Your redesigned paper').fill('15.4');
  await page.getByLabel('What happened during the test?').fill('The ridged sheet held the same block longer across the same gap.');
  await page.getByRole('button', { name: 'Next step', exact: true }).click();
  await page.getByLabel('What does your evidence suggest?').fill('The result fits my prediction, but I should repeat the same test.');
  await page.getByRole('button', { name: 'Next step', exact: true }).click();
  await page.getByLabel('Where could this idea go next?').fill('I could test folded packaging to protect a model using less paper.');
  await page.getByRole('button', { name: 'View your portfolio' }).click();
  await expect(page).toHaveURL(/\/demo\/portfolio$/);
  await expect(page.getByText('All seven steps have recorded evidence.', { exact: false })).toBeVisible();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export demo JSON' }).click();
  const file = await download;
  const parsed = JSON.parse(await readFile((await file.path())!, 'utf8'));
  expect(parsed.syntheticDemoOnly).toBe(true);
  expect(parsed.evidenceSteps).toBe(7);
  expect(parsed.observations.measurements.difference).toBe(12.2);
  await page.reload();
  await expect(page.getByText('All seven steps have recorded evidence.', { exact: false })).toBeVisible();
  await page.getByRole('combobox', { name: 'Explore an age group' }).selectOption('5-6');
  await expect(page.getByText('0 of 7 steps have recorded evidence.', { exact: false })).toBeVisible();
  await page.getByRole('combobox', { name: 'Explore an age group' }).selectOption('10-12');
  await page.getByRole('button', { name: 'Clear demo notes', exact: true }).click();
  await page.getByRole('button', { name: 'Keep my notes' }).click();
  await expect(page.getByText('All seven steps have recorded evidence.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Clear demo notes', exact: true }).click();
  await page.getByRole('button', { name: 'Clear all demo notes', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('cleared');
  await expect(page.getByText('0 of 7 steps have recorded evidence.', { exact: false })).toBeVisible();
  expect(errors).toEqual([]);
});

test('saved demo corruption recovers; guardian tabs work with keyboard', async ({ page }) => {
  await page.goto('/demo');
  await page.evaluate(() => sessionStorage.setItem('educationos.synthetic-demo.v1', '{broken'));
  await page.reload();
  await expect(page.getByRole('status')).toContainText('fresh demo');
  await page.getByRole('link', { name: 'Guardian preview', exact: true }).click();
  const tab = page.getByRole('tab', { name: 'Learning evidence' });
  await tab.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Safety boundaries' })).toBeFocused();
  await expect(page.getByRole('tab', { name: 'Safety boundaries' })).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('End');
  await expect(page.getByRole('tab', { name: 'Before real accounts' })).toBeFocused();
  const scan = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  expect(scan.violations, JSON.stringify(scan.violations)).toEqual([]);
});

test('all demo routes remain accessible and fit desktop and mobile', async ({ page }) => {
  await mkdir(screenshotDir, { recursive: true });
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    for (const path of ['/', '/demo', '/demo/lab', '/demo/portfolio', '/demo/guardian']) {
      await page.goto(path);
      await expect(page.locator('h1')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      const scan = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
      expect(scan.violations, JSON.stringify(scan.violations)).toEqual([]);
      const name = path === '/' ? 'marketing' : path.replace('/','').replaceAll('/','-');
      await page.screenshot({ path: `${screenshotDir}/${name}-${width}.png`, fullPage: true });
    }
  }
});

test('production CSP uses unique script nonces, canonical pages and fixed www redirect', async ({ request, page }) => {
  const first = await request.get('/'); const second = await request.get('/');
  const csp = first.headers()['content-security-policy'];
  expect(csp).toContain("'strict-dynamic'");
  expect(csp.split(';').find(rule => rule.includes('script-src'))).not.toContain('unsafe-inline');
  expect(csp).not.toEqual(second.headers()['content-security-policy']);
  expect(first.headers()['x-content-type-options']).toBe('nosniff');
  await page.goto('/programs');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://educationos.space/programs');
  const redirect = await request.get('/approach?ref=demo', { headers: { host: 'www.educationos.space' }, maxRedirects: 0 });
  expect(redirect.status()).toBe(308);
  expect(redirect.headers().location).toBe('https://educationos.space/approach?ref=demo');
});
