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
      const connectionData = JSON.parse(event.stream.connection.data);

      if (event.stream.typeOfVideo === "SCREEN") {
        const screenSubscriber = session.subscribe(event.stream, undefined);
        setMainStreamManager(screenSubscriber);
        setScreenShareStream(screenSubscriber);
        setScreenSharingUser(connectionData.clientData);
        return;
      }
    });

    session.on("streamDestroyed", (event) => {
      const destroyedUserInfo = JSON.parse(event.stream.connection.data);

      if (destroyedUserInfo.clientData.role === "admin") {
        leaveSession();
        return;
      }

      if (event.stream.typeOfVideo === "SCREEN") {
        // subscribers 배열에서 화면 공유 스트림 제거
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
  }, [session, originalPublisher, deleteSubscriber]);

  const joinSession = async (sessionId: string, isVideoEnabled: boolean, isAudioEnabled: boolean) => {
    OV.current = new OpenVidu();
    const mySession = OV.current.initSession();

    mySession.on("connectionCreated", (event) => {
      const connection = event.connection;
      setConnectionUser((prev) => [...prev, connection]);
    });

    mySession.on("streamCreated", (event) => {
      const subscriber = mySession.subscribe(event.stream, undefined);
      if (event.stream.typeOfVideo === "SCREEN") {
        setMainStreamManager(subscriber);
      }
      setSubscribers((subscribers) => [...subscribers, subscriber]);
    });

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

  // 화면공유 시작
  const startScreenShare = async () => {
    try {
      if (!OV.current || !session) return;

      const originalPublisher = publisher;

      if (publisher) {
        await session.unpublish(publisher);
      }

      const screenPublisher = await OV.current.initPublisherAsync(undefined, {
        audioSource: undefined,
        videoSource: "screen",
        publishAudio: true,
        publishVideo: true,
        resolution: "1920x1080",
        frameRate: 15,
        mirror: false,
      });

      if (screenPublisher) {
        await session.publish(screenPublisher);
        setScreenShareStream(screenPublisher);
        setScreenSharingUser(myUserName);
        setMainStreamManager(screenPublisher);
        setPublisher(originalPublisher);
      }
    } catch {
      if (publisher && session) {
        await session.publish(publisher);
      }
    }
  };

  // 화면공유 종료
  const stopScreenShare = async () => {
    if (!session) return;

    try {
      if (screenShareStream) {
        await session.unpublish(screenShareStream as Publisher);
        setScreenShareStream(undefined);
        setScreenSharingUser(undefined);
      }

      if (publisher) {
        await session.publish(publisher);
        setMainStreamManager(publisher);
        publisher.publishVideo(true);
      }
    } catch (error) {
      console.error("Error stopping screen share:", error);
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

  const updateParticipantState = useCallback(() => {
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
        role: clientData.role,
      };
    };

    const allParticipants = publisher ? [getParticipantInfo(publisher), ...subscribers.map((sub) => getParticipantInfo(sub))] : subscribers.map((sub) => getParticipantInfo(sub));

    setParticipants(allParticipants);
  }, [subscribers, publisher]);

  useEffect(() => {
    updateParticipantState();
  }, [updateParticipantState]);

  useEffect(() => {
    if (session) {
      session.on('streamPropertyChanged', (event: any) => {
        if (event.changedProperty === 'audioActive' || 
            event.changedProperty === 'videoActive') {
          updateParticipantState();
        }
      });

      return () => {
        session.off('streamPropertyChanged');
      };
    }
  }, [session, updateParticipantState]);

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
  updateParticipantState,
};
};
