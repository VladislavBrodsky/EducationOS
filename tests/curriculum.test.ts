import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getDemoMission } from '../src/content/missions';
import { fetchPublishedMission } from '../src/lib/api/curriculum';

const { get } = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('openapi-fetch', () => ({ default: () => ({ GET: get }) }));
const reviewed = getDemoMission('10-12');
function respond(mission: unknown) { get.mockResolvedValue({ data: { items: [mission] }, response: new Response('{}', { status: 200 }) }); }
beforeEach(() => get.mockReset());

describe('reviewed demo curriculum pin', () => {
  it('accepts the reviewed version with equivalent Python UTC serialization', async () => {
    respond({ ...reviewed, publishedAt: reviewed.publishedAt.replace('.000Z', 'Z') });
    await expect(fetchPublishedMission('10-12')).resolves.toMatchObject({ id: reviewed.id, version: 1 });
  });
  it.each([
    { ...reviewed, version: 2 },
    { ...reviewed, id: 'e0500000-0000-4000-8000-000000000099' },
    { ...reviewed, content: { ...reviewed.content, summary: 'Changed content under the original identifier.' } },
  ])('rejects a changed version, identity, or content before local drafts can be mixed', async mission => {
    respond(mission);
    await expect(fetchPublishedMission('10-12')).rejects.toThrow('does not match the reviewed demo version');
  });
});
