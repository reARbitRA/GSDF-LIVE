import React, { useState, useEffect } from 'react';
import Header from './components/shared-ui/navigation/Header';
import Dashboard from './components/scenes/Gateway/Dashboard';
import ScriptRiterScene from './components/scenes/ScriptRiter/ScriptRiterScene';
import TournamentBrowser from './components/scenes/Lobby/TournamentBrowser';
import GatewayScene from './components/scenes/Gateway/GatewayScene';

export type Page = 'dashboard' | 'script-riter' | 'tournaments';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setCurrentPage('tournaments'); // Default to lobby after login
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard setPage={setCurrentPage} />;
      case 'script-riter':
        return <ScriptRiterScene />;
      case 'tournaments':
        return <TournamentBrowser />;
      default:
        return <Dashboard setPage={setCurrentPage} />;
    }
  };

  if (!isAuthenticated) {
    return <GatewayScene onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text-primary)'}}>
      <Header setPage={setCurrentPage} currentPage={currentPage} />
      <main className="p-4">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;