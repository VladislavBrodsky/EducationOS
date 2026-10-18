import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';

test('dashboard, seven-step mission, evidence, export, and reset work together', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'A world of possibilities.' })).toBeVisible();
  await page.getByRole('button', { name: 'Start your mission' }).click();
  await page.getByRole('button', { name: 'Save step & continue' }).click();
  await expect(page.locator('main [role="alert"]')).toContainText('Describe');
  for (let step = 0; step < 7; step++) {
    await page.getByRole('button', { name: 'Use a fictional example' }).click();
    const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(scan.violations, `Lab step ${step + 1}`).toEqual([]);
    await page.getByRole('button', { name: step === 6 ? 'Complete mission' : 'Save step & continue' }).click();
  }
  await expect(page.getByText('Mission complete. Keep the curiosity.')).toBeVisible();
  await page.getByRole('button', { name: 'Review your portfolio' }).click();
  await expect(page.getByText('Folded paper count', { exact: true })).toBeVisible();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export demo JSON' }).click();
  const download = await downloadPromise;
  const file = await download.path();
  const data = JSON.parse(await readFile(file!, 'utf8'));
  expect(data.syntheticDemo).toBe(true); expect(data.missions[0].complete).toBe(true);
  expect(data.missions[0].evidence.folded).toBe('8');
  await page.getByRole('button', { name: 'Skills Vault', exact: true }).first().click();
  await expect(page.getByText('1 demo example')).toHaveCount(4);
  await page.getByRole('button', { name: 'Inventors Lab', exact: true }).first().click();
  await page.getByRole('navigation', { name: 'Mission steps' }).getByRole('button', { name: 'Find the contradiction', exact: true }).click();
  await page.getByLabel('What should improve?', { exact: true }).fill('A revised fictional goal.');
  await page.getByRole('button', { name: 'Portfolio', exact: true }).first().click();
  await expect(page.getByText('Folded paper count', { exact: true })).not.toBeVisible();
  await expect(page.getByText('1 / 7 steps')).toBeVisible();
  await page.getByRole('button', { name: 'Reset demo', exact: true }).click();
  await page.getByRole('button', { name: 'Clear all demo notes' }).click();
  await page.getByRole('button', { name: 'Portfolio', exact: true }).first().click();
  await expect(page.getByText('Every discovery starts somewhere.')).toBeVisible();
  expect(await page.evaluate(() => localStorage.length + sessionStorage.length)).toBe(0);
});

test('age bands change scaffolding without losing other demo attempts', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Learning stage', { exact: true }).selectOption('explorers');
  await page.getByRole('button', { name: 'Start your mission' }).click();
  await expect(page.getByText('With a grown-up, make a paper path', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Use a fictional example' }).click();
  await page.getByRole('button', { name: 'Save step & continue' }).click();
  await page.getByLabel('Learning stage', { exact: true }).selectOption('launchers');
  await expect(page.getByText('Discuss limitations, measurement uncertainty', { exact: false })).toBeVisible();
  await page.getByLabel('Learning stage', { exact: true }).selectOption('explorers');
  await expect(page.getByRole('heading', { name: 'Find the contradiction.' })).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'Portfolio', exact: true }).first().click();
  await expect(page.getByText('Every discovery starts somewhere.')).toBeVisible();
});

test('desktop, mobile, lab, and guardian have no detected WCAG A/AA axe violations', async ({ page }) => {
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 1000 }); await page.goto('/');
    for (const view of ['Dashboard', 'Inventors Lab', 'Skills Vault', 'Portfolio', 'Guardian preview']) {
      const nav = width < 680 ? page.getByRole('navigation', { name: 'Mobile navigation' }) : page.getByRole('navigation', { name: 'Main navigation' });
      await nav.getByRole('button', { name: view, exact: true }).click();
      await expect(page.locator('main h1')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      expect(scan.violations, `${view} at ${width}px`).toEqual([]);
      const undersized = await page.locator('button:visible').evaluateAll(buttons => buttons.filter(button => { const rect = button.getBoundingClientRect(); return rect.width < 43.9 || rect.height < 43.9; }).map(button => button.textContent));
      expect(undersized, `44px button targets: ${view} at ${width}px`).toEqual([]);
      if (view === 'Inventors Lab') {
        await page.screenshot({ path: `artifacts/lab-${width}.png`, fullPage: true });
        if (width === 390) await page.screenshot({ path: 'artifacts/lab-390-viewport.png' });
      }
    }
    const nav = width < 680 ? page.getByRole('navigation', { name: 'Mobile navigation' }) : page.getByRole('navigation', { name: 'Main navigation' });
    await nav.getByRole('button', { name: 'Dashboard', exact: true }).click();
    await page.screenshot({ path: `artifacts/dashboard-${width}.png`, fullPage: true });
    await nav.getByRole('button', { name: 'Guardian preview', exact: true }).click();
    await page.screenshot({ path: `artifacts/guardian-${width}.png`, fullPage: true });
  }
});

test('keyboard users can skip navigation and cancel the reset dialog', async ({ page }) => {
  await page.goto('/'); await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.getByRole('link', { name: 'Skip to content' }).press('Enter');
  await expect(page.locator('main')).toBeFocused();
  await page.getByRole('button', { name: 'Reset demo', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible(); await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('protected HTTP endpoints stay closed even with forged identity headers', async ({ request }) => {
  const result = await request.get('/api/v1/missions', { headers: { 'x-role': 'guardian', 'x-user-id': 'fake', 'x-tenant-id': 'fake' } });
  expect(result.status()).toBe(503); expect(result.headers()['cache-control']).toContain('no-store');
});
