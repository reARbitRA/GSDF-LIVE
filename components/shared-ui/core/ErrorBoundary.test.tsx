import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ErrorBoundary from './ErrorBoundary';
import { setLogSink } from '../../../services/logger';

const Boom: React.FC<{ explode: boolean }> = ({ explode }) => {
  if (explode) throw new Error('kaboom');
  return <div>healthy</div>;
};

describe('ErrorBoundary (F-RELY-001)', () => {
  const events: unknown[] = [];
  beforeEach(() => { events.length = 0; setLogSink(e => events.push(e)); vi.spyOn(console, 'error').mockImplementation(() => {}); });
  afterEach(() => { setLogSink(null); vi.restoreAllMocks(); });

  it('renders children when nothing throws', () => {
    render(<ErrorBoundary><Boom explode={false} /></ErrorBoundary>);
    expect(screen.getByText('healthy')).toBeInTheDocument();
  });

  it('shows a recovery panel and logs a structured event when a child throws', () => {
    render(<ErrorBoundary><Boom explode={true} /></ErrorBoundary>);
    expect(screen.getByRole('alert')).toHaveTextContent('kaboom');
    expect(screen.getByRole('button', { name: /Try again/i })).toBeInTheDocument();
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ level: 'error', event: 'ui.render_error' });
  });

  it('Try again re-renders the subtree', () => {
    const flag = { explode: true };
    const Flaky: React.FC = () => { if (flag.explode) throw new Error('kaboom'); return <div>healthy</div>; };
    render(<ErrorBoundary><Flaky /></ErrorBoundary>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    flag.explode = false;
    fireEvent.click(screen.getByRole('button', { name: /Try again/i }));
    expect(screen.getByText('healthy')).toBeInTheDocument();
  });
});
