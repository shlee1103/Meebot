import React from 'react';
import styled from 'styled-components';
import { useSelector } from "react-redux";
import { RootState } from "../../../stores/store";
import { CONFERENCE_STATUS } from "../../hooks/usePresentationControls";

interface HandButtonProps {
  onHandClick: () => void;
  onArrowClick: () => void;
  isHandActive?: boolean;
  isArrowActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  conferenceStatus: string;
}

const HandButton: React.FC<HandButtonProps> = ({
  onHandClick,
  onArrowClick,
  isHandActive = false,
  isArrowActive = false,
  disabled = false,
  children,
  conferenceStatus
}) => {
  const raisedHands = useSelector((state: RootState) => state.raisedHands.raisedHands);
  const presentersOrder = useSelector((state: RootState) => state.presentation.presentersOrder);
  const currentPresenterIndex = useSelector((state: RootState) => state.presentation.currentPresenterIndex);

  const currentPresenter = presentersOrder[currentPresenterIndex];
  const myUsername = useSelector((state: RootState) => state.myUsername.myUsername);

  // QnA 모드가 아닐 때는 목록 표시하지 않음
  if (conferenceStatus !== CONFERENCE_STATUS.QNA_ACTIVE) {
    return null;
  }

  const shouldAnimate = conferenceStatus === CONFERENCE_STATUS.QNA_ACTIVE && 
    currentPresenter && 
    currentPresenter.name !== myUsername && 
    !isHandActive;

  return (
    <StyledWrapper>
      <button
        className={`arrow-button-cont ${isArrowActive ? 'active' : ''} ${shouldAnimate ? 'animate-attention' : ''}`}
        onClick={onArrowClick}
        disabled={disabled}
      >
        <span className="arrow-icon" />
        <button
          className={`control-button ${isHandActive ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onHandClick();
          }}
          disabled={disabled || (currentPresenter && currentPresenter.name === myUsername)}
        >
          {children}
        </button>

        {isArrowActive && (
          <div className="hands-list">
            <div className="hands-list-header">
              <h3>질문자 목록</h3>
              <span>{raisedHands.length}명</span>
            </div>

            {raisedHands.length === 0 ? (
              <p className="no-hands">아직 질문자가 없습니다</p>
            ) : (
              <div className="hands-list-content">
                {raisedHands.map((participant) => (
                  <div key={participant.connectionId} className="participant-item">
                    <div className="participant-info">
                      <span className="status-dot" />
                      <span className="participant-name">{participant.userName}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div<{ backgroundColor?: string; hoverColor?: string }>`
  .arrow-button-cont {
    width: 80px;
    height: 50px;
    border-radius: 9999px;
    background: #232D45;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 6px;
    box-shadow: 0px 0px 8px -4px rgba(254, 254, 254, 0.3);
    position: relative;
    border: none;
    cursor: pointer;

    &:hover:not(:disabled) {
      background: #2A3347;
    }

    &.active:not(:disabled) {
      background: #2A3347;

      .arrow-icon {
        background: #ffffff;
        transform: translateY(-50%) rotate(180deg);
      }
    }

    &:disabled {
      cursor: default;
      background: #1a1f2e;
      pointer-events: none;
      filter: grayscale(30%) brightness(70%);

      .arrow-icon {
        background: #9CA3AF;
      }

      .control-button {
        background: #1a1f2e;
        
        svg {
          opacity: 0.5;
      }
    }

    &.animate-attention {
      animation: attention 2s infinite cubic-bezier(0.4, 0, 0.6, 1);
      
      &:hover {
        animation: none;
      }

      &::after {
        content: '질문이 있으신가요?';
        position: absolute;
        white-space: nowrap;
        bottom: calc(100% + 8px);
        left: 50%;
        transform: translateX(-50%);
        background: rgba(26, 235, 184, 0.1);
        color: #1AEBB8;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 500;
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
        font-family: 'Pretendard', sans-serif;
      }

      &:hover::after {
        opacity: 1;
      }
    }
  }
  .arrow-icon {
    position: absolute;
    left: 8px;
    top: 50%;
    transform: translateY(-50%) rotate(0deg);
    width: 24px;
    height: 24px;
    background: #F7F7F7;
    mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z'/%3E%3C/svg%3E") no-repeat center;
    mask-size: contain;
    -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z'/%3E%3C/svg%3E") no-repeat center;
    -webkit-mask-size: contain;
    transition: all 0.3s ease;
    .active & {
      background: #ffffff;
    }
  }

  .control-button {
    width: 40px;
    height: 40px;
    border-radius: 9999px;
    background: #2A3347;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;

    &:hover:not(.disabled) {
      background: #202942;
    }
  
    &.active {
      background: #1AEBB8;
      
      img {
        filter: brightness(0) saturate(100%) invert(0%) sepia(7%) saturate(98%) hue-rotate(346deg) brightness(95%) contrast(86%);
      }
    }
  
    &.disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  }

  img {
    width: 24px;
    height: 24px;
    filter: brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(7500%) hue-rotate(173deg) brightness(117%) contrast(117%);
  }

  .hands-list {
    position: absolute;
    bottom: 100%;
    right: 0;
    margin-bottom: 12px;
    background: #1A2235;
    border: 1px solid #2A3347;
    border-radius: 12px;
    padding: 16px;
    width: 280px;
    box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.25);
    max-height: 300px;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background: #1A2235;
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: #2A3347;
      border-radius: 4px;
      
      &:hover {
        background: #374151;
      }
    }
  }

  .hands-list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #2A3347;
    
    h3 {
      color: #FFFFFF;
      font-size: 16px;
      font-weight: 600;
      font-family: 'Pretendard', sans-serif;
    }
    
    span {
      background: #2A3347;
      color: #9CA3AF;
      font-size: 13px;
      padding: 4px 8px;
      border-radius: 12px;
      font-family: 'Pretendard', sans-serif;
    }
  }

  .no-hands {
    color: #9CA3AF;
    font-size: 14px;
    text-align: center;
    padding: 20px 0;
    font-family: 'Pretendard', sans-serif;
  }

  .hands-list-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .participant-item {
    padding: 8px 12px;
    border-radius: 8px;
    transition: all 0.2s ease;
    
    &:hover {
      background: #232D45;
    }
  }

  .participant-info {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    background: #1AEBB8;
    border-radius: 50%;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      width: 12px;
      height: 12px;
      background: rgba(26, 235, 184, 0.2);
      border-radius: 50%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }

  .participant-name {
    color: #FFFFFF;
    font-size: 14px;
    font-weight: 500;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: 'Pretendard', sans-serif;
  }

  /* 애니메이션 효과 */
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .hands-list {
    animation: slideIn 0.2s ease-out;
  }

  /* 새로운 애니메이션 스타일 추가 */
  @keyframes attention {
    0% {
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(26, 235, 184, 0.4);
    }
    70% {
      transform: scale(1.05);
      box-shadow: 0 0 0 10px rgba(26, 235, 184, 0);
    }
    100% {
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(26, 235, 184, 0);
    }
  }
`;

export default HandButton; 