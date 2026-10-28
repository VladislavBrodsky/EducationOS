import { expect, test } from '@playwright/test';

test('the paper model responds to pointer and keyboard without inventing results', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Papel doblado', exact: true }).click();
  await expect(page.locator('.fx-bridge-scene')).toHaveAttribute('data-shape', 'folded');
  await expect(page.locator('.fx-model-status')).toHaveText('La misma hoja, con una forma diferente');
  await page.getByRole('button', { name: 'Papel plano', exact: true }).press('Space');
  await expect(page.locator('.fx-bridge-scene')).toHaveAttribute('data-shape', 'flat');
  await expect(page.getByRole('button', { name: 'Papel plano', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.fx-model-note')).toContainText('Un modelo visual');
  await expect(page.locator('.fx-bento')).toContainText('Actividades en inglés');
  await expect(page.locator('.fx-code-card')).toHaveAttribute('href', '/portal/labs/loop-loom');
});

test('decorative motion can be paused and respects the device preference', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/en');
  await expect(page.locator('.fx-orbit-node')).toHaveCount(4);
  await expect(page.locator('.fx-orbit-node').first()).toHaveCSS('animation-play-state', 'running');
  await page.getByRole('button', { name: 'Pause animations', exact: true }).click();
  await expect(page.locator('.fx-orbit-node').first()).toHaveCSS('animation-play-state', 'paused');
  await expect(page.getByRole('button', { name: 'Resume animations', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Resume animations', exact: true }).click();
  await expect(page.locator('.fx-orbit-node').first()).toHaveCSS('animation-play-state', 'running');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.fx-orbit-node').first()).toHaveCSS('animation-name', 'none');
  expect(await page.locator('.m-hero h1 em').evaluate(element => getComputedStyle(element, '::after').animationName)).toBe('none');
  await expect(page.locator('.m-hero-benefits li').first()).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.fx-motion-toggle').first()).toBeHidden();
  await page.getByRole('button', { name: 'Folded paper', exact: true }).click();
  await expect(page.locator('.fx-model-status')).toHaveText('The same sheet, a different shape');
});

test('the enhanced page keeps its content and links without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto('/ru');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('От «почему?»');
  await expect(page.locator('.fx-model-note')).toContainText('Визуальная модель');
  await expect(page.locator('.fx-bento-feature-footer a')).toHaveAttribute('href', '/demo/lab');
  await expect(page.locator('.m-method-card')).toHaveCount(4);
  await page.locator('.m-stage-card').click();
  await expect(page.locator('#paper-bridge-challenge')).toBeFocused();
  await page.locator('.m-mobile-menu summary').click();
  await page.getByRole('navigation', { name: 'Основная навигация' }).getByRole('link', { name: 'Метод', exact: true }).click();
  await expect(page).toHaveURL(/\/ru\/approach$/);
  await page.locator('.m-language summary').click();
  await page.getByRole('navigation', { name: 'Language / Idioma / Язык' }).getByRole('link', { name: 'English', exact: true }).click();
  await expect(page).toHaveURL(/\/en\/approach$/);
  await context.close();
});
