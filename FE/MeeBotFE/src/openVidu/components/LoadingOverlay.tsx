import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { H1, Mn, P } from "../../components/common/Typography";

const WaveLoader = styled.div`
  .center {
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    transform: scale(1.2);
  }

  .wave {
    width: 5px;
    height: 40px;
    background: linear-gradient(45deg, #8b5cf6, #5eead4);
    margin: 7px;
    animation: wave 1s linear infinite;
    border-radius: 20px;
    opacity: 0.9;
    box-shadow: 0 0 15px rgba(139, 92, 246, 0.6);
  }

  ${[...Array(10)]
    .map(
      (_, i) => `
    .wave:nth-child(${i + 1}) {
      animation-delay: ${i * 0.1}s;
    }
  `
    )
    .join("")}

  @keyframes wave {
    0% {
      transform: scale(0);
    }
    50% {
      transform: scale(1);
    }
    100% {
      transform: scale(0);
    }
  }
`;

const GlowingBackground = styled.div`
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, rgba(139, 92, 246, 0.15) 0%, rgba(94, 234, 212, 0.1) 35%, transparent 70%);
  animation: pulse 4s ease-in-out infinite;

  @keyframes pulse {
    0% {
      opacity: 0.4;
    }
    50% {
      opacity: 0.8;
    }
    100% {
      opacity: 0.4;
    }
  }
`;

const FloatingText = styled.div`
  animation: float 3s ease-in-out infinite;

  @keyframes float {
    0% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
    100% {
      transform: translateY(0px);
    }
  }
`;

interface LoadingOverlayProps {
  onLoadingComplete?: () => void;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ onLoadingComplete }) => {
  const [countdown, setCountdown] = useState(3);
  const [isVisible, setIsVisible] = useState(true);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const remainingSeconds = Math.max(3 - Math.floor(elapsedTime / 1000), 0);

      setCountdown(remainingSeconds);

      if (remainingSeconds === 0) {
        clearInterval(timer);
        setTimeout(() => {
          setIsVisible(false);
          onLoadingComplete?.();
        }, 1000);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [startTime, onLoadingComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md z-50 flex items-center justify-center overflow-hidden">
      <GlowingBackground />

      <div className="relative text-center space-y-16">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full">
          <div className="w-1 h-32 bg-gradient-to-b from-transparent via-violet-500 to-teal-300 opacity-40" />
        </div>

        <FloatingText>
          <H1 className="text-white mb-4 animate-pulse text-9xl drop-shadow-[0_0_10px_rgba(255,255,255,0.7)]">{countdown}</H1>
        </FloatingText>

        <WaveLoader>
          <div className="center">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="wave" />
            ))}
          </div>
        </WaveLoader>

        <div className="space-y-2">
          <P className="text-white text-2xl tracking-wider font-semibold drop-shadow-[0_0_8px_rgba(94,234,212,0.5)]">곧 발표회가 시작될 예정입니다</P>
          <Mn className="text-teal-200">MeeBot과 함께하는 특별한 순간</Mn>
        </div>

        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[120%]">
          <div className="w-1 h-48 bg-gradient-to-t from-transparent via-violet-500 to-teal-300 opacity-40" />
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
