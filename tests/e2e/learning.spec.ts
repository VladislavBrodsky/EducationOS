import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';
import type { PublishedMission } from '../../src/contracts/learning';
const DEMO_MISSIONS: PublishedMission[] = JSON.parse(await readFile(new URL('../../shared/curriculum/missions.v1.json', import.meta.url), 'utf8'));

async function serveCurriculum(page: import('@playwright/test').Page) {
  await page.route('**/api/v1/missions?*', async route => {
    const ageBand = new URL(route.request().url()).searchParams.get('age_band');
    await route.fulfill({ json: { items: DEMO_MISSIONS.filter(mission => mission.ageBand === ageBand) } });
  });
}

test('public website opens the current demo and all seven steps produce local evidence', async ({ page }) => {
  await serveCurriculum(page);
  const mutations: string[] = [];
  page.on('request', request => { if (request.url().includes('/api/') && request.method() !== 'GET') mutations.push(request.url()); });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /La curiosidad/ })).toBeVisible();
  await page.getByRole('link', { name: 'Explorar la misión', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Published lesson ready' })).toBeVisible();
  await page.getByRole('button', { name: 'Next step', exact: true }).click();
  await expect(page.locator('#demo-step-error')).toContainText('Add a sentence');
  await page.getByLabel('What do you notice?').fill('The flat paper bends in the middle in this made-up example.');
  await page.getByRole('button', { name: 'Next step', exact: true }).click();
  await page.getByLabel('Describe the tradeoff').fill('The paper should stand longer while the material stays the same.');
  await page.getByRole('button', { name: 'Next step', exact: true }).click();
  await page.getByLabel('Idea 01', { exact: true }).fill('Fold the paper into a zigzag.');
  await page.getByLabel('Idea 02', { exact: true }).fill('Curve the paper into an arch.');
  await page.getByRole('button', { name: 'Next step', exact: true }).click();
  await page.getByLabel('Make your prediction').fill('If I fold the paper then it might stand longer because its shape changes.');
  await page.getByRole('button', { name: 'Next step', exact: true }).click();
  await page.getByLabel('Flat paper / baseline').fill('8');
  await page.getByLabel('Your redesigned paper').fill('0');
  await page.getByLabel('What happened during the test?').fill('The redesigned paper fell first in this fictional trial.');
  await page.getByRole('button', { name: 'Next step', exact: true }).click();
  await page.getByLabel('What does your evidence suggest?').fill('This made-up trial does not support the prediction; I would repeat it.');
  await page.getByRole('button', { name: 'Next step', exact: true }).click();
  await page.getByLabel('Where could this idea go next?').fill('I could test a folded paper roof under the same controlled conditions.');
  await page.getByRole('button', { name: 'Complete mission', exact: true }).click();
  await expect(page.getByText('All seven steps have recorded evidence.', { exact: false })).toBeVisible();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export demo JSON' }).click();
  const download = await downloadPromise;
  const exported = JSON.parse(await readFile((await download.path())!, 'utf8'));
  expect(exported.syntheticDemoOnly).toBe(true);
  expect(exported.evidenceSteps).toBe(7);
  expect(exported.observations.measurements.redesigned).toBe(0);
  expect(mutations).toEqual([]);
  await page.getByRole('button', { name: 'Clear demo notes', exact: true }).click();
  await page.getByRole('button', { name: 'Keep my notes', exact: true }).click();
  await expect(page.getByText('All seven steps have recorded evidence.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Clear demo notes', exact: true }).click();
  await page.getByRole('button', { name: 'Clear all demo notes', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'A blank page is a good beginning' })).toBeVisible();
  expect(await page.evaluate(() => sessionStorage.getItem('educationos.synthetic-demo.v1'))).toBeNull();
});

