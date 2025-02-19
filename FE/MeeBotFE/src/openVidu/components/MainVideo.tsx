import { StreamManager } from "openvidu-browser";
import UserVideoComponent from "./UserVideoComponent";

interface MainVideoProps {
  mainStreamManager: StreamManager | undefined;
}

const MainVideo: React.FC<MainVideoProps> = ({ mainStreamManager }) => {
  return <div className="md:h-full md:w-auto h-auto w-full relative aspect-video flex items-center">{mainStreamManager && <UserVideoComponent streamManager={mainStreamManager} />}</div>;
};

export default MainVideo;
