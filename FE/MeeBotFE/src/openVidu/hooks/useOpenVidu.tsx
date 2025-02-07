import { OpenVidu, Publisher, Session, StreamManager, Subscriber } from "openvidu-browser";
import { useState, useRef, useCallback, useEffect } from "react";
import { createSession, createToken } from "../../apis/room";

export const useOpenVidu = () => {
  const [mySessionId, setMySessionId] = useState<string>("");
  const [myUserName, setMyUserName] = useState<string>("")
  const [session, setSession] = useState<Session | undefined>(undefined);
  const [mainStreamManager, setMainStreamManager] = useState<StreamManager | undefined>(undefined);
  const [publisher, setPublisher] = useState<Publisher | undefined>(undefined);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [participants, setParticipants] = useState<string[]>([]);
  const [screenShareStream, setScreenShareStream] = useState<StreamManager | undefined>(undefined);
  const [screenSharingUser, setScreenSharingUser] = useState<string | undefined>(undefined);
  const [originalPublisher, setOriginalPublisher] = useState<Publisher | undefined>(undefined);
  const [connectionUser, setConnectionUser] = useState<any[]>([]);
  const [messages, setMessages] = useState<{
    sender: string;
    text: string;
    time: string;
  }[]>([]);

  const OV = useRef<OpenVidu | null>(null);

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
      console.log("스트림 생성 이벤트:", event);
      console.log("연결 데이터:", connectionData);

      if (event.stream.typeOfVideo === "SCREEN") {
        const screenSubscriber = session.subscribe(event.stream, undefined);
        setMainStreamManager(screenSubscriber);
        setScreenShareStream(screenSubscriber);
        setScreenSharingUser(connectionData.clientData);
        return;
      }
    });

    session.on("streamDestroyed", (event) => {
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

    console.log('joinSession 비디오, 오디오', isVideoEnabled, isAudioEnabled)

    // connectionCreated 코드 추가(o)
    mySession.on("connectionCreated", (event) => {
      console.log("Connection Created:", event.connection);
      const connection = event.connection;
      setConnectionUser(prev => [...prev, connection]);
    });

    mySession.on("streamCreated", (event) => {
      const subscriber = mySession.subscribe(event.stream, undefined);
      if (event.stream.typeOfVideo === "SCREEN") {
        setMainStreamManager(subscriber);
      }
      setSubscribers((subscribers) => [...subscribers, subscriber]);
    });


    mySession.on("signal:chat", (event) => {
      const connectionData = JSON.parse(event.from?.data || '{}').clientData;
      const now = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
      const messageData = JSON.parse(event.data || '{}');
    
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          sender: connectionData || "Unknown",
          text: messageData.text,
          time: now,
          attachments: messageData.attachments
        }
      ]);
    });

    try {
      setSession(mySession);
      
      const tokenData = await getToken(sessionId);
      await mySession.connect(tokenData, { clientData: myUserName });
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

  
const sendMessage = async (message: string) => {
  if (!session) return;
  try {
    await session.signal({
      data: JSON.stringify({ text: message }),
      type: "chat",
    });
  } catch (error) {
    console.error("Message sending failed:", error);
  }
};

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
    setMyUserName(`Participant${Math.floor(Math.random() * 100)}`);
    setMainStreamManager(undefined);
    setPublisher(undefined);
    setScreenShareStream(undefined);
    setScreenSharingUser(undefined);
  }, [session]);

  useEffect(() => {
    const participantNames = subscribers.map((subscriber) => {
      const connectionData = JSON.parse(subscriber.stream.connection.data).clientData;
      return connectionData;
    });
    setParticipants([myUserName, ...participantNames]);
  }, [subscribers, myUserName]);

  return {
    mySessionId,
    setMySessionId,
    myUserName,
    setMyUserName,
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
