import React from "react";
import { StreamManager } from "openvidu-browser";
import OpenViduVideoComponent from "./OpenViduVideoComponent";
import { Mn } from "../../components/common/Typography";
import userIcon from "../../assets/user_icon.svg";

interface Props {
  streamManager: StreamManager;
}

const UserVideoComponent: React.FC<Props> = ({ streamManager }) => {
  const getUserData = () => {
    const { clientData } = JSON.parse(streamManager.stream.connection.data);
    return {
      name: clientData.name,
      image: clientData.image,
    };
  };

  const isCameraEnabled = streamManager.stream.videoActive;
  const userData = getUserData();

  return (
    <>
      {streamManager !== undefined ? (
        <div className="relative w-full h-full">
          {isCameraEnabled ? (
            <OpenViduVideoComponent streamManager={streamManager} />
          ) : (
            <div className="w-full h-full">
              <img src={userData.image || userIcon} alt="Profile" className="w-12 h-12 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
          )}
          <div
            className="absolute top-2 left-2 px-2 py-0.5 
            bg-black/40 backdrop-blur-[2px] rounded-md"
          >
            <Mn className="text-white text-sm">{userData.name}</Mn>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default UserVideoComponent;
