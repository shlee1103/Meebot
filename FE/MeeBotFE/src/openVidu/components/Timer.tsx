import React from "react";
import { Session } from "openvidu-browser";
import { useTimer } from "../hooks/useTimer";
import { useSelector } from "react-redux";
import { RootState } from "../../stores/store";
import styled from 'styled-components';
import { CONFERENCE_STATUS } from '../hooks/usePresentationControls';

interface TimerProps {
  conferenceStatus: string;
  session: Session | undefined;
  isSpeaking: boolean;
}

const Timer: React.FC<TimerProps> = ({ conferenceStatus, session, isSpeaking }) => {
  const role = useSelector((state: RootState) => state.role.role);
  const isAdmin = role === "admin";

  const { minutes, remainingSeconds } = useTimer({
    conferenceStatus,
    session,
    isAdmin,
    isSpeaking,
  });

  return (
    <TimerWrapper $isActive={isSpeaking && conferenceStatus === CONFERENCE_STATUS.PRESENTATION_ACTIVE}>
      <TimerDisplay>
        <TimeText>{minutes.toString().padStart(2, '0')}</TimeText>
        <Separator>:</Separator>
        <TimeText>{remainingSeconds.toString().padStart(2, '0')}</TimeText>
      </TimerDisplay>
    </TimerWrapper>
  );
};

const TimerWrapper = styled.div<{ $isActive: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  background: ${props => props.$isActive ? 'rgba(59, 130, 246, 0.1)' : 'rgba(31, 41, 55, 0.5)'};
  border: 1px solid ${props => props.$isActive ? 'rgba(59, 130, 246, 0.2)' : 'rgba(55, 65, 81, 0.3)'};
  border-radius: 12px;
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
  display: none;
  @media (min-width: 1024px) {
    display: block;
  }
`;

const TimerDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
`;

const TimeText = styled.span`
  font-family: 'LAB디지털';
  font-size: 32px;
  line-height: 1;
  color: white;
  letter-spacing: 1px;
`;

const Separator = styled.span`
  font-family: 'LAB디지털';
  font-size: 32px;
  line-height: 1;
  color: white;
  animation: blink 1s infinite;
  
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
`;

export default Timer;
