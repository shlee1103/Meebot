import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Session } from "openvidu-browser";
import { toast } from "react-toastify";
import { RootState } from "../../stores/store";
import { CONFERENCE_STATUS } from "../constants/conferenceConstants";
import { useDispatch } from "react-redux";
import { setPresentationTime, setQnATime } from "../../stores/store";

interface UseTimerProps {
  conferenceStatus: string;
  session: Session | undefined;
  isAdmin: boolean;
  isSpeaking: boolean;
}

interface UseTimerReturn {
  minutes: number;
  remainingSeconds: number;
  isLastMinute: boolean;
  resetTimer: () => void;
  isRunning: boolean;
  isOvertime: boolean;
}

interface TimerSignalData {
  currentSeconds: number;
  isLastMinute: boolean;
  timerType: "presentation" | "qna";
  presentationTime: number;
  qnaTime: number;
}

interface NotificationData {
  message: string;
  status: string;
}

export const useTimer = ({ conferenceStatus, session, isAdmin }: UseTimerProps): UseTimerReturn => {
  const dispatch = useDispatch();

  const { presentationTime, qnaTime } = useSelector((state: RootState) => state.presentation);

  const [seconds, setSeconds] = useState(presentationTime * 60);
  const [isLastMinute, setIsLastMinute] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [lastMinuteNotified, setLastMinuteNotified] = useState(false);
  const [isOvertime, setIsOvertime] = useState(false);

  // 1분 전 알림 메시지 생성
  const getLastMinuteMessage = () => {
    if (conferenceStatus === CONFERENCE_STATUS.PRESENTATION_ACTIVE) {
      return "발표 종료까지 1분 남았습니다!";
    }
    if (conferenceStatus === CONFERENCE_STATUS.QNA_ACTIVE) {
      return "질의응답 종료까지 1분 남았습니다!";
    }
    return "1분 남았습니다!";
  };

  // 알림 시그널 전송
  const sendNotificationSignal = (message: string) => {
    if (!session || !isAdmin) return;

    session.signal({
      data: JSON.stringify({
        message,
        status: conferenceStatus,
      } as NotificationData),
      type: "timer-notification",
    });
  };

  // 알림 시그널 수신 처리
  useEffect(() => {
    if (!session) return;

    const handleNotification = (event: any) => {
      if (event.data) {
        const data: NotificationData = JSON.parse(event.data);
        toast.error(data.message);
      }
    };

    session.on("signal:timer-notification", handleNotification);

    return () => {
      session.off("signal:timer-notification", handleNotification);
    };
  }, [session]);

  // 현재 상태에 따른 타이머 초기 시간 설정
  const getInitialMinutes = () => {
    switch (conferenceStatus) {
      case CONFERENCE_STATUS.CONFERENCE_WAITING:
      case CONFERENCE_STATUS.PRESENTATION_READY:
      case CONFERENCE_STATUS.PRESENTATION_ACTIVE:
        return presentationTime;
      case CONFERENCE_STATUS.PRESENTATION_COMPLETED:
      case CONFERENCE_STATUS.QNA_ACTIVE:
        return qnaTime;
      default:
        return presentationTime;
    }
  };

  // 타이머 시그널 전송
  const sendTimerSignal = (currentSeconds: number, isLastMin: boolean) => {
    if (!session || !isAdmin) return;

    const timerType = conferenceStatus === CONFERENCE_STATUS.QNA_ACTIVE ? "qna" : "presentation";

    session.signal({
      data: JSON.stringify({
        currentSeconds,
        isLastMinute: isLastMin,
        timerType,
        presentationTime,
        qnaTime,
      } as TimerSignalData),
      type: "timer-sync",
    });
  };

  // MeeU 말하기 시그널 처리
  useEffect(() => {
    if (!session) return;

    const handleSpeechSignal = (event: any) => {
      if (event.data) {
        const data = JSON.parse(event.data);
        if (data.status === "speaking") {
          setIsRunning(false); // 발표 시작 시 타이머 중지
        } else if (data.status === "speech-end") {
          // MeeU 말하기가 끝나면 컨퍼런스 상태에 따라 타이머 재시작
          setIsRunning(conferenceStatus === CONFERENCE_STATUS.PRESENTATION_ACTIVE || conferenceStatus === CONFERENCE_STATUS.QNA_ACTIVE);
        }
      }
    };

    session.on("signal:meeU-speech", handleSpeechSignal);
    return () => {
      session.off("signal:meeU-speech", handleSpeechSignal);
    };
  }, [session, conferenceStatus]);

  // 타이머 시그널 수신 처리
  useEffect(() => {
    if (!session || isAdmin) return;

    session.on("signal:timer-sync", (event) => {
      if (event.data) {
        const data: TimerSignalData = JSON.parse(event.data);
        dispatch(setPresentationTime(data.presentationTime));
        dispatch(setQnATime(data.qnaTime));
        setSeconds(data.currentSeconds);
        setIsLastMinute(data.isLastMinute);
      }
    });
  }, [session, isAdmin]);

  useEffect(() => {
    const initialMinutes = getInitialMinutes();
    setSeconds(initialMinutes * 60);
    setIsLastMinute(false);
    setLastMinuteNotified(false);

    if (isAdmin) {
      sendTimerSignal(initialMinutes * 60, false);
    }
  }, [conferenceStatus, presentationTime, qnaTime]);

  // 타이머 동작 (admin만 실행)
  useEffect(() => {
    if (!isAdmin) return;

    let interval: NodeJS.Timeout | undefined;

    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          if (prev === 0) {
            setIsOvertime(true);
            return 1;
          }

          if (prev > 0 && isOvertime) {
            return prev + 1;
          }

          const newSeconds = prev - 1;

          if (newSeconds === 60 && !lastMinuteNotified) {
            setIsLastMinute(true);
            setLastMinuteNotified(true);
            const message = getLastMinuteMessage();
            sendNotificationSignal(message);
          }

          sendTimerSignal(newSeconds, isLastMinute);
          return newSeconds;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, seconds, isAdmin, lastMinuteNotified, conferenceStatus, isOvertime]);

  const resetTimer = () => {
    const initialMinutes = getInitialMinutes();
    setSeconds(initialMinutes * 60);
    setIsLastMinute(false);
    setLastMinuteNotified(false);
    if (isAdmin) {
      sendTimerSignal(initialMinutes * 60, false);
    }
  };

  return {
    minutes: Math.floor(seconds / 60),
    remainingSeconds: seconds % 60,
    resetTimer,
    isLastMinute,
    isRunning,
    isOvertime,
  };
};
