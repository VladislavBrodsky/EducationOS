import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const labPath = '/portal/labs/same-half';

async function revealInvestigation(page: Page) {
  await page.getByRole('radio', { name: 'The amount changes with the shape.', exact: true }).check();
  await page.getByRole('button', { name: 'Try my prediction', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Make a half with your own shape', exact: true })).toBeVisible();
}

async function completeInvestigation(page: Page) {
  await page.getByRole('radio', { name: 'Both cover half of the same-sized whole.', exact: true }).check();
  await page.getByRole('radio', { name: 'No. Those two pieces together cover less than half.', exact: true }).check();
  await page.getByRole('spinbutton', { name: 'How many of eight equal cells make half?', exact: true }).fill('4');
  await page.getByRole('radio', { name: 'I can split the eight equal cells into two groups with the same number.', exact: true }).check();
  await page.getByRole('button', { name: 'Check and record my discovery', exact: true }).click();
}

test('Same Half checks evidence and transfer, preserves work, and invalidates an edited selection', async ({ page }) => {
  await page.goto(labPath);
  await expect(page.getByRole('heading', { name: 'Same Half Different Shape', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Same whole, different equal parts.', exact: true })).toHaveCount(0);
  await revealInvestigation(page);
  await expect(page.getByRole('button', { pressed: true }).filter({ hasText: /^\d+$/ })).toHaveCount(6);
  await page.getByRole('button', { name: 'Rearrange six cells', exact: true }).click();
  await expect(page.locator('.half-count')).toContainText('6 of 12 equal cells selected.');

  await page.getByRole('button', { name: 'Check and record my discovery', exact: true }).click();
  await expect(page.locator('.p-assessment-feedback')).toContainText('Keep investigating');
  await expect(page.locator('.p-assessment-feedback')).toContainText('Three of six and two of four');
  await completeInvestigation(page);
  await expect(page.locator('.p-assessment-feedback')).toContainText('discovery recorded');
  await expect(page.locator('.p-heading .p-tag')).toHaveText('Activity recorded');
  await page.reload();
  await expect(page.getByRole('spinbutton', { name: 'How many of eight equal cells make half?', exact: true })).toHaveValue('4');
  await expect(page.locator('.p-heading .p-tag')).toHaveText('Activity recorded');

  const firstCell = page.getByRole('button', { name: 'Cell 1, row 1, column 1', exact: true });
  await expect(firstCell).toHaveAttribute('aria-pressed', 'true');
  await firstCell.focus();
  await page.keyboard.press('Space');
  await expect(firstCell).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('.half-count')).toContainText('5 of 12 equal cells selected.');
  await expect(page.locator('.p-heading .p-tag')).toHaveCount(0);
  await expect(page.getByRole('spinbutton', { name: 'How many of eight equal cells make half?', exact: true })).toHaveValue('');
  await page.reload();
  await expect(firstCell).toHaveAttribute('aria-pressed', 'false');
  expect(await page.evaluate(() => JSON.parse(sessionStorage.getItem('educationos.portal.v1')!).labs['same-half'].completed)).toBe(false);
});

test('Same Half is usable in its mobile flat view, optional Anatomy view, and both themes', async ({ page }) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(labPath);
  await revealInvestigation(page);
  await expect(page.locator('.half-tilted')).toHaveCount(0);
  const cell = page.getByRole('button', { name: 'Cell 1, row 1, column 1', exact: true });
  await cell.focus();
  await page.keyboard.press('Enter');
  await expect(cell).toHaveAttribute('aria-pressed', 'false');
  await page.keyboard.press('Space');
  await expect(cell).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.half-count')).toContainText('6 of 12 equal cells selected.');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  let scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(scan.violations, 'mobile flat fractions').toEqual([]);
  await page.getByRole('button', { name: 'Try a tilted view', exact: true }).click();
  await expect(page.getByRole('img', { name: 'A tilted picture of your twelve-cell whole' })).toBeVisible();
  expect(await page.locator('.half-tilted .lab-solid').count()).toBe(13);
  await page.getByRole('button', { name: 'Switch to dark theme', exact: true }).click();
  await expect(page.locator('.p-portal')).toHaveAttribute('data-theme', 'dark');
  scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(scan.violations, 'mobile dark Anatomy fractions').toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await completeInvestigation(page);
  await expect(page.locator('.p-assessment-feedback')).toContainText('discovery recorded');
});

test('Same Half supplies an initially closed native worked example without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  try {
    const page = await context.newPage();
    await page.goto(new URL(labPath, baseURL).toString());
    await expect(page.getByText('Draw a rectangle with three rows of four equal cells. Select six cells, then select a different set of six.', { exact: true })).toBeVisible();
    const fallback = page.locator('noscript details');
    await expect(fallback).not.toHaveAttribute('open', '');
    await page.getByText('Open the worked comparison', { exact: true }).click();
    await expect(fallback).toHaveAttribute('open', '');
    await expect(fallback).toContainText('Four of eight equal cells make half');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  } finally {
    await context.close();
  }
});
