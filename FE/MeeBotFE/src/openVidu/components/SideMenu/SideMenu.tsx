import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../stores/store";
import SideMenuContent from "./SideMenuContent";
import { ParticipantInfo } from "../../hooks/useOpenVidu";

interface SideMenuProps {
  isMenuOpen: boolean;
  sessionId: string;
  participants: ParticipantInfo[];
  conferenceStatus: string;
  currentPresenter: ParticipantInfo | null;
  currentScript: string;
  myUserName: string;
  messages: {
    sender: {name: string, image: string};
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
  isMenuOpen,
  participants: participantsList,
  conferenceStatus,
  currentScript,
  currentPresenter,
  myUserName,
  messages,
  sendMessage,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("participants");
  const meetingTitle = useSelector((state: RootState) => state.meetingTitle.meetingTitle);

  return (
    <div className="relative">
      {/* 사이드 메뉴 */}
      <div
        className={`fixed top-0 right-0 bg-[#111827] text-white transform
          transition-transform duration-300 ease-in-out 
          ${isMenuOpen ? "translate-x-0" : "translate-x-full"}
          w-[380px] h-[calc(100vh-80px)] rounded-l-2xl border-l border-[#1f2937]
          shadow-[-4px_0px_15px_-5px_rgba(0,0,0,0.3)]`}
      >
        {/* 발표회 정보 */}
        <div className="h-14 flex items-center justify-between px-4">
          <span className="font-pretendard text-lg font-semibold">{meetingTitle}</span>
        </div>

        {/* 탭 버튼 */}
        <div className="flex justify-between items-center px-4 pb-3">
          <div className="flex-1 mx-1 relative group">
            <button
              onClick={() => setActiveTab("participants")}
              className={`w-full h-12 rounded-xl flex items-center justify-center
                transition-all duration-300 ease-in-out
                ${activeTab === "participants" 
                  ? "bg-[#6B4CFF] text-white shadow-md scale-[1.02]" 
                  : "bg-[#1f2937] text-gray-400 hover:bg-[#374151]"}`}
            >
              <svg
                className="w-6 h-6 transition-transform duration-300 ease-in-out"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 12.75c1.63 0 3.07.39 4.24.9 1.08.48 1.76 1.56 1.76 2.73V18H6v-1.61c0-1.18.68-2.26 1.76-2.73 1.17-.52 2.61-.91 4.24-.91zM4 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm18 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM12 12c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
              </svg>
            </button>
            <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 
              px-2 py-1 bg-[#374151] text-white text-xs rounded-md
              opacity-0 group-hover:opacity-100 transition-opacity duration-200
              whitespace-nowrap pointer-events-none font-pretendard">
              참여자
            </div>
          </div>

          <div className="flex-1 mx-1 relative group">
            <button
              onClick={() => setActiveTab("chat")}
              className={`w-full h-12 rounded-xl flex items-center justify-center
                transition-all duration-300 ease-in-out
                ${activeTab === "chat" 
                  ? "bg-[#6B4CFF] text-white shadow-md scale-[1.02]" 
                  : "bg-[#1f2937] text-gray-400 hover:bg-[#374151]"}`}
            >
              <svg
                className="w-6 h-6 transition-transform duration-300 ease-in-out"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
              </svg>
            </button>
            <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 
              px-2 py-1 bg-[#374151] text-white text-xs rounded-md
              opacity-0 group-hover:opacity-100 transition-opacity duration-200
              whitespace-nowrap pointer-events-none font-pretendard">
              채팅
            </div>
          </div>

          <div className="flex-1 mx-1 relative group">
            <button
              onClick={() => setActiveTab("script")}
              className={`w-full h-12 rounded-xl flex items-center justify-center
                transition-all duration-300 ease-in-out
                ${activeTab === "script" 
                  ? "bg-[#6B4CFF] text-white shadow-md scale-[1.02]" 
                  : "bg-[#1f2937] text-gray-400 hover:bg-[#374151]"}`}
            >
              <svg
                className="w-6 h-6 transition-transform duration-300 ease-in-out"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-2-12H7v2h10V7zm0 4H7v2h10v-2zm-3 4H7v2h7v-2z"/>
              </svg>
            </button>
            <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 
              px-2 py-1 bg-[#374151] text-white text-xs rounded-md
              opacity-0 group-hover:opacity-100 transition-opacity duration-200
              whitespace-nowrap pointer-events-none font-pretendard">
              스크립트
            </div>
          </div>
        </div>

        {/* 콘텐츠 */}
        <SideMenuContent
          activeTab={activeTab}
          participantsList={participantsList}
          conferenceStatus={conferenceStatus}
          currentScript={currentScript}
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
