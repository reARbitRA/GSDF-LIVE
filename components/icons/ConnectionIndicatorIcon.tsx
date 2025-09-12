import React from 'react';
import { Connection } from '../../types';

// Fix: The component was missing a return statement, causing it to return 'void' instead of a ReactNode.
export const ConnectionIndicatorIcon: React.FC<React.SVGProps<SVGSVGElement> & { type: Connection['type'] }> = ({ type, ...props }) => {
  const iconPaths: Record<Connection['type'], React.ReactNode> = {
    synergy: <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />, // Plus icon
    conflict: <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />, // X icon
    information: <><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0-4h.01" /></>, // Info icon
    // Fix: Multiple JSX elements must be wrapped in a fragment to avoid parsing errors.
    protection: <>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm0 1.5a8.25 8.25 0 1 0 0 16.5 8.25 8.25 0 0 0 0-16.5Z" clipRule="evenodd" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 1.5V21" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12H20.25" />
    </>, // Shield-like icon (simplified)
    neutral: <circle cx="12" cy="12" r="6" />, // Simple circle
  };

  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      {iconPaths[type] || iconPaths['neutral']}
    </svg>
  );
};
