import React from 'react';
import styled from 'styled-components';

interface ControlButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  backgroundColor?: string;
  hoverColor?: string;
  children: React.ReactNode;
}

const ControlButton: React.FC<ControlButtonProps> = ({ 
  onClick, 
  isActive = false, 
  disabled = false,
  backgroundColor,
  hoverColor,
  children
}) => {
  return (
    <StyledWrapper backgroundColor={backgroundColor} hoverColor={hoverColor}>
      <button 
        className={`control-button ${isActive ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={onClick}
        disabled={disabled}
      >
        {children}
      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div<{ backgroundColor?: string; hoverColor?: string }>`
  .control-button {
    width: 50px;
    height: 50px;
    border-radius: 9999px;
    background: ${props => props.backgroundColor || '#202942'};
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px;
    box-shadow: 0px 0px 8px -4px rgba(254, 254, 254, 0.3);
    transition: all 0.3s ease;

    &:hover:not(.disabled) {
      background: ${props => props.hoverColor || '#2A3347'};
    }

    &.active {
      background: #1AEBB8;
      
      img {
        filter: brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(288deg) brightness(102%) contrast(102%);
      }
    }

    &.disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }

    img {
      width: 24px;
      height: 24px;
      filter: brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(7500%) hue-rotate(173deg) brightness(117%) contrast(117%);
    }
  }
`;

export default ControlButton; 