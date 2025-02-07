import { useState } from 'react';
import participantsOn from "../../assets/images/participants_on.png";
import participantsOff from "../../assets/images/participants_off.png";
import chatOn from "../../assets/images/chat_on.png";
import chatOff from "../../assets/images/chat_off.png";
import scriptOn from "../../assets/images/script_on.png";
import scriptOff from "../../assets/images/script_off.png";
import SideMenuContent from './SideMenuContent';
// import pencil from "../../assets/images/pencil.png";
// import codeCopy from "../../assets/images/code_copy.png";

interface SideMenuProps {
  isMenuOpen: boolean;
  sessionId: string;
  participants: string[];
  onToggle: () => void;
  isPresenting: boolean;
  currentPresenter: string | null;
  currentScript: string;
  myUserName: string;
  messages: { 
    sender: string; 
    text: string; 
    time: string;
  }[];
  sendMessage: (message: string) => void;
}


type TabType = 'participants' | 'chat' | 'script';

const SideMenu: React.FC<SideMenuProps> = ({ isMenuOpen, sessionId, participants : participantsList, onToggle, isPresenting, currentScript, currentPresenter, myUserName, messages, sendMessage}) => {
  const [activeTab, setActiveTab] = useState<TabType>('participants');
  
  return (
    <>
      <button 
        onClick={onToggle} 
        className="fixed bottom-5 right-5 z-50 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        {isMenuOpen ? "닫기" : "메뉴"}
      </button>
      
      <div 
        className={`fixed top-0 right-0 h-screen bg-[#0A1017] text-white transform transition-transform duration-300 ease-in-out 
          ${isMenuOpen ? "translate-x-0" : "translate-x-full"}
          w-[380px]`}
      >
        {/* 헤더 */}
        <div className="h-14 flex items-center justify-between px-4">
          <span className="font-pretendard text-lg font-semibold">{sessionId}</span>
        </div>

        {/* 탭 버튼 */}
        {/* 참여자 버튼 */}
        <div className="flex justify-between px-4 py-2">
          <button
            onClick={() => setActiveTab('participants')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
              ${activeTab === 'participants' 
                ? 'bg-[#6B4CFF] text-white' 
                : 'text-gray-400 hover:bg-gray-800'}`}
          >
            <img 
              src={activeTab === 'participants' ? participantsOn : participantsOff} 
              alt="참여자" 
              className="w-5 h-5" 
            />
            <span>참여자</span>
          </button>

          {/* 채팅 버튼 */}
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
              ${activeTab === 'chat' 
                ? 'bg-[#6B4CFF] text-white' 
                : 'text-gray-400 hover:bg-gray-800'}`}
          >
            <img 
              src={activeTab === 'chat' ? chatOn : chatOff} 
              alt="채팅" 
              className="w-5 h-5" 
            />
            <span>채팅</span>
          </button>

          {/* 스크립트 버튼 */}
          <button
            onClick={() => setActiveTab('script')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
              ${activeTab === 'script' 
                ? 'bg-[#6B4CFF] text-white' 
                : 'text-gray-400 hover:bg-gray-800'}`}
          >
            <img 
              src={activeTab === 'script' ? scriptOn : scriptOff} 
              alt="스크립트" 
              className="w-5 h-5" 
            />
            <span>스크립트</span>
          </button>
        </div>

        {/* 콘텐츠 */}
        <SideMenuContent activeTab={activeTab} participantsList={participantsList} isPresenting={isPresenting} currentScript={currentScript} currentPresenter={currentPresenter} myUserName={myUserName} messages={messages} sendMessage={sendMessage}/>
      </div>
    </>
  );
};

export default SideMenu;