import { describe, it, expect } from 'vitest';
import { authenticateWithPassword, requestMagicLink, MANIPULATION_MESSAGE } from './authService';

describe('authService (stub)', () => {
  it('rejects empty identifier and empty password as contradictions', async () => {
    expect(await authenticateWithPassword('', 'x', { latencyMs: 0 })).toEqual({ ok: false, type: 'contradiction', message: 'Identifier cannot be empty.' });
    expect(await authenticateWithPassword('op', '', { latencyMs: 0 })).toEqual({ ok: false, type: 'contradiction', message: 'Password field is required.' });
  });
  it('rejects denylisted weak passwords with a manipulation error', async () => {
    const r = await authenticateWithPassword('operator1', 'password', { latencyMs: 0 });
    expect(r).toEqual({ ok: false, type: 'manipulation', message: MANIPULATION_MESSAGE });
    expect((await authenticateWithPassword('operator1', 'PASSWORD', { latencyMs: 0 })).ok).toBe(false);
  });
  it('grants a demo session otherwise and flags it as demo', async () => {
    const r = await authenticateWithPassword('testuser', 'goodpassword', { latencyMs: 0 });
    expect(r.ok).toBe(true);
    if (r.ok) { expect(r.session.demo).toBe(true); expect(r.session.identifier).toBe('testuser'); }
  });
  it('magic link requires a valid email', async () => {
    expect((await requestMagicLink('not-an-email', { latencyMs: 0 }))).toMatchObject({ ok: false, type: 'contradiction' });
    expect((await requestMagicLink('a@b.co', { latencyMs: 0 })).ok).toBe(true);
  });
});
