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
  const profileImage = JSON.parse(streamManager.stream.connection.data).clientData.image;
  const isCameraEnabled = streamManager.stream.videoActive;

  return (
    <>
      {streamManager !== undefined ? (
        <div className="relative w-full">
          {isCameraEnabled ? (
            <div className="flex flex-col justify-center h-full">
              <OpenViduVideoComponent streamManager={streamManager} />
            </div>
          ) : (
            <div className="aspect-video bg-[#111827]">
              {localStorage.getItem("profile") ? (
                <img src={profileImage} alt="Profile" className="w-12 h-12 rounded-full absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%]" />
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
        </div>
      ) : null}
    </>
  );
};

export default UserVideoComponent;
