import { useState, useEffect } from "react";
import Meeu from "../assets/images/MeeU.png";
import { P } from "../../components/common/Typography";

interface MeeUProps {
  speech: string;
  currentSentence: string;
}

const MeeU: React.FC<MeeUProps> = ({ currentSentence }) => {
  const [displayText, setDisplayText] = useState<string>("");
  const [currentCharIndex, setCurrentCharIndex] = useState<number>(0);

  useEffect(() => {
    if (!currentSentence) {
      setDisplayText("");
      setCurrentCharIndex(0);
      return;
    }

    if (currentCharIndex < currentSentence.length) {
      const timer = setTimeout(() => {
        setDisplayText(currentSentence.slice(0, currentCharIndex + 1));
        setCurrentCharIndex((prev) => prev + 1);
      }, 100); // 타이핑 속도 조절

      return () => clearTimeout(timer);
    }
  }, [currentSentence, currentCharIndex]);

  useEffect(() => {
    if (currentSentence) {
      setCurrentCharIndex(0);
      setDisplayText("");
    }
  }, [currentSentence]);

  return (
    <div className="flex flex-col items-start justify-center bg-[#171f2e] p-3">
      <div className="flex flex-row items-start justify-start bg-[#171f2e] p-2 space-x-3">
        <div className="w-12 h-12 animate-bounce-slow">
          <img src={Meeu} alt="MeeU character" className="w-full h-full object-contain hover:scale-110 transition-transform duration-300" />
        </div>

        {displayText && (
          <div
            className="relative bg-gradient-to-r from-[#2A3347] to-[#232D45] rounded-2xl p-3 min-w-[200px]
            shadow-lg border border-[#464E62]/30 backdrop-blur-sm
            animate-in fade-in slide-in-from-left-4 duration-300"
          >
            <div className="absolute top-1/2 -left-2 transform -translate-y-1/2">
              <div className="w-3 h-3 bg-[#2A3347] transform rotate-45 border-l border-t border-[#464E62]/30" />
            </div>
            <P className="text-white whitespace-pre-wrap text-sm">{displayText}</P>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeeU;
