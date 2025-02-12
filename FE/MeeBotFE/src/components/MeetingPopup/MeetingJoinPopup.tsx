import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setRole } from "../../stores/store";
import { H3, P } from "../common/Typography";
import Button from "../common/Button";
import { checkSessionId } from "../../apis/room";

interface MeetingJoinPopupProps {
  onClose: () => void;
}

const MeetingJoinPopup: React.FC<MeetingJoinPopupProps> = ({ onClose }) => {
  const [sessionId, setSessionId] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const [isValid, setIsValid] = useState(true);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleJoinMeeting = async () => {
    if (!sessionId.trim()) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 300);
      return;
    }

    const valid = await checkSessionId(sessionId);
    if (!valid) {
      setIsValid(false);
      return;
    }

    dispatch(setRole("participant"));
    navigate(`/meeting-setting/${sessionId}`);
    onClose();

    dispatch(setRole("participant"));
    navigate(`/meeting-setting/${sessionId}`);
    onClose();
  };

  return (
    <div className="flex flex-col px-16 py-16 gap-6 items-center">
      <H3 className="text-white w-full text-nowrap text-center">화상 모임 참여하기</H3>
      <div className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="화상 코드를 입력해주세요."
          value={sessionId}
          onChange={(e) => {
            setSessionId(e.target.value);
            setIsShaking(false);
          }}
          className={`
          w-full px-12 py-4 border border-[#6B4CFF] rounded-[34px]
          font-pretendard text-sm-sm md:text-sm-md lg:text-sm-lg
          text-[#1AEBB8] placeholder-[#E9E5FF] text-center
          bg-transparent focus:outline-none focus:ring-2 focus:ring-[#6B4CFF]
          focus:font-semibold focus:placeholder:text-transparent
          ${isShaking ? "animate-shake border-[#D84F4F]" : ""}
          ${!isValid ? "animate-shake border-[#D84F4F]" : ""}
          `}
        />
      </div>
      {!isValid && <P className="text-[#D84F4F] text-center">유효하지 않은 초대 코드입니다.</P>}
      <div className="flex flex-row gap-5 items-center">
        <Button variant="cancel" onClick={onClose}>
          취소
        </Button>
        <Button variant="glow" onClick={handleJoinMeeting}>
          참여하기
        </Button>
      </div>
    </div>
  );
};
export default MeetingJoinPopup;
