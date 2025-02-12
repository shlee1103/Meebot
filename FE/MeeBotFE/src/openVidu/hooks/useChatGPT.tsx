import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Session } from "openvidu-browser";
import { RootState } from "../../stores/store";
import { CONFERENCE_STATUS, FIXED_MENTS } from "../constants/conferenceConstants";
import { TextToSpeech } from "../../utils/TextToSpeech";
import webClient from "../apis/webClient";

export const useChatGPT = (session: Session | undefined) => {
  const [error, setError] = useState<string | null>(null);
  const [speech, setSpeech] = useState<string>("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const tts = new TextToSpeech();

  const { currentPresenterIndex, presentationTime, qnaTime, presentersOrder } = useSelector((state: RootState) => state.presentation);

  const role = useSelector((state: RootState) => state.role.role);
  const isAdmin = role === "admin";

  const broadcastSpeech = async (message: string) => {
    if (!session || !isAdmin) return;

    await session.signal({
      data: JSON.stringify({
        message,
        status: "speaking",
      }),
      type: "meeU-speech",
    });
  };

  const broadcastSpeechEnd = async () => {
    if (!session || !isAdmin) return;

    await session.signal({
      data: JSON.stringify({
        status: "speech-end",
      }),
      type: "meeU-speech",
    });
  };

  const executeSpeech = async (message: string) => {
    setIsSpeaking(true);
    setSpeech(message);

    await new Promise((resolve) => {
      tts.onEnd = () => {
        resolve(null);
      };
      tts.speak(message);
    });

    setIsSpeaking(false);
    if (isAdmin) {
      await broadcastSpeechEnd();
    }
  };

  useEffect(() => {
    if (!session) return;

    const handleSpeechSignal = async (event: any) => {
      if (event.data) {
        try {
          const data = JSON.parse(event.data);
          if (data.message) {
            await executeSpeech(data.message);
          }
        } catch (error) {
          console.error("Error parsing signal data:", error);
        }
      }
    };

    session.on("signal:meeU-speech", handleSpeechSignal);
    return () => {
      session.off("signal:meeU-speech", handleSpeechSignal);
    };
  }, [session]);

  const startConference = async () => {
    try {
      const response = await webClient.post("/api/chatgpt/start-presentation", {
        presentation_teams_num: presentersOrder.length,
        presentation_time: presentationTime,
        question_time: qnaTime,
        presenter: {
          presenter: presentersOrder[0],
          order: 1,
        },
      });

      const message = response.data.message;
      if (isAdmin) {
        await broadcastSpeech(message);
      }
    } catch (err) {
      console.error("Error:", err);
      setError("AI 멘트 생성 중 오류가 발생했습니다.");
    }
  };

  const startPresentation = async () => {
    try {
      if (!session || !isAdmin) return;

      await session.signal({
        data: JSON.stringify({
          status: "speaking",
        }),
        type: "meeU-speech",
      });

      const currentPresenter = presentersOrder[currentPresenterIndex];
      const response = await webClient.post("/api/chatgpt/next-presentation", {
        presenter: {
          presentation_order: currentPresenterIndex + 1,
          presenter: currentPresenter,
        },
      });

      const message = response.data.message;
      if (isAdmin) {
        await broadcastSpeech(message);
      }
    } catch (err) {
      console.error("Error:", err);
      setError("AI 멘트 생성 중 오류가 발생했습니다.");
    }
  };

  const speakFixedMent = async (ment: string) => {
    if (isAdmin) {
      await broadcastSpeech(ment);
    }
  };

  const handleConferenceStatusChange = async (currentStatus: string) => {
    switch (currentStatus) {
      case CONFERENCE_STATUS.CONFERENCE_WAITING:
        await startConference();
        break;

      case CONFERENCE_STATUS.PRESENTATION_READY:
        await startPresentation();
        break;

      case CONFERENCE_STATUS.PRESENTATION_ACTIVE:
        await speakFixedMent(FIXED_MENTS.PRESENTATION_END);
        break;

      case CONFERENCE_STATUS.PRESENTATION_COMPLETED:
        await speakFixedMent(FIXED_MENTS.QNA_START);
        break;

      case CONFERENCE_STATUS.QNA_ACTIVE: {
        const nextPresenterIndex = currentPresenterIndex + 1;
        const currentPresenter = presentersOrder[currentPresenterIndex].name;
        const nextPresenter = presentersOrder[nextPresenterIndex].name;
        if (nextPresenterIndex < presentersOrder.length) {
          await speakFixedMent(FIXED_MENTS.QNA_END(currentPresenter, nextPresenter));
        } else {
          await speakFixedMent(FIXED_MENTS.FINAL_PRESENTATION_COMPLETED(currentPresenter));
        }
        break;
      }

      case CONFERENCE_STATUS.CONFERENCE_ENDED:
        await speakFixedMent(FIXED_MENTS.CONFERENCE_ENDED);
        break;

      default:
        break;
    }
  };

  return {
    speech,
    error,
    isSpeaking,
    handleConferenceStatusChange,
  };
};
