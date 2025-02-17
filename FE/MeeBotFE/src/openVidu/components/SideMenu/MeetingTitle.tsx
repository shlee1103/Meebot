import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateRoomTitle } from "../../../apis/room";
import { RootState, setMeetingTitle } from "../../../stores/store";
import { Session } from "openvidu-browser";
import { Sm, Mn } from "../../../components/common/Typography";
import information from "../../assets/images/information.png";

interface MeetingTitleProps {
  roomCode: string;
  session: Session | undefined;
}

const MeetingTitle: React.FC<MeetingTitleProps> = ({ roomCode, session }) => {
  const role = useSelector((state: RootState) => state.role.role);
  const meetingTitle = useSelector((state: RootState) => state.meetingTitle.meetingTitle);
  const { presentationTime, qnaTime, presentersOrder } = useSelector((state: RootState) => state.presentation);
  const [isOpen, setIsOpen] = useState(false);
  const [hasBeenChanged, setHasBeenChanged] = useState(false);
  const [tempTitle, setTempTitle] = useState(meetingTitle);
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

  useEffect(() => {
    setTempTitle(meetingTitle);
  }, [meetingTitle]);

  const handleClose = () => {
    setIsOpen(false);
    setHasBeenChanged(false);
    setTempTitle(meetingTitle);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && hasBeenChanged) {
      handleClickEditText();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempTitle(e.target.value);
    setHasBeenChanged(true);
  };

  const handleClickEditText = async () => {
    try {
      await updateRoomTitle(roomCode, tempTitle);
      dispatch(setMeetingTitle(tempTitle));
      if (session) {
        session.signal({
          data: JSON.stringify({ title: tempTitle }),
          type: "meeting-title-change",
        });
      }
      setIsOpen(false);
      setHasBeenChanged(false);
    } catch {
      alert("수정에 실패하였습니다.");
      setTempTitle(meetingTitle);
    }
  };

  return (
    <div ref={titleRef} className="relative w-full max-w-none rounded font-pretendard text-lg font-semibold">
      {!isOpen ? (
        <div className="flex items-center justify-between py-3">
          <div
            onClick={() => {
              setIsOpen(true);
              setTempTitle(meetingTitle);
            }}
            className="font-pretendard cursor-pointer flex-1 mr-3"
          >
            <Sm className="text-[#FFFFFF] break-words leading-relaxed line-clamp-2">{meetingTitle}</Sm>
          </div>
          <img src={information} alt="Information" onClick={() => setIsOpen(true)} className="w-5 h-5 cursor-pointer flex-shrink-0" />
        </div>
      ) : (
        <div className="rounded-t shadow-sm text-white bg-[#171F2E] text-base font-normal relative">
          {/* 입력창 */}
          <div className="flex items-center gap-2">
            {role === "admin" ? (
              <>
                <div className="flex-1 relative w-full">
                  <input
                    type="text"
                    value={tempTitle}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyPress}
                    className="w-full outline-none bg-[#171F2E] text-white border border-[#6B4CFF] rounded-lg px-2 pr-8 py-1 caret-white"
                    autoFocus
                  />
                  <button onClick={handleClose} className="absolute right-2 top-1/2 -translate-y-1/2">
                    <X size={16} color="#E0E0E0" />
                  </button>
                </div>
                {hasBeenChanged && (
                  <button onClick={handleClickEditText} className="bg-[#6B4CFF] w-[45px] h-[34px] rounded-lg flex items-center justify-center">
                    <Mn className="text-[#FFFFFF] font-semibold">수정</Mn>
                  </button>
                )}
              </>
            ) : (
              <div className="flex-1 relative w-full bg-[#171F2E] text-white border border-[#171F2E] rounded-lg px-2 py-1">
                <Sm className="text-[#FFFFFF]">{meetingTitle}</Sm>
              </div>
            )}
          </div>
          {/* 정보창 */}
          <div className="absolute top-full p-4 bg-[#171F2E] w-full rounded-b z-10">
            {presentersOrder.length === 0 ? (
              <div className="p-6 text-center">
                {role === "admin" ? (
                  <div className="flex flex-col items-center justify-center space-y-6">
                    <div className="w-16 h-16 bg-[#242C3C] rounded-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-[#8B8B8B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <Sm className="text-[#8B8B8B] mb-2">발표회 설정이 필요합니다</Sm>
                      <span className="text-[#8B8B8B] text-xs font-pretendard">아래 버튼을 클릭하여 발표회를 설정해주세요</span>
                    </div>
                    <button
                      onClick={() => {
                        /* 발표회 설정 모달 열기 */
                      }}
                      className="relative px-6 py-2 bg-[#6B4CFF] text-white rounded-lg hover:bg-[#5940CC] transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 group"
                    >
                      <div className="absolute -inset-0.5 bg-[#6B4CFF] opacity-40 rounded-lg blur-[2px] animate-pulse"></div>
                      <div className="relative flex items-center space-x-2">
                        <span>발표회 설정하기</span>
                      </div>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-6">
                    <div className="w-16 h-16 bg-[#242C3C] rounded-full flex items-center justify-center animate-pulse">
                      <div className="w-14 h-14 bg-[#242C3C] rounded-full flex items-center justify-center">
                        <div className="w-10 h-10 border-4 border-[#6B4CFF] border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    </div>
                    <div className="text-center">
                      <Sm className="text-[#8B8B8B] mb-2">발표회 설정 대기 중</Sm>
                      <span className="text-[#8B8B8B] text-xs font-pretendard">관리자가 발표회를 설정하고 있습니다</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Sm className="text-[#FFFFFF]">발표 시간</Sm>
                <div className="mt-3 bg-[#242C3C] p-3 rounded">
                  <Mn className="text-[#FFFFFF]">
                    1인당 발표 시간 : <span className="text-[#1AEBB8]">{presentationTime}분</span>
                  </Mn>
                  <div className="mt-3">
                    <Mn className="text-[#FFFFFF]">
                      질의응답 시간 : <span className="text-[#1AEBB8]">{qnaTime}분</span>
                    </Mn>
                  </div>
                </div>
                <div className="mt-6">
                  <Sm className="text-[#FFFFFF]">발표 순서</Sm>
                  <div className="mt-2 space-y-1 bg-[#242C3C] p-3 rounded">
                    {presentersOrder.map((presenter, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-[18px] h-[18px] text-xs text-[#FFFFFF] bg-[#000000] rounded-full border border-[#6B4CFF]">{index + 1}</div>
                        <Mn className="text-[#FFFFFF]">{presenter.name}</Mn>
                      </div>
                    ))}
                  </div>
                </div>
                {/* 요약 정보 */}
                <div className="mt-6 flex items-center">
                  <div className="w-1 h-6 bg-[#1AEBB8] rounded-full mr-3"></div>
                  <Mn className="text-[#8B8B8B] leading-6">
                    "{meetingTitle}"의 발표자는 {presentersOrder.length}명이며, 발표시간은 약 {(presentationTime + qnaTime) * presentersOrder.length}분으로 진행될 예정입니다.
                  </Mn>
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
