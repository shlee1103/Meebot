import React, { useEffect, useState, useRef } from "react";
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

interface ChatProps {
  myUserName: string;
  messages: { 
    sender: string; 
    text: string; 
    time: string;
  }[];
  sendMessage: (message: string) => void;
}
const Chat: React.FC<ChatProps> = ({ myUserName, messages, sendMessage }) => {
 const [message, setMessage] = useState("");
 const chatBoxRef = useRef<HTMLDivElement>(null);
 const [showEmojiPicker, setShowEmojiPicker] = useState(false);
 const inputRef = useRef<HTMLInputElement>(null);

 const handleSendMessage = () => {
  if (message.trim() !== "") {
    sendMessage(message);
    setMessage("");
  }
};

 const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
   if (e.key === "Enter") handleSendMessage();
 };

 const handleEmojiClick = (emojiData: EmojiClickData) => {
  setMessage(prev => prev + emojiData.emoji);
  setShowEmojiPicker(false);
  inputRef.current?.focus();  // 이모지 선택 후 입력 필드로 포커스
};


 useEffect(() => {
   if (chatBoxRef.current) {
     chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
   }
 }, [messages]);

 return (
  <div className="flex flex-col h-full">
    <div ref={chatBoxRef} className="flex-1 p-4 space-y-4 overflow-y-auto">
      {messages.length === 0 ? (
        <p className="text-gray-400 text-center">No messages yet.</p>
      ) : (
        messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === myUserName ? "justify-end" : "justify-start"}`}>
            {msg.sender !== myUserName && (
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0" />
                <div>
                  <div className="text-sm mb-1">
                    {msg.sender} <span className="text-gray-500 text-xs">참가자</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-end gap-2">
                      <div className="text-sm bg-gray-200 p-2 rounded-lg">{msg.text}</div>
                      <span className="text-xs text-gray-500">{msg.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
 
            {msg.sender === myUserName && (
              <div className="flex flex-col items-end">
                <div className="flex flex-col gap-2">
                  <div className="flex items-end gap-2">
                    <span className="text-xs text-gray-500">{msg.time}</span>
                    <div className="text-sm bg-teal-600 text-white rounded-lg p-2">{msg.text}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
 
    <div className="p-4 border-t">
      {showEmojiPicker && (
        <div className="absolute bottom-20 right-4">
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}
 
      <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2">
        <button 
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="text-gray-500 hover:text-gray-700"
        >
          😊
        </button>
        <input
         ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="채팅을 입력해주세요..."
          className="flex-1 bg-transparent outline-none text-sm"
        />
        <button
          onClick={handleSendMessage}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Send
        </button>
      </div>
    </div>
  </div>
 );
};

export default Chat;