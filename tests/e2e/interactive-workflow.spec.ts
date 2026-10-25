import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { PORTAL_LESSONS } from '../../src/lib/portal-learning';

const solutions: Record<string, string> = {
  'programming-first-message': 'print("Hello, world!")\nprint("I can make things.")',
  'programming-variables': 'seeds = 4\nseeds = seeds + 3\nprint(seeds)',
  'programming-repeat': 'repeat 3:\n  print("Clap")\n  print("Tap")',
  'science-fair-test': 'same', 'science-evidence': 'observed',
  'mathematics-patterns': '15', 'mathematics-fractions': 'half', 'mathematics-area': '12',
  'language-strong-sentence': 'clear', 'arts-patterns': 'three',
  'language-precise-description': 'A curved blue handle sticks out from the smooth white side. Inside, a dark ring marks where warm tea used to sit. A tiny chip interrupts the round rim.',
  'language-short-story': 'The key lay beside the locked garden gate. Mira wanted to find the missing seed box, but she did not know who owned the key. She chose to ask the gardener instead of taking it. Together they opened the gate and found the box beneath a bench. Mira returned the key and planted the seeds with permission.',
  'arts-color-story': 'My reading garden feels peaceful. Pale green covers most of the walls because it reminds me of leaves. Dark blue marks the shaded reading corners. A small yellow doorway draws attention to the entrance without filling the entire space with bright colour.',
  'arts-design-brief': 'This sign is for a new learner looking for the reading corner. I chose large dark lettering on a pale background so the words are easy to see. A simple book symbol helps younger readers. I would ask someone where they think the sign leads, then revise it using their answer.',
};

