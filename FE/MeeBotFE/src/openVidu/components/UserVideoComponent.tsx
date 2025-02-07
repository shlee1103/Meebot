import React from "react";
import { StreamManager } from "openvidu-browser";
import OpenViduVideoComponent from "./OpenViduVideoComponent";

interface Props {
  streamManager: StreamManager;
}

const UserVideoComponent: React.FC<Props> = ({ streamManager }) => {
  const getNicknameTag = (): string => {
    // Gets the nickName of the user
    return JSON.parse(streamManager.stream.connection.data).clientData;
  };

  return (
    <>
      {streamManager !== undefined ? (
        <div className="relative w-full h-full">
          <OpenViduVideoComponent streamManager={streamManager} />
          <div className="absolute top-0 left-0 px-1.5 text-black font-bold bg-white text-sm">
            <p className="m-0">{getNicknameTag()}</p>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default UserVideoComponent;
