import { test, expect, type Page } from '@playwright/test';

// Opt-in only: a disposable migrated database and three operator-provisioned,
// adult-attested test accounts must exist before this integration check runs.
test.skip(process.env.STUDIO_LIVE_E2E !== '1', 'Requires the disposable Python/PostgreSQL/Redis stack');

const bands = ['5-6', '7-9', '10-12', '13-15', '16-17'];
const steps = ['Notice', 'Contradiction', 'Imagine', 'Hypothesis', 'Experiment', 'Reflect', 'Transfer'];

async function signIn(page: Page, baseURL: string, role: 'educator' | 'reviewer' | 'guardian', password: string) {
  await page.goto(`${baseURL}/studio`);
  await page.getByLabel('Email address').fill(`${role}@studio.example`);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Open workspace', exact: true }).click();
  await expect(page.getByText('Signed in as')).toContainText(role);
}

test('real adult browser sessions create, independently approve, and revoke consent through Python', async ({ page, browser, baseURL, request }) => {
  test.setTimeout(120000);
  const password = process.env.STUDIO_E2E_PASSWORD;
  if (!password || !baseURL) throw new Error('STUDIO_E2E_PASSWORD and browser baseURL are required');
  const runLabel = String(Date.now()).split('').map(digit => 'abcdefghij'[Number(digit)]).join('');
  const title = `Paper structures ${runLabel}`;
  await page.setViewportSize({ width: 1440, height: 1000 });
  await signIn(page, baseURL, 'educator', password);
  await page.getByRole('button', { name: 'New draft', exact: true }).click();
  await page.getByLabel('Mission title', { exact: true }).fill(title);
  await page.getByLabel('Learning intention').fill('Compare two paper structures and use observations to explain a design choice.');
  await page.getByLabel('TRIZ principle', { exact: true }).fill('Change a shape to explore another balance');
  for (const ageBand of bands) {
    const stage = page.locator('details.studio-stage').filter({ has: page.locator('summary').getByText(`Ages ${ageBand}`, { exact: true }) });
    if (!(await stage.evaluate(element => element.hasAttribute('open')))) await stage.locator('summary').click();
    await page.getByLabel(`Challenge for ages ${ageBand}`, { exact: true }).fill(`With an adult, compare two paper shapes using a clear table for ages ${ageBand}.`);
    for (const name of steps) {
      await page.getByLabel(new RegExp(`${name} · ages ${ageBand}$`)).fill(`${name}: describe one paper idea and compare it with the first shape.`);
    }
    await page.getByLabel(`Safety and adult guidance · ages ${ageBand}`, { exact: true }).fill('Use paper only on a clear table with adult supervision. Keep the activity simple.');
  }
  await page.getByRole('button', { name: 'Save draft', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Draft saved as version 1');
  // The browser is showing persisted content after the API save and history reads.
  for (const stage of await page.locator('details.studio-stage').all()) {
    if (await stage.evaluate(element => element.hasAttribute('open'))) await stage.locator('summary').click();
  }
  await page.screenshot({ path: 'artifacts/studio-live-editor.png', fullPage: true });
  await page.getByRole('button', { name: 'Submit saved version', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Submitted for an independent review');
  await expect(page.getByLabel('Mission title', { exact: true })).toBeDisabled();

  const reviewerContext = await browser.newContext();
  const guardianContext = await browser.newContext();
  try {
    const reviewer = await reviewerContext.newPage();
    await signIn(reviewer, baseURL, 'reviewer', password);
    await reviewer.getByRole('button', { name: new RegExp(title) }).click();
    await expect(reviewer.getByLabel('Mission title', { exact: true })).toHaveValue(title);
    await expect(reviewer.getByLabel('Mission title', { exact: true })).toBeDisabled();
    await reviewer.getByLabel('Review decision note').fill('Checked every age stage, paper-only materials, adult guidance, and seven-step sequence.');
    await reviewer.getByRole('checkbox', { name: 'I reviewed every age stage and safety guidance' }).check();
    await reviewer.getByRole('button', { name: 'Approve & publish', exact: true }).click();
    await expect(reviewer.getByRole('status')).toContainText('published to the curriculum catalog');
    if (process.env.STUDIO_API_URL) {
      const published = await request.get(new URL('/api/v1/curriculum/published', process.env.STUDIO_API_URL).href);
      expect(published.status()).toBe(200);
      const catalog = await published.json() as { items: { title: string }[] };
      expect(catalog.items.some(mission => mission.title === title)).toBe(true);
    }

    const guardian = await guardianContext.newPage();
    await signIn(guardian, baseURL, 'guardian', password);
    await expect(guardian.getByText('Child profiles unavailable', { exact: true })).toBeVisible();
    await guardian.getByRole('checkbox').check();
    await guardian.getByRole('button', { name: 'Record acknowledgment', exact: true }).click();
    await expect(guardian.getByRole('status')).toContainText('Acknowledgment recorded');
    await expect(guardian.getByText('Pending verification', { exact: true })).toBeVisible();
    await guardian.getByRole('button', { name: 'Revoke acknowledgment', exact: true }).click();
    await expect(guardian.getByRole('status')).toContainText('Acknowledgment revoked');
    await expect(guardian.getByText('Revoked', { exact: true })).toBeVisible();
    await expect(guardian.getByText('Child profiles unavailable', { exact: true })).toBeVisible();
  } finally {
    await reviewerContext.close();
    await guardianContext.close();
  }
});
