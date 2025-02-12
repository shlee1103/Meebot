import { ParticipantInfo } from "../../hooks/useOpenVidu";
import { CONFERENCE_STATUS } from "../../hooks/usePresentationControls";

interface ScriptProps {
  conferenceStatus: string
  currentScript: string
  currentPresenter: ParticipantInfo | null
}

const Script: React.FC<ScriptProps> = ({ conferenceStatus, currentScript, currentPresenter }) => {
  // 실시간 스크립트 표시
  return (
    <>
      {(conferenceStatus === CONFERENCE_STATUS.PRESENTATION_ACTIVE && currentPresenter) && (
        <div className="p-4 overflow-y-auto h-full">
          <div className="p-3 rounded-lg bg-[#E9E8F3] bg-opacity-30 text-[#FFFFFF] text-sm">
            {currentScript}
          </div>
        </div>
      )}
    </>
  );
};

export default Script;
