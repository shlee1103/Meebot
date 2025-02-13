import React, { useState, useEffect, useRef } from "react";
import { useOpenVidu } from "../hooks/useOpenVidu";
import { useStreamControls } from "../hooks/useStreamControls";
import { useParticipantsSlider } from "../hooks/useParticipantsSlider";
import { useChatGPT } from "../hooks/useChatGPT";
import { CONFERENCE_STATUS, usePresentationControls } from "../hooks/usePresentationControls";
import { useNavigate, useParams } from "react-router-dom";
import { createRoom } from "../../apis/room";
import { useSelector, useDispatch } from "react-redux";
import { RootState, addRaisedHand, removeRaisedHand, clearRaisedHands, addMessage } from "../../stores/store";
import ParticipantsList from "../components/ParticipantsList";
import MainVideo from "../components/MainVideo";
import ControlBar from "../components/ControlBar";
import SideMenu from "../components/SideMenu/SideMenu";
import Timer from "../components/Timer";
import MeeU from "../components/MeeU";
import ConferenceStatusButton from "../components/ConferenceStatusButton";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingOverlay from "../components/LoadingOverlay";
import FinishPopup from "../components/Popup/FinishPopup";
import HandsupList from "../components/HandsupList";

interface QnAMessage {
  sender: string;
  text: string;
  timestamp: number;
  order: number;
}

