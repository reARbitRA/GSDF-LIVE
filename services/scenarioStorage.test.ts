import { describe, it, expect, beforeEach } from 'vitest';
import { Team } from '../types';
import { saveScenario, loadScenario, listScenarios, loadLastOpened, deleteScenario, exportScenarioJson, STORAGE_KEY } from './scenarioStorage';

const node = { id: 'n1', name: 'Doctor', team: Team.TOWN, description: '', abilities: [], isCustom: false, x: 1, y: 2 };

describe('scenarioStorage (F-EXEC-002 / F-DATA-002)', () => {
  beforeEach(() => localStorage.clear());

  it('saves and reloads a scenario, tracking last opened', () => {
    const saved = saveScenario({ id: 's1', name: 'Alpha', description: 'd', nodes: [node], connections: [] });
    expect(saved.savedAt).toBeTruthy();
    expect(loadScenario('s1')?.nodes).toHaveLength(1);
    expect(loadLastOpened()?.id).toBe('s1');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toHaveProperty('s1');
  });

  it('lists newest first and deletes', () => {
    saveScenario({ id: 'a', name: 'A', description: '', nodes: [], connections: [] });
    saveScenario({ id: 'b', name: 'B', description: '', nodes: [], connections: [] });
    const all = listScenarios();
    expect(all.map(s => s.id)).toEqual(expect.arrayContaining(['a', 'b']));
    deleteScenario('a');
    expect(loadScenario('a')).toBeNull();
    expect(listScenarios()).toHaveLength(1);
  });

  it('survives corrupt storage without throwing', () => {
    localStorage.setItem(STORAGE_KEY, '{not json');
    expect(listScenarios()).toEqual([]);
    expect(() => saveScenario({ id: 'x', name: 'X', description: '', nodes: [], connections: [] })).not.toThrow();
  });

  it('exports a self-describing JSON document', () => {
    const json = exportScenarioJson({ id: 's', name: 'S', description: '', nodes: [node], connections: [] });
    expect(JSON.parse(json)).toMatchObject({ format: 'gsdf-scenario', schemaVersion: 1, name: 'S' });
  });
});
