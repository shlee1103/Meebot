import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../stores/store";
import { CONFERENCE_STATUS } from "../hooks/usePresentationControls";

interface HandsupListProps {
  conferenceStatus: string;
}

const HandsupList: React.FC<HandsupListProps> = ({ conferenceStatus }) => {
  const [isOpen, setIsOpen] = useState(false);
  const raisedHands = useSelector((state: RootState) => state.raisedHands.raisedHands);
  const presentersOrder = useSelector((state: RootState) => state.presentation.presentersOrder);
  const currentPresenterIndex = useSelector((state: RootState) => state.presentation.currentPresenterIndex);

  const currentPresenter = presentersOrder[currentPresenterIndex];
  const currentPresenterName = currentPresenter?.name || "";

  const ITEM_HEIGHT = 24;
  const MAX_VISIBLE_ITEMS = 5;
  const MAX_HEIGHT = ITEM_HEIGHT * MAX_VISIBLE_ITEMS + 20;

  if (conferenceStatus !== CONFERENCE_STATUS.QNA_ACTIVE) {
    return null;
  }

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center bg-[#1a2235] hover:bg-[#232d42] text-white text-sm px-4 py-2 rounded-lg">
        <span className="mr-2">질문자 목록</span>
        <span className="bg-blue-500 text-xs px-2 py-0.5 rounded-full">{raisedHands.length}</span>
      </button>

      {isOpen && (
        <div
          className="absolute bottom-full right-0 mb-2 bg-[#1a2235] rounded-lg p-3 shadow-lg w-60"
          style={{
            maxHeight: `${MAX_HEIGHT}px`,
            overflowY: raisedHands.length > MAX_VISIBLE_ITEMS ? "auto" : "hidden",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white text-sm font-medium">질문자 목록</h3>
            <span className="text-gray-400 text-xs">{raisedHands.length}명</span>
          </div>

          {raisedHands.length === 0 ? (
            <p className="text-gray-400 text-xs">아직 질문자가 없습니다</p>
          ) : (
            <div className="space-y-1">
              {raisedHands.map((participant) => (
                <div key={participant.connectionId} className={"flex items-center justify-between py-1 px-2 rounded hover:bg-gray-800/50"} style={{ height: `${ITEM_HEIGHT}px` }}>
                  <div className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    <span className="text-white text-xs truncate max-w-[120px]">{participant.userName}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HandsupList;
