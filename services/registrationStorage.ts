import { logger } from './logger';

/**
 * Local record of tournament registrations.
 * MVP: localStorage only — there is no tournament backend yet, and the tournament list itself is
 * demo data (see data in TournamentBrowser). Swap for an API client when a backend exists.
 */
export const REGISTRATIONS_KEY = 'gsdf.registrations.v1';

const getStore = (): Storage | null => {
  try { return typeof window !== 'undefined' && window.localStorage ? window.localStorage : null; } catch { return null; }
};

export const getRegistrations = (): Set<string> => {
  const raw = getStore()?.getItem(REGISTRATIONS_KEY);
  if (!raw) return new Set();
  try {
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []);
  } catch {
    logger.warn('registrations.storage.corrupt');
    return new Set();
  }
};

export const isRegistered = (tournamentId: string): boolean => getRegistrations().has(tournamentId);

export const register = (tournamentId: string): Set<string> => {
  const all = getRegistrations();
  all.add(tournamentId);
  getStore()?.setItem(REGISTRATIONS_KEY, JSON.stringify([...all]));
  logger.info('tournament.registered', { tournamentId });
  return all;
};

export const unregister = (tournamentId: string): Set<string> => {
  const all = getRegistrations();
  all.delete(tournamentId);
  getStore()?.setItem(REGISTRATIONS_KEY, JSON.stringify([...all]));
  logger.info('tournament.unregistered', { tournamentId });
  return all;
};
