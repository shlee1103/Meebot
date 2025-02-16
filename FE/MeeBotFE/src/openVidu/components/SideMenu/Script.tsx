import { useState, useEffect } from "react";
import { ParticipantInfo } from "../../hooks/useOpenVidu";
import { CONFERENCE_STATUS } from "../../hooks/usePresentationControls";

interface ScriptProps {
  conferenceStatus: string;
  currentScript: string;
  currentPresenter: ParticipantInfo | null;
}

const Script: React.FC<ScriptProps> = ({ conferenceStatus, currentScript, currentPresenter }) => {
  const [accumulatedScript, setAccumulatedScript] = useState<string>("");

  const shouldShowScript =
    conferenceStatus === CONFERENCE_STATUS.PRESENTATION_ACTIVE || conferenceStatus === CONFERENCE_STATUS.PRESENTATION_COMPLETED || conferenceStatus === CONFERENCE_STATUS.QNA_ACTIVE;

  // 새로운 스크립트를 누적
  useEffect(() => {
    if (currentScript && currentScript.trim() !== "") {
      setAccumulatedScript((prev) => {
        // 자연스러운 띄어쓰기를 위한 처리
        const needsSpace = prev.length > 0 && !prev.endsWith(" ");
        return prev + (needsSpace ? " " : "") + currentScript;
      });
    }
  }, [currentScript]);

  // 발표자가 변경될 때 누적 스크립트 초기화
  useEffect(() => {
    setAccumulatedScript("");
  }, [currentPresenter?.name]);

  return (
    <>
      {shouldShowScript && currentPresenter && (
        <div className="p-4 overflow-y-auto h-full">
          <div className="p-3 rounded-lg bg-[#E9E8F3] bg-opacity-30 text-[#FFFFFF] text-sm whitespace-pre-wrap">{accumulatedScript}</div>
        </div>
      )}
    </>
  );
};

export default Script;
