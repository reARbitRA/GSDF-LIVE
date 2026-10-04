import React, { useState } from 'react';
import NotificationBanner from '../../shared-ui/banners/NotificationBanner';
import { Page } from '../../../App';

interface DashboardProps {
  setPage: (page: Page) => void;
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="border p-6 rounded-lg shadow-lg flex items-center space-x-4 terminal-panel" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
    <div className="bg-[#00BFFF]/10 p-3 rounded-full">
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-400 font-mono uppercase">{title}</p>
      <p className="text-2xl font-bold font-orbitron">{value}</p>
    </div>
  </div>
);

const SuspicionRadarCard: React.FC = () => (
  <div className="border p-4 rounded-lg shadow-lg flex flex-col justify-between terminal-panel" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', minHeight: '180px' }}>
    <div className="flex justify-between items-center w-full">
      <h3 className="text-sm text-gray-400 font-mono uppercase">Suspicion Radar</h3>
      <div className="flex items-center space-x-1">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        <span className="text-xs font-mono text-green-400">LIVE</span>
      </div>
    </div>
    <div className="relative w-24 h-24 my-2">
      {/* Radar SVG */}
      <svg viewBox="0 0 100 100" className="w-full h-full" aria-labelledby="radar-title" role="img">
        <title id="radar-title">Suspicion Radar monitoring player anomalies</title>
        {/* Grid lines */}
        <circle cx="50" cy="50" r="20" fill="none" stroke="rgba(0, 255, 136, 0.1)" strokeWidth="1"/>
        <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(0, 255, 136, 0.1)" strokeWidth="1"/>
        <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(0, 255, 136, 0.2)" strokeWidth="1"/>
        
        {/* Radar Sweep */}
        <defs>
            <linearGradient id="radar-gradient" gradientUnits="userSpaceOnUse" x1="50" y1="50" x2="95" y2="50">
              <stop offset="0%" stopColor="rgba(0, 255, 136, 0.5)" />
              <stop offset="100%" stopColor="rgba(0, 255, 136, 0)" />
            </linearGradient>
        </defs>
        <path d="M 50 50 L 50 2 A 48 48 0 0 1 93.3 25.4 Z" fill="url(#radar-gradient)" className="radar-sweep-arm" />

        {/* Blips (Anomalies) */}
        <circle cx="65" cy="35" r="3" fill="var(--color-trust-low)">
           <animate attributeName="opacity" values="0.7;1;0.7" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="30" cy="70" r="2.5" fill="var(--color-fact-conflict)">
           <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="25" cy="40" r="2" fill="var(--color-trust-neutral)">
          <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2.5s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
    <div className="font-mono text-xs w-full grid grid-cols-2 gap-x-2 text-center">
      <p>STRESS: <span className="font-bold text-[#FFAA00]">HIGH</span></p>
      <p>ANOMALIES: <span className="font-bold text-[#CC3300]">1 DETECTED</span></p>
    </div>
  </div>
);


const ActionCard: React.FC<{ title: string; description: string; onClick: () => void; buttonText: string }> = ({ title, description, onClick, buttonText }) => (
  <div className="border p-6 rounded-lg shadow-lg flex flex-col justify-between terminal-panel" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
    <div>
      <h3 className="text-xl font-bold" style={{ color: 'var(--color-primary)' }}>{title}</h3>
      <p className="mt-2 text-gray-300">{description}</p>
    </div>
    <button onClick={onClick} className="mt-4 w-full bg-[#00FF88] text-black font-bold py-2 px-4 rounded-lg terminal-button">
      {buttonText}
    </button>
  </div>
);

const gameStats = [
  { name: 'Classic Mafia', count: 752 },
  { name: 'Secret Hitler', count: 251 },
  { name: 'The Resistance: Avalon', count: 122 },
  { name: 'Custom Scenarios', count: 79 },
];
const maxCount = Math.max(...gameStats.map(g => g.count));


const GameStatsChart: React.FC = () => (
  <div className="border p-6 rounded-lg shadow-lg terminal-panel" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
    <h3 className="text-xl font-bold text-[#00FF88] mb-4">Game Stats</h3>
    <div className="space-y-4">
      {gameStats.map((game) => (
        <div key={game.name}>
          <div className="flex justify-between items-center mb-1">
            <span className="text-base font-medium text-gray-300">{game.name}</span>
            <span className="text-sm font-medium text-[#00BFFF]">{game.count.toLocaleString()}</span>
          </div>
          <div className="w-full bg-gray-700/50 rounded-full h-2.5">
            <div 
              className="bg-gradient-to-r from-[#00BFFF] to-[#00FF88] h-2.5 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${(game.count / maxCount) * 100}%` }}
              aria-valuenow={game.count}
              aria-valuemin={0}
              aria-valuemax={maxCount}
              role="progressbar"
              aria-label={`${game.name} active games`}
            ></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);


const Dashboard: React.FC<DashboardProps> = ({ setPage }) => {
  const [notice, setNotice] = useState<string | null>(null);
  return (
    <div className="space-y-8">
      {notice && <NotificationBanner type="info" message={notice} onDismiss={() => setNotice(null)} />}
      <div className="text-center">
        <h1 
            className="text-4xl md:text-5xl font-orbitron font-black tracking-wider uppercase title-glow"
            style={{ '--glow-color': 'var(--color-primary)' } as React.CSSProperties}
        >
            Global Social-Deduction Federation
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active Investigations" value="1,204" icon={<UsersIcon />} />
        <StatCard title="My Scenarios" value="8" icon={<DocumentTextIcon />} />
        <StatCard title="Federation Tournaments" value="3 Ongoing" icon={<TrophyIcon />} />
        <SuspicionRadarCard />
      </div>

      <GameStatsChart />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ActionCard
          title="Open Script Riter"
          description="Enter the script editor. Visualize roles, map connections, and design the next generation of social deduction scenarios."
          onClick={() => setPage('script-riter')}
          buttonText="Open Editor"
        />
        <ActionCard
          title="Join a Tournament"
          description="Test your skills against the best. Browse upcoming leagues and tournaments to compete for glory in the Global Federation."
          onClick={() => setPage('tournaments')}
          buttonText="Browse Tournaments"
        />
        <ActionCard
          title="Quick Play"
          description="Jump into a classic Mafia game. Find a public lobby and start playing immediately."
          onClick={() => setNotice('Quick Play is not available yet.')}
          buttonText="Find Investigation"
        />
      </div>

    </div>
  );
};

// SVG Icon Components
const UsersIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#00BFFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm6-11a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
);
const DocumentTextIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#00BFFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
);
const TrophyIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#00BFFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 21H5a2 2 0 01-2-2V9a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-4l-3-3-3 3z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 21V9" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 21V9" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5z" /></svg>
);


export default Dashboard;