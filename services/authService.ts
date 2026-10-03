/**
 * Authentication service boundary.
 *
 * STUB — there is no identity provider yet (see audit finding F-SEC-002 / task T-016).
 * This module exists so the UI talks to a single, replaceable interface. The stub:
 *   - validates shape (non-empty identifier / password, email for magic link),
 *   - rejects a small denylist of trivially weak passwords with a "manipulation" error
 *     (the behaviour asserted by GatewayScene.test.tsx),
 *   - otherwise returns a local, unsigned demo session.
 * Nothing here provides real security. Do NOT ship to production without T-016.
 */

export type AuthErrorType = 'contradiction' | 'manipulation' | 'generic';

export interface DemoSession {
  identifier: string;
  issuedAt: string;
  mode: 'password' | 'magic-link';
  demo: true;
}

export type AuthResult =
  | { ok: true; session: DemoSession }
  | { ok: false; type: AuthErrorType; message: string };

export const WEAK_PASSWORD_DENYLIST: ReadonlySet<string> = new Set([
  'password', 'password1', '123456', '12345678', 'qwerty', 'letmein', 'admin', 'welcome',
]);

export const MANIPULATION_MESSAGE = 'Authentication failed: Signal manipulation detected.';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const isValidEmail = (value: string): boolean => EMAIL_RE.test(value);

export interface AuthOptions {
  /** Simulated network latency for the stub (ms). Defaults to 250. */
  latencyMs?: number;
}

const wait = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export async function authenticateWithPassword(
  identifier: string,
  password: string,
  opts: AuthOptions = {},
): Promise<AuthResult> {
  const id = identifier.trim();
  if (!id) return { ok: false, type: 'contradiction', message: 'Identifier cannot be empty.' };
  if (!password) return { ok: false, type: 'contradiction', message: 'Password field is required.' };

  await wait(opts.latencyMs ?? 250);

  if (WEAK_PASSWORD_DENYLIST.has(password.toLowerCase())) {
    return { ok: false, type: 'manipulation', message: MANIPULATION_MESSAGE };
  }
  return { ok: true, session: { identifier: id, issuedAt: new Date().toISOString(), mode: 'password', demo: true } };
}

export async function requestMagicLink(email: string, opts: AuthOptions = {}): Promise<AuthResult> {
  const value = email.trim();
  if (!value) return { ok: false, type: 'contradiction', message: 'Identifier cannot be empty.' };
  if (!isValidEmail(value)) return { ok: false, type: 'contradiction', message: 'A valid email is required for magic link.' };
  await wait(opts.latencyMs ?? 250);
  // Stub: no email is sent; the demo session is granted directly.
  return { ok: true, session: { identifier: value, issuedAt: new Date().toISOString(), mode: 'magic-link', demo: true } };
}
