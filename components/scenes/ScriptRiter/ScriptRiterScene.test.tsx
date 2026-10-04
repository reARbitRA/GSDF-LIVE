import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import ScriptRiterScene from './ScriptRiterScene';
import { STORAGE_KEY } from '../../../services/scenarioStorage';

vi.mock('../../../services/geminiService', () => ({
  generateScenarioIdeas: vi.fn(), parseRolesFromFileContent: vi.fn(), isAiConfigured: () => false,
  AiUnavailableError: class extends Error {},
}));

describe('Script Riter save / restore (J3)', () => {
  beforeEach(() => localStorage.clear());

  it('Save persists the canvas to localStorage and confirms in-app (no window.alert)', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(<ScriptRiterScene />);
    // add the first community role from the library
    const addButtons = screen.getAllByRole('button', { name: /add .* to scenario/i });
    fireEvent.click(addButtons[0]);
    fireEvent.click(screen.getByRole('button', { name: /^Save scenario$/i }));
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    const saved = Object.values(stored)[0] as { nodes: unknown[] } | undefined;
    expect(saved?.nodes).toHaveLength(1);
    expect(screen.getByRole('status')).toHaveTextContent(/saved/i);
    expect(alertSpy).not.toHaveBeenCalled();
  });

  it('restores the last saved scenario on mount', () => {
    const { unmount } = render(<ScriptRiterScene />);
    fireEvent.click(screen.getAllByRole('button', { name: /add .* to scenario/i })[0]);
    fireEvent.click(screen.getByRole('button', { name: /^Save scenario$/i }));
    unmount();
    render(<ScriptRiterScene />);
    expect(document.querySelectorAll('[data-testid="nexus-node"]')).toHaveLength(1);
  });

  it('shows an in-app error (not alert) when an oversize file is chosen', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(<ScriptRiterScene />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const big = new File([new Uint8Array(200_001)], 'roles.txt', { type: 'text/plain' });
    fireEvent.change(input, { target: { files: [big] } });
    expect(await screen.findByRole('alert')).toHaveTextContent(/too large/i);
    expect(alertSpy).not.toHaveBeenCalled();
  });
});
