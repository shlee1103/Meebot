import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Session } from "openvidu-browser";
import { RootState } from "../../stores/store";
import { CONFERENCE_STATUS, FIXED_MENTS } from "../constants/conferenceConstants";
import { TextToSpeech } from "../../utils/TextToSpeech";
import webClient from "../apis/webClient";

interface PresentationData {
  presenter: string | null;
  presentation_order: number;
  roomCode: string;
  startTime: string;
  endTime: string;
  transcripts: string;
}

export const useChatGPT = (session: Session | undefined, currentPresentationData: PresentationData | null) => {
  const [error, setError] = useState<string | null>(null);
  const [speech, setSpeech] = useState<string>("");
  const [currentSentence, setCurrentSentence] = useState<string>("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const tts = new TextToSpeech();

  const { currentPresenterIndex, presentersOrder } = useSelector((state: RootState) => state.presentation);

  const meetingTitle = useSelector((state: RootState) => state.meetingTitle.meetingTitle);
  const role = useSelector((state: RootState) => state.role.role);
  const isAdmin = role === "admin";

  // Clean up TTS when component unmounts
  useEffect(() => {
    return () => {
      tts.close().catch((error) => {
        console.error("Error closing TTS:", error);
      });
    };
  }, []);

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

    try {
      tts.onTextChange = (text: string) => {
        setCurrentSentence(text);
      };

      tts.onEnd = () => {
        setIsSpeaking(false);
        setCurrentSentence("");
        if (isAdmin) {
          broadcastSpeechEnd();
        }
      };

      await tts.speak(message);
    } catch (error) {
      console.error("TTS Error:", error);
      setError("음성 변환 중 오류가 발생했습니다.");
      setIsSpeaking(false);
    }
  };

  useEffect(() => {
    if (!session) {
      tts.stop();
      return;
    }

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
      tts.stop();
    };
  }, [session]);

  const startConference = async (ment: string) => {
    if (isAdmin) {
      await broadcastSpeech(ment);
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

  useEffect(() => {
    const handlePresentationDataChange = async () => {
      if (currentPresentationData) {
        try {
          const response = await webClient.post("/api/chatgpt/end-presentation", currentPresentationData);
          const message = response.data.message;
          if (isAdmin) {
            await broadcastSpeech(message);
          }
        } catch (err) {
          console.error("Error:", err);
          setError("AI 멘트 생성 중 오류가 발생했습니다.");
        }
      }
    };

    handlePresentationDataChange();
  }, [currentPresentationData]);

  const endConference = async () => {
    try {
      const response = await webClient.post("/api/chatgpt/end-conference", {
        roomTitle: meetingTitle,
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

  const handleConferenceStatusChange = async (currentStatus: string, ment: string) => {
    switch (currentStatus) {
      case CONFERENCE_STATUS.CONFERENCE_WAITING:
        await startConference(ment);
        break;

      case CONFERENCE_STATUS.PRESENTATION_READY:
        await startPresentation();
        break;

      case CONFERENCE_STATUS.PRESENTATION_COMPLETED:
        await speakFixedMent(FIXED_MENTS.QNA_START);
        break;

      case CONFERENCE_STATUS.QNA_ACTIVE: {
        const nextPresenterIndex = currentPresenterIndex + 1;
        const currentPresenter = presentersOrder[currentPresenterIndex]?.name;

        if (!currentPresenter) {
          console.error("Current presenter not found");
          break;
        }

        if (nextPresenterIndex < presentersOrder.length) {
          const nextPresenter = presentersOrder[nextPresenterIndex]?.name;
          if (nextPresenter) {
            await speakFixedMent(FIXED_MENTS.QNA_END(currentPresenter, nextPresenter));
          }
        } else {
          await endConference();
        }
        break;
      }

      default:
        break;
    }
  };

  return {
    speech,
    currentSentence,
    error,
    isSpeaking,
    handleConferenceStatusChange,
  };
};
