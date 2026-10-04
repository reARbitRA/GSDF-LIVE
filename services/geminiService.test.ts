import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('geminiService boot safety (F-EXEC-001)', () => {
  const original = process.env.API_KEY;
  beforeEach(() => { vi.resetModules(); delete process.env.API_KEY; });
  afterEach(() => { if (original !== undefined) process.env.API_KEY = original; else delete process.env.API_KEY; });

  it('importing the module does NOT throw when API_KEY is unset', async () => {
    await expect(import('./geminiService')).resolves.toBeTruthy();
  });

  it('isAiConfigured() reports false without a key and true with one', async () => {
    const mod = await import('./geminiService');
    expect(mod.isAiConfigured()).toBe(false);
    process.env.API_KEY = 'placeholder-for-test';
    expect(mod.isAiConfigured()).toBe(true);
  });

  it('generateScenarioIdeas returns null (no uncaught throw) without a key', async () => {
    const mod = await import('./geminiService');
    await expect(mod.generateScenarioIdeas([], 'theme', { min: 5, max: 9 }, '')).resolves.toBeNull();
  });

  it('parseRolesFromFileContent throws a user-facing AiUnavailableError without a key', async () => {
    const mod = await import('./geminiService');
    await expect(mod.parseRolesFromFileContent('text')).rejects.toBeInstanceOf(mod.AiUnavailableError);
  });

  it('App can be imported and rendered without a key (non-AI journeys survive)', async () => {
    const React = await import('react');
    const { render, screen } = await import('@testing-library/react');
    const { default: App } = await import('../App');
    render(React.createElement(App));
    expect(screen.getByLabelText(/Operator ID or Email/i)).toBeInTheDocument();
  });
});
