import { CONFERENCE_STATUS } from "../hooks/usePresentationControls";
import { useSelector } from "react-redux";
import { RootState } from "../../stores/store";

interface ConferenceStatusButtonProps {
  conferenceStatus: string;
  changeConferenceStatus: (status: string) => void;
}

const ConferenceStatusButton: React.FC<ConferenceStatusButtonProps> = ({ conferenceStatus, changeConferenceStatus }) => {
  const role = useSelector((state: RootState) => state.role.role);

  if (role != "admin") return null;

  const handleClickConferenceStatusButton = () => {
    changeConferenceStatus(conferenceStatus);
  };

  // 상태별 버튼 스타일을 객체로 정의
  const buttonStyles = {
    // [CONFERENCE_STATUS.CONFERENCE_WAITING]: "bg-gradient-to-b from-[#A1A6BC] to-[#626A8D]",  // 발표회 시작(그라데이션)
    [CONFERENCE_STATUS.CONFERENCE_WAITING]: "bg-[#626A8D] hover:bg-[#626A8D]", // 발표회 시작
    [CONFERENCE_STATUS.PRESENTATION_READY]: "bg-green-500 hover:bg-green-600", // 발표시작
    [CONFERENCE_STATUS.PRESENTATION_ACTIVE]: "bg-red-500 hover:bg-red-600", // 발표종료
    [CONFERENCE_STATUS.PRESENTATION_COMPLETED]: "bg-purple-500 hover:bg-purple-600",
    [CONFERENCE_STATUS.QNA_READY]: "bg-blue-500 hover:bg-blue-600",
    [CONFERENCE_STATUS.QNA_ACTIVE]: "bg-blue-500 hover:bg-blue-600",
    [CONFERENCE_STATUS.QNA_COMPLETED]: "bg-purple-500 hover:bg-purple-600", // 보라색
  };

  return (
    <button
      className={`${buttonStyles[conferenceStatus]} text-white 
                     rounded-lg px-6 py-3 font-bold shadow-lg 
                     transition-all duration-300 ease-in-out 
                     hover:scale-105`}
      onClick={handleClickConferenceStatusButton}
    >
      {conferenceStatus === CONFERENCE_STATUS.CONFERENCE_WAITING && <p>발표회 시작</p>}
      {conferenceStatus === CONFERENCE_STATUS.PRESENTATION_READY && <p>발표 시작</p>}
      {conferenceStatus === CONFERENCE_STATUS.PRESENTATION_ACTIVE && <p>발표 종료</p>}
      {(conferenceStatus === CONFERENCE_STATUS.PRESENTATION_COMPLETED || conferenceStatus === CONFERENCE_STATUS.QNA_READY) && <p>질의응답 시작</p>}
      {conferenceStatus === CONFERENCE_STATUS.QNA_ACTIVE && <p>질의응답 종료</p>}
      {conferenceStatus === CONFERENCE_STATUS.QNA_COMPLETED && <p>발표회 종료</p>}
    </button>
  );
};

export default ConferenceStatusButton;
