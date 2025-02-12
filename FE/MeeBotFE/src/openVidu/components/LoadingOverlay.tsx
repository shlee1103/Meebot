import React, { useEffect, useState } from 'react';
import meeu from '../../assets/MeeU.png';

interface LoadingOverlayProps {
  onLoadingComplete?: () => void;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ onLoadingComplete }) => {
  const [countdown, setCountdown] = useState(5);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimeout(() => {
            setIsVisible(false);
            onLoadingComplete?.();
          }, 1000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onLoadingComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <img 
            src={meeu} 
            alt="Loading character" 
            className="w-48 h-48 mx-auto animate-bounce"
            style={{ 
              animation: 'bounce 1s infinite',
              animationTimingFunction: 'cubic-bezier(0.28, 0.84, 0.42, 1)'
            }} 
          />
          <div className="text-white text-8xl font-bold mt-8 mb-12">
            {countdown}
          </div>
        </div>
        <div className="text-white text-3xl">
          발표회 시작 전... 잠시 기다려주세요...
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;