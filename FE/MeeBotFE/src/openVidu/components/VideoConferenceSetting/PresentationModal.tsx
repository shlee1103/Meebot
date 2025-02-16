import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { useEffect, useState, useRef } from "react";
import { PresenterOrderList } from "./PresenterOrderList";
import { ParticipantInfo } from "../../hooks/useOpenVidu";
import { H3, Lg, Mn, P, Sm } from "../../../components/common/Typography";
import { RootState } from "../../../stores/store";
import { useSelector } from "react-redux";
import { Session } from "openvidu-browser";

interface PresentationModalProps {
  session: Session | undefined;
  isOpen: boolean;
  presentationTime: number;
  setPresentationTime: (time: number) => void;
  qnaTime: number;
  setQnATime: (time: number) => void;
  selectedSpeakers: ParticipantInfo[];
  presentersOrder: ParticipantInfo[];
  participants: ParticipantInfo[];
  onSpeakerSelect: (participant: ParticipantInfo) => void;
  onSpeakerRemove: (participant: string) => void;
  onDragEnd: (result: DropResult) => void;
  onCancel: () => void;
  onConfirm: () => void;
  onRandomize: () => void;
}

export const PresentationModal: React.FC<PresentationModalProps> = ({
  session,
  isOpen,
  presentationTime,
  setPresentationTime,
  qnaTime,
  setQnATime,
  selectedSpeakers,
  presentersOrder,
  participants,
  onSpeakerSelect,
  onSpeakerRemove,
  onDragEnd,
  onRandomize,
  onCancel,
  onConfirm,
}) => {
  const [mounted, setMounted] = useState(false);
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [isQnaDropdownOpen, setIsQnaDropdownOpen] = useState(false);
  const timeSelectRef = useRef<HTMLDivElement>(null);
  const qnaSelectRef = useRef<HTMLDivElement>(null);
  const { meetingTitle } = useSelector((state: RootState) => state.meetingTitle);

  const handleCompleteSetting = () => {
    if (!session) {
      alert("입력하신 정보가 저장되지 못했습니다.");
      return;
    }

    session.signal({
      data: JSON.stringify({
        qnaTime: qnaTime,
        presentationTime: presentationTime,
        presentersOrder: presentersOrder,
      }),
      type: "presentation-setting",
    });

    onConfirm();
  };

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
    } else {
      setMounted(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (timeSelectRef.current && !timeSelectRef.current.contains(event.target as Node)) {
        setIsTimeDropdownOpen(false);
      }
      if (qnaSelectRef.current && !qnaSelectRef.current.contains(event.target as Node)) {
        setIsQnaDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!isOpen || !mounted) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1002]
      transition-all duration-300 ease-in-out
      ${mounted ? "opacity-100" : "opacity-0"}`}
    >
      <div
        className={`bg-gradient-to-b from-[#1C2135] to-[#171F2E] w-[650px] h-[85%]
        rounded-2xl flex flex-col shadow-2xl border border-[#2A3347]/30
        transition-all duration-300 ease-out
        ${mounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"}`}
      >
        {/* Header */}
        <div
          className={`px-8 pt-8 pb-6 border-b border-[#2A3347]/30
          transition-all duration-500 delay-100
          ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <H3 className="text-white mb-3">발표회 설정</H3>
          <Mn className="text-gray-300">
            발표를 위한 설정들을 입력해주세요.
            <br />
            입력하신 정보를 바탕으로 <span className="text-[#1AEBB8] font-bold">MeeU</span>가 발표 진행을 도와드립니다.
          </Mn>
        </div>

        <div
          className={`flex-1 overflow-y-auto px-8 py-6 space-y-12 custom-scrollbar
          transition-all duration-500 delay-200
          ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          {/* 타이머 설정 */}
          <section className="space-y-4">
            <Lg className="text-white flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#1AEBB8]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              타이머 설정
            </Lg>
            <div className="flex gap-4">
              <div className="flex flex-col gap-2 flex-1">
                <Mn className="block text-gray-300">1인당 발표 시간 (분)</Mn>
                <div className="relative group" ref={timeSelectRef}>
                  <button
                    onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
                    className="w-full bg-[#171F2E] text-white p-3 rounded-lg 
                      border border-[#6B4CFF] hover:border-[#5940CC] 
                      focus:border-[#5940CC] focus:ring-2 focus:ring-[#6B4CFF]/20
                      focus:outline-none
                      transition-all duration-300 ease-in-out
                      cursor-pointer
                      text-base font-medium
                      hover:bg-[#1A2338]
                      text-left"
                  >
                    {presentationTime}분
                  </button>

                  {isTimeDropdownOpen && (
                    <div className="absolute z-10 w-full mt-2 py-1 bg-[#171F2E] rounded-lg border border-[#2A3347] shadow-lg">
                      {Array.from({ length: 12 }, (_, i) => (i + 1) * 5).map((minutes) => (
                        <button
                          key={minutes}
                          onClick={() => {
                            setPresentationTime(minutes);
                            setIsTimeDropdownOpen(false);
                          }}
                          className="w-full px-4 py-2.5 text-left text-gray-200 
                            hover:bg-[#1A2338] hover:text-white
                            transition-colors duration-150
                            border-b border-[#2A3347]/50
                            last:border-b-0"
                        >
                          {minutes}분
                        </button>
                      ))}
                    </div>
                  )}

                  <div
                    className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none
                      transition-all duration-300 ease-in-out
                      group-hover:translate-y-[2px]"
                  >
                    <svg
                      width="14"
                      height="8"
                      viewBox="0 0 14 8"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className={`transform transition-all duration-300 ease-in-out
                        group-hover:scale-110
                        ${isTimeDropdownOpen ? "rotate-180" : "rotate-0"}`}
                    >
                      <path
                        d="M1 1L7 7L13 1"
                        stroke="#6B4CFF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="group-hover:stroke-[#5940CC]
                          transition-all duration-300 ease-in-out"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <Mn className="block text-gray-300">질의응답 시간 (분)</Mn>
                <div className="relative group" ref={qnaSelectRef}>
                  <button
                    onClick={() => setIsQnaDropdownOpen(!isQnaDropdownOpen)}
                    className="w-full bg-[#171F2E] text-white p-3 rounded-lg 
                      border border-[#6B4CFF] hover:border-[#5940CC] 
                      focus:border-[#5940CC] focus:ring-2 focus:ring-[#6B4CFF]/20
                      focus:outline-none
                      transition-all duration-300 ease-in-out
                      cursor-pointer
                      text-base font-medium
                      hover:bg-[#1A2338]
                      text-left"
                  >
                    {qnaTime}분
                  </button>

                  {isQnaDropdownOpen && (
                    <div className="absolute z-10 w-full mt-2 py-1 bg-[#171F2E] rounded-lg border border-[#2A3347] shadow-lg">
                      {Array.from({ length: 12 }, (_, i) => (i + 1) * 5).map((minutes) => (
                        <button
                          key={minutes}
                          onClick={() => {
                            setQnATime(minutes);
                            setIsQnaDropdownOpen(false);
                          }}
                          className="w-full px-4 py-2.5 text-left text-gray-200 
                            hover:bg-[#1A2338] hover:text-white
                            transition-colors duration-150
                            border-b border-[#2A3347]/50
                            last:border-b-0"
                        >
                          {minutes}분
                        </button>
                      ))}
                    </div>
                  )}

                  <div
                    className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none
                      transition-all duration-300 ease-in-out
                      group-hover:translate-y-[2px]"
                  >
                    <svg
                      width="14"
                      height="8"
                      viewBox="0 0 14 8"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className={`transform transition-all duration-300 ease-in-out
                        group-hover:scale-110
                        ${isQnaDropdownOpen ? "rotate-180" : "rotate-0"}`}
                    >
                      <path
                        d="M1 1L7 7L13 1"
                        stroke="#6B4CFF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="group-hover:stroke-[#5940CC]
                          transition-all duration-300 ease-in-out"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 발표자 선택 */}
          <section className="space-y-4">
            <Lg className="text-white flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#1AEBB8]" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
              발표자 선택
            </Lg>
            <div
              className="bg-[#171F2E]/50 border border-[#2A3347] rounded-xl overflow-hidden
              shadow-[0_4px_20px_rgba(0,0,0,0.1)] backdrop-blur-sm"
            >
              <div className="p-4 min-h-[100px] max-h-[200px] overflow-y-auto custom-scrollbar">
                {selectedSpeakers.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedSpeakers.map((speaker) => (
                      <div
                        key={speaker.name}
                        className="bg-[#6B4CFF]/10 text-white px-4 py-2 rounded-lg 
                          flex items-center gap-2 border border-[#6B4CFF]/20
                          transition-all duration-300 group
                          hover:bg-[#6B4CFF]/20"
                      >
                        <span className="text-sm font-medium">{speaker.name}</span>
                        <button
                          onClick={() => onSpeakerRemove(speaker.name)}
                          className="text-[#6B4CFF]/70 hover:text-[#6B4CFF] 
                            transition-colors duration-300
                            w-5 h-5 rounded-full flex items-center justify-center
                            hover:bg-[#6B4CFF]/10"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Mn className="text-gray-400 text-center">발표자를 선택해주세요</Mn>
                )}
              </div>

              <div className="border-t border-[#2A3347] bg-[#1A2338] p-4">
                <Mn className="text-gray-300 mb-3">참가자 목록</Mn>
                <div className="flex flex-wrap gap-2">
                  {participants
                    .filter((participant) => !selectedSpeakers.includes(participant))
                    .map((participant) => (
                      <button
                        key={participant.name}
                        onClick={() => onSpeakerSelect(participant)}
                        className="bg-[#232D45] text-gray-300 px-4 py-2 rounded-lg
                          hover:bg-[#2A3347] hover:text-white
                          transition-all duration-300 ease-in-out
                          text-sm font-medium
                          border border-[#2A3347] hover:border-[#464E62]"
                      >
                        {participant.name}
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </section>

          {/* 발표 순서 */}
          <section className="space-y-4">
            <DragDropContext onDragEnd={onDragEnd}>
              <PresenterOrderList presentersOrder={presentersOrder} onRandomize={onRandomize} />
            </DragDropContext>
          </section>

          {/* 요약 */}
          <div
            className="bg-gradient-to-r from-[#1A2338] to-[#232D45] rounded-xl p-6 border border-[#2A3347]/30
            shadow-[0_4px_20px_rgba(0,0,0,0.1)]"
          >
            <P className="text-white mb-3 leading-relaxed tracking-wide">
              <span className="text-[#1AEBB8] mx-1 font-semibold">{meetingTitle}</span>의 발표자는
              <span className="text-[#1AEBB8] mx-1 font-semibold">{selectedSpeakers.length}명</span>이며, 발표시간은
              <span className="text-[#1AEBB8] mx-1 font-semibold">약 {(presentationTime + qnaTime) * selectedSpeakers.length}분</span>으로 진행될 예정입니다.
            </P>
            <div className="text-gray-400 text-sm space-y-2">
              <Mn className="tracking-wide leading-relaxed">※ 발표 중에는 발표자의 화면이 공유되며, 발표 종료 중에는 질의응답 시간이 이어집니다.</Mn>
              <Mn className="tracking-wide leading-relaxed">※ 입력 완료를 누르면 발표회에 대한 수정이 불가능합니다.</Mn>
            </div>
          </div>
        </div>

        <div
          className={`px-8 py-4 border-t border-[#2A3347]/30 bg-[#171F2E]/50 backdrop-blur-sm
          transition-all duration-500 delay-300
          ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-5 py-2.5 text-gray-300 rounded-lg hover:bg-[#2A3347]/50
                transition-all duration-300 ease-in-out font-medium"
            >
              <Sm>취소</Sm>
            </button>
            <button
              onClick={handleCompleteSetting}
              className="px-5 py-2.5 bg-[#6B4CFF] text-white rounded-lg
                hover:bg-[#5940CC] transition-all duration-300 ease-in-out
                font-medium shadow-lg shadow-[#6B4CFF]/20"
            >
              <Sm>입력완료</Sm>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
