import React, { useState } from 'react';
import { Tournament } from '../../../types';

const mockTournaments: Tournament[] = [
  { id: 't1', name: 'Winter Championship 2024', status: 'Ongoing', game: 'Secret Hitler - Extended', participants: 48, maxParticipants: 64, startDate: '2024-07-15' },
  { id: 't2', name: 'Nexus Open League', status: 'Ongoing', game: 'Classic Mafia', participants: 112, maxParticipants: 128, startDate: '2024-07-10' },
  { id: 't3', name: 'Rookie Rumble', status: 'Upcoming', game: 'Classic Mafia', participants: 0, maxParticipants: 32, startDate: '2024-08-01' },
  { id: 't4', name: 'Avalon Grandmasters', status: 'Upcoming', game: 'The Resistance: Avalon', participants: 12, maxParticipants: 20, startDate: '2024-08-05' },
  { id: 't5', name: 'Summer Invitational', status: 'Completed', game: 'Custom Scenario', participants: 24, maxParticipants: 24, startDate: '2024-06-20' },
];

const TournamentCard: React.FC<{ tournament: Tournament }> = ({ tournament }) => {
  const getStatusColor = (status: Tournament['status']) => {
    switch (status) {
      case 'Ongoing': return 'bg-green-500/80';
      case 'Upcoming': return 'bg-blue-500/80';
      case 'Completed': return 'bg-gray-600/80';
    }
  };

  const isFull = tournament.participants === tournament.maxParticipants;

  return (
    <div className="border rounded-lg shadow-lg overflow-hidden terminal-panel" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
      <div className="p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-white">{tournament.name}</h3>
          <span className={`px-3 py-1 text-xs font-semibold text-white rounded-full ${getStatusColor(tournament.status)}`}>
            {tournament.status}
          </span>
        </div>
        <p className="text-sm text-[#00FF88] mt-1 font-mono">{tournament.game}</p>
        <div className="mt-4 flex justify-between items-center text-gray-300">
          <div>
            <p className="text-sm font-mono uppercase">Participants</p>
            <p className="font-bold text-lg font-orbitron">{tournament.participants} / {tournament.maxParticipants}</p>
          </div>
          <div>
            <p className="text-sm font-mono uppercase">Starts On</p>
            <p className="font-bold text-lg font-orbitron">{new Date(tournament.startDate).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="w-full bg-gray-700/50 rounded-full h-2.5 mt-4">
          <div className="h-2.5 rounded-full" style={{ width: `${(tournament.participants / tournament.maxParticipants) * 100}%`, backgroundColor: 'var(--color-secondary)' }}></div>
        </div>
        <button 
          disabled={tournament.status !== 'Upcoming' || isFull} 
          className="w-full mt-6 bg-[#00FF88] text-black font-bold py-2 px-4 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed terminal-button"
        >
          {tournament.status === 'Upcoming' ? (isFull ? 'Full' : 'Register') : 'View Details'}
        </button>
      </div>
    </div>
  );
};


const TournamentBrowser: React.FC = () => {
  const [filter, setFilter] = useState<'All' | Tournament['status']>('All');

  const filteredTournaments = mockTournaments.filter(t => filter === 'All' || t.status === filter);

  const FilterButton: React.FC<{ status: 'All' | Tournament['status'] }> = ({ status }) => {
    const isActive = filter === status;
    return (
      <button
        onClick={() => setFilter(status)}
        className={`px-4 py-2 rounded-md text-sm font-medium font-mono uppercase terminal-tab ${
          isActive
            ? 'bg-[#00FF88]/20 text-[#00FF88] shadow-lg'
            : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
        }`}
      >
        {status}
      </button>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-orbitron font-bold tracking-wide">Federation Tournaments</h1>
        <p className="mt-2 text-lg font-mono uppercase tracking-widest text-primary/80">Global Social-Deduction Federation</p>
      </div>
      
      <div className="flex justify-center space-x-2 md:space-x-4 mb-8">
        <FilterButton status="All" />
        <FilterButton status="Upcoming" />
        <FilterButton status="Ongoing" />
        <FilterButton status="Completed" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredTournaments.map(tournament => (
          <TournamentCard key={tournament.id} tournament={tournament} />
        ))}
      </div>
    </div>
  );
};

export default TournamentBrowser;