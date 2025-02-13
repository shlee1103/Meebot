import React from 'react';
import styled from 'styled-components';

interface HandButtonProps {
  onHandClick: () => void;
  onArrowClick: () => void;
  isHandActive?: boolean;
  isArrowActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

const HandButton: React.FC<HandButtonProps> = ({
  onHandClick,
  onArrowClick,
  isHandActive = false,
  isArrowActive = false,
  disabled = false,
  children
}) => {
  return (
    <StyledWrapper>
      <button
        className={`arrow-button-cont ${isArrowActive ? 'active' : ''}`}
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
          disabled={disabled}
        >
          {children}
        </button>
      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div<{ backgroundColor?: string; hoverColor?: string }>`
  .arrow-button-cont {
    width: 80px;
    height: 50px;
    border-radius: 9999px;
    background: #272727;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 6px;
    box-shadow: 0px 0px 8px -4px rgba(254, 254, 254, 0.3);
    position: relative;
    border: none;
    cursor: pointer;

    &:hover:not(:disabled) {
      background: #333333;
    }

    &.active {
      background: #333333;

      .arrow-icon {
        background: #ffffff;
        transform: translateY(-50%) rotate(180deg);
      }
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
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
    background: #5e5e5e;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;

    &:hover:not(.disabled) {
      background: #333333;
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
  }
`;

export default HandButton; 