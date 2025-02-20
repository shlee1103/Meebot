import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState, setRole, setMeetingTitle } from "../../stores/store";
import { H3, P, Sm } from "../common/Typography";
import Button from "../common/Button";
import copy_icon from "../../assets/copy_icon.svg";
import link_icon from "../../assets/link_icon.svg";

interface MeetingCreatePopupProps {
  onClose: () => void;
}

const MeetingCreatePopup: React.FC<MeetingCreatePopupProps> = ({ onClose }) => {
  const dispatch = useDispatch();
  const meetingTitle = useSelector((state: RootState) => state.meetingTitle.meetingTitle);
  const [isShaking, setIsShaking] = useState(false);
  const [isTitleHidden, setIsTitleHidden] = useState(false);
  const [isFullyHidden, setIsFullyHidden] = useState(true);
  const [sessionId, setSessionId] = useState("");
  const BASE_URL = "https://meebot.site/meeting-setting";

  const navigate = useNavigate();

  const generateSessionId = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array.from({ length: 7 }, () => characters[Math.floor(Math.random() * characters.length)]).join("");
  };

  const handleCreateMeeting = async () => {
    if (!meetingTitle.trim()) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 300);
      return;
    }

    const sessionId = generateSessionId();
    setSessionId(sessionId);
    setIsTitleHidden(true);

    setTimeout(() => {
      setIsFullyHidden(false);
    }, 500);
  };

  const handleJoinMeeting = () => {
    dispatch(setRole("admin"));
    navigate(`/meeting-setting/${sessionId}`);
    onClose();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("복사되었습니다!");
    });
  };

  return (
    <div className="flex flex-col px-10 py-8 gap-10 min-w-[624px] max-w-14 overflow-hidden">
      <div className="flex flex-col gap-4 items-start">
        <H3 className="text-white w-full text-nowrap text-left">화상 모임 생성하기</H3>
        <Sm className="text-white w-full text-nowrap text-left">발표를 위한 화상 모임을 시작합니다.</Sm>
      </div>

      <div className="relative w-full min-h-[120px]">
        {/* 발표 주제 입력 UI*/}
        {isFullyHidden && (
          <div
            className={`
            flex flex-col gap-5 w-full
            transition-all duration-500 absolute
            ${isTitleHidden ? "translate-x-[-100%] opacity-0" : "translate-x-0 opacity-100"}
            ${!isFullyHidden ? "hidden" : ""}
            `}
          >
            <div className="flex flex-row items-end gap-1">
              <P className="text-white">발표 주제</P>
              <Sm className="text-white">(방 제목)</Sm>
              <Sm className="text-[#D84F4F]">필수</Sm>
            </div>
            <div className="flex flex-col gap-4 w-full">
              <input
                type="text"
                placeholder="발표 주제를 입력해주세요."
                value={meetingTitle}
                onChange={(e) => {
                  dispatch(setMeetingTitle(e.target.value));
                }}
                className={`
                w-full px-4 py-3 border border-[#6B4CFF] rounded-[15px]
                font-pretendard text-sm-sm md:text-sm-md lg:text-sm-lg
                text-[#E9E5FF] placeholder-[#E9E5FF] text-left
                bg-transparent focus:outline-none focus:ring-2 focus:ring-[#6B4CFF]
                focus:font-semibold focus:placeholder:text-transparent
                ${isShaking ? "animate-shake border-[#D84F4F]" : ""}
                `}
              />
              <p className="text-[#ACACAC] font-pretendard text-[10px] md:text-[12px] lg:text-[14px] text-left text-nowrap">
                * 발표 중에는 발표자의 화면이 공유되며, 발표 종류 후에는 질의 응답 시간이 이어집니다.
              </p>
            </div>
          </div>
        )}

        {/* 참여 코드 UI */}
        {isTitleHidden && (
          <div
            className={`
          flex flex-col gap-5 w-full
          transition-all duration-500 absolute
          ${isTitleHidden ? "translate-x-0 opacity-100" : "translate-x-[100%] opacity-0"}
          ${isFullyHidden ? "hidden" : ""}
          `}
          >
            <P className="text-white text-left">참여 코드</P>
            <div className="flex flex-col gap-4">
              <div className="flex flex-row w-full gap-3">
                <div className="flex-shrink-0 flex flex-row items-center py-3 px-4 bg-[#334155] rounded-lg gap-3">
                  <Sm className="text-[#1AEBB8] font-semibold whitespace-nowrap">{sessionId}</Sm>
                  <button className="flex-shrink-0" onClick={() => copyToClipboard(sessionId)}>
                    <img src={copy_icon} alt="참여 코드 복사" className="opacity-70 hover:opacity-100 transition-opacity duration-200" />
                  </button>
                </div>
                <div className="flex-1 flex flex-row items-center py-3 px-4 bg-[#334155] rounded-lg gap-3 min-w-0">
                  <Sm className="text-[#DDDDDD] font-semibold truncate">
                    {BASE_URL}/{sessionId}
                  </Sm>
                  <button className="flex-shrink-0" onClick={() => copyToClipboard(`${BASE_URL}/${sessionId}`)}>
                    <img src={link_icon} alt="참여 링크 복사" className="opacity-70 hover:opacity-100 transition-opacity duration-200" />
                  </button>
                </div>
              </div>
              <p className="text-[#ACACAC] font-pretendard text-[10px] md:text-[12px] lg:text-[14px] text-left text-nowrap">* 회의에 초대하고 싶은 사용자에게 이 정보를 보내세요.</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-row gap-5 w-full justify-end">
        <Button variant="cancel" onClick={onClose}>
          취소
        </Button>
        <Button variant="glow" onClick={isTitleHidden ? handleJoinMeeting : handleCreateMeeting}>
          {isTitleHidden ? "참여하기" : "다음"}
        </Button>
      </div>
    </div>
  );
};
export default MeetingCreatePopup;
