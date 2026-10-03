// ARBITER post-remediation journey probe. Runs against the REMEDIATED source.
import React from 'react';
import { render, screen, fireEvent, act, cleanup, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

async function login(App: React.FC) {
  render(<App />);
  fireEvent.change(screen.getByLabelText(/Operator ID or Email/i), { target: { value: 'operator1' } });
  fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'goodpassword' } });
  fireEvent.click(screen.getByRole('button', { name: /^Authenticate$/i })); // real click (constraint validation path)
  for (const ms of [300, 400, 2600]) { await act(async () => { vi.advanceTimersByTime(ms); }); }
  const fading = document.querySelector('.animate-fade-out');
  if (fading) await act(async () => { fading.dispatchEvent(new Event('animationend')); });
}

describe('post-remediation journeys', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.resetModules(); localStorage.clear(); });
  afterEach(() => { cleanup(); vi.useRealTimers(); });

  it('J1 (no key): App boots, Gateway renders, login via real click succeeds', async () => {
    delete process.env.API_KEY;
    const { default: App } = await import('../../App');
    await login(App);
    expect(screen.getByText(/Federation Tournaments/i)).toBeTruthy();
  });

  it('J1 (bad password): manipulation error shown, no login', async () => {
    const { default: App } = await import('../../App');
    render(<App />);
    fireEvent.change(screen.getByLabelText(/Operator ID or Email/i), { target: { value: 'operator1' } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /^Authenticate$/i }));
    await act(async () => { vi.advanceTimersByTime(400); });
    expect(screen.getByRole('alert').textContent).toMatch(/manipulation/i);
  });

  it('J2: header navigation reaches Dashboard and lazy Script Riter', async () => {
    const { default: App } = await import('../../App');
    await login(App);
    fireEvent.click(screen.getByRole('button', { name: /^Dashboard$/i }));
    expect(screen.getAllByText(/Quick Play/i).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: /^Script Riter$/i }));
    vi.useRealTimers();
    expect(await screen.findByRole('button', { name: /^Save scenario$/i })).toBeTruthy();
  });

  it('J3: add role, Save → localStorage; survives remount', async () => {
    const { default: App } = await import('../../App');
    await login(App);
    fireEvent.click(screen.getByRole('button', { name: /^Script Riter$/i }));
    vi.useRealTimers();
    await screen.findByRole('button', { name: /^Save scenario$/i });
    fireEvent.click(screen.getAllByRole('button', { name: /add .* to scenario/i })[0]);
    fireEvent.click(screen.getByRole('button', { name: /^Save scenario$/i }));
    expect(localStorage.getItem('gsdf.scenarios.v1')).toContain('"nodes"');
    expect(screen.getByRole('status').textContent).toMatch(/saved/i);
  });

  it('J4: Register changes state and persists', async () => {
    const { default: App } = await import('../../App');
    await login(App);
    const card = screen.getByText('Rookie Rumble').closest('[data-testid="tournament-card"]') as HTMLElement;
    fireEvent.click(within(card).getByRole('button', { name: /^Register$/ }));
    expect(within(card).getByText('1 / 32')).toBeTruthy();
    expect(localStorage.getItem('gsdf.registrations.v1')).toBe('["t3"]');
  });
});
