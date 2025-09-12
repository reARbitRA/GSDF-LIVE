import React from 'react';

const XpWheel: React.FC = () => {
  return (
    <div className="p-4 border rounded-lg" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
      <h2 className="text-xl font-orbitron">XP Progression</h2>
      <p className="text-gray-400 mt-2">A radial progress wheel for user XP will be here.</p>
    </div>
  );
};

export default XpWheel;
