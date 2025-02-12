import { useState, useEffect } from "react";
import { Publisher } from "openvidu-browser";
import { useDispatch, useSelector } from "react-redux";
import { RootState, toggleCamera, toggleMic, turnOffMic, turnOnMic } from "../../stores/store";

export const useStreamControls = (publisher: Publisher | undefined, startScreenShareSession: () => Promise<void>, stopScreenShareSession: () => Promise<void>, isScreenShared: boolean) => {
  const isMicEnabled = useSelector((state: RootState) => state.device.isMicEnabled);
  const isCameraEnabled = useSelector((state: RootState) => state.device.isCameraEnabled);

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

  const toggleHand = () => {
    setIsHandRaised(!isHandRaised);
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
  };
};
