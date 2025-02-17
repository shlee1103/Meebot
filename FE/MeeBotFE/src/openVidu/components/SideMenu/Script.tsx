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
    conferenceStatus === CONFERENCE_STATUS.PRESENTATION_ACTIVE || 
    conferenceStatus === CONFERENCE_STATUS.PRESENTATION_COMPLETED || 
    conferenceStatus === CONFERENCE_STATUS.QNA_ACTIVE;

  return (
    <>
      {shouldShowScript && currentPresenter && (
        <div className="flex flex-col pb-6 h-full font-pretendard">
          {/* 발표자 정보 */}
          <div className="flex items-center gap-3 p-3 mb-4 bg-white/15 rounded-xl 
                         backdrop-blur-sm">
            <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-white/30">
              <img 
                src={currentPresenter.image} 
                alt={currentPresenter.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="text-[16px] text-white font-semibold mb-1">
                {currentPresenter.name}
              </div>
              <div className="px-2.5 py-1 text-[12px] bg-white/20 text-white 
                            rounded-full w-fit font-medium">
                발표자
              </div>
            </div>
          </div>
          
          {/* 스크립트 내용 */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-6 rounded-2xl bg-white/15 backdrop-blur-sm">
              {accumulatedScript ? (
                <p className="text-[15px] text-white font-medium leading-[2.2] 
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
