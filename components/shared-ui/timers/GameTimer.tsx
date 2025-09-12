import React from 'react';

const GameTimer: React.FC = () => {
  return (
    <div className="font-mono text-lg p-2 bg-black/20 rounded">
      <span>PHASE END: </span>
      <span className="font-bold text-primary">04:32</span>
    </div>
  );
};

export default GameTimer;
