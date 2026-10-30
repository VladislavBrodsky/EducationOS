import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const educatorId = 'a1111111-1111-4111-8111-111111111111';
const missionId = 'c1111111-1111-4111-8111-111111111111';
const stageBands = ['5-6', '7-9', '10-12', '13-15', '16-17'];
const steps = ['Notice', 'Contradiction', 'Imagine', 'Hypothesis', 'Experiment', 'Reflect', 'Transfer'];
const content = {
  title: 'A better paper bridge', summary: 'Compare two paper structures and explain what the observations suggest.', trizPrinciple: 'Change a shape to find a different balance',
  stages: stageBands.map(ageBand => ({ ageBand, challenge: `Compare paper shapes with an adult for ages ${ageBand}.`, steps: steps.map(step => `${step}: explore one idea using only paper and an adult helper.`), safetyNote: 'Use paper only on a clear table with adult supervision.' })),
};
const mission = { ...content, id: missionId, status: 'draft', version: 1, authorId: educatorId, moderationFlags: [] as string[], createdAt: '2026-10-28T12:00:00Z', updatedAt: '2026-10-28T12:00:00Z' };
const sessionFor = (role: 'educator' | 'reviewer' | 'guardian') => ({ adult: { id: role === 'educator' ? educatorId : 'b1111111-1111-4111-8111-111111111111', role, adultAttested: true, identityVerified: false }, csrfToken: 'csrf-token-for-ui-tests' });

async function mockWorkspace(page: Page, role: 'educator' | 'reviewer' | 'guardian', initiallySignedIn = true) {
  let signedIn = initiallySignedIn;
  let current = { ...mission, status: role === 'reviewer' ? 'review' : 'draft' };
  let saved = role !== 'educator';
  let consent: { id: string; purpose: string; policyVersion: string; status: string; acknowledgedAt: string; revokedAt: string | null; childProfilesAvailable: boolean } | null = null;
  const mutations: { path: string; method: string; body: Record<string, unknown>; csrf: string | undefined }[] = [];
  await page.route('**/api/adult-studio/**', async route => {
    const request = route.request();
    const path = new URL(request.url()).pathname.replace('/api/adult-studio/', '');
    const method = request.method();
    if (method !== 'GET') mutations.push({ path, method, body: request.postDataJSON() ?? {}, csrf: request.headers()['x-csrf-token'] });
    if (path === 'adults/login') { signedIn = true; return route.fulfill({ json: sessionFor(role) }); }
    if (!signedIn) return route.fulfill({ status: 401, json: { error: { code: 'UNAUTHENTICATED' } } });
    if (path === 'adults/session') return route.fulfill({ json: sessionFor(role) });
    if (path === 'adults/logout') { signedIn = false; return route.fulfill({ json: { success: true } }); }
    if (path === 'adults/consents') {
      if (method === 'POST') { consent = { id: missionId, purpose: 'child_learning', policyVersion: 'scaffold-v1', status: 'pending_verification', acknowledgedAt: '2026-10-28T12:00:00Z', revokedAt: null, childProfilesAvailable: false }; return route.fulfill({ json: consent }); }
      return route.fulfill({ json: { items: consent ? [consent] : [] } });
    }
    if (path === `adults/consents/${missionId}` && consent) { consent.status = 'revoked'; return route.fulfill({ json: consent }); }
    if (path === 'studio/missions' && method === 'GET') return route.fulfill({ json: { items: saved ? [current] : [] } });
    if (path.endsWith('/history')) return route.fulfill({ json: { versions: [{ version: current.version, status: current.status, content, createdAt: current.createdAt }], events: [{ id: 'event-1', action: 'draft_created', version: 1, note: '', createdAt: current.createdAt }] } });
    if (path === 'studio/missions' || path === `studio/missions/${missionId}`) {
      if (method !== 'GET') { current = { ...current, ...request.postDataJSON() }; saved = true; }
      return route.fulfill({ json: current });
    }
    if (path.endsWith('/submit')) { current = { ...current, status: 'review', version: current.version + 1 }; return route.fulfill({ json: current }); }
    if (path.endsWith('/review')) { current = { ...current, status: request.postDataJSON().decision === 'approve' ? 'published' : 'draft', version: current.version + 1 }; return route.fulfill({ json: current }); }
    return route.fulfill({ status: 404, json: { error: { code: 'NOT_FOUND' } } });
  });
  return mutations;
}