test('the landing challenge checks both actions, explains errors, and supports retry in every language', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const [path, solved] of [['/', 'Reto resuelto'], ['/en', 'Challenge solved'], ['/ru', 'Задача решена']]) {
    await page.goto(path);
    const task = page.locator('.fx-bridge-preview');
    await task.locator('button[type=submit]').click();
    await expect(task.getByRole('alert')).toBeVisible();
    await task.locator('.activity-review').click();
    await expect(task.locator('[data-answer=folded]')).toBeFocused();
    await task.locator('[data-answer=folded]').click();
    await task.locator('button[type=submit]').click();
    await task.locator('.activity-review').click();
    await expect(task.locator('select')).toBeFocused();
    await task.locator('select').selectOption('material');
    await task.locator('button[type=submit]').click();
    await expect(task.locator('select')).toHaveAttribute('aria-invalid', 'true');
    await expect(task.getByRole('alert')).toBeVisible();
    await task.locator('select').selectOption('shape');
    await task.locator('button[type=submit]').click();
    await expect(task.getByRole('status').filter({ hasText: solved })).toBeVisible();
    const scan = await new AxeBuilder({ page }).include('.fx-bridge-preview').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(scan.violations).toEqual([]);
    await task.locator('.fx-shape-controls button').first().click();
    await expect(task.locator('.is-success')).toHaveCount(0);
    await task.locator('button[type=submit]').click();
    await expect(task.getByRole('alert')).toBeVisible();
    await task.locator('.fx-task-actions button[type=button]').click();
    await expect(task.locator('select')).toHaveValue('');
    await expect(task.locator('.activity-feedback')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

for (const lesson of PORTAL_LESSONS) test(`${lesson.title}: incorrect → corrected → restored → edited`, async ({ page }) => {
  await page.goto(`/portal/learn/${lesson.id}`);
  const submit = page.getByRole('button', { name: /^(Check my answer|Check & record activity|Record my practice)$/ });
  await submit.click();
  await expect(page.locator('.activity-feedback.is-error')).toBeVisible();
  await page.locator('.activity-review').click();
  await expect(page.locator('[data-answer][aria-invalid=true]').first()).toBeFocused();
  const activity = lesson.activity;
  if (activity.kind === 'code') await page.getByLabel('Your code', { exact: true }).fill(solutions[lesson.id]);
  if (activity.kind === 'choice') {
    await page.locator(`input[type=radio][value="${activity.options.find(option => option.id !== solutions[lesson.id])!.id}"]`).check();
    await submit.click();
    await expect(page.locator('.activity-feedback.is-error')).toBeVisible();
    await page.locator(`input[type=radio][value="${solutions[lesson.id]}"]`).check();
  }
  if (activity.kind === 'writing') await page.locator('#writing-draft').fill(solutions[lesson.id]);
  if (activity.kind === 'experiment') {
    await page.locator('#observation-flat').fill('0');
    await page.locator('#observation-folded').fill('0');
    await page.locator('#observation-notice').fill('Both paper bridges slipped immediately in this made-up comparison.');
  }
  await submit.click();
  await expect(page.locator('.activity-feedback.is-success')).toBeVisible();
  await page.reload();
  await expect(page.locator('.activity-feedback.is-success')).toBeVisible();
  if (activity.kind === 'code') await page.locator('#practice-code').fill(solutions[lesson.id] + '\n# Try a change');
  if (activity.kind === 'choice') await page.locator(`input[type=radio][value="${activity.options.find(option => option.id !== solutions[lesson.id])!.id}"]`).check();
  if (activity.kind === 'writing') await page.locator('#writing-draft').fill(solutions[lesson.id] + ' I will revise this draft.');
  if (activity.kind === 'experiment') await page.locator('#observation-flat').fill('1');
  await expect(page.locator('.activity-feedback.is-success')).toHaveCount(0);
  await expect(page.locator('.p-reflection')).toHaveCount(0);
});

test('mobile code errors expose a correction path back to the editor', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/portal/learn/programming-first-message');
  await page.getByRole('button', { name: 'Activity', exact: true }).click();
  await page.locator('#practice-code').fill('print(');
  await page.getByRole('button', { name: 'Run code', exact: true }).click();
  await expect(page.locator('.activity-feedback.is-error')).toContainText('Line 1');
  await page.getByRole('button', { name: 'Back to activity', exact: true }).click();
  await expect(page.locator('#practice-code')).toBeFocused();
  await page.locator('#practice-code').fill(solutions['programming-first-message']);
  await page.getByRole('button', { name: 'Check & record activity', exact: true }).click();
  await expect(page.locator('.activity-feedback.is-success')).toBeVisible();
});

test('the seven-step mission cannot finish by skipping straight to Transfer', async ({ page }) => {
  await page.goto('/demo/lab');
  await page.getByRole('button', { name: /07 Transfer/ }).click();
  await page.getByLabel('Where could this idea go next?').fill('I could test a folded paper roof with the same materials.');
  await page.getByRole('button', { name: 'Complete mission', exact: true }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Finish Step 01' })).toBeVisible();
  await page.getByRole('button', { name: 'Go to Step 01', exact: true }).click();
  await expect(page.getByLabel('What do you notice?')).toBeVisible();
  await expect(page.locator('#demo-step-title')).toBeFocused();
});

test('discovery labs explain missing predictions instead of leaving a dead button', async ({ page }) => {
  for (const [id, button] of [['loop-loom', 'Save my prediction'], ['same-half', 'Try my prediction'], ['hidden-cubes', 'Open the builder']]) {
    await page.goto(`/portal/labs/${id}`);
    await page.getByRole('button', { name: button, exact: true }).click();
    await expect(page.locator('.activity-feedback.is-error')).toBeVisible();
    await page.locator('.activity-review').click();
    await expect(page.locator('[data-answer=prediction]').first()).toBeFocused();
  }
  await page.locator('#cube-prediction').fill('-1');
  await page.getByRole('button', { name: 'Open the builder', exact: true }).click();
  await expect(page.locator('#cube-prediction')).toHaveValue('-1');
  await expect(page.locator('.activity-feedback.is-error')).toBeVisible();
  await page.locator('#cube-prediction').fill('7');
  await page.getByRole('button', { name: 'Open the builder', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Look for equal layers' })).toBeVisible();
  await expect(page.locator('.activity-feedback.is-error')).toHaveCount(0);
});
