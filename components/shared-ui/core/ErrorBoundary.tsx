import React from 'react';
import { logger } from '../../../services/logger';

interface Props { children: React.ReactNode; }
interface State { error: Error | null; }

/** Catches render-time errors so a single faulty scene cannot white-screen the whole app. */
class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    logger.error('ui.render_error', error, { componentStack: info.componentStack ?? undefined });
  }

  private reset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div role="alert" className="min-h-screen flex items-center justify-center p-8" style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text-primary)' }}>
        <div className="max-w-lg w-full border rounded-lg p-6 space-y-4" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
          <h1 className="text-2xl font-orbitron font-bold">Signal lost</h1>
          <p className="text-gray-300">Something went wrong while rendering this screen. Your last saved work is unaffected.</p>
          <pre className="text-xs font-mono text-red-300 whitespace-pre-wrap">{this.state.error.message}</pre>
          <div className="flex gap-3">
            <button type="button" onClick={this.reset} className="px-4 py-2 rounded-md bg-[#00FF88] text-black font-bold terminal-button">Try again</button>
            <button type="button" onClick={() => window.location.reload()} className="px-4 py-2 rounded-md bg-gray-700 text-white terminal-button">Reload</button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
