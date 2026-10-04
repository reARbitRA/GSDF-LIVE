import React, { useState, FormEvent, useRef } from 'react';
import AnimatedLogo from '../../shared-ui/navigation/AnimatedLogo';
import ShieldCheckIcon from '../../shared-ui/icons/ShieldCheckIcon';
import FingerPrintIcon from '../../shared-ui/icons/FingerPrintIcon';
import CommandIcon from '../../shared-ui/icons/CommandIcon';
import SpinnerIcon from '../../shared-ui/icons/SpinnerIcon';
import CommandPalette from './CommandPalette';
import { authenticateWithPassword, requestMagicLink, isValidEmail } from '../../../services/authService';

interface DigitalIdCardProps {
  onAuthenticated: () => void;
}

type AuthMode = 'password' | 'magic-link';
type ErrorType = 'contradiction' | 'manipulation' | 'generic';
/** Delay between the success announcement and the transition animation (ms). */
const SUCCESS_TRANSITION_MS = 300;
interface AuthError {
  message: string;
  type: ErrorType;
}

const DigitalIdCard: React.FC<DigitalIdCardProps> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<AuthMode>('password');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<AuthError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  
  const statusRef = useRef<HTMLDivElement>(null);

  const getErrorStyles = (type: ErrorType) => {
    switch (type) {
      case 'contradiction': // Amber
        return 'border-amber-500/50 bg-amber-900/20 text-amber-400';
      case 'manipulation': // Magenta
        return 'border-fuchsia-500/50 bg-fuchsia-900/20 text-fuchsia-400';
      default: // Generic
        return 'border-red-500/50 bg-red-900/20 text-red-400';
    }
  };

  /** Synchronous shape validation so feedback is immediate; the auth service re-validates. */
  const validateForm = (): AuthError | null => {
    if (!identifier) return { message: 'Identifier cannot be empty.', type: 'contradiction' };
    if (mode === 'password' && !password) return { message: 'Password field is required.', type: 'contradiction' };
    if (mode === 'magic-link' && !isValidEmail(identifier)) return { message: 'A valid email is required for magic link.', type: 'contradiction' };
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    const result = mode === 'password'
      ? await authenticateWithPassword(identifier, password)
      : await requestMagicLink(identifier);

    if (result.ok === false) {
      setIsLoading(false);
      setError({ message: result.message, type: result.type });
      return;
    }

    if (statusRef.current) {
      statusRef.current.textContent = 'Authentication successful. Initializing neural link...';
    }
    setTimeout(onAuthenticated, SUCCESS_TRANSITION_MS);
  };

  const TabButton: React.FC<{ current: AuthMode; target: AuthMode; children: React.ReactNode }> = ({ current, target, children }) => (
    <button
      type="button"
      role="tab"
      aria-selected={current === target}
      onClick={() => { setMode(target); setError(null); }}
      className={`flex-1 py-2 px-4 text-center text-sm font-semibold uppercase font-mono tracking-wider transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[--color-surface] focus:ring-[--color-primary] ${
        current === target
          ? 'bg-[--color-surface-light] text-[--color-primary]'
          : 'bg-transparent text-gray-400 hover:bg-gray-800/50'
      }`}
    >
      {children}
    </button>
  );

  return (
    <>
    <div className="w-full max-w-md rounded-lg border shadow-2xl overflow-hidden animate-fade-in" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', boxShadow: '0 0 40px rgba(0, 255, 136, 0.1)'}}>
        <div className="p-6 text-center border-b" style={{ borderColor: 'var(--color-border)' }}>
            <div className="inline-block">
                 <AnimatedLogo />
            </div>
            <p className="text-sm mt-2 text-gray-400 font-mono uppercase tracking-widest">Global Social-Deduction Federation</p>
        </div>
        <div className="flex" role="tablist" aria-label="Authentication Method">
            <TabButton current={mode} target="password">Digital ID</TabButton>
            <TabButton current={mode} target="magic-link">Magic Link</TabButton>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6" noValidate>
            <div className="relative" role="tabpanel" hidden={mode !== 'password'}>
                <label htmlFor="identifier" className="block text-sm font-medium text-gray-400 font-mono">Identifier</label>
                <input 
                    id="identifier" 
                    type="text" 
                    disabled={mode !== 'password'}
                    value={identifier} 
                    onChange={e => setIdentifier(e.target.value)}
                    placeholder="Operator ID or Email"
                    className="mt-1 block w-full bg-gray-900/50 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    aria-label="Operator ID or Email for password login"
                    aria-describedby={error ? "auth-error" : undefined}
                />
            </div>
            <div role="tabpanel" hidden={mode !== 'password'}>
                 <label htmlFor="password" className="block text-sm font-medium text-gray-400 font-mono">Password</label>
                <input 
                    id="password" 
                    type="password" 
                    disabled={mode !== 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="mt-1 block w-full bg-gray-900/50 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                     aria-label="Password"
                     aria-describedby={error ? "auth-error" : undefined}
                />
            </div>
             <div className="relative" role="tabpanel" hidden={mode !== 'magic-link'}>
                <label htmlFor="magic-link-email" className="block text-sm font-medium text-gray-400 font-mono">Email Address</label>
                <input 
                    id="magic-link-email" 
                    type="email" 
                    disabled={mode !== 'magic-link'}
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    placeholder="operator@gsdf.live"
                    className="mt-1 block w-full bg-gray-900/50 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    aria-label="Email address for magic link"
                    aria-describedby={error ? "auth-error" : undefined}
                />
            </div>
            {/* Live region for accessibility announcements */}
            <div 
                ref={statusRef}
                className="sr-only" 
                aria-live="polite"
            ></div>

            {error && (
                <div id="auth-error" role="alert" className={`p-3 text-sm rounded-md border ${getErrorStyles(error.type)}`}>
                    {error.message}
                </div>
            )}
            
            <button 
                type="submit" 
                disabled={isLoading}
                aria-label={mode === 'magic-link' ? 'Send Magic Link' : 'Authenticate'}
                aria-busy={isLoading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-black bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-600 disabled:cursor-not-allowed terminal-button"
            >
                {isLoading ? <SpinnerIcon className="w-5 h-5"/> : (mode === 'magic-link' ? 'Send Magic Link' : 'Authenticate')}
            </button>
            <div className="text-center">
                <button
                    type="button"
                    onClick={() => setCommandPaletteOpen(true)}
                    className="text-sm font-mono text-gray-400 hover:text-primary flex items-center justify-center w-full gap-2 p-2 rounded-md hover:bg-gray-800/50 transition-colors"
                    aria-haspopup="dialog"
                >
                    <CommandIcon className="w-4 h-4" />
                    Command Palette
                </button>
            </div>
        </form>
         <div className="p-3 bg-black/30 text-xs text-gray-500 font-mono flex justify-between items-center">
            <div className="flex items-center gap-2" title="Demo authentication: credentials are checked locally only; no server verification exists yet.">
                <ShieldCheckIcon className="w-4 h-4 text-amber-400" />
                <span>Demo auth — no server verification</span>
            </div>
             <div className="flex items-center gap-2" title="Your session and saved work live only in this browser.">
                <FingerPrintIcon className="w-4 h-4 text-blue-400" />
                <span>Local-only session</span>
            </div>
        </div>
    </div>
    {isCommandPaletteOpen && <CommandPalette onClose={() => setCommandPaletteOpen(false)} />}
    </>
  );
};

export default DigitalIdCard;