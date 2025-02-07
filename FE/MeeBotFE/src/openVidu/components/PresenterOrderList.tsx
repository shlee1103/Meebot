import { Droppable, Draggable } from "react-beautiful-dnd";
import { Menu } from "lucide-react";
import random from "../assets/images/random.png";

interface PresenterOrderListProps {
  presentersOrder: string[]; // 발표 순서
  onRandomize: () => void;
}

export const PresenterOrderList = ({ presentersOrder, onRandomize }: PresenterOrderListProps) => {
  if (presentersOrder.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-lg">발표 순서</h3>
        <button onClick={onRandomize} className="flex items-center gap-2 px-3 py-1.5 bg-[#2C3440] rounded-lg text-white hover:bg-[#3C4450] transition-colors" disabled={presentersOrder.length <= 1}>
          <img src={random} alt="랜덤" className="w-4 h-4" />
          <span className="text-sm">랜덤 돌리기</span>
        </button>
      </div>
      <Droppable droppableId="speakers">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="border border-[#464E62] rounded-lg p-4 space-y-2">
            {presentersOrder.map((presenter, index) => (
              <Draggable key={presenter} draggableId={presenter} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`
                      flex justify-between items-center bg-[#2C3440] rounded-lg p-3
                      ${snapshot.isDragging ? "shadow-lg border border-[#6B4CFF]" : ""}
                    `}
                  >
                    <div>
                      <span className="text-[#1AEBB8] mr-3">{index + 1}</span>
                      <span className="text-white">{presenter}</span>
                    </div>
                    <div className="mr-3 text-gray-400 hover:text-white">
                      <Menu size={20} />
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
