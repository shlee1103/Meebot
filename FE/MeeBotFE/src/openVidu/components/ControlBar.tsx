import { usePresentationSetting } from "../hooks/usePresentationSetting";
import { PresentationModal } from "./PresentationModal";
import micOn from "../assets/images/mic_on.png";
import micOff from "../assets/images/mic_off.png";
import videoOn from "../assets/images/video_on.png";
import videoOff from "../assets/images/video_off.png";
import screenShare from "../assets/images/screen_share.png";
import screenShareOff from "../assets/images/screen_share_off.png";
import handsUp from "../assets/images/hands_up.png";
import handsDown from "../assets/images/hands_down.png";
import leave_Session from "../assets/images/leave_session.png";
import settingBtn from "../assets/images/setting_btn.png";
import { CONFERENCE_STATUS } from "../hooks/usePresentationControls";
import { useSelector } from "react-redux";
import { RootState } from "../../stores/store";
import { ParticipantInfo } from "../hooks/useOpenVidu";
import LeavingConfirmPopup from "./Popup/LeavingConfirmPopup";
import { useState } from "react";
import { Session } from "openvidu-browser";

interface ControlBarProps {
  session: Session | undefined;
  isScreenShared: boolean;
  isHandRaised: boolean;
  toggleAudio: () => void;
  toggleVideo: () => void;
  startScreenShare: () => void;
  stopScreenShare: () => void;
  toggleHand: () => void;
  leaveSession: () => void;
  participants: ParticipantInfo[];
  conferenceStatus: string;
  amISharing: boolean;
  currentPresenter: ParticipantInfo | null;
}

const ControlBar: React.FC<ControlBarProps> = ({
  session,
  isScreenShared,
  isHandRaised,
  toggleAudio,
  toggleVideo,
  startScreenShare,
  stopScreenShare,
  toggleHand,
  leaveSession,
  participants,
  amISharing,
  conferenceStatus,
  currentPresenter,
}) => {
  const {
    isModalOpen,
    presentationTime,
    setPresentationTime,
    qnaTime,
    setQnATime,
    selectedSpeakers,
    presentersOrder,
    handleSpeakerSelect,
    handleSpeakerRemove,
    handleDragEnd,
    cancelModal,
    toggleModal,
    randomizeSpeakersOrder,
  } = usePresentationSetting();

  const myUsername = useSelector((state: RootState) => state.myUsername.myUsername);
  const role = useSelector((state: RootState) => state.role.role);
  const isAudioEnabled = useSelector((state: RootState) => state.device.isMicEnabled);
  const isVideoEnabled = useSelector((state: RootState) => state.device.isCameraEnabled);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const handleLeaveClick = () => {
    setShowLeaveConfirm(true);
  };

  const getPopupContent = () => {
    const isConferenceBefore = conferenceStatus === CONFERENCE_STATUS.CONFERENCE_WAITING;

    if (role === "participant") {
      if (isConferenceBefore) {
        return {
          title: "발표회를 나가시겠습니까?",
          text1: "",
          text2: "",
        };
      }
      return {
        title: "발표회를 나가시겠습니까?",
        text1: "지금 퇴장하시면 발표 종료 후 AI가 제공하는",
        text2: "발표 요약본을 받으실 수 없습니다.",
      };
    } else {
      if (isConferenceBefore) {
        return {
          title: "발표회를 취소하시겠습니까?",
          text1: "퇴장 시 대기 중인 모든 참가자가 자동으로 퇴장됩니다.",
          text2: "",
        };
      }
      return {
        title: "발표회를 종료하시겠습니까?",
        text1: "지금 퇴장하시면 발표회가 즉시 종료되며,",
        text2: "모든 참가자가 자동으로 퇴장됩니다.",
      };
    }
  };

  const popupContent = getPopupContent();

  return (
    <>
      <div className="flex px-6 py-3 bg-[#030b21] rounded-[5%]">
        {/* 마이크 버튼 */}
        <button
          onClick={toggleAudio}
          disabled={
            (conferenceStatus === CONFERENCE_STATUS.PRESENTATION_READY || conferenceStatus === CONFERENCE_STATUS.PRESENTATION_ACTIVE) && role === "participant" && currentPresenter?.name !== myUsername
          }
          className="p-2 border-none bg-transparent cursor-pointer"
        >
          <img src={isAudioEnabled ? micOn : micOff} alt="Mic" className="w-6 h-6" />
        </button>
        {/* 비디오 버튼 */}
        <button className="p-2 border-none bg-transparent cursor-pointer" onClick={toggleVideo}>
          <img src={isVideoEnabled ? videoOn : videoOff} alt="Video" className="w-6 h-6" />
        </button>
        <button
          className="p-2 border-none bg-transparent cursor-pointer"
          onClick={amISharing ? stopScreenShare : startScreenShare}
          disabled={isScreenShared && !amISharing} // 다른 사람이 공유 중일 때는 버튼 비활성화
        >
          <img src={amISharing ? screenShare : screenShareOff} alt="Share" className={`w-6 h-6 ${isScreenShared && !amISharing ? "opacity-50" : ""}`} />
        </button>
        {/* 손들기 버튼 */}
        <button className="p-2 border-none bg-transparent cursor-pointer" onClick={toggleHand}>
          <img src={isHandRaised ? handsUp : handsDown} alt="Hand" className="w-6 h-6" />
        </button>
        {/* 나가기 버튼 */}
        <button className="p-2 border-none bg-transparent cursor-pointer" onClick={handleLeaveClick}>
          <img src={leave_Session} alt="Leave" className="w-6 h-6" />
        </button>
        {/* 발표회 설정 버튼 */}
        <button className="p-2 border-none bg-transparent cursor-pointer" onClick={toggleModal}>
          <img src={settingBtn} alt="Modal" className="w-6 h-6" />
        </button>
      </div>

      <PresentationModal
        session={session}
        isOpen={isModalOpen}
        presentationTime={presentationTime}
        setPresentationTime={setPresentationTime}
        qnaTime={qnaTime}
        setQnATime={setQnATime}
        selectedSpeakers={selectedSpeakers}
        presentersOrder={presentersOrder}
        participants={participants}
        onSpeakerSelect={handleSpeakerSelect}
        onSpeakerRemove={handleSpeakerRemove}
        onDragEnd={handleDragEnd}
        onCancel={cancelModal}
        onConfirm={toggleModal}
        onRandomize={randomizeSpeakersOrder}
      />

      <LeavingConfirmPopup
        isOpen={showLeaveConfirm}
        onCancel={() => setShowLeaveConfirm(false)}
        onConfirm={leaveSession}
        popupTitle={popupContent.title}
        popupText1={popupContent.text1}
        popupText2={popupContent.text2}
      />
    </>
  );
};

export default ControlBar;
