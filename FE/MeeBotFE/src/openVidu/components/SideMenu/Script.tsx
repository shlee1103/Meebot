import { ParticipantInfo } from "../../hooks/useOpenVidu";
import { CONFERENCE_STATUS } from "../../hooks/usePresentationControls";
import { useState, useEffect } from 'react';

interface ScriptProps {
  conferenceStatus: string
  currentScript: string
  currentPresenter: ParticipantInfo | null
}

const Script: React.FC<ScriptProps> = ({ conferenceStatus, currentScript, currentPresenter }) => {
  const [savedScript, setSavedScript] = useState<string>('');

  const shouldShowScript =
    conferenceStatus === CONFERENCE_STATUS.PRESENTATION_ACTIVE ||
    conferenceStatus === CONFERENCE_STATUS.PRESENTATION_COMPLETED ||
    conferenceStatus === CONFERENCE_STATUS.QNA_ACTIVE; // 발표 시작 ~ 질의응답 종료

  // currentScript가 의미있는 값일 때 저장
  useEffect(() => {
    if (currentScript && currentScript.trim() !== '') {
      setSavedScript(currentScript);
    }
  }, [currentScript]);

  // 발표자가 변경될 때 저장된 스크립트 초기화
  useEffect(() => {
    setSavedScript('');
  }, [currentPresenter?.name]); // connectionId로 발표자 변경 감지


  // 실제 표시할 스크립트 (현재 스크립트가 없으면 저장된 스크립트 사용)
  const displayScript = currentScript || savedScript;

  // 실시간 스크립트 표시
  return (
    <>
      {(shouldShowScript && currentPresenter) && (
        <div className="p-4 overflow-y-auto h-full">
          <div className="p-3 rounded-lg bg-[#E9E8F3] bg-opacity-30 text-[#FFFFFF] text-sm whitespace-pre-wrap">
            {displayScript}
          </div>
        </div>
      )}
    </>
  );
};

export default Script;
