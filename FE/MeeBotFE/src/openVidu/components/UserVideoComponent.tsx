import React from "react";
import { StreamManager } from "openvidu-browser";
import OpenViduVideoComponent from "./OpenViduVideoComponent";
import { Mn } from "../../components/common/Typography";
import userIcon from "../../assets/user_icon.svg";

interface Props {
  streamManager: StreamManager;
}

const UserVideoComponent: React.FC<Props> = ({ streamManager }) => {
  const getNicknameTag = (): string => {
    return JSON.parse(streamManager.stream.connection.data).clientData.name;
  };
  const isCameraEnabled = streamManager.stream.videoActive;
  const isAudioEnabled = streamManager.stream.audioActive;

  return (
    <>
      {streamManager !== undefined ? (
        <div className="relative w-full">
          {isCameraEnabled ? (
            <div className="flex flex-col justify-center h-full">
              <OpenViduVideoComponent streamManager={streamManager} />
            </div>
          ) : (
            <div className="aspect-video bg-[#171f2e]">
              {localStorage.getItem("profile") ? (
                <img src={localStorage.getItem("profile")!} alt="Profile" className="w-12 h-12 rounded-full absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%]" />
              ) : (
                <img src={userIcon} alt="Profile" className="w-12 h-12 rounded-full absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%]" />
              )}
            </div>
          )}

          <div
            className="absolute top-2 left-2 px-2 py-0.5 
            bg-black/40 backdrop-blur-[2px] rounded-md"
          >
            <Mn className="text-white text-sm">{getNicknameTag()}</Mn>
          </div>

          {!isAudioEnabled && (
            <div
              className="absolute top-2 right-2 px-2 py-0.5 
              bg-red-500/80 backdrop-blur-[2px] rounded-md"
            >
              <Mn className="text-white text-sm">음소거</Mn>
            </div>
          )}
        </div>
      ) : null}
    </>
  );
};

export default UserVideoComponent;
