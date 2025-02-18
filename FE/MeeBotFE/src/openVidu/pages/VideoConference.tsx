import React, { useState, useEffect, useRef } from "react";
import { useOpenVidu } from "../hooks/useOpenVidu";
import { useStreamControls } from "../hooks/useStreamControls";
import { useParticipantsSlider } from "../hooks/useParticipantsSlider";
import { useChatGPT } from "../hooks/useChatGPT";
import { CONFERENCE_STATUS, usePresentationControls } from "../hooks/usePresentationControls";
import { useNavigate, useParams } from "react-router-dom";
import { createRoom, saveParticipants } from "../../apis/room";
import { useSelector, useDispatch } from "react-redux";
import { RootState, setMeetingTitle, setPresentationTime, setQnATime, updateSpeakersOrder, addRaisedHand, removeRaisedHand, clearRaisedHands, addMessage } from "../../stores/store";
import ParticipantsList from "../components/ParticipantsList";
import MainVideo from "../components/MainVideo";
import ControlBar from "../components/ControlBar/ControlBar";
import SideMenu from "../components/SideMenu/SideMenu";
import MeeU from "../components/MeeU";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingOverlay from "../components/LoadingOverlay";
import FinishPopup from "../components/Popup/FinishPopup";
import BackgroundGradients from "../../components/common/BackgroundGradients";
import { saveSummary } from "../../apis/storage";
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
  const updateParticipantsState = useOpenVidu().updateParticipantState;

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

  const { accumulatedScript, conferenceStatus, setConferenceStatus, changeConferenceStatus, currentPresenter, setCurrentPresenter, resetPresenter, setCurrentScript, currentPresentationData } =
    usePresentationControls(session, myUserName as string);

  const { isHandRaised, setIsHandRaised, toggleAudio, turnOffAudio, turnOnAudio, toggleVideo, toggleHand, startScreenShare, stopScreenShare } = useStreamControls(
    publisher,
    session,
    startScreenShareSession,
    stopScreenShareSession,
    isScreenShared,
    conferenceStatus,
    updateParticipantsState
  );

  const { currentSlide, handlePrevSlide, handleNextSlide } = useParticipantsSlider(subscribers, isMenuOpen);

  const { speech, isSpeaking, handleConferenceStatusChange, currentSentence } = useChatGPT(session, currentPresentationData);

  const handleStatusChange = async (status: string) => {
    await changeConferenceStatus(status);

    if (status === CONFERENCE_STATUS.CONFERENCE_WAITING && !hasShownLoading.current) {
      setIsLoading(true);
      hasShownLoading.current = true;
    } else {
      await handleConferenceStatusChange(status);
    }
  };

  // LoadingOverlay 완료 후 실행될 콜백
  const handleLoadingComplete = async () => {
    setIsLoading(false);
    await handleConferenceStatusChange(CONFERENCE_STATUS.CONFERENCE_WAITING);
  };


  useEffect(() => {
    if (!session) return;

    const handleConferenceStatus = async (event: any) => {
      if (!event.data) return;

      const data = JSON.parse(event.data);

      // 발표회 시작
      if (data.action === CONFERENCE_STATUS.PRESENTATION_READY) {
        turnOffAudio();
        setCurrentPresenter(data.presenter);
        setConferenceStatus(data.action);

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
        console.log("발표회 종료 후 출력");

        if (session?.connection?.connectionId === event.from?.connectionId) {
          try {
            const emails = (participants ?? [])
              .map(participant => participant.email)
              .filter((email): email is string => email !== undefined && email !== null);

            console.log("emails", emails);

            // API 호출
            const result = await saveParticipants(sessionId as string, emails);
            console.log("result", result);

            const summary = await saveSummary(sessionId as string);
            console.log("summary", summary);
          } catch (error) {
            console.error("발표회 종료 처리 중 오류 발생 : ", error);
          }
        }

        dispatch(clearRaisedHands());
        setIsHandRaised(false);
        resetPresenter();
        setConferenceStatus(data.action);
        setShowFinishPopup(true);
        return;
      }
    };

    // 문장 구분을 위한 헬퍼 함수 추가
    const formatScript = (text: string) => {
      const patterns = [
        // 1. 문장 부호로 끝나는 경우 (Basic punctuation)
        /([^.!?]+[.!?]+)\s*/g, // 기본 문장 부호

        // 2. 존댓말 (Formal) 종결어미
        /([^습니다]+(습니다|습니까))\s*/g, // ~습니다, ~습니까
        /([^세요]+(세요|시죠|게요))\s*/g, // ~세요, ~시죠, ~게요
        /([^데]+(데요|데))\s*/g, // ~데요, ~데
        /([^합니다]+(합니다|할게요))\s*/g, // ~합니다, ~할게요
        /([^니다]+(입니다|입니까))\s*/g, // ~입니다, ~입니까
        /([^시]+(시옵니다|시겠습니다))\s*/g, // ~시옵니다, ~시겠습니다
        /([^니다]+(으시겠습니다|시었습니다))\s*/g, // ~으시겠습니다, ~시었습니다

        // 3. 발표/공식 상황의 정중한 종결어미 (Formal presentation endings)
        /([^겠]+(겠습니다|하겠습니다))\s*/g, // "발표하겠습니다", "말씀드리겠습니다"
        /([^니다]+(입니다|였습니다))\s*/g, // "결과입니다", "내용이었습니다"
        /([^다]+(드리겠습니다|드렸습니다))\s*/g, // "설명드리겠습니다", "말씀드렸습니다"
        /([^다]+(됩니다|되겠습니다))\s*/g, // "마무리됩니다", "진행되겠습니다"
        /([^다]+(보겠습니다|봤습니다))\s*/g, // "살펴보겠습니다", "확인해봤습니다"
        /([^다]+(시작하겠습니다|마치겠습니다))\s*/g, // "시작하겠습니다", "마치겠습니다"
        /([^니다]+(있습니다|없습니다))\s*/g, // "존재합니다", "필요없습니다"
        /([^니다]+(나타냅니다|보여줍니다))\s*/g, // "나타냅니다", "보여줍니다"
        /([^다]+(하였습니다|했었습니다))\s*/g, // "진행하였습니다", "설명했었습니다"
        /([^다]+(주시겠습니다|맡기겠습니다))\s*/g, // "도와주시겠습니다", "맡기겠습니다"
        /([^다]+(되었습니다|이루어졌습니다))\s*/g, // "완료되었습니다", "이루어졌습니다"

        // 4. 의문형 종결어미 (Question endings)
        // 4-1. 존댓말 의문형
        /([^나요]+(나요|까요|려고요|ㄹ까요))\s*/g, // ~나요, ~까요, ~려고요, ~ㄹ까요
        /([^닙]+(ㄴ가요|인가요))\s*/g, // ~ㄴ가요, ~인가요
        /([^까]+(을까요|할까요))\s*/g, // ~을까요, ~할까요
        /([^요]+(은가요|는가요))\s*/g, // ~은가요, ~는가요
        /([^요]+(실까요|으실까요))\s*/g, // ~실까요, ~으실까요
        /([^요]+(신가요|으신가요))\s*/g, // ~신가요, ~으신가요

        // 4-2. 반말 의문형
        /([^나]+(나|니))\s*/g, // ~나, ~니
        /([^까]+(까))\s*/g, // ~까
        /([^냐]+(니|냐|나))\s*/g, // ~니, ~냐, ~나
        /([^랴]+(랴|랴고))\s*/g, // ~랴, ~랴고 (의문/반문)

        // 5. 일반 존댓말 종결어미 (General formal endings)
        /([^요]+(요|죠|네요))\s*/g, // ~요, ~죠, ~네요
        /([^데]+(ㄴ데요|은데요|는데요))\s*/g, // ~ㄴ데요, ~은데요, ~는데요
        /([^거]+(거든요|걸요|게요))\s*/g, // ~거든요, ~걸요, ~게요
        /([^아]+(아요|어요|에요|예요))\s*/g, // ~아요, ~어요, ~에요, ~예요
        /([^요]+(시네요|으시네요))\s*/g, // ~시네요, ~으시네요
        /([^요]+(답니다요|답니까요))\s*/g, // ~답니다요, ~답니까요

        // 6. 반말 종결어미 (Informal endings)
        // 6-1. 기본 반말
        /([^어]+(어|아))\s*/g, // ~어, ~아
        /([^다]+(했다|한다|하겠다))\s*/g, // ~했다, ~한다, ~하겠다
        /([^야]+(해|봐|줘))\s*/g, // ~해, ~봐, ~줘
        /([^어]+(어|었어|았어))\s*/g, // ~어, ~었어, ~았어
        /([^지]+(지|찌|징))\s*/g, // ~지, ~찌, ~징
        /([^ㄴ]+(ㄴ다|는다))\s*/g, // ~ㄴ다, ~는다 (서술형)

        // 6-2. 명령/제안형 반말
        /([^자]+(자|쟈|장))\s*/g, // ~자, ~쟈, ~장
        /([^ㄹ]+(ㄹ게|ㄹ래))\s*/g, // ~ㄹ게, ~ㄹ래
        /([^어]+(어라|아라))\s*/g, // ~어라, ~아라 (명령형)

        // 6-3. 기타 반말
        /([^네]+(네|네요))\s*/g, // ~네, ~네요
        /([^든]+(든|는데|은데))\s*/g, // ~든, ~는데, ~은데
        /([^다]+(됐다|된다|될까))\s*/g, // ~됐다, ~된다, ~될까

        // 7. 감탄/감정 종결어미 (Exclamatory endings)
        /([^군]+(군요|구나|군))\s*/g, // ~군요, ~구나, ~군
        /([^네]+(네요|네|냐))\s*/g, // ~네요, ~네, ~냐
        /([^다]+(답니다|다네|다나))\s*/g, // ~답니다, ~다네, ~다나
        /([^아]+(와|워|봐))\s*/g, // ~와, ~워, ~봐
        /([^아]+(구려|는걸|로구나))\s*/g, // ~구려, ~는걸, ~로구나

        // 8. 추측/의견 종결어미 (Conjecture/Opinion endings)
        /([^것]+(것같아요|것같습니다))\s*/g, // ~것같아요, ~것같습니다
        /([^듯]+(듯해요|듯합니다))\s*/g, // ~듯해요, ~듯합니다
        /([^까]+(ㄹ까요|ㄹ텐데요))\s*/g, // ~ㄹ까요, ~ㄹ텐데요
        /([^데]+(ㄹ텐데|을텐데|할텐데))\s*/g, // ~ㄹ텐데, ~을텐데, ~할텐데
        /([^요]+(겠죠|시겠죠|으시겠죠))\s*/g, // ~겠죠, ~시겠죠, ~으시겠죠

        // 9. 비격식 종결어미 (Casual endings)
        /([^다]+(이다|예요|에요))\s*/g, // ~이다, ~예요, ~에요
        /([^야]+(이야|야|라야))\s*/g, // ~이야, ~야, ~라야
        /([^든]+(든지|던데|더라))\s*/g, // ~든지, ~던데, ~더라
        /([^라]+(더라고|잖아|라고))\s*/g, // ~더라고, ~잖아, ~라고
        /([^아]+(다고|래요|라며))\s*/g, // ~다고, ~래요, ~라며

        // 10. 특수 종결어미 (Special endings)
        /([^네]+(네용|니당|넹))\s*/g, // ~네용, ~니당, ~넹 (귀여운 말투)
        /([^다]+(됭|됨|됨당))\s*/g, // ~됭, ~됨, ~됨당 (귀여운 말투)
        /([^요]+(여요|예용|욤))\s*/g, // ~여요, ~예용, ~욤 (귀여운 말투)
        /([^ㅁ]+(ㅁ))\s*/g, // ~ㅁ (명사형 전환)
        /([^게]+(게나|거나|건가))\s*/g, // ~게나, ~거나, ~건가
        /([^면]+(면서|므로|면됨))\s*/g, // ~면서, ~므로, ~면됨ㅍ

        // 11. 연결어미
        /([^고]+(고))\s*/g, // ~고 (연결어미, 예: "가고 싶어요")
        /([^면]+(면))\s*/g, // ~면 (조건, 예: "가면 좋아요")
        /([^아서]+(아서|아서요))\s*/g, // ~아서/아서요 (원인, 예: "가서 먹었어요")
        /([^부터]+(부터))\s*/g, // ~부터 (시간적 순서, 예: "이제부터 할 거예요")

        // 12. 존댓말의 간접 표현
        /([^을]+(을|를))\s*/g, // ~을/를 (목적어, 예: "책을 읽어요")
        /([^도]+(도))\s*/g, // ~도 (대상, 예: "나도 가요")

        // 13. 명령형 연결어미
        /([^시]+(시|시오))\s*/g, // ~시/시오 (명령형, 예: "가시요")

        // 14. 추측형 연결어미
        /([^겠]+(겠|겠어요))\s*/g, // ~겠/겠어요 (추측, 예: "하겠어요")
      ];

      let formattedText = text;
      patterns.forEach((pattern) => {
        formattedText = formattedText.replace(pattern, "$1");
      });

      return formattedText.trim();
    };

    // 시그널 핸들러 수정
    session.on("signal:stt-transcript", (event) => {
      if (event.data) {
        const { text } = JSON.parse(event.data);
        const formattedText = formatScript(text);
        setCurrentScript(formattedText);
      }
    });

    // 프레젠테이션 세팅에 대한 시그널
    session.on("signal:presentation-setting", (event) => {
      if (event.data) {
        const { qnaTime, presentationTime, presentersOrder } = JSON.parse(event.data);
        dispatch(setQnATime(qnaTime));
        dispatch(setPresentationTime(presentationTime));
        dispatch(updateSpeakersOrder(presentersOrder));
      }
    });

    // 방제목 변경 시그널
    session.on("signal:meeting-title-change", (event) => {
      if (event.data) {
        const { title } = JSON.parse(event.data);
        dispatch(setMeetingTitle(title));
      }
    });

    // 프레젠테이션 세팅에 대한 시그널
    session.on("signal:presentation-setting", (event) => {
      if (event.data) {
        const { qnaTime, presentationTime, presentersOrder } = JSON.parse(event.data);
        dispatch(setQnATime(qnaTime));
        dispatch(setPresentationTime(presentationTime));
        dispatch(updateSpeakersOrder(presentersOrder));
      }
    });

    // 방제목 변경 시그널
    session.on("signal:meeting-title-change", (event) => {
      if (event.data) {
        const { title } = JSON.parse(event.data);
        dispatch(setMeetingTitle(title));
      }
    });

    // QnA 트랜스크립트 이벤트 리스너 수정
    session.on("signal:qna-transcript", (event) => {
      if (event.data) {
        const messageData: QnAMessage = JSON.parse(event.data);
        dispatch(addMessage(messageData));
      }
    });

    // 발표회 상태 관련 시그널
    session.on("signal:conference-status", handleConferenceStatus);
    return () => {
      session.off("signal:conference-status", handleConferenceStatus);
    };
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
      <BackgroundGradients />

      <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="dark" />

      <div className="flex flex-1 min-h-0 z-10">
        <div className={`flex flex-col transition-all duration-300 ease-in-out pb-20 ${isMenuOpen ? "lg:w-[calc(100%-380px)]" : "lg:w-full"}`}>
          <div className="flex-none hidden lg:block md:block">
            <ParticipantsList subscribers={subscribers} currentSlide={currentSlide} isMenuOpen={isMenuOpen} handlePrevSlide={handlePrevSlide} handleNextSlide={handleNextSlide} />
          </div>
          <div className="flex-1 min-h-0">
            <MainVideo mainStreamManager={mainStreamManager} />
          </div>
          <div className="flex-none hidden lg:block md:block">
            <MeeU speech={speech} currentSentence={currentSentence} />
          </div>
        </div>
        <div className="pb-20">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`fixed top-[50%] right-0 transform -translate-y-1/2
              w-7 h-28 
              bg-[#111827] hover:bg-[#1f2937]
              transition-all duration-300 ease-in-out
              items-center justify-center
              border-y border-l border-[#1f2937]
              rounded-l-full
              cursor-pointer
              shadow-[-4px_0px_12px_-2px_rgba(0,0,0,0.3)]
              hidden lg:flex
              ${isMenuOpen ? "right-[380px]" : "right-0"}`}
          >
            <span className={`w-5 h-5 transition-transform duration-300 ease-in-out ${isMenuOpen ? "rotate-180" : ""}`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#6B4CFF"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-90 hover:opacity-100 transition-opacity"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </span>
          </button>
          <div className="pb-20 hidden lg:block">
            <SideMenu
              isMenuOpen={isMenuOpen}
              sessionId={sessionId as string}
              session={session}
              participants={participants}
              conferenceStatus={conferenceStatus}
              currentPresenter={currentPresenter}
              accumulatedScript={accumulatedScript}
              myUserName={myUserName as string}
              messages={messages}
              sendMessage={sendMessage}
            />
          </div>
        </div>
      </div>

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
        session={session}
        isSpeaking={isSpeaking}
        changeConferenceStatus={handleStatusChange}
      />

      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] pointer-events-auto">
          <LoadingOverlay onLoadingComplete={handleLoadingComplete} />
        </div>
      )}

      <FinishPopup isOpen={showFinishPopup} onClose={() => setShowFinishPopup(false)} leaveSession={leaveSession}></FinishPopup>
    </div>
  );
};

export default VideoConference;
