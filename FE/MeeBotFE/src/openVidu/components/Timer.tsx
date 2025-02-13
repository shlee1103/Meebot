import React from "react";
import { Session } from "openvidu-browser";
import { useTimer } from "../hooks/useTimer";
import { useSelector } from "react-redux";
import { RootState } from "../../stores/store";

interface TimerProps {
  conferenceStatus: string;
  session: Session | undefined;
  isSpeaking: boolean;
}

const Timer: React.FC<TimerProps> = ({ conferenceStatus, session, isSpeaking }) => {
  const role = useSelector((state: RootState) => state.role.role);
  const isAdmin = role === "admin";

  const { minutes, remainingSeconds, isLastMinute } = useTimer({
    conferenceStatus,
    session,
    isAdmin,
    isSpeaking,
  });

  return (
    <div className="bg-[#0a1929] rounded-lg px-6 py-3 lg:inline-block hidden">
      <div className={`font-mono text-4xl tracking-wider ${isLastMinute ? "text-red-500" : "text-[#1AEBB8]"}`}>
        {String(minutes).padStart(2, "0")}:{String(remainingSeconds).padStart(2, "0")}
      </div>
    </div>
  );
};

export default Timer;
