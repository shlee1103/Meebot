import { usePresentationSetting } from "../../hooks/usePresentationSetting";
import { PresentationModal } from "../VideoConferenceSetting/PresentationModal";
import { CONFERENCE_STATUS } from "../../hooks/usePresentationControls";
import { useSelector } from "react-redux";
import { RootState } from "../../../stores/store";
import { ParticipantInfo } from "../../hooks/useOpenVidu";
import LeavingConfirmPopup from "../Popup/LeavingConfirmPopup";
import { useState } from "react";
import { Session } from "openvidu-browser";
import ConferenceStatusButton from "./ConferenceStatusButton";
import Timer from "./Timer";
import MicToggle from './MicToggle';
import VideoToggle from './VideoToggle';
import ControlButton from "./ControlButton";
import HandButton from "./HandButton";

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
  isSpeaking: boolean;
  changeConferenceStatus: (status: string) => void;
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
  isSpeaking,
  changeConferenceStatus,
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
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [isOpenHandList, setIsOpenHandList] = useState(false);

  const ScreenShareIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-5 h-5">
      <path d="M19 12h-2v3h-3v2h5v-5zM7 9h3V7H5v5h2V9zm14-6H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16.01H3V4.99h18v14.02z" />
    </svg>
  );

  const ScreenShareOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-5 h-5">
      <path d="M21.22 18.02l2 2H24v-2h-2.78zm.77-2l.01-10a2 2 0 0 0-2-2H7.22l5.23 5.23c.18-.04.36-.07.55-.1V7.02l4 3.73-1.58 1.47 5.54 5.54c.61-.33 1.03-.99 1.03-1.74zM2.39 1.73L1.11 3l1.54 1.54c-.4.36-.65.89-.65 1.48v10a2 2 0 0 0 2 2H0v2h18.13l2.71 2.71 1.27-1.27L2.39 1.73zM7 15.02c.31-1.48.92-2.95 2.07-4.06l1.59 1.59c-1.54.38-2.7 1.18-3.66 2.47z" />
    </svg>
  );

  const HandRaisedIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-5 h-5">
      <path d="M19.75 8c-.69 0-1.25.56-1.25 1.25V15H18c-1.65 0-3 1.35-3 3h-1c0-2.04 1.53-3.72 3.5-3.97V3.25a1.25 1.25 0 0 0-2.5 0V11h-1V1.25a1.25 1.25 0 0 0-2.5 0V11h-1V2.75a1.25 1.25 0 0 0-2.5 0V11h-1V5.75a1.25 1.25 0 0 0-2.5 0v10c0 4.56 3.69 8.25 8.25 8.25S20 20.31 20 15.75v-6.5C20 8.56 19.44 8 18.75 8z" />
    </svg>
  );

  const LeaveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-5 h-5">
      <path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
    </svg>
  );

  const toggleHandList = () => {
    setIsOpenHandList(!isOpenHandList);
  };

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
          text2: ""
        };
      }
      return {
        title: "발표회를 나가시겠습니까?",
        text1: "지금 퇴장하시면 발표 종료 후 AI가 제공하는",
        text2: "발표 요약본을 받으실 수 없습니다."
      };
    } else {
      if (isConferenceBefore) {
        return {
          title: "발표회를 취소하시겠습니까?",
          text1: "퇴장 시 대기 중인 모든 참가자가 자동으로 퇴장됩니다.",
          text2: ""
        };
      }
      return {
        title: "발표회를 종료하시겠습니까?",
        text1: "지금 퇴장하시면 발표회가 즉시 종료되며,",
        text2: "모든 참가자가 자동으로 퇴장됩니다."
      };
    }
  };

  const popupContent = getPopupContent();

  return (
    <div className="fixed bottom-0 left-0 right-0">
      <div className="flex items-center justify-between px-4">
        <div className="flex w-[350px]">
          <Timer conferenceStatus={conferenceStatus} session={session} isSpeaking={isSpeaking} />
        </div>
        
        <div className="flex-1 flex items-center justify-center gap-7 py-4">
          <MicToggle
            isEnabled={isAudioEnabled}
            onToggle={toggleAudio}
            disabled={
              (conferenceStatus === CONFERENCE_STATUS.PRESENTATION_READY ||
                conferenceStatus === CONFERENCE_STATUS.PRESENTATION_ACTIVE) &&
              role === "participant" &&
              currentPresenter?.name !== myUsername
            }
          />
          <VideoToggle
            isEnabled={isVideoEnabled}
            onToggle={toggleVideo}
          />
          <div className="flex items-center gap-4">
            <ControlButton
              onClick={amISharing ? stopScreenShare : startScreenShare}
              isActive={amISharing}
              disabled={isScreenShared && !amISharing}
            >
              {amISharing ? <ScreenShareIcon /> : <ScreenShareOffIcon />}
            </ControlButton>
            <HandButton
              onHandClick={toggleHand}
              onArrowClick={toggleHandList}
              isHandActive={isHandRaised}
              isArrowActive={isOpenHandList}
            >
              <HandRaisedIcon />
            </HandButton>
            <ControlButton
              onClick={handleLeaveClick}
              isActive={false}
              backgroundColor="#FA3C3C"
              hoverColor="#FF7272"
            >
              <LeaveIcon />
            </ControlButton>
          </div>
        </div>

        <div className="flex w-[350px] justify-end">
          {role === "admin" && (
            <div className="hidden lg:flex flex-row items-center gap-4">
              <button
                onClick={toggleModal}
                className="px-4 py-3 rounded-xl bg-[#1f2937] hover:bg-[#374151] 
                  text-white text-md font-medium transition-all duration-300 
                  border border-[#374151] hover:border-[#4B5563]
                  flex items-center gap-2 shadow-lg hover:shadow-xl font-pretendard"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                발표회 설정
              </button>
              <ConferenceStatusButton conferenceStatus={conferenceStatus} changeConferenceStatus={changeConferenceStatus} />
            </div>
          )}
        </div>
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
    </div>
  );
};

export default ControlBar;