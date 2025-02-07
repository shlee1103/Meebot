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
import startBtn from "../assets/images/start_btn.png";
import stopBtn from "../assets/images/stop_btn.png";
import { useSelector } from "react-redux";
import { RootState } from "../../stores/store";

interface ControlBarProps {
  isScreenShared: boolean;
  isHandRaised: boolean;
  isPresenting: boolean;
  toggleAudio: () => void;
  toggleVideo: () => void;
  startScreenShare: () => void;
  stopScreenShare: () => void;
  toggleHand: () => void;
  leaveSession: () => void;
  startPresenting: () => void;
  stopPresenting: () => void;
  participants: string[];
  amISharing: boolean;  
}

const ControlBar: React.FC<ControlBarProps> = ({
  isScreenShared,
  isHandRaised,
  isPresenting,
  toggleAudio,
  toggleVideo,
  startScreenShare,
  stopScreenShare,
  toggleHand,
  leaveSession,
  startPresenting,
  stopPresenting,
  participants,
  amISharing,
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

  const isAudioEnabled = useSelector((state: RootState) => state.device.isMicEnabled);
  const isVideoEnabled = useSelector((state: RootState) => state.device.isCameraEnabled);

  const handleClickPresentationButton = () => {
    if(isPresenting){
      // 발표 중단 버튼 눌렀을 때
      stopPresenting()
    } else {
      // 발표 시작 버튼 눌렀을 때
      startPresenting()
    }
  }

  return (
    <>
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-[#030b21] rounded-[5%] z-[1000]">
        <button className="p-2 border-none bg-transparent cursor-pointer" onClick={toggleAudio}>
          <img src={isAudioEnabled ? micOn : micOff} alt="Mic" className="w-6 h-6" />
        </button>
        <button className="p-2 border-none bg-transparent cursor-pointer" onClick={toggleVideo}>
          <img src={isVideoEnabled ? videoOn : videoOff} alt="Video" className="w-6 h-6" />
        </button>
        <button 
          className="p-2 border-none bg-transparent cursor-pointer" 
          onClick={amISharing ? stopScreenShare : startScreenShare}
          // 다른 사람이 공유 중일 때는 버튼 비활성화
          disabled={isScreenShared && !amISharing}
        >
          <img 
            src={amISharing ? screenShare : screenShareOff} 
            alt="Share" 
            className={`w-6 h-6 ${isScreenShared && !amISharing ? 'opacity-50' : ''}`}
          />
        </button>
        <button className="p-2 border-none bg-transparent cursor-pointer" onClick={toggleHand}>
          <img src={isHandRaised ? handsUp : handsDown} alt="Hand" className="w-6 h-6" />
        </button>
        <button className="p-2 border-none bg-transparent cursor-pointer" onClick={leaveSession}>
          <img src={leave_Session} alt="Leave" className="w-6 h-6" />
        </button>
        <button className="p-2 border-none bg-transparent cursor-pointer" onClick={toggleModal}>
          <img src={settingBtn} alt="Modal" className="w-6 h-6" />
        </button>

        {/* 발표시작 버튼 */}
        <button className="p-2 border-none bg-transparent cursor-pointer" onClick={handleClickPresentationButton}>
          <img src={isPresenting ? stopBtn : startBtn} alt="Presentation" className="w-6 h-6" />
        </button>
      </div>

      <PresentationModal
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
    </>
  );
};

export default ControlBar;
