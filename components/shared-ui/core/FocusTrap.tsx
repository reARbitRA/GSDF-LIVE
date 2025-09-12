import React, { useRef, useEffect } from 'react';

const FocusTrap: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const trapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const focusableElementsString =
      'a[href], button:not([disabled]), textarea, input, select';
    
    const trapNode = trapRef.current;
    if (!trapNode) return;

    const focusableElements = trapNode.querySelectorAll(focusableElementsString) as NodeListOf<HTMLElement>;
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) { // Shift+Tab
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else { // Tab
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    firstElement?.focus();

    trapNode.addEventListener('keydown', handleKeyDown);

    return () => {
      trapNode.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div ref={trapRef} role="region" aria-label="Focus-trapped area">
      {children}
    </div>
  );
};

export default FocusTrap;
