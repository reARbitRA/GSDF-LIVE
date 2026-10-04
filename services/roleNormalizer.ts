import { GeneratedRoleIdea, Role, Team } from '../types';

/** Maximum size of an uploaded role file forwarded to the AI parser (bytes). */
export const MAX_IMPORT_BYTES = 200_000;

const TEAM_ALIASES: Record<string, Team> = {
  town: Team.TOWN, village: Team.TOWN, villager: Team.TOWN, good: Team.TOWN, innocent: Team.TOWN,
  mafia: Team.MAFIA, scum: Team.MAFIA, werewolf: Team.MAFIA, werewolves: Team.MAFIA, evil: Team.MAFIA, wolf: Team.MAFIA,
  independent: Team.INDEPENDENT, neutral: Team.INDEPENDENT, solo: Team.INDEPENDENT,
  'third party': Team.THIRD_PARTY, 'third-party': Team.THIRD_PARTY, thirdparty: Team.THIRD_PARTY, cult: Team.THIRD_PARTY,
};

/**
 * Map an arbitrary team string (from the model or an imported file) onto the Team enum.
 * Unknown values fall back to Team.INDEPENDENT so the UI never receives an out-of-enum value.
 */
export const normaliseTeam = (raw: unknown): Team => {
  if (typeof raw !== 'string') return Team.INDEPENDENT;
  const key = raw.trim().toLowerCase();
  if ((Object.values(Team) as string[]).map(v => v.toLowerCase()).includes(key)) {
    return (Object.values(Team) as Team[]).find(v => v.toLowerCase() === key)!;
  }
  return TEAM_ALIASES[key] ?? Team.INDEPENDENT;
};

/** Collision-free id generator (crypto.randomUUID with a counter fallback for old runtimes). */
let counter = 0;
export const newId = (prefix: string): string => {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === 'function') return `${prefix}-${c.randomUUID()}`;
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter.toString(36)}`;
};

/** Convert a model/imported role idea into a fully-typed custom Role. */
export const toRole = (idea: GeneratedRoleIdea, prefix: 'imported' | 'ai'): Role => ({
  id: newId(prefix),
  name: String(idea.name ?? 'Unnamed role').trim() || 'Unnamed role',
  team: normaliseTeam(idea.team),
  description: String(idea.description ?? ''),
  abilities: [],
  isCustom: true,
});

/** Validate an upload before any of it is read into memory or sent to the model. */
export const validateImportFile = (file: { size: number; type?: string; name?: string }): string | null => {
  if (file.size === 0) return 'The selected file is empty.';
  if (file.size > MAX_IMPORT_BYTES) {
    return `File is too large (${Math.round(file.size / 1024)} KB). The limit is ${Math.round(MAX_IMPORT_BYTES / 1024)} KB.`;
  }
  const type = file.type ?? '';
  if (type && !type.startsWith('text/') && !/(json|xml|html|markdown)/i.test(type)) {
    return `Unsupported file type "${type}". Upload a text, Markdown, HTML, XML or JSON file.`;
  }
  return null;
};
