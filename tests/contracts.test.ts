import { describe, expect, it } from 'vitest';
import { missionContentSchema, publishedMissionSchema, stepKinds } from '../src/contracts/learning';
import { DEMO_MISSIONS } from '../src/content/missions';

describe('browser curriculum boundary', () => {
  it('rejects incomplete or reordered TRIZ content before rendering the step workflow', () => {
    const content = DEMO_MISSIONS[0].content;
    expect(missionContentSchema.safeParse(content).success).toBe(true);
    expect(missionContentSchema.safeParse({ ...content, steps: content.steps.slice(0, 6) }).success).toBe(false);
    expect(missionContentSchema.safeParse({ ...content, steps: content.steps.map(step => ({ ...step, kind: 'notice' })) }).success).toBe(false);
    expect(content.steps.map(step => step.kind)).toEqual(stepKinds);
  });
  it('rejects unsupported stage, identity additions, or unsafe contract changes from a lesson response', () => {
    const mission = DEMO_MISSIONS[0];
    expect(publishedMissionSchema.safeParse({ ...mission, ageBand: '18-21' }).success).toBe(false);
    expect(publishedMissionSchema.safeParse({ ...mission, learnerId: 'unexpected' }).success).toBe(false);
    expect(publishedMissionSchema.safeParse({ ...mission, content: { ...mission.content, adultGuidance: '' } }).success).toBe(false);
  });
});
