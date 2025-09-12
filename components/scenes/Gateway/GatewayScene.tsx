import React, { useState } from 'react';
import DigitalIdCard from './DigitalIdCard';
import NeuralWeaveAnimation from './NeuralWeaveAnimation';

interface GatewaySceneProps {
  onLoginSuccess: () => void;
}

const GatewayScene: React.FC<GatewaySceneProps> = ({ onLoginSuccess }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleAuthenticated = () => {
    setIsAnimating(true);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center gateway-bg">
      {isAnimating ? (
        <NeuralWeaveAnimation onAnimationComplete={onLoginSuccess} />
      ) : (
        <DigitalIdCard onAuthenticated={handleAuthenticated} />
      )}
    </div>
  );
};

export default GatewayScene;