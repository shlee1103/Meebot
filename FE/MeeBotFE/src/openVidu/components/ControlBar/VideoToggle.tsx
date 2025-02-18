import React from 'react';
import styled from 'styled-components';

interface VideoToggleProps {
  isEnabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

const VideoToggle: React.FC<VideoToggleProps> = ({ isEnabled, onToggle, disabled = false }) => {
  return (
    <StyledWrapper>
      <div className="toggle-cont">
        <input
          className="toggle-input"
          id="video-toggle"
          name="video-toggle"
          type="checkbox"
          checked={isEnabled}
          onChange={onToggle}
          disabled={disabled}
        />
        <label className="toggle-label" htmlFor="video-toggle">
          <div className="cont-label-video">
            <span className="label-video" />
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

  .toggle-cont .toggle-label .cont-label-video {
    position: relative;
    width: 40px;
    aspect-ratio: 1 / 1;
    background: #2A3347;
    border-radius: 9999px;
    transition: all 0.5s cubic-bezier(1, 0, 0, 1);
  }

  .toggle-cont .toggle-input:checked + .toggle-label .cont-label-video {
    background: #1AEBB8;
    transform: translateX(40px);
  }

  .toggle-cont .toggle-label .label-video {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: inline-block;
    width: 24px;
    height: 24px;
    background: #fefefe;
    mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.54-.18L19.73 21 21 19.73 3.27 2z'/%3E%3C/svg%3E") no-repeat center;
    mask-size: contain;
    -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.54-.18L19.73 21 21 19.73 3.27 2z'/%3E%3C/svg%3E") no-repeat center;
    -webkit-mask-size: contain;
    transition: all 0.5s cubic-bezier(1, 0, 0, 1);
  }

  .toggle-cont .toggle-input:checked + .toggle-label .label-video {
    background: #fefefe;
    mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z'/%3E%3C/svg%3E") no-repeat center;
    mask-size: contain;
    -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z'/%3E%3C/svg%3E") no-repeat center;
    -webkit-mask-size: contain;
  }

  .toggle-cont .toggle-input:disabled + .toggle-label {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

export default VideoToggle; 