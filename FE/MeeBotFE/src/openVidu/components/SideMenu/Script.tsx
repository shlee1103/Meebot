import { useEffect, useRef } from "react";
import { ParticipantInfo } from "../../hooks/useOpenVidu";
import { CONFERENCE_STATUS } from "../../hooks/usePresentationControls";

interface ScriptProps {
  conferenceStatus: string;
  accumulatedScript: string;
  currentPresenter: ParticipantInfo | null;
}

const Script: React.FC<ScriptProps> = ({ conferenceStatus, accumulatedScript, currentPresenter }) => {
  const scriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scriptRef.current) {
      scriptRef.current.scrollTop = scriptRef.current.scrollHeight;
    }
  }, [accumulatedScript]);

  const shouldShowScript =
    conferenceStatus === CONFERENCE_STATUS.PRESENTATION_ACTIVE || 
    conferenceStatus === CONFERENCE_STATUS.PRESENTATION_COMPLETED || 
    conferenceStatus === CONFERENCE_STATUS.QNA_ACTIVE;

  return (
    <>
      {shouldShowScript && currentPresenter && (
        <div className="flex flex-col pb-6 h-full font-pretendard">
          {/* 발표자 정보 */}
          <div className="flex items-center gap-3 p-3 mb-3 bg-white/15 rounded-2xl 
            backdrop-blur-sm">
            <div className="relative">
              <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-white/30">
                <img 
                  src={currentPresenter.image} 
                  alt={currentPresenter.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              {/* 활성 상태 표시 */}
              <div className={`absolute -bottom-0 -right-0 w-3 h-3 rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 animate-pulse border-1 border-white/10 shadow-md`}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[16px] text-white font-semibold">
                {currentPresenter.name}
              </span>
              <span className="px-2 py-0.5 text-[11px] bg-white/20 text-white 
                rounded-full font-medium">
                발표자
              </span>
            </div>
          </div>
          
          {/* 스크립트 내용 */}
          <div ref={scriptRef} className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-6 rounded-2xl bg-white/15 backdrop-blur-sm">
              {accumulatedScript ? (
                <p className="text-[18px] text-white font-medium leading-[2.2] 
                  tracking-wide whitespace-pre-wrap break-keep">
                  {accumulatedScript}
                </p>
              ) : (
                <p className="text-[15px] text-white/60 text-center font-medium">
                  아직 스크립트가 없습니다.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Script;
