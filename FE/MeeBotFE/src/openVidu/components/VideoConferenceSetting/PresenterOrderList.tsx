import { Droppable, Draggable } from "react-beautiful-dnd";
import { Menu } from "lucide-react";
import random from "../../assets/images/random.png";
import { ParticipantInfo } from "../../hooks/useOpenVidu";
import { Lg } from "../../../components/common/Typography";

interface PresenterOrderListProps {
  presentersOrder: ParticipantInfo[];
  onRandomize: () => void;
}

export const PresenterOrderList = ({ presentersOrder, onRandomize }: PresenterOrderListProps) => {
  if (presentersOrder.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#1AEBB8]" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
          <Lg className="text-white">발표 순서</Lg>
        </div>
        <button 
          onClick={onRandomize} 
          className="flex items-center gap-2 px-4 py-2 bg-[#171F2E] rounded-lg 
            text-white hover:bg-[#1A2338] transition-all duration-300 
            border border-[#2A3347] hover:border-[#464E62]
            disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={presentersOrder.length <= 1}
        >
          <img src={random} alt="랜덤" className="w-4 h-4" />
          <span className="text-sm font-medium">랜덤 돌리기</span>
        </button>
      </div>
      <Droppable droppableId="speakers">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="border border-[#2A3347] rounded-xl overflow-hidden
              shadow-[0_4px_20px_rgba(0,0,0,0.1)] p-4 space-y-2">
            {presentersOrder.map((presenter, index) => (
              <Draggable key={presenter.name} draggableId={presenter.name} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`
                      flex justify-between items-center bg-[#232D45] rounded-lg p-4
                      border border-transparent
                      transition-all duration-300 ease-in-out
                      hover:border-[#464E62] hover:bg-[#2A3347]
                      ${snapshot.isDragging ? "shadow-lg border-[#6B4CFF] bg-[#2A3347]" : ""}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[#1AEBB8] font-medium">{index + 1}</span>
                      <span className="text-white">{presenter.name}</span>
                    </div>
                    <div className="text-gray-400 hover:text-white transition-colors duration-300">
                      <Menu size={18} />
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};
