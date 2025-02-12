import { useState, useEffect } from "react";
import Meeu from "../assets/images/MeeU.png";
import { P } from "../../components/common/Typography";
interface MeeUProps {
  speech: string;
}

const MeeU: React.FC<MeeUProps> = ({ speech }) => {
  const [lines, setLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState<number>(0);
  const [displayText, setDisplayText] = useState<string>("");
  const [currentCharIndex, setCurrentCharIndex] = useState<number>(0);

  useEffect(() => {
    if (speech) {
      const splitLines: string[] = [];
      let currentLine = "";
      const words = speech.split(" ");

      for (const word of words) {
        if (currentLine.length + word.length > 80) {
          splitLines.push(currentLine.trim());
          currentLine = word + " ";
        } else {
          currentLine += word + " ";
        }
      }
      if (currentLine) {
        splitLines.push(currentLine.trim());
      }

      setLines(splitLines);
      setCurrentLineIndex(0);
      setCurrentCharIndex(0);
      setDisplayText("");
    }
  }, [speech]);

  useEffect(() => {
    if (lines.length === 0) return;

    const currentLine = lines[currentLineIndex];
    if (currentCharIndex < currentLine.length) {
      const timer = setTimeout(() => {
        setDisplayText(currentLine.slice(0, currentCharIndex + 1));
        setCurrentCharIndex((prev) => prev + 1);
      }, 120);

      return () => clearTimeout(timer);
    } else if (currentLineIndex < lines.length - 1) {
      const timer = setTimeout(() => {
        setCurrentLineIndex((prev) => prev + 1);
        setCurrentCharIndex(0);
        setDisplayText("");
      }, 100);

      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setDisplayText("");
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [currentCharIndex, currentLineIndex, lines]);

  return (
    <div className="flex flex-col items-start justify-center bg-[#171f2e] p-4">
      <div className="flex flex-row items-start justify-start bg-[#171f2e] p-4 space-x-4">
        <div className="w-16 h-16">
          <img src={Meeu} alt="MeeU character" className="w-full h-full object-contain" />
        </div>

        {displayText && (
          <div className="relative bg-[#616161] rounded-lg p-4">
            <div className="absolute top-1/2 -left-2 transform -translate-y-1/2">
              <div className="w-4 h-4 bg-[#616161] transform rotate-45" />
            </div>
            <P className="text-white whitespace-nowrap">{displayText}</P>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeeU;
