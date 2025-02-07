import Chat from "./Chat";
import Participant from "./Participant";
import Script from "./Script";

type TabType = 'participants' | 'chat' | 'script';

interface SideMenuContentProps {
  activeTab: TabType
  participantsList: string[]
  isPresenting: boolean
  currentPresenter: string | null
  currentScript: string
  myUserName: string;
  messages: { 
    sender: string; 
    text: string; 
    time: string;
  }[];
  sendMessage: (message: string) => void;
}

const SideMenuContent: React.FC<SideMenuContentProps> = ({ activeTab, participantsList, currentScript, isPresenting, currentPresenter, myUserName, messages, sendMessage }) => {
  return (
    <div className="h-[calc(100%-7rem)] overflow-y-auto">
      {activeTab === 'participants' && <Participant participantsList={participantsList} />}
      {activeTab === 'chat' && <Chat myUserName={myUserName} messages={messages} sendMessage={sendMessage} />}
      {activeTab === 'script' && <Script currentScript={currentScript} isPresenting={isPresenting} currentPresenter={currentPresenter} />}
    </div>
  )
}


export default SideMenuContent