test('five age bands retain separate drafts through navigation and browser reload', async ({ page }) => {
  await serveCurriculum(page);
  await page.goto('/demo/lab');
  await expect(page.getByRole('status').filter({ hasText: 'Published lesson ready' })).toBeVisible();
  await page.getByLabel('What do you notice?').fill('Made-up maker notes remain in this tab.');
  await page.getByLabel('Explore an age group').selectOption('5-6');
  await expect(page.getByText('With a grown-up, put a sheet of paper', { exact: false })).toBeVisible();
  await page.getByLabel('What do you notice?').fill('Made-up explorer notes stay separate.');
  for (const band of ['7-9', '13-15', '16-17', '10-12']) {
    await page.getByLabel('Explore an age group').selectOption(band);
    await expect(page.getByRole('status').filter({ hasText: 'Published lesson ready' })).toBeVisible();
  }
  await expect(page.getByLabel('What do you notice?')).toHaveValue('Made-up maker notes remain in this tab.');
  await page.reload();
  await expect(page.getByLabel('What do you notice?')).toHaveValue('Made-up maker notes remain in this tab.');
  await page.getByRole('link', { name: 'Guardian preview', exact: true }).click();
  await page.getByRole('tab', { name: 'Safety boundaries' }).click();
  await expect(page.getByRole('heading', { name: 'A small, contained learning space' })).toBeVisible();
  await page.getByRole('tab', { name: 'Safety boundaries' }).press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Before real accounts' })).toBeFocused();
});

test('unavailable and malformed curriculum clearly show offline preview and retry recovers', async ({ page }) => {
  await page.route('**/api/v1/missions?*', route => route.fulfill({ status: 503, json: { error: { code: 'UNAVAILABLE' } } }));
  await page.goto('/demo/lab');
  await expect(page.getByRole('status').filter({ hasText: 'Offline lesson preview' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Notice the system' })).toBeVisible();
  await page.unroute('**/api/v1/missions?*');
  await page.route('**/api/v1/missions?*', route => route.fulfill({ json: { items: [{ id: 'invalid' }] } }));
  await page.getByRole('button', { name: 'Retry connection' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Offline lesson preview' })).toBeVisible();
  await page.unroute('**/api/v1/missions?*');
  const reviewed = DEMO_MISSIONS.find(mission => mission.ageBand === '10-12')!;
  // Even a schema-valid new version must not replace the lesson that existing
  // local drafts and exported version-1 evidence refer to.
  await page.route('**/api/v1/missions?*', route => route.fulfill({ json: { items: [{ ...reviewed, version: 2 }] } }));
  await page.getByRole('button', { name: 'Retry connection' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Offline lesson preview' })).toBeVisible();
  await page.unroute('**/api/v1/missions?*');
  await page.route('**/api/v1/missions?*', route => route.fulfill({ json: { items: [{ ...reviewed, content: { ...reviewed.content, summary: 'A changed summary under the same version identifier.' } }] } }));
  await page.getByRole('button', { name: 'Retry connection' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Offline lesson preview' })).toBeVisible();
  await page.unroute('**/api/v1/missions?*');
  await serveCurriculum(page);
  await page.getByRole('button', { name: 'Retry connection' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Published lesson ready' })).toBeVisible();
});

test('current public pages and demo routes fit desktop/mobile and pass automated accessibility scans', async ({ page }) => {
  test.setTimeout(120000);
  await serveCurriculum(page);
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of ['/', '/programs', '/approach', '/trust', '/privacy', '/safety', '/terms', '/accessibility', '/demo', '/demo/lab', '/demo/portfolio', '/demo/guardian']) {
      await page.goto(route);
      await expect(page.locator('main h1')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${route} overflows at ${width}px`).toBe(true);
      const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      expect(scan.violations, `${route} at ${width}px`).toEqual([]);
    }
    await page.goto('/demo');
    await page.screenshot({ path: `artifacts/dashboard-${width}.png`, fullPage: true });
    await page.goto('/demo/guardian');
    await page.screenshot({ path: `artifacts/guardian-${width}.png`, fullPage: true });
  }
});
