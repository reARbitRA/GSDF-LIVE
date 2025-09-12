import React from 'react';
import { Page } from '../App';
import AnimatedLogo from './AnimatedLogo';

interface HeaderProps {
  setPage: (page: Page) => void;
  currentPage: Page;
}

const Header: React.FC<HeaderProps> = ({ setPage, currentPage }) => {
  const NavLink: React.FC<{ page: Page; children: React.ReactNode }> = ({ page, children }) => {
    const isActive = currentPage === page;
    return (
      <button
        onClick={() => setPage(page)}
        className={`px-4 py-2 rounded-md text-sm font-medium uppercase tracking-wider font-mono terminal-tab ${
          isActive
            ? 'bg-[#00FF88]/20 text-[#00FF88] shadow-lg'
            : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
        }`}
      >
        {children}
      </button>
    );
  };

  return (
    <header className="bg-black/30 backdrop-blur-sm sticky top-0 z-50 border-b" style={{ borderColor: 'var(--color-border)'}}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AnimatedLogo />
            </div>
            
          </div>
          <div className="hidden md:block">
              <div className="flex items-baseline space-x-4">
                <NavLink page="dashboard">Dashboard</NavLink>
                {/* Fix: Type '"nexus"' is not assignable to type 'Page'. Changed to 'script-riter'. */}
                <NavLink page="script-riter">Nexus Hub</NavLink>
                <NavLink page="tournaments">Tournaments</NavLink>
              </div>
            </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;