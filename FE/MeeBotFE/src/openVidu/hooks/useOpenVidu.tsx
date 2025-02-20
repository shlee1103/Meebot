import { Connection, OpenVidu, Publisher, Session, StreamManager, Subscriber, ConnectionEvent } from "openvidu-browser";
import { useState, useRef, useCallback, useEffect } from "react";
import { createSession, createToken } from "../../apis/room";
import { useDispatch, useSelector } from "react-redux";
import { RootState, setMeetingTitle } from "../../stores/store";
import { useNavigate } from "react-router-dom";
import ChatMEEU from "../../assets/chatMeeU.png";
import ChatUnknown from "../../assets/user_icon.svg";

export interface ParticipantInfo {
  name: string;
  email?: string;
  image: string;
  isAudioActive: boolean;
  isVideoActive: boolean;
  role: string;
}

export const useOpenVidu = () => {
  const [mySessionId, setMySessionId] = useState<string>("");
  const [session, setSession] = useState<Session | undefined>(undefined);
  const [mainStreamManager, setMainStreamManager] = useState<StreamManager | undefined>(undefined);
  const [publisher, setPublisher] = useState<Publisher | undefined>(undefined);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [participants, setParticipants] = useState<ParticipantInfo[]>([]);
  const [screenShareStream, setScreenShareStream] = useState<StreamManager | undefined>(undefined);
  const [screenSharingUser, setScreenSharingUser] = useState<string | undefined>(undefined);
  const [originalPublisher, setOriginalPublisher] = useState<Publisher | undefined>(undefined);
  const [connectionUser, setConnectionUser] = useState<Connection[]>([]);
  const [messages, setMessages] = useState<
    {
      sender: { name: string; image: string; role?: string };
      text?: string;
      summary?: string;
      question?: string;
      time: string;
      eventType?: string;
      timestamp?: number;
    }[]
  >([]);

  const myUserName = useSelector((state: RootState) => state.myUsername.myUsername);
  const userRole = useSelector((state: RootState) => state.role.role);
  const meetingTitle = useSelector((state: RootState) => state.meetingTitle.meetingTitle);
  const dispatch = useDispatch();

  const OV = useRef<OpenVidu | null>(null);

  const navigate = useNavigate();

  const getToken = async (sessionId: string) => {
    await createSession(sessionId);
    return await createToken(sessionId);
  };

  const deleteSubscriber = useCallback((streamManager: StreamManager) => {
    if (!streamManager || streamManager.stream.typeOfVideo === "SCREEN") return;
    setSubscribers((subscribers) => {
      const index = subscribers.indexOf(streamManager as Subscriber);
      if (index > -1) {
        const newSubscribers = [...subscribers];
        newSubscribers.splice(index, 1);
        return newSubscribers;
      }
      return subscribers;
    });
  }, []);

  useEffect(() => {
    if (!session) return;

    session.on("streamCreated", (event) => {
      console.log("스트림 생성:", {
        type: event.stream.typeOfVideo,
        streamId: event.stream.streamId,
      });

      // 모든 스트림을 구독
      const subscriber = session.subscribe(event.stream, undefined);
      const connectionData = JSON.parse(event.stream.connection.data);

      if (event.stream.typeOfVideo === "SCREEN") {
        console.log("화면 공유 스트림 구독 시작");
        setMainStreamManager(subscriber);
        setScreenShareStream(subscriber);
        setScreenSharingUser(connectionData.clientData.name);
      }

      // 모든 스트림을 subscribers 배열에 추가 (화면 공유 포함)
      setSubscribers((prevSubscribers) => {
        // 중복 구독 방지
        const isExisting = prevSubscribers.some((sub) => sub.stream.streamId === subscriber.stream.streamId);
        if (!isExisting) {
          return [...prevSubscribers, subscriber];
        }
        return prevSubscribers;
      });
    });

    session.on("streamDestroyed", (event) => {
      console.log("스트림 제거:", {
        type: event.stream.typeOfVideo,
        streamId: event.stream.streamId,
      });

      const destroyedUserInfo = JSON.parse(event.stream.connection.data);

      if (event.stream.typeOfVideo === "SCREEN") {
        setSubscribers((prevSubscribers) => prevSubscribers.filter((sub) => sub.stream.streamId !== event.stream.streamId));
        setScreenShareStream(undefined);
        setScreenSharingUser(undefined);
        if (originalPublisher) {
          setMainStreamManager(originalPublisher);
        }
        return;
      }
      deleteSubscriber(event.stream.streamManager);
    });

    return () => {
      session?.off("streamCreated");
      session?.off("streamDestroyed");
    };
  }, [session, originalPublisher, deleteSubscriber]);
  const joinSession = async (sessionId: string, isVideoEnabled: boolean, isAudioEnabled: boolean) => {
    OV.current = new OpenVidu();
    const mySession = OV.current.initSession();

    mySession.on("connectionCreated", (event) => {
      const connection = event.connection;
      setConnectionUser((prev) => [...prev, connection]);
    });

    // mySession.on("streamCreated", (event) => {
    //   const subscriber = mySession.subscribe(event.stream, undefined);
    //   if (event.stream.typeOfVideo === "SCREEN") {
    //     setMainStreamManager(subscriber);
    //   }
    //   setSubscribers((subscribers) => [...subscribers, subscriber]);
    // });

    mySession.on("signal:chat", (event) => {
      const connectionData = JSON.parse(event.from?.data || "{}").clientData;
      const now = new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
      const messageData = JSON.parse(event.data || "{}");

      setMessages((prevMessages) => {
        const newMessage = {
          sender: {
            name: connectionData.name || "Unknown",
            image: connectionData.image || ChatUnknown,
            role: connectionData.role || userRole,
          },
          text: messageData.text,
          time: now,
        };

        return [...prevMessages, newMessage];
      });
    });

    mySession.on("signal:MEEU_ANNOUNCEMENT", (event) => {
      const now = new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
      const messageData = JSON.parse(event.data || "{}");

      setMessages((prevMessages) => {
        const lastMeeuMessage = [...prevMessages].reverse().find((msg) => msg.sender.name === "MeeU");

        if (lastMeeuMessage && lastMeeuMessage.eventType === messageData.eventType) {
          return prevMessages;
        }

        // PRESENTATION_SUMMARY_AND_QUESTION 타입만
        return [
          ...prevMessages,
          {
            sender: { name: "MeeU", image: ChatMEEU },
            summary: messageData.summary,
            question: messageData.question,
            time: now,
            eventType: messageData.eventType,
          },
        ];
      });
    });

    try {
      setSession(mySession);
      const tokenData = await getToken(sessionId);
      const userProfileImage = localStorage.getItem("profile");
      const userEmail = localStorage.getItem("email");

      await mySession.connect(tokenData, { clientData: { name: myUserName, email: userEmail || "", image: userProfileImage, role: userRole } });

      const myPublisher = await OV.current.initPublisherAsync(undefined, {
        audioSource: undefined,
        videoSource: undefined,
        publishAudio: isAudioEnabled,
        publishVideo: isVideoEnabled,
        resolution: "1920x1080",
        frameRate: 15,
        insertMode: "APPEND",
        mirror: false,
      });
      await mySession.publish(myPublisher);

      setPublisher(myPublisher);
      setMainStreamManager(myPublisher);
      setOriginalPublisher(myPublisher);
    } catch (error) {
      console.error("[Error] Session 연결 실패:", error);
    }
  };

  // 방 제목 전송 useEffect
  useEffect(() => {
    if (!session) return;

    const handleMeetingTitle = (event: ConnectionEvent) => {
      if (event.connection.connectionId !== session.connection?.connectionId) {
        session.signal({
          data: meetingTitle,
          to: [event.connection],
          type: "meetingTitle",
        });
      } else {
        session.signal({
          type: "requestMeetingTitle",
        });
      }
    };

    session.on("signal:requestMeetingTitle", () => {
      if (meetingTitle) {
        session.signal({
          data: meetingTitle,
          type: "meetingTitle",
        });
      }
    });

    session.on("connectionCreated", handleMeetingTitle);

    session.on("signal:meetingTitle", (event) => {
      const title = event.data as string;
      dispatch(setMeetingTitle(title));
    });

    return () => {
      session?.off("connectionCreated", handleMeetingTitle);
      session?.off("signal:meetingTitle");
      session?.off("signal:requestMeetingTitle");
    };
  }, [session, meetingTitle]);

  const sendMessage = async (message: string) => {
    if (!session) return;

    try {
      await session.signal({
        data: JSON.stringify({
          text: message,
          sender: {
            name: myUserName,
            image: localStorage.getItem("profile") || ChatUnknown,
            role: userRole,
          },
        }),
        type: "chat",
      });
    } catch (error) {
      console.error("Message sending failed:", error);
    }
  };

  const startScreenShare = async () => {
    try {
      // OV.current와 session의 null 체크
      if (!OV.current || !session) {
        console.error("OpenVidu 인스턴스 또는 세션이 존재하지 않습니다.");
        return;
      }

      const openViduInstance = OV.current;

      // 1. 기존 퍼블리셔 제거
      if (publisher) {
        try {
          await session.unpublish(publisher);
          setPublisher(undefined);
          setMainStreamManager(undefined);
        } catch (unpublishError) {
          console.error("퍼블리셔 언발행 중 오류:", unpublishError);
        }
      }

      // 2. 화면 공유 스트림을 미리 가져옴
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      // navigator.mediaDevices.getDisplayMedia를 임시로 대체
      const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia;
      navigator.mediaDevices.getDisplayMedia = async () => screenStream;

      // 3. 화면 공유 퍼블리셔 생성
      const screenPublisher = await openViduInstance.initPublisherAsync(undefined, {
        videoSource: "screen",
        publishVideo: true,
        publishAudio: false,
        resolution: "1280x720",
        frameRate: 15,
        insertMode: "APPEND",
      });

      // getDisplayMedia를 원래대로 복구
      navigator.mediaDevices.getDisplayMedia = originalGetDisplayMedia;

      // 4. 세션에 발행
      await session.publish(screenPublisher);

      // 5. 상태 업데이트
      setMainStreamManager(screenPublisher);
      setPublisher(screenPublisher);
      setScreenShareStream(screenPublisher);
      setScreenSharingUser(myUserName);

      // 6. 화면 공유 종료 감지
      screenStream.getTracks().forEach((track) => {
        track.addEventListener("ended", () => {
          console.log("화면 공유 종료");
          stopScreenShare();
        });
      });
    } catch (error) {
      // getDisplayMedia를 원래대로 복구 (에러 발생 시에도)
      const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia;
      if (navigator.mediaDevices.getDisplayMedia !== originalGetDisplayMedia) {
        navigator.mediaDevices.getDisplayMedia = originalGetDisplayMedia;
      }

      console.error("화면 공유 중 전체 오류:", error);

      // 오류 시 복구 시도
      if (session && OV.current) {
        try {
          // 원래 비디오/오디오 퍼블리셔 복원
          const newPublisher = await OV.current.initPublisherAsync(undefined, {
            audioSource: undefined,
            videoSource: undefined,
            publishAudio: true,
            publishVideo: true,
            resolution: "1920x1080",
            frameRate: 15,
            insertMode: "APPEND",
            mirror: false,
          });

          await session.publish(newPublisher);
          setMainStreamManager(newPublisher);
          setPublisher(newPublisher);
        } catch (recoveryError) {
          console.error("복구 시도 중 오류:", recoveryError);
        }
      }
    }
  };

  const stopScreenShare = async () => {
    if (!session) return;

    try {
      console.log("화면 공유 종료 시작");

      // 1. 화면 공유 스트림 중단
      if (screenShareStream) {
        if (screenShareStream instanceof Publisher) {
          await session.unpublish(screenShareStream);
        }
        setScreenShareStream(undefined);
        setScreenSharingUser(undefined);
      }

      // 2. 새로운 통합 퍼블리셔 생성
      if (OV.current) {
        const newPublisher = await OV.current.initPublisherAsync(undefined, {
          audioSource: undefined,
          videoSource: undefined,
          publishAudio: true,
          publishVideo: true,
          resolution: "1920x1080",
          frameRate: 30,
          insertMode: "APPEND",
          mirror: false,
        });

        await session.publish(newPublisher);
        setMainStreamManager(newPublisher);
        setPublisher(newPublisher);
        setOriginalPublisher(newPublisher);
      }

      console.log("화면 공유 종료 완료");
    } catch (error) {
      console.error("화면 공유 종료 에러:", error);
    }
  };

  const leaveSession = useCallback(() => {
    if (session) {
      session.disconnect();
    }

    OV.current = null;
    setSession(undefined);
    setSubscribers([]);
    setMySessionId("SessionA");
    setMainStreamManager(undefined);
    setPublisher(undefined);
    setScreenShareStream(undefined);
    setScreenSharingUser(undefined);

    navigate("/");
  }, [session]);

  useEffect(() => {
    const getParticipantInfo = (streamManager: StreamManager) => {
      const { clientData } = JSON.parse(streamManager.stream.connection.data);
      const isAudioActive = streamManager.stream.audioActive;
      const isVideoActive = streamManager.stream.videoActive;

      return {
        name: clientData.name,
        image: clientData.image,
        email: clientData.email,
        isAudioActive,
        isVideoActive,
      };
    };

    const allParticipants = publisher ? [getParticipantInfo(publisher), ...subscribers.map((sub) => getParticipantInfo(sub))] : subscribers.map((sub) => getParticipantInfo(sub));

    setParticipants(allParticipants);
  }, [subscribers, publisher]);

  return {
    mySessionId,
    setMySessionId,
    myUserName,
    session,
    mainStreamManager,
    setMainStreamManager,
    publisher,
    subscribers,
    joinSession,
    leaveSession,
    participants,
    startScreenShare,
    stopScreenShare,
    isScreenShared: !!screenShareStream,
    amISharing: screenSharingUser === myUserName,
    connectionUser,
    setConnectionUser,
    messages,
    sendMessage,
  };
};
