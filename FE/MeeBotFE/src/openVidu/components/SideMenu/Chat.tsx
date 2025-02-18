import React, { useEffect, useState, useRef } from "react";
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
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
    <div className="flex flex-col h-full font-pretendard">
      <div ref={chatBoxRef} className="flex-1 pb-4 pr-2 space-y-4 overflow-y-auto custom-scrollbar">
        {messages.length === 0 ? (
          <p className="text-white/40 text-center text-sm">채팅이 없습니다.</p>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className="flex flex-col">
              {/* MEEU AI 메시지 */}
              {msg.sender.name === "MeeU" && (
                <div className="flex flex-col space-y-4">
                  {/* 요약 말풍선 */}
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center">
                      <img src={ChatMeeU} alt="MeeU" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <div className="text-sm mb-1">
                        <span className="text-[#2A8A86] font-medium">MeeU</span>
                      </div>
                      <div className="flex items-end gap-2">
                        <div className="bg-gradient-to-br from-[#2A8A86]/20 to-[#1AEBB8]/10 
                                      backdrop-blur-lg rounded-[2px_15px_15px_15px] p-3 
                                      border border-[#1AEBB8]/20">
                          <span className="text-white text-sm break-all whitespace-pre-wrap">
                            {msg.summary}
                          </span>
                        </div>
                        <span className="text-[11px] text-white/40">{msg.time}</span>
                      </div>
                    </div>
                  </div>

                  {/* 질문 말풍선 */}
                  {msg.question && (
                    <div className="flex items-start gap-2">
                      <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center">
                        <img src={ChatMeeU} alt="MeeU" className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <div className="text-sm mb-1">
                          <span className="text-[#2A8A86] font-medium">MeeU</span>
                        </div>
                        <div className="flex items-end gap-2">
                          <div className="bg-gradient-to-br from-[#2A8A86]/20 to-[#1AEBB8]/10 
                                          backdrop-blur-lg rounded-[2px_15px_15px_15px] p-3 
                                          border border-[#1AEBB8]/20">
                            <span className="text-white text-sm break-all whitespace-pre-wrap">
                              {msg.question}
                            </span>
                          </div>
                          <span className="text-[11px] text-white/40">{msg.time}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 다른 사용자의 메시지 */}
              {msg.sender.name !== "MeeU" && msg.sender.name !== myUserName && (
                <div className="flex items-start gap-3">
                  {(index === 0 || 
                    messages[index - 1]?.sender.name !== msg.sender.name || 
                    messages[index - 1]?.time !== msg.time) ? (
                    <>
                      <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden">
                        <img src={msg.sender.image} alt={msg.sender.name} 
                          className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-white/90 font-medium">
                            {msg.sender.name}
                          </span>
                          {isAdminMessage(msg) && (
                            <span className="px-1.5 py-[2px] text-[10px] bg-[#9747FF]/10 
                                          text-[#9747FF] rounded-full leading-none">
                              관리자
                            </span>
                          )}
                        </div>
                        <div className="flex items-end gap-2">
                          <div className={`p-3 rounded-[2px_15px_15px_15px] 
                            ${isAdminMessage(msg)
                              ? 'bg-gradient-to-br from-[#7B3FE4]/20 to-[#9747FF]/10 backdrop-blur-md border border-[#9747FF]/20'
                              : 'bg-white/5 backdrop-blur-md border border-white/10'
                            }`}>
                            <span className="text-white text-sm break-all whitespace-pre-wrap">
                              {msg.text}
                            </span>
                          </div>
                          {(index === messages.length - 1 || 
                            messages[index + 1]?.time !== msg.time || 
                            messages[index + 1]?.sender.name !== msg.sender.name) && (
                            <span className="text-[11px] text-white/40">{msg.time}</span>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="ml-11">
                      <div className="flex items-end gap-2">
                        <div className={`p-3 rounded-[2px_15px_15px_15px] 
                          ${isAdminMessage(msg)
                            ? 'bg-gradient-to-br from-[#7B3FE4]/20 to-[#9747FF]/10 backdrop-blur-md border border-[#9747FF]/20'
                            : 'bg-white/5 backdrop-blur-md border border-white/10'
                          }`}>
                          <span className="text-white text-sm break-all whitespace-pre-wrap">
                            {msg.text}
                          </span>
                        </div>
                        {(index === messages.length - 1 || 
                          messages[index + 1]?.time !== msg.time || 
                          messages[index + 1]?.sender.name !== msg.sender.name) && (
                          <span className="text-[11px] text-white/40">{msg.time}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 내 메시지 */}
              {msg.sender.name === myUserName && (
                <div className="flex justify-end items-end gap-2">
                  {(index === messages.length - 1 || 
                    messages[index + 1]?.time !== msg.time || 
                    messages[index + 1]?.sender.name !== msg.sender.name) && (
                    <span className="text-[11px] text-white/40">{msg.time}</span>
                  )}
                  <div className="bg-white/15 backdrop-blur-md p-3 
                                rounded-[15px_2px_15px_15px] 
                                border border-white/20">
                    <span className="text-white text-sm break-all whitespace-pre-wrap">
                      {msg.text}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 메시지 입력 영역 */}
      <div className="pb-6 relative">
        {showEmojiPicker && (
          <div className="absolute bottom-[76px] left-0">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}

        <div className="flex gap-2 bg-white/5 backdrop-blur-md p-2 rounded-xl">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="w-10 h-10 flex items-center justify-center
                      text-white/50 hover:text-white/80
                      transition-colors duration-200"
          >
            😊
          </button>
          
          <div className="flex-1 flex items-center">
            <textarea
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="메시지를 입력해주세요."
              rows={1}
              className="flex-1 bg-transparent outline-none 
                        text-white placeholder:text-white/40 
                        text-sm min-h-[40px] max-h-[120px] 
                        resize-none w-full
                        py-[10px] leading-[20px]
                        custom-scrollbar"
              style={{
                height: '40px',
                maxHeight: '120px',
                overflowY: 'auto'
              }}
              onInput={(e: React.FormEvent<HTMLTextAreaElement>) => {
                const target = e.currentTarget;
                target.style.height = '40px';
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
            className="send-button w-10 h-10 flex items-center justify-center
                      bg-[#2A8A86] rounded-lg
                      hover:bg-[#1AEBB8] 
                      transition-all duration-200"
          >
            <div className="svg-wrapper-1">
              <div className="svg-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" 
                     width={18} height={18}
                     className="text-white">
                  <path fill="none" d="M0 0h24v24H0z" />
                  <path fill="currentColor" 
                        d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z" />
                </svg>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;