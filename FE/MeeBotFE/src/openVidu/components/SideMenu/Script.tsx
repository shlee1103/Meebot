// import { useState, useEffect } from "react";
import { ParticipantInfo } from "../../hooks/useOpenVidu";
import { CONFERENCE_STATUS } from "../../hooks/usePresentationControls";

interface ScriptProps {
  conferenceStatus: string;
  accumulatedScript: string;
  currentPresenter: ParticipantInfo | null;
}

const Script: React.FC<ScriptProps> = ({ conferenceStatus, accumulatedScript, currentPresenter }) => {
  const shouldShowScript =
    conferenceStatus === CONFERENCE_STATUS.PRESENTATION_ACTIVE || conferenceStatus === CONFERENCE_STATUS.PRESENTATION_COMPLETED || conferenceStatus === CONFERENCE_STATUS.QNA_ACTIVE;

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
