import { describe, expect, it } from 'vitest';
import { MAGIC_UI_COMPONENTS, MAGIC_UI_CATEGORIES } from '../src/lib/magic-ui-catalog';

describe('reviewed Magic UI inventory', () => {
  it('keeps all official entries unique, categorized and on the official source host', () => {
    expect(MAGIC_UI_COMPONENTS).toHaveLength(77);
    expect(new Set(MAGIC_UI_COMPONENTS.map(item => item.id)).size).toBe(77);
    expect(MAGIC_UI_CATEGORIES).toHaveLength(8);
    for (const item of MAGIC_UI_COMPONENTS) {
      expect(MAGIC_UI_CATEGORIES).toContain(item.category);
      for (const link of [item.docsUrl, item.registryUrl]) {
        const url = new URL(link);
        expect(url.protocol).toBe('https:');
        expect(url.hostname).toBe('magicui.design');
        expect(url.username + url.password + url.search + url.hash).toBe('');
      }
    }
  });
  it('distinguishes the adapted previews from reference-only components', () => {
    expect(MAGIC_UI_COMPONENTS.filter(item => item.implementation !== 'reference')).toHaveLength(16);
    expect(MAGIC_UI_COMPONENTS.filter(item => item.implementation === 'reference')).toHaveLength(61);
  });
});
