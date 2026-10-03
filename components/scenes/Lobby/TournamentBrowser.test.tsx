import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import TournamentBrowser from './TournamentBrowser';
import { REGISTRATIONS_KEY } from '../../../services/registrationStorage';

describe('Tournament browser registration (J4 / F-EXEC-003)', () => {
  beforeEach(() => localStorage.clear());

  const rookieCard = () => screen.getByText('Rookie Rumble').closest('[data-testid="tournament-card"]') as HTMLElement;

  it('Register records the registration, bumps the count and flips the button', () => {
    render(<TournamentBrowser />);
    const card = rookieCard();
    expect(within(card).getByText('0 / 32')).toBeInTheDocument();
    fireEvent.click(within(card).getByRole('button', { name: /^Register$/ }));
    expect(within(card).getByText('1 / 32')).toBeInTheDocument();
    expect(within(card).getByRole('button', { name: /Registered/ })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(REGISTRATIONS_KEY)!)).toEqual(['t3']);
    expect(screen.getByRole('status')).toHaveTextContent(/registered/i);
  });

  it('registration survives remount and can be withdrawn', () => {
    const { unmount } = render(<TournamentBrowser />);
    fireEvent.click(within(rookieCard()).getByRole('button', { name: /^Register$/ }));
    unmount();
    render(<TournamentBrowser />);
    const btn = within(rookieCard()).getByRole('button', { name: /Registered/ });
    fireEvent.click(btn);
    expect(within(rookieCard()).getByRole('button', { name: /^Register$/ })).toBeInTheDocument();
    expect(within(rookieCard()).getByText('0 / 32')).toBeInTheDocument();
  });

  it('filter shows only matching statuses and ongoing/completed cannot be registered', () => {
    render(<TournamentBrowser />);
    fireEvent.click(screen.getByRole('button', { name: /^Upcoming$/ }));
    expect(screen.queryByText('Winter Championship 2024')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /^All$/ }));
    const winter = screen.getByText('Winter Championship 2024').closest('[data-testid="tournament-card"]') as HTMLElement;
    expect(within(winter).getByRole('button', { name: /View Details/ })).toBeDisabled();
  });

  it('labels the tournament list as demo data', () => {
    render(<TournamentBrowser />);
    expect(screen.getByText(/demo data/i)).toBeInTheDocument();
  });
});
