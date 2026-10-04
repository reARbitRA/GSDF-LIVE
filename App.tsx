import React, { Suspense, lazy, useState } from 'react';
import Header from './components/shared-ui/navigation/Header';
import Dashboard from './components/scenes/Gateway/Dashboard';
// Lazy: pulls the 125 kB community-role dataset and the Gemini SDK only when the editor is opened.
const ScriptRiterScene = lazy(() => import('./components/scenes/ScriptRiter/ScriptRiterScene'));
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
        return (
          <Suspense fallback={<div className="p-8 text-center font-mono text-gray-400" role="status">Loading Script Riter…</div>}>
            <ScriptRiterScene />
          </Suspense>
        );
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