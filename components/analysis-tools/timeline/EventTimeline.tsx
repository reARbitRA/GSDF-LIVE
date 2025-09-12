import React from 'react';

const EventTimeline: React.FC = () => {
  return (
    <div className="p-4 border rounded-lg" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
      <h2 className="text-xl font-orbitron">Event Timeline</h2>
      <p className="text-gray-400 mt-2">A visual timeline of key game events will be rendered here.</p>
    </div>
  );
};

export default EventTimeline;
