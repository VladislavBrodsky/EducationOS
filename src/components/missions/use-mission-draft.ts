'use client';

import { useSyncExternalStore } from 'react';
import { initialInputs, sanitizeInputs } from '@/lib/missions/catalog';
import { missionIds, type MissionId, type MissionInputs } from '@/lib/missions/model';

type Snapshot = { inputs: MissionInputs; ready: boolean; storageFailed: boolean };
const server = Object.fromEntries(missionIds.map(id => [id, { inputs: initialInputs(id), ready: false, storageFailed: false }])) as Record<MissionId, Snapshot>;
const browser = new Map<MissionId, Snapshot>();
const listeners = new Set<() => void>();
const key = (id: MissionId) => `educationos.context-mission.v1.${id}`;
function read(id: MissionId): Snapshot {
  if (typeof window === 'undefined') return server[id];
  let snapshot = browser.get(id);
  if (!snapshot) {
    try {
      const raw = window.sessionStorage.getItem(key(id));
      snapshot = { inputs: raw && raw.length < 2500 ? sanitizeInputs(id, JSON.parse(raw)) : initialInputs(id), ready: true, storageFailed: false };
    } catch { snapshot = { inputs: initialInputs(id), ready: true, storageFailed: true }; }
    browser.set(id, snapshot);
  }
  return snapshot;
}
function subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
export function useMissionDraft(id: MissionId) {
  const snapshot = useSyncExternalStore(subscribe, () => read(id), () => server[id]);
  function update(inputs: MissionInputs, reset = false) {
    let storageFailed = snapshot.storageFailed;
    try { if (reset) window.sessionStorage.removeItem(key(id)); else window.sessionStorage.setItem(key(id), JSON.stringify(sanitizeInputs(id, inputs))); }
    catch { storageFailed = true; }
    browser.set(id, { inputs: sanitizeInputs(id, inputs), ready: true, storageFailed });
    for (const listener of listeners) listener();
  }
  return { ...snapshot, change: (field: string, value: string) => update({ ...snapshot.inputs, [field]: value }), reset: () => update(initialInputs(id), true) };
}
