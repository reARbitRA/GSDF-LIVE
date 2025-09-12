import React from 'react';

const AchievementsList: React.FC = () => {
  return (
    <div className="p-4 border rounded-lg" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
      <h2 className="text-xl font-orbitron">Achievements</h2>
      <p className="text-gray-400 mt-2">A list of unlocked user achievements.</p>
    </div>
  );
};

export default AchievementsList;
