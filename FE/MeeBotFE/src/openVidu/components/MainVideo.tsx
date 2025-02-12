import { StreamManager } from "openvidu-browser";
import UserVideoComponent from "./UserVideoComponent";

interface MainVideoProps {
  mainStreamManager: StreamManager | undefined;
}

const MainVideo: React.FC<MainVideoProps> = ({ mainStreamManager }) => {
  return <div className="w-full h-full relative">{mainStreamManager && <UserVideoComponent streamManager={mainStreamManager} />}</div>;
};

export default MainVideo;
