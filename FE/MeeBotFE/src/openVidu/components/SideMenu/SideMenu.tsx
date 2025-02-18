import { useState } from "react";
import SideMenuContent from "./SideMenuContent";
import MeetingTitle from "./MeetingTitle";
import { ParticipantInfo } from "../../hooks/useOpenVidu";
import { Session } from "openvidu-browser";

interface SideMenuProps {
  isMenuOpen: boolean;
  session: Session | undefined;
  sessionId: string;
  participants: ParticipantInfo[];
  conferenceStatus: string;
  currentPresenter: ParticipantInfo | null;
  accumulatedScript: string;
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

type TabType = "participants" | "chat" | "script";

const SideMenu: React.FC<SideMenuProps> = ({
  sessionId,
  session,
  isMenuOpen,
  participants: participantsList,
  conferenceStatus,
  accumulatedScript,
  currentPresenter,
  myUserName,
  messages,
  sendMessage,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("participants");

  return (
    <div className="relative">
      {/* 사이드 메뉴 */}
      <div
        className={`fixed top-0 right-0 bg-[#171F2E] text-white transform
          transition-transform duration-300 ease-in-out 
          ${isMenuOpen ? "translate-x-0" : "translate-x-full"}
          w-[380px] h-[calc(100vh-88px)] rounded-l-2xl border-l border-[#1f2937]
          shadow-[-4px_0px_15px_-5px_rgba(0,0,0,0.3)]`}
      >
        {/* 헤더 */}
        <div className="h-14 flex items-center justify-between px-5">
          <MeetingTitle roomCode={sessionId} session={session} />
        </div>

        {/* 탭 버튼 */}
        <div className="grid grid-cols-3 gap-3 px-5 pb-3">
          {[
            { 
              id: "participants", 
              icon: "M9 13.75c-2.34 0-7 1.17-7 3.5V19h14v-1.75c0-2.33-4.66-3.5-7-3.5zM4.34 17c.84-.58 2.87-1.25 4.66-1.25s3.82.67 4.66 1.25H4.34zM9 12c1.93 0 3.5-1.57 3.5-3.5S10.93 5 9 5 5.5 6.57 5.5 8.5 7.07 12 9 12zm0-5c.83 0 1.5.67 1.5 1.5S9.83 10 9 10s-1.5-.67-1.5-1.5S8.17 7 9 7zm7.04 6.81c1.16.84 1.96 1.96 1.96 3.44V19h4v-1.75c0-2.02-3.5-3.17-5.96-3.44zM15 12c1.93 0 3.5-1.57 3.5-3.5S16.93 5 15 5c-.54 0-1.04.13-1.5.35.63.89 1 1.98 1 3.15s-.37 2.26-1 3.15c.46.22.96.35 1.5.35z", 
              label: "참여자" 
            },
            { 
              id: "chat", 
              icon: "M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12zM7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z", 
              label: "채팅" 
            },
            { 
              id: "script", 
              icon: "M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6zm2-6h8v2H8v-2zm0-3h8v2H8v-2zm0-3h5v2H8V8z", 
              label: "스크립트" 
            }
          ].map(tab => (
            <div key={tab.id} className="relative group">
              <button
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`w-full h-12 rounded-xl flex items-center justify-center
                  transition-all duration-300 ease-in-out relative overflow-hidden
                  backdrop-blur-sm
                  ${activeTab === tab.id 
                    ? 'bg-[#6B4CFF]/80 shadow-lg border-2 border-[#8168FF]/70 transform scale-105' 
                    : 'bg-[#6B4CFF]/5 hover:bg-[#6B4CFF]/10 border border-[#6B4CFF]/20'}`}
                style={{
                  boxShadow: activeTab === tab.id 
                    ? '0 8px 16px rgba(107, 76, 255, 0.15)' 
                    : 'none'
                }}
              >
                <svg 
                  className={`transition-all duration-300 ease-in-out
                    ${activeTab === tab.id 
                      ? 'w-5 h-5 text-white' 
                      : 'w-5 h-5 text-[#6B4CFF]/70'}`} 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d={tab.icon} />
                </svg>
                {activeTab === tab.id && (
                  <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
                )}
              </button>
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 
                            px-3 py-1.5 bg-[#2A3447] backdrop-blur-sm
                            text-white font-medium text-xs rounded-lg
                            opacity-0 group-hover:opacity-100 transition-opacity duration-200
                            whitespace-nowrap pointer-events-none font-pretendard
                            shadow-lg">
                {tab.label}
              </div>
            </div>
          ))}
        </div>

        {/* 콘텐츠 */}
        <SideMenuContent
          activeTab={activeTab}
          participantsList={participantsList}
          conferenceStatus={conferenceStatus}
          accumulatedScript={accumulatedScript}
          currentPresenter={currentPresenter}
          myUserName={myUserName}
          messages={messages}
          sendMessage={sendMessage}
        />
      </div>
    </div>
  );
};

export default SideMenu;
