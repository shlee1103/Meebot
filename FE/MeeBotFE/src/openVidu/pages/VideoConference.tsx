import React, { useState, useEffect, useRef } from "react";
import { useOpenVidu } from "../hooks/useOpenVidu";
import { useStreamControls } from "../hooks/useStreamControls";
import { useParticipantsSlider } from "../hooks/useParticipantsSlider";
import { usePresentationControls } from "../hooks/usePresentationControls";
import ParticipantsList from "../components/ParticipantsList";
import MainVideo from "../components/MainVideo";
import ControlBar from "../components/ControlBar";
import SideMenu from "../components/SideMenu/SideMenu";
import { useParams } from "react-router-dom";
import { createRoom } from "../../apis/room";
import { useSelector } from "react-redux";
import { RootState } from "../../stores/store";

const VideoConference: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const { sessionId, myUserName } = useParams();
  const isMicEnabled = useSelector((state: RootState) => state.device.isMicEnabled);
  const isCameraEnabled = useSelector((state: RootState) => state.device.isCameraEnabled);

  const {
    mySessionId,
    session,
    mainStreamManager,
    publisher,
    subscribers,
    joinSession,
    leaveSession,
    participants,
    startScreenShare: startScreenShareSession,
    stopScreenShare: stopScreenShareSession,
    isScreenShared,
    amISharing,
    messages,
    sendMessage,
  } = useOpenVidu();

  const {
    isHandRaised,
    toggleAudio,
    toggleVideo,
    toggleHand,
    startScreenShare,
    stopScreenShare,
  } = useStreamControls(
    publisher,
    session,
    startScreenShareSession,
    stopScreenShareSession,
    isScreenShared
  );

  const {
    currentSlide,
    handlePrevSlide,
    handleNextSlide
  } = useParticipantsSlider(subscribers, isMenuOpen);

  const isOpen = useRef(false);

  const {
    isPresenting,
    setIsPresenting,
    startPresenting,
    stopPresenting,
    currentPresenter,
    setCurrentPresenter,
    resetPresenter,
    currentScript,
    setCurrentScript,
    sendJSONToServer
  } = usePresentationControls(session, myUserName as string);

  useEffect(() => {
    if (session) {
      // 발표 시작 및 종료 시 이벤트 처리
      session.on('signal:presentation-status', (event) => {
        if (event.data) { // typescript 때문에 넣는 if
          const data = JSON.parse(event.data);

          // 발표 시작 
          if (data.action === 'start') {
            setCurrentPresenter(data.presenter) // 발표자 정보 설정
            setIsPresenting(myUserName === data.presenter)  // 다른 사람이 발표 시작하면 내 발표 상태 false
          }
          // 발표 종료
          else if (data.action === 'end') {
            resetPresenter() // 발표자 정보 초기화
            setIsPresenting(false)
          }
        }
      });

      // 실시간 스크립트 이벤트 처리
      session.on('signal:stt-transcript', (event) => {
        if (event.data) { // typescript 때문에 넣는 if
          const { text } = JSON.parse(event.data);
          setCurrentScript(text)
        }
      });

    }
  }, [session, myUserName, sendJSONToServer])

  useEffect(() => {
    console.log("발표자 변경", currentPresenter)
  }, [currentPresenter])

  useEffect(() => {
    if (!isOpen.current) {
      console.log('joinSession 비디오, 오디오', isCameraEnabled, isMicEnabled)
      joinSession(sessionId as string, isCameraEnabled, isMicEnabled)
      createRoom(sessionId as string, myUserName as string, localStorage.getItem('email') as string)
      isOpen.current = true;
    }

    const onBeforeUnload = () => {
      leaveSession();
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [leaveSession, isMicEnabled, isCameraEnabled]); // 의존성 배열에 추가

  return (
    <div className="w-screen h-screen overflow-hidden relative bg-[#171f2e]">
      <div className="flex">

        <div className={`flex flex-col transition-all duration-300 ease-in-out ${isMenuOpen ? 'w-4/5' : 'w-full'}`}>
          <ParticipantsList
            subscribers={subscribers}
            currentSlide={currentSlide}
            isMenuOpen={isMenuOpen}
            handlePrevSlide={handlePrevSlide}
            handleNextSlide={handleNextSlide}
          />

          <MainVideo mainStreamManager={mainStreamManager} />

            <ControlBar
              isScreenShared={isScreenShared}
              isHandRaised={isHandRaised}
              toggleAudio={toggleAudio}
              toggleVideo={toggleVideo}
              startScreenShare={startScreenShare}
              stopScreenShare={stopScreenShare}
              toggleHand={toggleHand}
              leaveSession={leaveSession}
              participants={participants}
              isPresenting={isPresenting}
              startPresenting={startPresenting}
              stopPresenting={stopPresenting}
              amISharing={amISharing}
            />
          </div>

          <SideMenu
            isMenuOpen={isMenuOpen}
            sessionId={mySessionId}
            participants={participants}
            onToggle={() => setIsMenuOpen(!isMenuOpen)}
            isPresenting={isPresenting}
            currentPresenter={currentPresenter}
            currentScript={currentScript}
            myUserName={myUserName as string}
            messages={messages}
            sendMessage={sendMessage}
          />
        </div>
    </div>
  );
};

export default VideoConference;