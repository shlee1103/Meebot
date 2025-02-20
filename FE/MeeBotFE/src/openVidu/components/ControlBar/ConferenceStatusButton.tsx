import { CONFERENCE_STATUS } from "../../hooks/usePresentationControls";
import { useState, useEffect } from "react";

interface ConferenceStatusButtonProps {
  conferenceStatus: string;
  changeConferenceStatus: (status: string) => void;
  className?: string;
}

const ConferenceStatusButton: React.FC<ConferenceStatusButtonProps> = ({ conferenceStatus, changeConferenceStatus, className = "" }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (conferenceStatus === CONFERENCE_STATUS.CONFERENCE_ENDED) {
      setShowTooltip(false);
      return;
    }

    const message = getTooltipMessage();
    if (message) {
      setShowTooltip(true);
      const timer = setTimeout(() => {
        setShowTooltip(false);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setShowTooltip(false);
    }
  }, [conferenceStatus]);

  if (conferenceStatus === CONFERENCE_STATUS.CONFERENCE_ENDED) {
    return null;
  }

  const getTooltipMessage = () => {
    switch (conferenceStatus) {
      case CONFERENCE_STATUS.PRESENTATION_READY:
        return "발표를 시작할 준비가 되었다면 클릭해주세요";
      case CONFERENCE_STATUS.PRESENTATION_ACTIVE:
        return "발표가 끝나면 클릭해주세요";
      case CONFERENCE_STATUS.PRESENTATION_COMPLETED:
      case CONFERENCE_STATUS.QNA_READY:
        return "질의응답을 시작해주세요";
      case CONFERENCE_STATUS.QNA_ACTIVE:
        return "질의응답 시간이 종료되었을 때 클릭해주세요";
      case CONFERENCE_STATUS.QNA_COMPLETED:
        return "발표회를 종료하기 위해 클릭해주세요";
      case CONFERENCE_STATUS.CONFERENCE_WAITING:
        return "발표회를 시작하기 위해 클릭해주세요";
      default:
        return "";
    }
  };

  const getTooltipStyle = () => {
    switch (conferenceStatus) {
      case CONFERENCE_STATUS.CONFERENCE_WAITING:
      case CONFERENCE_STATUS.QNA_COMPLETED:
        return {
          ring: "ring-[#6B4CFF]/30",
          border: "border-[#6B4CFF]/20",
          shadow: "shadow-[0_0_20px_rgba(107,76,255,0.2)]",
          iconColor: "text-[#6B4CFF]",
        };

      case CONFERENCE_STATUS.PRESENTATION_READY:
      case CONFERENCE_STATUS.PRESENTATION_ACTIVE:
        return {
          ring: "ring-[#3B82F6]/30",
          border: "border-[#3B82F6]/20",
          shadow: "shadow-[0_0_20px_rgba(59,130,246,0.2)]",
          iconColor: "text-[#3B82F6]",
        };

      case CONFERENCE_STATUS.PRESENTATION_COMPLETED:
      case CONFERENCE_STATUS.QNA_READY:
      case CONFERENCE_STATUS.QNA_ACTIVE:
        return {
          ring: "ring-[#06B6D4]/30",
          border: "border-[#06B6D4]/20",
          shadow: "shadow-[0_0_20px_rgba(6,182,212,0.2)]",
          iconColor: "text-[#06B6D4]",
        };

      default:
        return {
          ring: "ring-[#6B4CFF]/30",
          border: "border-[#6B4CFF]/20",
          shadow: "shadow-[0_0_20px_rgba(107,76,255,0.2)]",
          iconColor: "text-[#6B4CFF]",
        };
    }
  };

  const getButtonConfig = () => {
    switch (conferenceStatus) {
      case CONFERENCE_STATUS.CONFERENCE_WAITING:
        return {
          text: "발표회 시작",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          style: "bg-gradient-to-r from-[#6B4CFF] to-[#8B6FFF] hover:from-[#5B3FE6] hover:to-[#7B5FE6] border-[#7C61FF] hover:border-[#6B4CFF]",
          ringColor: "from-[#6B4CFF] to-[#8B6FFF]",
        };
      case CONFERENCE_STATUS.QNA_COMPLETED:
        return {
          text: "발표회 종료",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          ),
          style: "bg-gradient-to-r from-[#6B4CFF] to-[#8B6FFF] hover:from-[#5B3FE6] hover:to-[#7B5FE6] border-[#7C61FF] hover:border-[#6B4CFF]",
          ringColor: "from-[#6B4CFF] to-[#8B6FFF]",
        };
      case CONFERENCE_STATUS.PRESENTATION_READY:
        return {
          text: "발표 시작",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          ),
          style: "bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] hover:from-[#2563EB] hover:to-[#3B82F6] border-[#60A5FA] hover:border-[#3B82F6]",
          ringColor: "from-[#3B82F6] to-[#60A5FA]",
        };
      case CONFERENCE_STATUS.PRESENTATION_ACTIVE:
        return {
          text: "발표 종료",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
          ),
          style: "bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] hover:from-[#2563EB] hover:to-[#3B82F6] border-[#60A5FA] hover:border-[#3B82F6]",
          ringColor: "from-[#3B82F6] to-[#60A5FA]",
        };
      case CONFERENCE_STATUS.PRESENTATION_COMPLETED:
      case CONFERENCE_STATUS.QNA_READY:
        return {
          text: "질의응답 시작",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          ),
          style: "bg-gradient-to-r from-[#06B6D4] to-[#22D3EE] hover:from-[#0891B2] hover:to-[#06B6D4] border-[#22D3EE] hover:border-[#06B6D4]",
          ringColor: "from-[#06B6D4] to-[#22D3EE]",
        };
      case CONFERENCE_STATUS.QNA_ACTIVE:
        return {
          text: "질의응답 종료",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          ),
          style: "bg-gradient-to-r from-[#06B6D4] to-[#22D3EE] hover:from-[#0891B2] hover:to-[#06B6D4] border-[#22D3EE] hover:border-[#06B6D4]",
          ringColor: "from-[#06B6D4] to-[#22D3EE]",
        };
      default:
        return {
          text: "",
          icon: null,
          style: "",
          ringColor: "",
        };
    }
  };

  const config = getButtonConfig();

  return (
    <div className="relative group">
      {showTooltip && (
        <div className="fixed right-4 bottom-20 z-50">
          <div
            className={`relative px-6 py-3.5
            bg-[#1a2435] 
            ring-2 ${getTooltipStyle().ring}
            text-white text-sm font-medium
            rounded-2xl
            ${getTooltipStyle().shadow}
            border ${getTooltipStyle().border}
            whitespace-nowrap
            animate-tooltip-bounce
            flex items-center gap-3`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${getTooltipStyle().iconColor} animate-pulse`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="relative font-pretendard">{getTooltipMessage()}</div>
          </div>
          <div
            className={`absolute inset-0 -z-10
            bg-gradient-to-r ${getTooltipStyle().border.replace("border", "from")} ${getTooltipStyle().border.replace("border", "to")}
            rounded-2xl blur-xl
            animate-pulse-slow`}
          ></div>
        </div>
      )}

      <div
        className={`absolute -inset-[2px] bg-gradient-to-r ${config.ringColor}
        rounded-xl blur-[4px] opacity-3 group-hover:opacity-15
        transition duration-1000 group-hover:duration-200
        animate-pulse-slow`}
      ></div>

      <button
        onClick={() => changeConferenceStatus(conferenceStatus)}
        className={`relative px-4 py-2.5 rounded-xl text-white text-md font-medium
          transition-all duration-300 ease-in-out
          border backdrop-blur-sm
          flex items-center gap-2.5
          shadow-lg hover:shadow-xl
          group-hover:scale-[1.02]
          ${config.style}
          ${className}`}
      >
        <span className="relative transform group-hover:scale-110 transition-transform duration-300">{config.icon}</span>
        <span className="relative font-pretendard transform group-hover:translate-x-0.5 transition-transform duration-300">{config.text}</span>
      </button>
    </div>
  );
};

export default ConferenceStatusButton;
