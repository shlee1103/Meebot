import { useState, useEffect } from "react";
import { Publisher, Session } from "openvidu-browser";
import { useDispatch, useSelector } from "react-redux";
import { RootState, toggleCamera, toggleMic, turnOffMic, turnOnMic } from "../../stores/store";
import { CONFERENCE_STATUS } from "../constants/conferenceConstants";

export const useStreamControls = (
  publisher: Publisher | undefined,
  session: Session | undefined,
  startScreenShareSession: () => Promise<void>,
  stopScreenShareSession: () => Promise<void>,
  isScreenShared: boolean,
  conferenceStatus: string
) => {
  const isMicEnabled = useSelector((state: RootState) => state.device.isMicEnabled);
  const isCameraEnabled = useSelector((state: RootState) => state.device.isCameraEnabled);
  const myUserName = useSelector((state: RootState) => state.myUsername.myUsername);

  const [isHandRaised, setIsHandRaised] = useState<boolean>(false);

  const dispatch = useDispatch();

  const turnOffAudio = () => {
    if (publisher) {
      publisher.publishAudio(false);
      dispatch(turnOffMic());
    }
  };

  const turnOnAudio = () => {
    if (publisher) {
      publisher.publishAudio(true);
      dispatch(turnOnMic());
    }
  };

  const toggleAudio = () => {
    if (publisher) {
      const newAudioState = !isMicEnabled;
      publisher.publishAudio(newAudioState);
      dispatch(toggleMic());
    }
  };

  const toggleVideo = () => {
    if (publisher) {
      publisher.publishVideo(!isCameraEnabled);
      dispatch(toggleCamera());
    }
  };

  const toggleHand = async () => {
    if (!session) return;

    if (conferenceStatus !== CONFERENCE_STATUS.QNA_ACTIVE) return;

    const newHandState = !isHandRaised;

    try {
      await session.signal({
        data: JSON.stringify({
          message: "손들기",
          isRaising: newHandState,
          userName: myUserName,
        }),
        type: "handup",
      });
      setIsHandRaised(!isHandRaised);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (publisher) {
      const audioTrack = publisher.stream.getMediaStream().getAudioTracks()[0];

      if (audioTrack.enabled) dispatch(turnOnMic());
      else dispatch(turnOffMic());
    }
  }, [publisher?.stream]);

  return {
    turnOffAudio,
    turnOnAudio,
    isScreenShared,
    isHandRaised,
    toggleAudio,
    toggleVideo,
    startScreenShare: startScreenShareSession,
    stopScreenShare: stopScreenShareSession,
    toggleHand,
    setIsHandRaised,
  };
};
