import React, { useState, FormEvent, useRef } from 'react';
import AnimatedLogo from '../../shared-ui/navigation/AnimatedLogo';
import ShieldCheckIcon from '../../shared-ui/icons/ShieldCheckIcon';
import FingerPrintIcon from '../../shared-ui/icons/FingerPrintIcon';
import CommandIcon from '../../shared-ui/icons/CommandIcon';
import SpinnerIcon from '../../shared-ui/icons/SpinnerIcon';
import CommandPalette from './CommandPalette';

interface DigitalIdCardProps {
  onAuthenticated: () => void;
}

type AuthMode = 'password' | 'magic-link';
type ErrorType = 'contradiction' | 'manipulation' | 'generic';
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

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!identifier) {
      setError({ message: 'Identifier cannot be empty.', type: 'contradiction' });
      return;
    }

    if (mode === 'password' && !password) {
      setError({ message: 'Password field is required.', type: 'contradiction' });
      return;
    }

    if (mode === 'magic-link' && !validateEmail(identifier)) {
        setError({ message: 'A valid email is required for magic link.', type: 'contradiction' });
        return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
        // Simulate successful authentication
        if (statusRef.current) {
          statusRef.current.textContent = 'Authentication successful. Initializing neural link...';
        }
        setTimeout(onAuthenticated, 1000);
    }, 1500);
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
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="relative" role="tabpanel" hidden={mode !== 'password'}>
                <label htmlFor="identifier" className="block text-sm font-medium text-gray-400 font-mono">Identifier</label>
                <input 
                    id="identifier" 
                    type="text" 
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
            <div className="flex items-center gap-2" title="End-to-end Encrypted Connection">
                <ShieldCheckIcon className="w-4 h-4 text-green-400" />
                <span>E2EE Active</span>
            </div>
             <div className="flex items-center gap-2" title="This device is trusted">
                <FingerPrintIcon className="w-4 h-4 text-blue-400" />
                <span>Device Trust Verified</span>
            </div>
        </div>
    </div>
    {isCommandPaletteOpen && <CommandPalette onClose={() => setCommandPaletteOpen(false)} />}
    </>
  );
};

export default DigitalIdCard;