import React from 'react';
import { Connection } from '../../../types';

export const ConnectionIndicatorIcon: React.FC<React.SVGProps<SVGSVGElement> & { type: Connection['type'] }> = ({ type, ...props }) => {
  const iconPaths: Record<Connection['type'], React.ReactNode> = {
    synergy: <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v10m-5-5h10" />,
    conflict: <path strokeLinecap="round" strokeLinejoin="round" d="m7.5 7.5 9 9m0-9-9 9" />,
    information: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </>
    ),
    protection: <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
    neutral: <circle cx="12" cy="12" r="5" fill="none" />,
  };

  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      {iconPaths[type] || iconPaths['neutral']}
    </svg>
  );
};