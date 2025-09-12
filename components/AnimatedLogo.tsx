import React from 'react';

const AnimatedLogo: React.FC = () => {
  return (
    <div className="font-orbitron text-xl font-bold tracking-wider uppercase flex items-center glitch-text" aria-label="GSDF LIVE">
      <span className="animated-letter" style={{ color: 'var(--color-fact-verified)', animationDelay: '0s' }}>G</span>
      <span className="animated-letter" style={{ color: 'var(--color-fact-conflict)', animationDelay: '0.2s' }}>S</span>
      <span className="animated-letter" style={{ color: 'var(--color-trust-high)', animationDelay: '0.4s' }}>D</span>
      <span className="animated-letter" style={{ color: 'var(--color-fact-verified)', animationDelay: '0.6s' }}>F</span>
      <span 
        className="ml-2" 
        // Fix: The style object is cast to React.CSSProperties to allow for the use of the custom CSS property '--glow-color'.
        style={{ 
          color: 'var(--color-danger)', 
          animation: 'pulse-glow 1.5s infinite ease-in-out',
          '--glow-color': 'var(--color-danger)'
        } as React.CSSProperties}
      >
        LIVE
      </span>
    </div>
  );
};

export default AnimatedLogo;
