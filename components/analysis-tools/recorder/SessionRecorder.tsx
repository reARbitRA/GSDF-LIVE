import React from 'react';

const SessionRecorder: React.FC = () => {
  return (
    <div className="p-4 border rounded-lg" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
      <h2 className="text-xl font-orbitron">Session Recorder</h2>
      <p className="text-gray-400 mt-2">Controls for recording and replaying game sessions.</p>
    </div>
  );
};

export default SessionRecorder;