test('adult login leads to full five-stage draft and saved-version submission with CSRF', async ({ page }) => {
  const writes = await mockWorkspace(page, 'educator', false);
  await page.goto('/studio');
  await page.getByLabel('Email address').fill('educator@example.test');
  await page.getByLabel('Password', { exact: true }).fill('LocalTestPassword');
  await page.getByRole('button', { name: 'Open workspace' }).click();
  await expect(page.getByText('Signed in as')).toBeVisible();
  await page.getByRole('button', { name: 'New draft', exact: true }).click();
  await page.getByLabel('Mission title', { exact: true }).fill(content.title);
  await page.getByLabel('Learning intention').fill(content.summary);
  await page.getByLabel('TRIZ principle', { exact: true }).fill(content.trizPrinciple);
  for (const stage of content.stages) {
    const details = page.locator('details.studio-stage').filter({ has: page.locator('summary').getByText(`Ages ${stage.ageBand}`, { exact: true }) });
    if (!(await details.evaluate(element => element.hasAttribute('open')))) await details.locator('summary').click();
    await page.getByLabel(`Challenge for ages ${stage.ageBand}`, { exact: true }).fill(stage.challenge);
    for (const [index, name] of steps.entries()) await page.getByLabel(new RegExp(`${name} · ages ${stage.ageBand}$`)).fill(stage.steps[index]);
    await page.getByLabel(`Safety and adult guidance · ages ${stage.ageBand}`, { exact: true }).fill(stage.safetyNote);
  }
  await page.getByRole('button', { name: 'Save draft', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Draft saved as version 1');
  await page.getByLabel('Mission title', { exact: true }).fill('A changed unsaved title');
  await expect(page.getByRole('button', { name: 'Submit saved version' })).toBeDisabled();
  await page.getByLabel('Mission title', { exact: true }).fill(content.title);
  await page.getByRole('button', { name: 'Submit saved version' }).click();
  await expect(page.getByRole('status')).toContainText('Submitted for an independent review');
  expect(writes.find(write => write.path === 'studio/missions')?.body).toEqual(content);
  expect(writes.find(write => write.path.endsWith('/submit'))?.body).toEqual({ expectedVersion: 1 });
  expect(writes.filter(write => write.path !== 'adults/login').every(write => write.csrf === sessionFor('educator').csrfToken)).toBe(true);
  await expect(page.getByRole('button', { name: 'Approve & publish' })).toHaveCount(0);
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
});

test('reviewer inspects a locked revision, records decision, and publishes', async ({ page }) => {
  const writes = await mockWorkspace(page, 'reviewer');
  await page.goto('/studio');
  await page.getByRole('button', { name: /A better paper bridge/ }).click();
  await expect(page.getByLabel('Mission title', { exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Approve & publish' })).toBeDisabled();
  await page.getByLabel('Review decision note').fill('Age suitability and paper-only activities checked with adult supervision.');
  await page.getByRole('checkbox', { name: 'I reviewed every age stage and safety guidance' }).check();
  await page.getByRole('button', { name: 'Approve & publish' }).click();
  await expect(page.getByRole('status')).toContainText('published to the curriculum catalog');
  expect(writes.find(write => write.path.endsWith('/review'))?.body).toEqual({ expectedVersion: 1, decision: 'approve', note: 'Age suitability and paper-only activities checked with adult supervision.', safetyReviewed: true });
  await page.getByText('Version history & audit trail', { exact: false }).click();
  await expect(page.getByText('draft created', { exact: true })).toBeVisible();
});

test('guardian explicitly acknowledges and revokes without child data or enrollment', async ({ page }) => {
  const writes = await mockWorkspace(page, 'guardian');
  await page.goto('/studio');
  await expect(page.getByRole('button', { name: 'Record acknowledgment' })).toBeDisabled();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Record acknowledgment' }).click();
  await expect(page.getByText('Pending verification', { exact: true })).toBeVisible();
  await expect(page.getByText('Child profiles unavailable', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Revoke acknowledgment' }).click();
  await expect(page.getByText('Revoked', { exact: true })).toBeVisible();
  expect(writes.map(write => write.path)).toEqual(['adults/consents', `adults/consents/${missionId}`]);
  expect(writes[0].body).toEqual({ purpose: 'child_learning', policyVersion: 'scaffold-v1', acknowledged: true });
  expect(await page.locator('input').count()).toBe(1);
});

test('conflict and sign-out states are clear and mission text is rendered as text', async ({ page }) => {
  await mockWorkspace(page, 'reviewer');
  await page.route(`**/api/adult-studio/studio/missions/${missionId}`, route => route.fulfill({ json: { ...mission, title: '<img src=x onerror="window.injected=true">', status: 'review' } }));
  await page.goto('/studio');
  await page.getByRole('button', { name: /A better paper bridge/ }).click();
  await expect(page.getByRole('heading', { name: '<img src=x onerror="window.injected=true">', exact: true })).toBeVisible();
  expect(await page.evaluate(() => 'injected' in window)).toBe(false);
  await page.route('**/api/adult-studio/studio/missions/*/review', route => route.fulfill({ status: 409, json: { error: { code: 'CONFLICT' } } }));
  await page.getByLabel('Review decision note').fill('All safety checks were reviewed before the decision.');
  await page.getByRole('button', { name: 'Return for revision' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'This mission changed' })).toContainText('mission changed');
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Adult sign in', exact: true })).toBeVisible();
  await expect(page.getByLabel('Password', { exact: true })).toHaveValue('');
});

test('login and adult workspaces fit mobile and desktop and pass automated accessibility checks', async ({ page }) => {
  test.setTimeout(120000);
  for (const role of ['educator', 'reviewer', 'guardian'] as const) {
    await page.unroute('**/api/adult-studio/**');
    await mockWorkspace(page, role, role !== 'educator');
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto('/studio');
      await expect(page.getByRole('heading', { name: 'Ideas become learning' })).toBeVisible();
      await expect(page.getByRole('status')).not.toContainText('Checking');
      if (role === 'reviewer') await page.getByRole('button', { name: /A better paper bridge/ }).click();
      const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      expect(scan.violations, `${role} at ${width}px`).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${role} at ${width}px`).toBe(true);
      await page.screenshot({ path: `artifacts/studio-${role}-${width}.png`, fullPage: true });
    }
  }
});

test('studio entry keeps the form close to a compact hero and exposes safety details by keyboard', async ({ page }) => {
  await mockWorkspace(page, 'educator', false);
  for (const width of [1440, 768, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/studio');
    await expect(page.getByRole('heading', { name: 'Adult sign in', exact: true })).toBeVisible();
    await expect(page.getByText('Child profiles and unrestricted AI are unavailable', { exact: true })).toBeVisible();
    await expect(page.getByText('Adult identity verification pending', { exact: true })).toBeVisible();
    const layout = await page.evaluate(() => {
      const heading = document.querySelector('.studio-intro h1')!;
      const form = document.querySelector('.studio-login')!.getBoundingClientRect();
      const guide = document.querySelector('.studio-login-copy')!.getBoundingClientRect();
      const safety = document.querySelector('.studio-boundary')!.getBoundingClientRect();
      return {
        fontSize: Number.parseFloat(getComputedStyle(heading).fontSize),
        headingHeight: heading.getBoundingClientRect().height,
        gap: form.top - safety.bottom,
        formTop: form.top,
        guideTop: guide.top,
        formLeft: form.left,
        guideRight: guide.right,
        overflow: document.documentElement.scrollWidth > innerWidth,
      };
    });
    expect(layout.fontSize, `heading at ${width}px`).toBeLessThanOrEqual(42);
    expect(layout.headingHeight, `heading at ${width}px`).toBeLessThan(85);
    expect(layout.gap, `sign-in gap at ${width}px`).toBeLessThanOrEqual(32);
    expect(layout.overflow, `entry overflow at ${width}px`).toBe(false);
    if (width <= 760) expect(layout.formTop).toBeLessThan(layout.guideTop);
    else expect(layout.formLeft).toBeGreaterThanOrEqual(layout.guideRight);
    await page.screenshot({ path: `artifacts/studio-entry-layout-${width}.png`, fullPage: true });
    const disclosure = page.locator('details.studio-boundary');
    const summary = disclosure.locator('summary');
    await summary.focus();
    await summary.press('Enter');
    await expect(disclosure).toHaveAttribute('open');
    await expect(disclosure.getByText('Adult accounts are attested, not identity verified.', { exact: false })).toBeVisible();
    await expect(disclosure.getByText('Guardian acknowledgments are a consent workflow scaffold.', { exact: false })).toBeVisible();
    await summary.press('Space');
    await expect(disclosure).not.toHaveAttribute('open');
  }
});

test('transport denies arbitrary API paths, cross-origin writes, and oversized bodies', async ({ request, baseURL }) => {
  expect((await request.get('/api/adult-studio/ai/respond')).status()).toBe(404);
  expect((await request.post('/api/adult-studio/adults/login', { headers: { Origin: 'https://example.invalid' }, data: { email: 'a@example.test', password: 'test' } })).status()).toBe(403);
  expect((await request.post('/api/adult-studio/adults/login', { headers: { Origin: baseURL!, 'Content-Type': 'application/json' }, data: 'x'.repeat(16_385) })).status()).toBe(413);
});
