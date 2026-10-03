import { Connection, NexusNode } from '../types';
import { logger } from './logger';

/**
 * Local persistence for Script Riter scenarios.
 * MVP storage is the browser's localStorage (single device, single user). The interface is
 * deliberately async-free and tiny so it can be swapped for an HTTP client later.
 */
export const STORAGE_KEY = 'gsdf.scenarios.v1';
export const LAST_OPENED_KEY = 'gsdf.scenarios.lastOpened.v1';

export interface SavedScenario {
  id: string;
  name: string;
  description: string;
  nodes: NexusNode[];
  connections: Connection[];
  savedAt: string;
  schemaVersion: 1;
}

export type ScenarioDraft = Omit<SavedScenario, 'savedAt' | 'schemaVersion'>;

const getStore = (): Storage | null => {
  try {
    return typeof window !== 'undefined' && window.localStorage ? window.localStorage : null;
  } catch {
    return null;
  }
};

const readAll = (): Record<string, SavedScenario> => {
  const store = getStore();
  if (!store) return {};
  const raw = store.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as Record<string, SavedScenario>;
    logger.warn('scenario.storage.corrupt', { reason: 'not-an-object' });
    return {};
  } catch (err) {
    logger.warn('scenario.storage.corrupt', { reason: 'json-parse', error: String(err) });
    return {};
  }
};

const writeAll = (all: Record<string, SavedScenario>): void => {
  const store = getStore();
  if (!store) throw new Error('Local storage is not available in this browser.');
  store.setItem(STORAGE_KEY, JSON.stringify(all));
};

export const saveScenario = (draft: ScenarioDraft): SavedScenario => {
  const saved: SavedScenario = { ...draft, savedAt: new Date().toISOString(), schemaVersion: 1 };
  const all = readAll();
  all[saved.id] = saved;
  writeAll(all);
  getStore()?.setItem(LAST_OPENED_KEY, saved.id);
  logger.info('scenario.saved', { id: saved.id, nodes: saved.nodes.length, connections: saved.connections.length });
  return saved;
};

export const listScenarios = (): SavedScenario[] =>
  Object.values(readAll()).sort((a, b) => b.savedAt.localeCompare(a.savedAt));

export const loadScenario = (id: string): SavedScenario | null => readAll()[id] ?? null;

export const loadLastOpened = (): SavedScenario | null => {
  const id = getStore()?.getItem(LAST_OPENED_KEY);
  return id ? loadScenario(id) : null;
};

export const deleteScenario = (id: string): void => {
  const all = readAll();
  if (!(id in all)) return;
  delete all[id];
  writeAll(all);
  const store = getStore();
  if (store?.getItem(LAST_OPENED_KEY) === id) store.removeItem(LAST_OPENED_KEY);
};

/** Serialise a scenario for download / sharing. */
export const exportScenarioJson = (scenario: SavedScenario | ScenarioDraft): string =>
  JSON.stringify({ format: 'gsdf-scenario', schemaVersion: 1, ...scenario }, null, 2);
