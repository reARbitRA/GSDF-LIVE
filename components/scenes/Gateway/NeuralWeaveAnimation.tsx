import React, { useEffect, useRef } from 'react';

interface NeuralWeaveAnimationProps {
  onAnimationComplete: () => void;
}

const NeuralWeaveAnimation: React.FC<NeuralWeaveAnimationProps> = ({ onAnimationComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFiredRef = useRef(false);

  useEffect(() => {
    const handleAnimationEnd = () => {
      if (!animationFiredRef.current) {
        animationFiredRef.current = true;
        // Add a fade out effect
        if (containerRef.current) {
          containerRef.current.classList.add('animate-fade-out');
          containerRef.current.addEventListener('animationend', onAnimationComplete, { once: true });
        } else {
          onAnimationComplete();
        }
      }
    };
    
    // Fallback timer for browsers that might not fire animationend reliably
    // or for when reduced motion is enabled.
    const timer = setTimeout(handleAnimationEnd, 2500);

    const container = containerRef.current;
    if (container) {
      const paths = container.querySelectorAll('path');
      if (paths.length > 0) {
        // Listen to the last path's animation end
        paths[paths.length - 1].addEventListener('animationend', handleAnimationEnd, { once: true });
      } else {
        // If no paths, just complete
        handleAnimationEnd();
      }
    }
    
    return () => {
      clearTimeout(timer);
    };
  }, [onAnimationComplete]);

  return (
    <div ref={containerRef} className="w-full max-w-lg animate-fade-in" aria-label="Authentication successful animation">
      <svg viewBox="0 0 400 200" className="w-full">
        <defs>
          <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" style={{ stopColor: 'var(--color-primary)', stopOpacity: 0.5 }} />
            <stop offset="100%" style={{ stopColor: 'var(--color-primary)', stopOpacity: 0 }} />
          </radialGradient>
        </defs>

        {/* Grid points */}
        {[...Array(9)].map((_, i) =>
          [...Array(17)].map((_, j) => (
            <circle
              key={`${i}-${j}`}
              cx={25 + j * 22}
              cy={25 + i * 18}
              r="1.5"
              fill="var(--color-primary)"
              opacity="0.2"
            />
          ))
        )}
        
        <g fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round">
          <g className="animate-neural-weave">
            <path d="M 25 61 L 69 97 L 113 79 L 201 115 L 267 97 L 333 133 L 377 97" style={{animationDelay: '0s'}}/>
            <path d="M 25 115 L 91 151 L 157 115 L 201 97 L 245 133 L 289 79 L 377 43" style={{animationDelay: '0.2s'}}/>
            <path d="M 25 43 L 113 61 L 179 25 L 245 79 L 289 115 L 355 79 L 377 115" style={{animationDelay: '0.4s'}}/>
            <path d="M 69 25 L 135 61 L 201 43 L 267 61 L 311 25" style={{animationDelay: '0.6s'}}/>
             <path d="M 113 169 L 157 133 L 223 169 L 267 151 L 333 169" style={{animationDelay: '0.8s'}}/>
          </g>
        </g>
        
        <circle cx="200" cy="100" r="100" fill="url(#glowGradient)" />
      </svg>
      <p className="text-center font-mono text-primary mt-4 tracking-widest">CONNECTION ESTABLISHED</p>
    </div>
  );
};

export default NeuralWeaveAnimation;