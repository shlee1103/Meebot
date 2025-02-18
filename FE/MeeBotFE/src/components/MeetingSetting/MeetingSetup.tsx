import React, { useState } from "react";
import { Lg, Sm } from "../common/Typography";
import VideoPreview from "./VideoPreview";
import CameraButton from "./DeviceControls/CameraButton";
import MicButton from "./DeviceControls/MicButton";
import Button from "../common/Button";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setMyUsername } from "../../stores/store";

interface MeetingSetupProps {
  className?: string;
}

const MeetingSetup: React.FC<MeetingSetupProps> = ({ className }) => {
  const dispatch = useDispatch();
  const [myUserName, setMyUserName] = useState("");
  const { sessionId } = useParams();
  const [isShaking, setIsShaking] = useState(false);

  const navigate = useNavigate();

  const handleJoinClick = () => {
    if (!myUserName.trim()) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    dispatch(setMyUsername(myUserName));
    navigate(`/video-conference/${sessionId}/${myUserName}`);
  };

  return (
    <div className={`flex flex-col mx-6 md:mx-12 lg:mx-[200px] gap-6 md:gap-8 ${className} justify-center mb-20`}>
      <div className="flex flex-col gap-3 w-full">
        <Lg className="text-white font-bold">카메라와 오디오를 설정해주세요.</Lg>
        <Sm className="text-white">회의 중에도 설정이 가능합니다.</Sm>
      </div>

      {/* 미팅 제어 */}
      <div className="flex flex-col lg:flex-row w-full gap-10 lg:gap-20">
        <div className="w-full lg:w-1/2">
          <VideoPreview />
        </div>
        <div className="w-full lg:w-1/2 flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <Sm className="text-[#EEEEEE]">사용자 이름</Sm>
            <div className="flex flex-col gap-4 w-full">
              <input
                type="text"
                placeholder="사용자 이름을 입력해주세요."
                value={myUserName}
                onChange={(e) => {
                  setMyUserName(e.target.value);
                }}
                className={`
                w-full px-4 py-3 border border-[#6B4CFF] rounded-[15px]
                font-pretendard text-p-sm md:text-p-md lg:text-p-lg 
                text-[#E9E5FF] placeholder-[#E9E5FF] text-left
                bg-transparent focus:outline-none focus:ring-2 focus:ring-[#6B4CFF]
                focus:font-semibold focus:placeholder:text-transparent
                ${isShaking ? "animate-shake border-[#D84F4F]" : ""}
                `}
              />
              <p className="text-[#ACACAC] font-pretendard text-[10px] md:text-[12px] lg:text-[14px] text-left">* 사용자 이름은 화상 회의에서 다른 사용자에게 보여지는 이름과 동일합니다.</p>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row w-full gap-6 lg:gap-8">
            <div className="flex flex-col gap-2 lg:gap-4 w-full lg:w-1/2">
              <Sm className="text-[#EEEEEE]">카메라 설정</Sm>
              <CameraButton />
            </div>
            <div className="flex flex-col gap-2 lg:gap-4 w-full lg:w-1/2">
              <Sm className="text-[#EEEEEE]">오디오 설정</Sm>
              <MicButton />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-row justify-end gap-4">
        <Button variant="cancel">취소</Button>
        <Button variant="glow" onClick={handleJoinClick}>
          화상 채팅 참여
        </Button>
      </div>
    </div>
  );
};

export default MeetingSetup;
