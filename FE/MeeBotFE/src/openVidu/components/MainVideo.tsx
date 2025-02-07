import { StreamManager } from "openvidu-browser";
import UserVideoComponent from "./UserVideoComponent";

interface MainVideoProps {
  mainStreamManager: StreamManager | undefined;
}

const MainVideo: React.FC<MainVideoProps> = ({ mainStreamManager }) => {
  return (
    <div className="w-full relative h-[calc(100vh-295px)] mb-24">
      {mainStreamManager && (
        <div className="w-full h-[109%] rounded-lg">
          <UserVideoComponent streamManager={mainStreamManager} />
        </div>
      )}
    </div>
  );
};

export default MainVideo;