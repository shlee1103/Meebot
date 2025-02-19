import { useEffect, useState, useRef } from "react";
import { Session } from "openvidu-browser";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { useSelector, useDispatch } from "react-redux";
import { addMessage, incrementGlobalOrder, resetQnA, RootState, setCurrentPresenterIndex } from "../../stores/store";
import { interimSummarize, QnARequest, saveQnA } from "../../apis/chatGpt";
import ChatMEEU from "../../assets/chatMeeU.png";
import { ParticipantInfo } from "./useOpenVidu";

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// 발표회 상태
export const CONFERENCE_STATUS = {
  CONFERENCE_WAITING: "발표회 시작 전",
  PRESENTATION_READY: "발표 시작 전",
  PRESENTATION_ACTIVE: "발표 중",
  PRESENTATION_COMPLETED: "발표 끝",
  QNA_READY: "질의응답 전",
  QNA_ACTIVE: "질의응답 중",
  QNA_COMPLETED: "질의응답 끝",
  CONFERENCE_ENDED: "발표회 종료",
};

interface QnAMessage {
  sender: string;
  text: string;
  timestamp: number;
  order: number;
}

interface PresentationData {
  presenter: string | null;
  presentation_order: number;
  roomCode: string;
  startTime: string;
  endTime: string;
  transcripts: string;
}