const VideoConference: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [showFinishPopup, setShowFinishPopup] = useState<boolean>(false);
  const { sessionId, myUserName } = useParams();
  const hasShownLoading = useRef<boolean>(false);
  const isMicEnabled = useSelector((state: RootState) => state.device.isMicEnabled);
  const isCameraEnabled = useSelector((state: RootState) => state.device.isCameraEnabled);
  const isOpen = useRef(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
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

  const { conferenceStatus, setConferenceStatus, changeConferenceStatus, currentPresenter, setCurrentPresenter, resetPresenter, currentScript, setCurrentScript } = usePresentationControls(
    session,
    myUserName as string
  );

  const { isHandRaised, setIsHandRaised, toggleAudio, turnOffAudio, turnOnAudio, toggleVideo, toggleHand, startScreenShare, stopScreenShare } = useStreamControls(
    publisher,
    session,
    startScreenShareSession,
    stopScreenShareSession,
    isScreenShared,
    conferenceStatus
  );

  const { currentSlide, handlePrevSlide, handleNextSlide } = useParticipantsSlider(subscribers, isMenuOpen);

  const { speech, isSpeaking, handleConferenceStatusChange } = useChatGPT(session);

  const handleStatusChange = async (status: string) => {
    await changeConferenceStatus(status);
    await handleConferenceStatusChange(status);
  };

  useEffect(() => {
    if (session) {
      // 발표회 상태 관련 시그널
      session.on("signal:conference-status", async (event) => {
        if (event.data) {
          const data = JSON.parse(event.data);

          // 발표회 시작
          if (data.action === CONFERENCE_STATUS.PRESENTATION_READY) {
            turnOffAudio();
            setCurrentPresenter(data.presenter);
            setConferenceStatus(data.action);
            // 로딩화면을 한 번만 보여주기 위한 체크
            if (!hasShownLoading.current) {
              setIsLoading(true);
              hasShownLoading.current = true;
            }
          }

          // 관리자가 발표 시작 버튼 눌렀을 때
          if (data.action === CONFERENCE_STATUS.PRESENTATION_ACTIVE) {
            setCurrentPresenter(data.presenter);
            setConferenceStatus(data.action);

            // 현재 발표자의 마이크만 켜기
            if (data.presenter) {
              if (myUserName === data.presenter.name) {
                turnOnAudio();
              } else {
                turnOffAudio();
              }
            }
            return;
          }

          // 관리자 발표 종료 버튼 눌렀을 때
          if (data.action === CONFERENCE_STATUS.PRESENTATION_COMPLETED) {
            setConferenceStatus(data.action);
            return;
          }

          // 관리자가 질의 응답 시작 버튼 눌렀을 때
          if (data.action === CONFERENCE_STATUS.QNA_ACTIVE) {
            dispatch(clearRaisedHands());
            setIsHandRaised(false);
            setConferenceStatus(data.action);
          }

          // 관리자가 질의 응답 종료 버튼 눌렀을 때
          if (data.action === CONFERENCE_STATUS.QNA_COMPLETED) {
            dispatch(clearRaisedHands());
            setIsHandRaised(false);
            setConferenceStatus(data.action);
            turnOffAudio();
          }

          // 관리자가 발표회 종료 버튼 눌렀을 때
          if (data.action === CONFERENCE_STATUS.CONFERENCE_ENDED) {
            dispatch(clearRaisedHands());
            setIsHandRaised(false);
            resetPresenter();
            setConferenceStatus(data.action);
            setShowFinishPopup(true);
            return;
          }
        }
      });

      // 문장 구분을 위한 헬퍼 함수 추가
      const formatScript = (text: string) => {
        const patterns = [
          // 1. 문장 부호로 끝나는 경우
          /([^.!?]+[.!?]+)\s*/g,  // 기본 문장 부호

          // 2. 존댓말 종결어미
          /([^습니다]+(습니다|습니까))\s*/g,     // ~습니다, ~습니까
          /([^세요]+(세요|시죠|게요))\s*/g,      // ~세요, ~시죠, ~게요
          /([^합니다]+(합니다|할게요))\s*/g,     // ~합니다, ~할게요

          // 3. 발표 상황의 '~다' 종결어미
          /([^겠]+(겠습니다|하겠습니다))\s*/g,     // "발표하겠습니다", "말씀드리겠습니다"
          /([^니다]+(입니다|였습니다))\s*/g,      // "결과입니다", "내용이었습니다"
          /([^다]+(드리겠습니다|드렸습니다))\s*/g, // "설명드리겠습니다", "말씀드렸습니다"
          /([^다]+(됩니다|되겠습니다))\s*/g,      // "마무리됩니다", "진행되겠습니다"
          /([^다]+(보겠습니다|봤습니다))\s*/g,    // "살펴보겠습니다", "확인해봤습니다"
          /([^다]+(시작하겠습니다|마치겠습니다))\s*/g, // "시작하겠습니다", "마치겠습니다"
          /([^니다]+(있습니다|없습니다))\s*/g,    // "존재합니다", "필요없습니다"
          /([^니다]+(나타냅니다|보여줍니다))\s*/g, // "나타냅니다", "보여줍니다"

          // 4. 의문형 종결어미
          /([^나요]+(나요|까요|려고요|ㄹ까요))\s*/g,  // ~나요, ~까요, ~려고요, ~ㄹ까요

          // 5. 기타 종결어미
          /([^요]+(요|죠|네요))\s*/g,                 // ~요, ~죠, ~네요
        ];

        let formattedText = text;
        patterns.forEach(pattern => {
          formattedText = formattedText.replace(pattern, '$1\n');
        });

        return formattedText.trim();
      };

      // 시그널 핸들러 수정
      session.on("signal:stt-transcript", (event) => {
        if (event.data) {
          const { text } = JSON.parse(event.data);
          // 포맷팅된 텍스트로 설정
          const formattedText = formatScript(text);
          setCurrentScript(formattedText);
        }
      });

      // QnA 트랜스크립트 이벤트 리스너 수정
      session.on('signal:qna-transcript', (event) => {
        if (event.data) {
          const messageData: QnAMessage = JSON.parse(event.data);
          dispatch(addMessage(messageData));
        }
      });
    }
  }, [session, turnOffAudio, myUserName]);

  useEffect(() => {
    if (!isOpen.current) {
      joinSession(sessionId as string, isCameraEnabled, isMicEnabled);
      createRoom(sessionId as string, myUserName as string, localStorage.getItem("email") as string);
      isOpen.current = true;
    }

    const onBeforeUnload = () => {
      leaveSession();
    };

    const onPopState = () => {
      leaveSession();
      navigate("/");
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    window.addEventListener("popstate", onPopState);

    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.addEventListener("popstate", onPopState);
    };
  }, [leaveSession]);

  // 손들기 로직입니다
  useEffect(() => {
    if (!session) return;

    if (conferenceStatus === CONFERENCE_STATUS.QNA_COMPLETED) {
      dispatch(clearRaisedHands());
      setIsHandRaised(false);
    }

    const handleHandUpSignal = (event: any) => {
      if (event.data) {
        try {
          const data = JSON.parse(event.data);
          if (data.isRaising) {
            dispatch(
              addRaisedHand({
                connectionId: event.from.connectionId,
                userName: data.userName,
              })
            );
          } else {
            dispatch(removeRaisedHand(event.from.connectionId));
          }
        } catch (error) {
          console.log("에러 발생:", error);
        }
      }
    };

    session.on("signal:handup", handleHandUpSignal);

    return () => {
      session.off("signal:handup", handleHandUpSignal);
    };
  }, [session, conferenceStatus]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#171f2e]">
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="dark" />
      <div className="flex flex-1 min-h-0">
        <div className={`flex flex-col transition-all duration-300 ease-in-out ${isMenuOpen ? "w-[calc(100%-380px)]" : "w-full"}`}>
          <div className="flex-none">
            <ParticipantsList subscribers={subscribers} currentSlide={currentSlide} isMenuOpen={isMenuOpen} handlePrevSlide={handlePrevSlide} handleNextSlide={handleNextSlide} />
          </div>
          <div className="flex-1 min-h-0">
            <MainVideo mainStreamManager={mainStreamManager} />
          </div>
          <div className="flex flex-none justify-between items-center">
            <MeeU speech={speech} />
            <HandsupList conferenceStatus={conferenceStatus} />
          </div>
          <div className="flex justify-between items-center p-2 flex-none">
            <Timer conferenceStatus={conferenceStatus} session={session} isSpeaking={isSpeaking} />
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
              conferenceStatus={conferenceStatus}
              amISharing={amISharing}
              currentPresenter={currentPresenter}
            />
            <ConferenceStatusButton conferenceStatus={conferenceStatus} changeConferenceStatus={handleStatusChange} />
          </div>
        </div>
        <SideMenu
          isMenuOpen={isMenuOpen}
          sessionId={sessionId as string}
          participants={participants}
          onToggle={() => setIsMenuOpen(!isMenuOpen)}
          conferenceStatus={conferenceStatus}
          currentPresenter={currentPresenter}
          currentScript={currentScript}
          myUserName={myUserName as string}
          messages={messages}
          sendMessage={sendMessage}
        />
      </div>

      {/* LoadingOverlay를 마지막에 렌더링하여 최상단에 위치하도록 함 */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] pointer-events-auto">
          <LoadingOverlay
            onLoadingComplete={() => {
              setIsLoading(false);
            }}
          />
        </div>
      )}

      <FinishPopup isOpen={showFinishPopup} onClose={() => setShowFinishPopup(false)}></FinishPopup>
    </div>
  );
};

export default VideoConference;
