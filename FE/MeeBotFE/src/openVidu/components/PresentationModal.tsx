import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { useEffect, useState } from "react";
import { PresenterOrderList } from "./PresenterOrderList";
import { ParticipantInfo } from "../hooks/useOpenVidu";

interface PresentationModalProps {
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

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1001]">
      <div className="bg-[#1C2135] w-[512px] h-[600px] rounded-lg flex flex-col">
        <div className="flex-1 overflow-y-auto px-6">
          <div className="mb-6 mt-6">
            <h2 className="text-white text-xl font-bold mb-2">발표회 설정</h2>
            <p className="text-gray-300 text-sm">
              발표를 위한 설정들을 입력해주세요.
              <br />
              입력하신 정보를 바탕으로 <span className="text-[#1AEBB8] font-bold">MeeU</span>가 발표 진행을 도와드립니다.
            </p>
          </div>
          <div className="mb-6">
            <h3 className="text-white text-lg mb-4">타이머 설정</h3>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-gray-300 text-sm mb-2">1인당 발표 시간 (분)</label>
                <div className="relative">
                  <select
                    className="w-full bg-[#171F2E] text-white p-2 rounded-lg border border-[#6B4CFF] hover:border-[#5940CC] appearance-none cursor-pointer"
                    value={presentationTime}
                    onChange={(e) => setPresentationTime(Number(e.target.value))}
                  >
                    {Array.from({ length: 12 }, (_, i) => (i + 1) * 1).map((minutes) => (
                      <option key={minutes} value={minutes}>
                        {minutes} 분
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L6 6L11 1" stroke="white" strokeWidth="2" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-gray-300 text-sm mb-2">질의응답 시간 (분)</label>
                <div className="relative">
                  <select
                    className="w-full bg-[#171F2E] text-white p-2 rounded-lg border border-[#6B4CFF] hover:border-[#5940CC] appearance-none cursor-pointer"
                    value={qnaTime}
                    onChange={(e) => setQnATime(Number(e.target.value))}
                  >
                    {Array.from({ length: 12 }, (_, i) => (i + 1) * 1).map((minutes) => (
                      <option key={minutes} value={minutes}>
                        {minutes} 분
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L6 6L11 1" stroke="white" strokeWidth="2" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-white text-lg mb-4">발표자 선택</h3>
            <div className="border border-[#464E62] rounded-lg p-4 min-h-[100px] max-h-[200px] overflow-y-auto">
              {selectedSpeakers.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedSpeakers.map((speaker) => (
                    <div key={speaker.name} className="bg-[#2C3440] text-white px-3 py-1 rounded-full flex items-center gap-2">
                      <span>{speaker.name}</span>
                      <button onClick={() => onSpeakerRemove(speaker.name)} className="text-gray-400 hover:text-white">
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-400 text-center">발표자를 선택해주세요</div>
              )}
            </div>

            <div className="mt-4">
              <div className="text-gray-300 text-sm mb-2">참가자 목록</div>
              <div className="flex flex-wrap gap-2">
                {participants
                  .filter((participant) => !selectedSpeakers.includes(participant))
                  .map((participant) => (
                    <button key={participant.name} onClick={() => onSpeakerSelect(participant)} className="bg-[#2C3440] text-white px-3 py-1 rounded-full hover:bg-[#3C4450]">
                      {participant.name}
                    </button>
                  ))}
              </div>
            </div>
          </div>

          <DragDropContext onDragEnd={onDragEnd}>
            <PresenterOrderList presentersOrder={presentersOrder} onRandomize={onRandomize} />
          </DragDropContext>

          <div className="mb-6 bg-[#2C3440] rounded-lg p-4">
            <p className="text-white mb-2">
              <span className="text-[#1AEBB8] font-bold">첫번째 발표</span>의 발표자는
              <span className="text-[#1AEBB8] mx-1 font-bold">{selectedSpeakers.length}명</span>
              이며, 발표시간은
              <span className="text-[#1AEBB8] mx-1 font-bold">약 {(presentationTime + qnaTime) * selectedSpeakers.length}분</span>
              으로 진행될 예정입니다.
            </p>
            <div className="text-[#8B8B8B] text-xs">
              ※ 발표 중에는 발표자의 화면이 공유되며, 발표 종료 중에는 질의응답 시간이 이어집니다.
              <br />※ 입력 완료를 누르면 발표회에 대한 수정이 불가능합니다.
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-[#464E62]">
          <div className="flex justify-end gap-3">
            <button onClick={onCancel} className="px-4 py-2 text-white rounded hover:bg-[#2C3440]">
              취소
            </button>
            <button onClick={onConfirm} className="px-4 py-2 bg-[#6B4CFF] text-white rounded hover:bg-[#5940CC]">
              입력완료
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
