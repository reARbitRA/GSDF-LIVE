import React, { useEffect, useRef } from 'react';
import FocusTrap from '../../shared-ui/core/FocusTrap';
import BookIcon from '../../shared-ui/icons/BookIcon';
import NewScenarioIcon from '../../shared-ui/icons/NewScenarioIcon';

interface CommandPaletteProps {
  onClose: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ onClose }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Focus input on mount
    inputRef.current?.focus();
    
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const CommandItem: React.FC<{ icon: React.ReactNode; label: string; disabled?: boolean; shortcut?: string }> = ({
    icon,
    label,
    disabled = false,
    shortcut
  }) => (
    <li
      className={`flex items-center justify-between p-3 rounded-md transition-colors ${
        disabled
          ? 'text-gray-600 cursor-not-allowed'
          : 'text-gray-300 hover:bg-[--color-surface-light] hover:text-white cursor-pointer'
      }`}
      aria-disabled={disabled}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      {shortcut && <span className="text-xs font-mono p-1 bg-gray-700/50 rounded">{shortcut}</span>}
    </li>
  );

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-start justify-center z-50 backdrop-blur-sm animate-fade-in pt-20"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="command-palette-title"
    >
      <FocusTrap>
        <div
          className="w-full max-w-xl rounded-lg border shadow-2xl overflow-hidden"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
             <input
                ref={inputRef}
                type="text"
                placeholder="Type a command or search..."
                className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none"
                aria-label="Command palette input"
             />
          </div>
          <div className="p-3">
            <h2 id="command-palette-title" className="text-xs font-mono uppercase text-gray-500 mb-2 px-2">Navigation</h2>
            <ul>
                <CommandItem icon={<BookIcon className="w-5 h-5"/>} label="Go to Rulebook" disabled />
                <CommandItem icon={<NewScenarioIcon className="w-5 h-5"/>} label="Go to Academy" disabled />
            </ul>
          </div>
        </div>
      </FocusTrap>
    </div>
  );
};

export default CommandPalette;