// 발표 기능 제어 관리
export const usePresentationControls = (session: Session | undefined, myUserName: string) => {
  const [currentPresenter, setCurrentPresenter] = useState<ParticipantInfo | null>(null);
  const [currentScript, setCurrentScript] = useState<string>("");
  const prevTranscriptRef = useRef<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [conferenceStatus, setConferenceStatus] = useState(CONFERENCE_STATUS.CONFERENCE_WAITING);
  const [currentPresentationData, setCurrentPresentationData] = useState<PresentationData | null>(null);
  const [accumulatedScript, setAccumulatedScript] = useState<string>("");
  const prevFinalTranscriptRef = useRef<string>("");
  const { transcript, resetTranscript, finalTranscript } = useSpeechRecognition();
  const dispatch = useDispatch();
  const currentPresenterIndex = useSelector((state: RootState) => state.presentation.currentPresenterIndex);
  const presentersOrder = useSelector((state: RootState) => state.presentation.presentersOrder);
  const isMicEnabled = useSelector((state: RootState) => state.device.isMicEnabled);
  const globalOrder = useSelector((state: RootState) => state.qna.globalOrder);
  const qnaMessages = useSelector((state: RootState) => state.qna.messages);

  // 새로운 스크립트를 누적
  useEffect(() => {
    if (currentScript && currentScript.trim() !== "") {
      setAccumulatedScript((prev) => {
        // 자연스러운 띄어쓰기를 위한 처리
        const needsSpace = prev.length > 0 && !prev.endsWith(" ");
        return prev + (needsSpace ? " " : "") + currentScript;
      });
    }
  }, [currentScript]);

  // 발표자가 변경될 때 누적 스크립트 초기화
  useEffect(() => {
    setAccumulatedScript("");
  }, [currentPresenter?.name]);

  // JSON 파일 전송
  const sendJSONToServer = async (presenter: string | null, sessionId?: string) => {
    if (!presenter || !sessionId) return;

    const presentationJson = {
      presenter: presenter,
      presentation_order: currentPresenterIndex + 1,
      roomCode: sessionId,
      startTime: startTime,
      endTime: formatDate(new Date()),
      transcripts: accumulatedScript,
    };

    setCurrentPresentationData(presentationJson);

    // 백엔드로 요약 요청 보내기
    try {
      const response = await interimSummarize(presentationJson);

      // 요약 및 질문 시그널 보내기
      session?.signal({
        data: JSON.stringify({
          summary: `[${currentPresenter?.name}님의 발표 요약]\n${response.summation.text}`,
          question: `[${currentPresenter?.name}님에 대한 질문]\n${response.summation.question}`,
          sender: { name: "MeeU", image: ChatMEEU },
          eventType: `PRESENTATION_SUMMARY_AND_QUESTION_${presenter}_${currentPresenterIndex}`,
        }),
        type: "MEEU_ANNOUNCEMENT",
      });
    } catch (error) {
      console.error("Error sending presentation data:", error);
    }
  };

  // QnA 스크립트 JSON 저장 함수 수정
  const saveQnAJSON = async (sessionId?: string) => {
    if (!sessionId) return;

    // [...qnaMessages]로 새로운 배열을 만들어 정렬
    const sortedQnAScript = [...qnaMessages]
      .sort((a, b) => a.order - b.order)
      .map((msg) => `${msg.sender}: ${msg.text}`)
      .join(" ");

    const qnaRequest: QnARequest = {
      roomCode: sessionId,
      script: sortedQnAScript,
      presentation_order: currentPresenterIndex + 1,
    };

    // 기존 저장 로직 유지...
    try {
      const message = await saveQnA(qnaRequest);
      console.log("QnA 저장 성공:", message);
    } catch (error) {
      if (error instanceof Error) {
        console.error("QnA 저장 실패:", error.message);
      }
    }
  };

  // 다음 발표자 정보를 return 하고 currentPresenterIndex 갱신
  const getNextPresenter = () => {
    const nextIndex = currentPresenterIndex + 1;

    if (nextIndex < presentersOrder.length) {
      dispatch(setCurrentPresenterIndex(nextIndex));
      return presentersOrder[nextIndex];
    } else {
      return null;
    }
  };

  // # 발표회 상태에 따라 수행되는 signal
  const changeConferenceStatus = async (currentStatus: string) => {
    if (currentStatus === CONFERENCE_STATUS.CONFERENCE_WAITING) {
      setCurrentPresenterIndex(0);
      session?.signal({
        data: JSON.stringify({
          presenter: null,
          action: CONFERENCE_STATUS.PRESENTATION_READY,
        }),
        type: "conference-status",
      });
      return;
    }

    // 발표 시작 버튼 눌렀을 때
    if (currentStatus === CONFERENCE_STATUS.PRESENTATION_READY) {
      const currentPresenter = presentersOrder[currentPresenterIndex];
      setStartTime(formatDate(new Date()));

      session?.signal({
        data: JSON.stringify({
          presenter: currentPresenter,
          action: CONFERENCE_STATUS.PRESENTATION_ACTIVE,
        }),
        type: "conference-status",
      });
      return;
    }

    // 발표 종료 버튼 눌렀을 때
    if (currentStatus === CONFERENCE_STATUS.PRESENTATION_ACTIVE) {
      session?.signal({
        data: JSON.stringify({
          presenter: null,
          action: CONFERENCE_STATUS.PRESENTATION_COMPLETED,
        }),
        type: "conference-status",
      });

      await sendJSONToServer(currentPresenter?.name ?? null, session?.sessionId);
      return;
    }

    // 질의응답 시작버튼 눌렀을 때
    if (currentStatus === CONFERENCE_STATUS.PRESENTATION_COMPLETED) {
      resetTranscript();

      session?.signal({
        data: JSON.stringify({
          presenter: null,
          action: CONFERENCE_STATUS.QNA_ACTIVE,
        }),
        type: "conference-status",
      });
    }
    
    // 질의응답 종료버튼 눌렀을 때
    if (currentStatus === CONFERENCE_STATUS.QNA_ACTIVE) {
      const nextPresenter = getNextPresenter();
      
      if (nextPresenter) {
        session?.signal({
          data: JSON.stringify({
            presenter: null,
            action: CONFERENCE_STATUS.PRESENTATION_READY,
          }),
          type: "conference-status",
        });
      } else {
        session?.signal({
          data: JSON.stringify({
            presenter: null,
            action: CONFERENCE_STATUS.QNA_COMPLETED,
          }),
          type: "conference-status",
        });
      }
      
      await saveQnAJSON(session?.sessionId);
    }

    // 발표회 종료 버튼을 눌렀을 때
    if (currentStatus === CONFERENCE_STATUS.QNA_COMPLETED) {
      session?.signal({
        data: JSON.stringify({
          presenter: null,
          action: CONFERENCE_STATUS.CONFERENCE_ENDED,
        }),
        type: "conference-status",
      });
    }
  };

  // 발표자 null로 리셋
  const resetPresenter = () => {
    setCurrentPresenter(null);
  };

  // 새로 인식된 부분만 추출하는 함수
  const getNewlyRecognizedText = (currentTranscript: string): string => {
    const prevText = prevTranscriptRef.current;
    const newText = currentTranscript.slice(prevText.length).trim();

    const patterns = [
      // 1. 문장 부호로 끝나는 경우
      /([^.!?]+[.!?]+)\s*/g, // 기본 문장 부호

      // 2. 존댓말 종결어미
      /([^습니다]+(습니다|습니까))\s*/g, // ~습니다, ~습니까
      /([^세요]+(세요|시죠|게요))\s*/g, // ~세요, ~시죠, ~게요
      /([^합니다]+(합니다|할게요))\s*/g, // ~합니다, ~할게요

      // 3. 발표 상황의 '~다' 종결어미
      /([^겠]+(겠습니다|하겠습니다))\s*/g, // "발표하겠습니다", "말씀드리겠습니다"
      /([^니다]+(입니다|였습니다))\s*/g, // "결과입니다", "내용이었습니다"
      /([^다]+(드리겠습니다|드렸습니다))\s*/g, // "설명드리겠습니다", "말씀드렸습니다"
      /([^다]+(됩니다|되겠습니다))\s*/g, // "마무리됩니다", "진행되겠습니다"
      /([^다]+(보겠습니다|봤습니다))\s*/g, // "살펴보겠습니다", "확인해봤습니다"
      /([^다]+(시작하겠습니다|마치겠습니다))\s*/g, // "시작하겠습니다", "마치겠습니다"
      /([^니다]+(있습니다|없습니다))\s*/g, // "존재합니다", "필요없습니다"
      /([^니다]+(나타냅니다|보여줍니다))\s*/g, // "나타냅니다", "보여줍니다"

      // 4. 의문형 종결어미
      /([^나요]+(나요|까요|려고요|ㄹ까요))\s*/g, // ~나요, ~까요, ~려고요, ~ㄹ까요

      // 5. 기타 종결어미
      /([^요]+(요|죠|네요))\s*/g, // ~요, ~죠, ~네요
    ];

    // 완성된 문장인지 확인
    const hasEndingPattern = patterns.some((pattern) => {
      pattern.lastIndex = 0;
      return pattern.test(newText);
    });

    // 완성된 한글 음절인지 확인
    if (newText && /[가-힣]+/.test(newText) && hasEndingPattern) {
      prevTranscriptRef.current = currentTranscript;
      return newText;
    }
    return "";
  };

  // 말하는 내용 전송
  const sendCurrentSpeech = (newText: string) => {
    if (!newText) return;

    session?.signal({
      data: JSON.stringify({
        text: newText,
        presenter: myUserName,
      }),
      type: "stt-transcript",
    });
  };

  // 발표 중인 내용을 시그널링 하는 부분
  useEffect(() => {
    if (conferenceStatus === CONFERENCE_STATUS.PRESENTATION_ACTIVE && currentPresenter?.name === myUserName && transcript) {
      // 지금 새롭게 인식된 내용들이 문장 단위로 끝났는지 판별 + 해당 새롭게 인식된 내용 반환
      const newlyRecognized = getNewlyRecognizedText(transcript);

      // 조건에 따라 시그널링 수행
      if (newlyRecognized) {
        sendCurrentSpeech(newlyRecognized);
      }
    }
  }, [transcript, conferenceStatus, currentPresenter]);

  // 발표자 변경 시 이전 transcript 초기화
  useEffect(() => {
    prevFinalTranscriptRef.current = "";
  }, [currentPresenter?.name]);

  // 질의응답 중 발화 내용 추적을 위한 useEffect 수정
  useEffect(() => {
    if (conferenceStatus === CONFERENCE_STATUS.QNA_ACTIVE) {
      if (finalTranscript) {
        const newMessage: QnAMessage = {
          sender: myUserName,
          text: finalTranscript,
          timestamp: Date.now(),
          order: globalOrder,
        };

        // Redux store에 메시지 추가
        dispatch(addMessage(newMessage));
        dispatch(incrementGlobalOrder());

        // 시그널로 공유
        session?.signal({
          data: JSON.stringify(newMessage),
          type: "qna-transcript",
        });

        resetTranscript();
      }
    }
  }, [finalTranscript, conferenceStatus]);

  // 상태 변경 시 QnA 초기화 추가
  useEffect(() => {
    if (conferenceStatus === CONFERENCE_STATUS.PRESENTATION_READY) {
      dispatch(resetQnA());
    }
  }, [conferenceStatus]);

  // STT 동작 여부를 제어
  useEffect(() => {
    if ((conferenceStatus === CONFERENCE_STATUS.PRESENTATION_ACTIVE && currentPresenter?.name === myUserName && isMicEnabled) || (conferenceStatus === CONFERENCE_STATUS.QNA_ACTIVE && isMicEnabled)) {
      SpeechRecognition.startListening({
        continuous: true,
        language: "ko-KR",
        interimResults: true,
      });
    } else if (
      (conferenceStatus === CONFERENCE_STATUS.PRESENTATION_ACTIVE && currentPresenter?.name === myUserName && !isMicEnabled) ||
      (conferenceStatus === CONFERENCE_STATUS.QNA_ACTIVE && !isMicEnabled)
    ) {
      SpeechRecognition.stopListening();
    } else {
      SpeechRecognition.stopListening();
      // sendCurrentSpeach("");
      resetTranscript();
    }

    return () => {
      SpeechRecognition.stopListening();
    };
  }, [conferenceStatus, resetTranscript, currentPresenter, isMicEnabled]);

  return {
    accumulatedScript,
    conferenceStatus,
    setConferenceStatus,
    changeConferenceStatus,
    currentPresenter,
    setCurrentPresenter,
    resetPresenter,
    currentScript,
    setCurrentScript,
    currentPresenterIndex,
    currentPresentationData,
  };
};
