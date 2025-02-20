import React from "react";
import styled from "styled-components";
import { P, Mn } from "../../components/common/Typography";

const LoadingSpinner = styled.div`
  .spinner {
    width: 120px;
    height: 120px;
    border: 5px solid rgba(139, 92, 246, 0.2);
    border-radius: 50%;
    border-top: 5px solid #5eead4;
    animation: spin 1s linear infinite;
    box-shadow: 0 0 15px rgba(139, 92, 246, 0.3);
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const GlowingBackground = styled.div`
  position: fixed;
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

const LoadingSummaryOverlay: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-black/80 z-[9999]">
      <div className="fixed inset-0 backdrop-blur-md" />
      <GlowingBackground />
      <div className="relative flex flex-col items-center justify-center h-full space-y-20">
        <LoadingSpinner>
          <div className="spinner" />
        </LoadingSpinner>
        <div className="space-y-3">
          <P className="text-white text-3xl tracking-wider font-semibold">발표 요약본을 생성하고 있습니다</P>
          <Mn className="text-teal-200 text-lg">발표 내용을 분석하여 요약본을 작성중입니다</Mn>
        </div>
      </div>
    </div>
  );
};

export default LoadingSummaryOverlay;
