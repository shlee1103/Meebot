import { ParticipantInfo } from "../../hooks/useOpenVidu";
import Chat from "./Chat";
import Participant from "./Participant";
import Script from "./Script";

type TabType = "participants" | "chat" | "script";

interface SideMenuContentProps {
  activeTab: TabType;
  participantsList: ParticipantInfo[];
  conferenceStatus: string;
  currentPresenter: ParticipantInfo | null;
  currentScript: string;
  myUserName: string;
  messages: {
    sender: { name: string; image: string };
    text?: string;
    summary?: string;
    question?: string;
    time: string;
    eventType?: string;
  }[];
  sendMessage: (message: string) => void;
}

const SideMenuContent: React.FC<SideMenuContentProps> = ({ activeTab, participantsList, currentScript, conferenceStatus, currentPresenter, myUserName, messages, sendMessage }) => {
  // console.log("참가 목록 :", participantsList);
  return (
    <div className="h-[calc(100%-7rem)] overflow-y-auto px-5">
      {activeTab === "participants" && <Participant participantsList={participantsList} />}
      {activeTab === "chat" && <Chat myUserName={myUserName} messages={messages} sendMessage={sendMessage} />}
      {activeTab === "script" && <Script currentScript={currentScript} conferenceStatus={conferenceStatus} currentPresenter={currentPresenter} />}
    </div>
  );
};

export default SideMenuContent;
