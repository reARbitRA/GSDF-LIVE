import { describe, it, expect } from 'vitest';
import { Team } from '../types';
import { normaliseTeam, newId, toRole, validateImportFile, MAX_IMPORT_BYTES } from './roleNormalizer';

describe('roleNormalizer', () => {
  it('maps enum values, aliases and unknowns', () => {
    expect(normaliseTeam('Town')).toBe(Team.TOWN);
    expect(normaliseTeam(' mafia ')).toBe(Team.MAFIA);
    expect(normaliseTeam('Third Party')).toBe(Team.THIRD_PARTY);
    expect(normaliseTeam('werewolf')).toBe(Team.MAFIA);
    expect(normaliseTeam('Villager')).toBe(Team.TOWN);
    expect(normaliseTeam('Chaos Gremlin')).toBe(Team.INDEPENDENT);
    expect(normaliseTeam(undefined)).toBe(Team.INDEPENDENT);
  });
  it('generates unique ids even for identical names in the same tick (F-DATA-001)', () => {
    const ids = new Set(Array.from({ length: 500 }, () => newId('imported')));
    expect(ids.size).toBe(500);
  });
  it('toRole produces an in-enum team and a custom flag', () => {
    const r = toRole({ name: 'Doctor', team: 'good', description: 'Heals' }, 'ai');
    expect(r.team).toBe(Team.TOWN); expect(r.isCustom).toBe(true); expect(r.id.startsWith('ai-')).toBe(true);
  });
  it('rejects oversize, empty and binary uploads (F-SEC-005)', () => {
    expect(validateImportFile({ size: MAX_IMPORT_BYTES + 1, type: 'text/plain' })).toMatch(/too large/);
    expect(validateImportFile({ size: 0 })).toMatch(/empty/);
    expect(validateImportFile({ size: 10, type: 'application/octet-stream' })).toMatch(/Unsupported/);
    expect(validateImportFile({ size: 10, type: 'text/markdown' })).toBeNull();
    expect(validateImportFile({ size: 10, type: '' })).toBeNull();
  });
});
