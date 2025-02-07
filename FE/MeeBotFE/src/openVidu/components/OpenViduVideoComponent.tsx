import React, { useEffect, useRef } from "react";
import { StreamManager } from "openvidu-browser";

interface Props {
  streamManager: StreamManager;
}

const OpenViduVideoComponent: React.FC<Props> = ({ streamManager }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (streamManager && videoRef.current) {
      streamManager.addVideoElement(videoRef.current);
    }
  }, [streamManager]);

  return <video autoPlay={true} ref={videoRef} className="w-full h-full float-left cursor-pointer object-contain" />;
};

export default OpenViduVideoComponent;
