import { useState } from "react";
import { Publisher, Session } from "openvidu-browser";
import { useDispatch } from "react-redux";
import { toggleCamera, toggleMic } from "../../stores/store";

export const useStreamControls = (
  publisher: Publisher | undefined, 
  session: Session | undefined,
  startScreenShareSession: () => Promise<void>,
  stopScreenShareSession: () => Promise<void>,
  isScreenShared: boolean
) => {
  const dispatch = useDispatch();

  const [isHandRaised, setIsHandRaised] = useState<boolean>(false);
  
  const toggleAudio = () => {
    if (publisher) {
      dispatch(toggleMic());
    }
  };
  
  const toggleVideo = () => {
    if (publisher) {
      dispatch(toggleCamera());
    }
  };
  
  const toggleHand = () => {
    setIsHandRaised(!isHandRaised);
  };

  return {
    isScreenShared,
    isHandRaised,
    toggleAudio,
    toggleVideo,
    startScreenShare: startScreenShareSession,
    stopScreenShare: stopScreenShareSession,
    toggleHand,
  };
};