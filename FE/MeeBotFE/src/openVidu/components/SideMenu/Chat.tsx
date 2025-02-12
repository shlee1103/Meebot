import React, { useEffect, useState, useRef } from "react";
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { Mn, Sm } from "../../../components/common/Typography";
import ChatMeeU from "../../../assets/chatMeeU.png"

interface ChatProps {
  myUserName: string;
  messages: {
    sender: { name: string, image: string, role?: string };
    text?: string;
    summary?: string;
    question?: string;
    time: string;
    eventType?: string;
  }[];

  sendMessage: (message: string) => void;
}
    
const Chat: React.FC<ChatProps> = ({ myUserName, messages, sendMessage }) => {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const sendButtonRef = useRef<HTMLButtonElement>(null);

  const isAdminMessage = (msg: { sender: { name: string, role?: string } }) => {
    return msg.sender.role === "admin";
  };

  const triggerSendAnimation = () => {
    if (sendButtonRef.current) {
      sendButtonRef.current.classList.add('send-animation');
      setTimeout(() => {
        sendButtonRef.current?.classList.remove('send-animation');
      }, 600);
    }
  }

  const handleSendMessage = () => {
    if (message.trim() !== "") {
      sendMessage(message);
      setMessage("");
      if (inputRef.current) {
        inputRef.current.style.height = '24px';
      }
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
      triggerSendAnimation();
    }
  };
  
  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div ref={chatBoxRef} className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar">
        {messages.length === 0 ? (
          <p className="text-gray-400 text-center">채팅이 없습니다.</p>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className="flex flex-col">
              {/* MEEU AI 메시지 */}
              {msg.sender.name === "MeeU" && (
                <div className="flex flex-col space-y-4">
                  {/* 요약 말풍선 */}
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden">
                      <img
                        src={ChatMeeU}
                        alt="MeeU"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-sm mb-1">
                        <Sm className="text-[#30B0AA]">MeeU</Sm>
                      </div>
                      <div className="flex items-end gap-2">
                        <div className={`
                          box-border flex flex-col justify-center items-center p-[14px] gap-[10px]
                          w-fit rounded-[0px_15px_15px_15px] bg-[#30B0AA]`}
                        >
                          <Mn className="text-black break-all !font-semibold whitespace-pre-wrap">{msg.summary}</Mn>
                        </div>
                        <span className="font-pretendard text-xs text-[#AFAFAF] text-nowrap">{msg.time}</span>
                      </div>
                    </div>
                  </div>

                  {/* 질문 말풍선 */}
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden">
                      <img
                        src={ChatMeeU}
                        alt="MeeU"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-sm mb-1">
                        <Sm className="text-[#30B0AA]">MeeU</Sm>
                      </div>
                      <div className="flex items-end gap-2">
                        <div className={`
                          box-border flex flex-col justify-center items-center p-[14px] gap-[10px]
                          w-fit rounded-[0px_15px_15px_15px] bg-[#30B0AA]`}
                        >
                          <Mn className="text-black break-all !font-semibold whitespace-pre-wrap">{msg.question}</Mn>
                        </div>
                        <span className="font-pretendard text-xs text-[#AFAFAF] text-nowrap">{msg.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 다른 사용자의 메시지보기 */}
              {msg.sender.name !== "MeeU" && msg.sender.name !== myUserName && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center">
                    <img src={msg.sender.image} alt={msg.sender.name} className="w-full h-full object-cover rounded-full" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Mn className="text-white">{msg.sender.name}</Mn>
                      {isAdminMessage(msg) && (
                        <span className="font-pretendard text-xs font-normal text-[#30B0AA] rounded-[15px] py-1 px-3 bg-[#171F2E]">관리자</span>
                      )}
                    </div>
                    <div className="flex items-end gap-2">
                      <div className={`
                        box-border flex flex-col justify-center items-center p-[14px] gap-[10px]
                        w-fit rounded-[0px_15px_15px_15px] border-[1.5px] ${isAdminMessage(msg)
                          ? "bg-[#000000] border-[#30B0AA]"
                          : "bg-[#26303F] border-[#384250]"
                        }`}
                      >
                        <Mn className="text-white break-all whitespace-pre-wrap">{msg.text}</Mn>
                      </div>
                      <span className="font-pretendard text-xs text-[#AFAFAF] text-nowrap">{msg.time}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 내 메시지 */}
              {msg.sender.name === myUserName && (
                <div className="flex justify-end">
                  <div className="flex items-end gap-2">
                    <span className="font-pretendard text-xs text-[#AFAFAF] text-nowrap">{msg.time}</span>
                    <div className={`
                        box-border flex flex-col justify-center items-center p-[14px] gap-[10px] 
                        w-fit border rounded-[0px_15px_15px_15px] transform scale-x-[-1] 
                        bg-[#192B42] border-[#384250]
                      `}
                    >
                      <Mn className="transform scale-x-[-1] text-white break-all whitespace-pre-wrap">{msg.text}</Mn>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 메시지 입력 영역 */}
      <div className="flex flex-row gap-3 py-3 px-6 items-end">
        {showEmojiPicker && (
          <div className="absolute bottom-20 right-4">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}

        <div className="flex flex-1 items-center gap-2 bg-[#4B5161] rounded-[10px] px-4 py-2 min-h-[44px]">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="text-gray-500 hover:text-gray-700 flex-shrink-0 items-center"
          >
            😊
          </button>
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => handleKeyPress(e)}
            placeholder="메시지를 입력해주세요."
            rows={1}
            className="flex-1 bg-transparent outline-none font-pretendard text-white 
            placeholder:text-[#8D8F93] placeholder:font-pretendard 
            lg:text-mn-lg md:text-mn-md text-mn-sm custom-scrollbar items-center
            min-h-[24px] max-h-[120px] resize-none overflow-y-auto w-full py-0"
            style={{
              height: 'auto',
              maxHeight: '120px',
              overflowY: 'auto'
            }}
            onInput={(e: React.FormEvent<HTMLTextAreaElement>) => {
              const target = e.currentTarget;
              target.style.height = '24px';
              const newHeight = Math.min(target.scrollHeight, 120);
              target.style.height = `${newHeight}px`;
            }}
          />
        </div>
        <button 
          ref={sendButtonRef}
          onClick={() => {
            handleSendMessage();
            triggerSendAnimation();
          }}
          className="send-button bg-[#2D8CFF] text-white rounded-[10px] flex-shrink-0 w-11 h-11 flex items-center justify-center"
        >
          <div className="svg-wrapper-1">
            <div className="svg-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={24} height={24}>
                <path fill="none" d="M0 0h24v24H0z" />
                <path fill="currentColor" d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z" />
              </svg>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Chat;