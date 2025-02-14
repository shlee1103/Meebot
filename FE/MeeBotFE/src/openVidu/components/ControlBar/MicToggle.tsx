import React from 'react';
import styled from 'styled-components';

interface MicToggleProps {
  isEnabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

const MicToggle: React.FC<MicToggleProps> = ({ isEnabled, onToggle, disabled = false }) => {
  return (
    <StyledWrapper>
      <div className="toggle-cont">
        <input 
          className="toggle-input" 
          id="mic-toggle" 
          name="mic-toggle" 
          type="checkbox"
          checked={isEnabled}
          onChange={onToggle}
          disabled={disabled}
        />
        <label className="toggle-label" htmlFor="mic-toggle">
          <div className="cont-label-mic">
            <span className="label-mic" />
          </div>
        </label>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  display: flex;
  height: 50px;
  align-items: center;

  .toggle-cont {
    width: 80px;
    height: 40px;
    border-radius: 9999px;
    position: relative;
    transform: translateY(-12%);
  }

  .toggle-cont .toggle-input {
    display: none;
  }

  .toggle-cont .toggle-label {
    cursor: pointer;
    position: relative;
    display: inline-block;
    padding: 6px;
    width: 100%;
    height: 100%;
    background: #202942;
    border-radius: 9999px;
    box-sizing: content-box;
    box-shadow: 0px 0px 8px -4px rgba(254, 254, 254, 0.3);
  }

  .toggle-cont .toggle-label .cont-label-mic {
    position: relative;
    width: 40px;
    aspect-ratio: 1 / 1;
    background: #2A3347;
    border-radius: 9999px;
    transition: all 0.5s cubic-bezier(1, 0, 0, 1);
  }

  .toggle-cont .toggle-input:checked + .toggle-label .cont-label-mic {
    background: #1AEBB8;
    transform: translateX(40px);
  }

  .toggle-cont .toggle-label .label-mic {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: inline-block;
    width: 24px;
    height: 24px;
    background: #fefefe;
    mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9l4.19 4.18L21 20.73 4.27 3z'/%3E%3C/svg%3E") no-repeat center;
    mask-size: contain;
    -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9l4.19 4.18L21 20.73 4.27 3z'/%3E%3C/svg%3E") no-repeat center;
    -webkit-mask-size: contain;
    transition: all 0.5s cubic-bezier(1, 0, 0, 1);
  }

  .toggle-cont .toggle-input:checked + .toggle-label .label-mic {
    background: #fefefe;
    mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z'/%3E%3Cpath d='M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z'/%3E%3C/svg%3E") no-repeat center;
    mask-size: contain;
    -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z'/%3E%3Cpath d='M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z'/%3E%3C/svg%3E") no-repeat center;
    -webkit-mask-size: contain;
  }

  .toggle-cont .toggle-input:disabled + .toggle-label {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

export default MicToggle; 