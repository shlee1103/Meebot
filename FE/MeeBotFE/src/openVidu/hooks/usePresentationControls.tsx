import { useEffect, useState } from "react";
import { Session } from "openvidu-browser";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { useSelector, useDispatch } from "react-redux";
import { RootState, setCurrentPresenterIndex } from "../../stores/store";
import { interimSummarize } from "../../apis/chatGpt";
import ChatMEEU from "../../assets/chatMeeU.png"
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

// 발표 기능 제어 관리
export const usePresentationControls = (session: Session | undefined, myUserName: string) => {
  const [currentPresenter, setCurrentPresenter] = useState<ParticipantInfo | null>(null);
  const [currentScript, setCurrentScript] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [conferenceStatus, setConferenceStatus] = useState(CONFERENCE_STATUS.CONFERENCE_WAITING);
  const { transcript, resetTranscript } = useSpeechRecognition();
  const dispatch = useDispatch();
  const currentPresenterIndex = useSelector((state: RootState) => state.presentation.currentPresenterIndex);
  const presentersOrder = useSelector((state: RootState) => state.presentation.presentersOrder);
  const isMicEnabled = useSelector((state: RootState) => state.device.isMicEnabled);

  // JSON 파일 전송
  const sendJSONToServer = async(presenter: string | null, sessionId?: string) => {
    if (!presenter || !sessionId) return;

    const presentationJson = {
      presenter: presenter,
      presentation_order: currentPresenterIndex + 1,
      roomCode: sessionId,
      startTime: startTime,
      endTime: formatDate(new Date()),
      transcripts: currentScript,
    };

    // 파일명 생성: "presentation_발표자명_타임스탬프.json"
    const fileName = `presentation_${presenter}_${new Date().getTime()}.json`;
    // JSON 데이터 생성
    const json = JSON.stringify(presentationJson, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    // 다운로드 링크 생성 및 실행
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    // 다운로드 트리거 및 정리
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    // 백엔드로 요약 요청 보내기
    try {
      const response = await interimSummarize(presentationJson);

      // 요약 및 질문 시그널 보내기
      session?.signal({
        data: JSON.stringify({
          summary: `[${response.summation.presenter}님의 발표 요약]\n${response.summation.text}`,
          question: `[${response.summation.presenter}님에 대한 질문]\n${response.summation.question}`,
          sender: { name: "MeeU", image: ChatMEEU },
          eventType: `PRESENTATION_SUMMARY_AND_QUESTION_${presenter}_${currentPresenterIndex}`  // 발표자와 순서 정보 추가
        }),
        type: 'MEEU_ANNOUNCEMENT'
      });
    } catch (error) {
      console.error("Error sending presentation data:", error);
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
      await sendJSONToServer(currentPresenter?.name ?? null, session?.sessionId);

      session?.signal({
        data: JSON.stringify({
          presenter: null,
          action: CONFERENCE_STATUS.PRESENTATION_COMPLETED,
        }),
        type: "conference-status",
      });

      return;
    }

    // 질의응답 시작버튼 눌렀을 때
    if (currentStatus === CONFERENCE_STATUS.PRESENTATION_COMPLETED) {
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

  // 말하는 내용 전송
  const sendCurrentSpeach = (currentText: string) => {
    session?.signal({
      data: JSON.stringify({
        text: currentText,
        presenter: myUserName,
      }),
      type: "stt-transcript",
    });
  };

  // 발표 중인 내용을 시그널링 하는 부분
  useEffect(() => {
    if (conferenceStatus === CONFERENCE_STATUS.PRESENTATION_ACTIVE && currentPresenter?.name === myUserName && transcript) {
      const currentText = transcript.trim();
      console.log(transcript);

      if (currentText) {
        sendCurrentSpeach(currentText);
      }
    }
  }, [transcript, conferenceStatus, currentPresenter]);

  // STT 동작 여부를 제어
  useEffect(() => {
    if (conferenceStatus === CONFERENCE_STATUS.PRESENTATION_ACTIVE && currentPresenter?.name === myUserName && isMicEnabled) {
      SpeechRecognition.startListening({
        continuous: true,
        language: "ko-KR",
        interimResults: true,
      });
    } else if (conferenceStatus === CONFERENCE_STATUS.PRESENTATION_ACTIVE && currentPresenter?.name === myUserName && !isMicEnabled) {
      SpeechRecognition.stopListening();
    } else {
      SpeechRecognition.stopListening();
      sendCurrentSpeach("");
      resetTranscript();
    }

    return () => {
      SpeechRecognition.stopListening();
    };
  }, [conferenceStatus, resetTranscript, currentPresenter, isMicEnabled]);

  return {
    conferenceStatus,
    setConferenceStatus,
    changeConferenceStatus,
    currentPresenter,
    setCurrentPresenter,
    resetPresenter,
    currentScript,
    setCurrentScript,
    currentPresenterIndex,
  };
};
