import React from 'react';

const InteractionHeatmap: React.FC = () => {
  return (
    <div className="p-4 border rounded-lg" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
      <h2 className="text-xl font-orbitron">Interaction Heatmap</h2>
      <p className="text-gray-400 mt-2">A heatmap showing player interactions will be rendered here.</p>
    </div>
  );
};

export default InteractionHeatmap;
