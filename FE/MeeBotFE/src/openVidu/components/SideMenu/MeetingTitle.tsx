import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, setMeetingSettingOpenModal } from "../../../stores/store";
import { Session } from "openvidu-browser";
import { Sm } from "../../../components/common/Typography";
import { BsInfoCircleFill } from "react-icons/bs";

interface MeetingTitleProps {
  roomCode?: string;
  session?: Session | undefined;
}

const MeetingTitle: React.FC<MeetingTitleProps> = () => {
  const role = useSelector((state: RootState) => state.role.role);
  const meetingTitle = useSelector((state: RootState) => state.meetingTitle.meetingTitle);
  const { presentationTime, qnaTime, presentersOrder } = useSelector((state: RootState) => state.presentation);
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();

  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (titleRef.current && !titleRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleOpenMeetingSettingModal = () => {
    setIsOpen(false);
    dispatch(setMeetingSettingOpenModal(true));
  };

  return (
    <div ref={titleRef} className="relative w-full max-w-none font-pretendard">
      {!isOpen ? (
        <div className="flex items-center justify-between py-4">
          <div
            onClick={() => {
              setIsOpen(true);
            }}
            className="font-pretendard cursor-pointer flex-1 mr-3"
          >
            <p
              className="text-[#FFFFFF] break-words leading-relaxed line-clamp-2 
                       font-semibold text-[15px]"
            >
              {meetingTitle}
            </p>
          </div>
          <div className="relative group">
            <BsInfoCircleFill
              onClick={() => setIsOpen(true)}
              className="w-5 h-5 cursor-pointer flex-shrink-0 
                     text-white/60 hover:text-white/90 transition-colors duration-200"
            />
            {/* Tooltip */}
            <div
              className="absolute -left-10 -translate-x-1/2 top-full mt-2 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-200
                      pointer-events-none z-50"
            >
              {/* Tooltip Arrow */}
              <div
                className="absolute left-4 bottom-full
                        border-4 border-transparent border-b-white/15"
              />
              <div
                className="bg-white/15 backdrop-blur-md text-white text-[11px] font-medium
                        px-3 py-1.5 rounded-lg whitespace-nowrap
                        border border-white/20"
              >
                클릭하여 미팅 정보 보기
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="absolute top-0 left-0 right-0 z-50
                      rounded-xl shadow-lg bg-white/15 backdrop-blur-md border border-white/20
                      max-h-[80vh] overflow-y-auto custom-scrollbar"
        >
          {/* 입력창 */}
          <div className="p-4">
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 bg-white/10 rounded-lg">
                <p className="text-white font-medium text-[14px]">{meetingTitle}</p>
              </div>
            </div>
          </div>

          {/* 정보창 */}
          <div className="px-4 py-4 border-t border-white/10 z-[100]">
            {presentersOrder.length === 0 ? (
              <div className="p-4">
                {role === "admin" ? (
                  <div className="flex flex-col items-center justify-center space-y-6">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <Sm className="text-white/60 mb-2">발표회 설정이 필요합니다</Sm>
                      <span className="text-white/40 text-xs">아래 버튼을 클릭하여 발표회를 설정해주세요</span>
                    </div>
                    <button
                      onClick={handleOpenMeetingSettingModal}
                      className="px-6 py-2 bg-[#2A8A86] hover:bg-[#1AEBB8] text-white 
                               rounded-lg transition-all duration-200 
                               hover:shadow-lg hover:shadow-[#2A8A86]/20"
                    >
                      발표회 설정하기
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-6">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                      <div className="w-10 h-10 border-4 border-[#2A8A86] border-t-transparent rounded-full animate-spin" />
                    </div>
                    <div className="text-center">
                      <Sm className="text-white/60 mb-2">발표회 설정 대기 중</Sm>
                      <span className="text-white/40 text-xs">관리자가 발표회를 설정하고 있습니다</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div>
                    <p className="text-white mb-2 font-bold text-[14px]">발표 시간</p>
                    <div className="bg-white/10 p-3 rounded-lg space-y-3">
                      <p className="text-white flex items-center gap-2 text-[13px]">
                        <span className="text-lg">⏰</span>
                        1인당 발표 시간 : <span className="text-[#1AEBB8] font-medium">{presentationTime}분</span>
                      </p>
                      <p className="text-white flex items-center gap-2 text-[13px]">
                        <span className="text-lg">💭</span>
                        질의응답 시간 : <span className="text-[#1AEBB8] font-medium">{qnaTime}분</span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-white mb-2 font-bold text-[14px]">발표 순서</p>
                    <div className="bg-white/10 p-3 rounded-lg space-y-2">
                      {presentersOrder.map((presenter, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div
                            className="flex items-center justify-center w-[18px] h-[18px] 
                                      text-xs text-white bg-white/10 rounded-full font-medium"
                          >
                            {index + 1}
                          </div>
                          <p className="text-white font-medium text-[13px]">{presenter.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 요약 정보 */}
                <div className="mt-6 flex items-center gap-3 p-3 bg-white/10 rounded-lg">
                  <span className="text-xl">📢</span>
                  <p className="text-white/60 leading-6 text-[13px]">
                    "{meetingTitle}"의 발표자는 {presentersOrder.length}명이며, 발표시간은 약 {(presentationTime + qnaTime) * presentersOrder.length}분으로 진행될 예정입니다.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingTitle;
