import { Subscriber } from "openvidu-browser";
import UserVideoComponent from "./UserVideoComponent";

interface ParticipantsListProps {
  subscribers: Subscriber[];
  currentSlide: number;
  isMenuOpen: boolean;
  handlePrevSlide: () => void;
  handleNextSlide: () => void;
}

const ParticipantsList: React.FC<ParticipantsListProps> = ({ subscribers, currentSlide, isMenuOpen, handlePrevSlide, handleNextSlide }) => {
  return (
    <div className="flex items-center w-full my-[1%]">
      {((isMenuOpen && subscribers.length > 4) || (!isMenuOpen && subscribers.length > 6)) && currentSlide !== 0 && (
        <button className="w-[3%] aspect-square flex items-center justify-center bg-white/20 rounded-full text-white" onClick={handlePrevSlide}>
          ◀
        </button>
      )}
      <div className="flex justify-center gap-[2%] overflow-hidden w-full px-[3%]">
        {subscribers.slice(currentSlide, currentSlide + (isMenuOpen ? 4 : 6)).map((sub) => (
          <div
            key={sub.id}
            className="flex-1 min-w-0 aspect-video rounded-lg overflow-hidden"
            style={{
              maxWidth: "18%",
              minWidth: "14%",
            }}
          >
            <UserVideoComponent streamManager={sub} />
          </div>
        ))}
      </div>
      {((isMenuOpen && subscribers.length > 4) || (!isMenuOpen && subscribers.length > 6)) && currentSlide < subscribers.length - (isMenuOpen ? 4 : 6) && (
        <button className="w-[3%] aspect-square flex items-center justify-center bg-white/20 rounded-full text-white" onClick={handleNextSlide}>
          ▶
        </button>
      )}
    </div>
  );
};

export default ParticipantsList;
