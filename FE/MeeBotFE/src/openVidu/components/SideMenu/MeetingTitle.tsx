import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateRoomTitle } from "../../../apis/room";
import { RootState, setMeetingTitle } from "../../../stores/store";
import { Sm, Mn } from "../../../components/common/Typography";
import information from "../../assets/images/information.png";
import { Session } from "openvidu-browser";

interface MeetingTitleProps {
  roomCode: string;
  session: Session | undefined;
}
const MeetingTitle: React.FC<MeetingTitleProps> = ({ roomCode, session }) => {
  const role = useSelector((state: RootState) => state.role.role);
  const meetingTitle = useSelector((state: RootState) => state.meetingTitle.meetingTitle);
  const { presentationTime, qnaTime, presentersOrder } = useSelector((state: RootState) => state.presentation);
  const dispatch = useDispatch();

  const [isOpen, setIsOpen] = useState(false);
  const [hasBeenChanged, setHasBeenChanged] = useState(false);

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
    setHasBeenChanged(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setMeetingTitle(e.target.value));
    setHasBeenChanged(true);
  };

  const handleClickEditText = async () => {
    try {
      await updateRoomTitle(roomCode, meetingTitle);
      if (session) {
        session.signal({
          data: JSON.stringify({ title: meetingTitle }),
          type: "meeting-title-change",
        });
      }
      dispatch(setMeetingTitle(meetingTitle));
      setIsOpen(false);
      setHasBeenChanged(false);
    } catch {
      alert("수정에 실패하였습니다.");
    }
  };

  return (
    <div ref={titleRef} className="relative w-full max-w-none rounded font-pretendard text-lg font-semibold">
      {!isOpen ? (
        <div className="flex items-center justify-between">
          <div onClick={() => setIsOpen(true)} className="font-pretendard py-[6px] cursor-pointer">
            <Sm className="text-[#FFFFFF]">{meetingTitle}</Sm>
          </div>
          <img src={information} alt="Information" onClick={() => setIsOpen(true)} className="w-5 h-5 cursor-pointer" />
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
                    value={meetingTitle}
                    onChange={handleInputChange}
                    className="w-full outline-none bg-[#171F2E] text-white border border-[#6B4CFF] rounded-lg px-2 pr-8 py-1"
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
          <div className="absolute top-full p-4 bg-[#171F2E] w-full rounded-b">
            <Sm className="text-[#FFFFFF]">발표 시간</Sm>
            <div className="mt-3">
              <Mn className="text-[#FFFFFF]">
                1인당 발표 시간 : <span className="text-[#1AEBB8]">{presentationTime}분</span>
              </Mn>
              <div className="mt-3">
                <Mn className="text-[#FFFFFF]">
                  질의응답 시간 : <span className="text-[#1AEBB8]">{qnaTime}분</span>
                </Mn>
              </div>
            </div>
            {presentersOrder.length > 0 && (
              <div className="mt-[30px]">
                <Sm className="text-[#FFFFFF]">발표 순서</Sm>
                <div className="mt-2 space-y-1">
                  {presentersOrder.map((presenter, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-[18px] h-[18px] text-xs text-[#FFFFFF] bg-[#000000] rounded-full border border-[#6B4CFF]">{index + 1}</div>
                      <Mn className="text-[#FFFFFF]">{presenter.name}</Mn>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingTitle;
