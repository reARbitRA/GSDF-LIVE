// ARBITER baseline journey probe (not part of product tests). Runs against UNMODIFIED source.
import React from 'react';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('J1 boot without API key', () => {
  it('module load throws when process.env.API_KEY is undefined', async () => {
    vi.resetModules();
    const prev = process.env.API_KEY; delete process.env.API_KEY;
    await expect(import('../../App')).rejects.toThrow('API_KEY environment variable not set');
    if (prev !== undefined) process.env.API_KEY = prev;
  });
});

describe('journeys with API key present', () => {
  beforeEach(() => { vi.useFakeTimers(); process.env.API_KEY = 'probe-placeholder'; vi.resetModules(); });
  afterEach(() => { cleanup(); vi.useRealTimers(); });

  async function login() {
    const { default: App } = await import('../../App');
    render(<App />);
    fireEvent.change(screen.getByLabelText(/Operator ID or Email/i), { target: { value: 'x' } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'anything' } });
    fireEvent.submit(screen.getByRole('button', { name: /Authenticate/i }).closest('form')!);
    for (const ms of [1600, 1100, 2600]) { await act(async () => { vi.advanceTimersByTime(ms); }); }
    // NeuralWeave: fallback timer fires 2500ms then waits for animationend (CSS, never fires in jsdom) -> dispatch manually
    const fading = document.querySelector('.animate-fade-out');
    if (fading) await act(async () => { fading.dispatchEvent(new Event('animationend')); });
  }

  it('J1: any credentials pass Gateway and land on Tournaments', async () => {
    await login();
    expect(screen.getByText(/Federation Tournaments/i)).toBeTruthy();
  });

  it('J1b: the "known bad password" case asserted by the repo test is NOT implemented', async () => {
    const { default: App } = await import('../../App');
    render(<App />);
    fireEvent.change(screen.getByLabelText(/Operator ID or Email/i), { target: { value: 'operator1' } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'password' } });
    fireEvent.submit(screen.getByRole('button', { name: /Authenticate/i }).closest('form')!);
    await act(async () => { vi.advanceTimersByTime(1600); });
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('J2: header navigation reaches Dashboard and Script Riter', async () => {
    await login();
    fireEvent.click(screen.getByRole('button', { name: /^Dashboard$/i }));
    expect(screen.getAllByText(/Quick Play/i).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: /^Script Riter$/i }));
    expect(screen.getByText(/New Scenario/i)).toBeTruthy();
  });

  it('J4: tournament filter works; Register has no handler', async () => {
    await login();
    fireEvent.click(screen.getByRole('button', { name: /^Upcoming$/i }));
    expect(screen.getAllByText('Upcoming').length).toBeGreaterThan(0);
    expect(screen.queryByText('Winter Championship 2024')).toBeNull();
    const reg = screen.getAllByRole('button', { name: /^Register$/i })[0];
    expect(reg.onclick).toBeNull();
    fireEvent.click(reg); // no observable outcome
    expect(screen.getByText(/Federation Tournaments/i)).toBeTruthy();
  });

  it('J3: Save button has no click handler', async () => {
    await login();
    fireEvent.click(screen.getByRole('button', { name: /^Script Riter$/i }));
    const save = screen.getByRole('button', { name: /Save/i });
    expect((save as any).onclick).toBeNull();
    const reactProps = Object.keys(save).find(k => k.startsWith('__reactProps'));
    expect((save as any)[reactProps!].onClick).toBeUndefined();
  });
});
