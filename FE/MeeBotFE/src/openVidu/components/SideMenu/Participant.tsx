import micOn from "../../assets/images/mic_on.png";
import micOff from "../../assets/images/mic_off.png";
import videoOn from "../../assets/images/video_on.png";
import videoOff from "../../assets/images/video_off.png";
import { ParticipantInfo } from "../../hooks/useOpenVidu";

interface ParticipantProps {
  participantsList: ParticipantInfo[];
}

const Participant: React.FC<ParticipantProps> = ({ participantsList }) => {
  return (
    <div className="flex flex-col gap-2 py-4">
      {participantsList.map((participant, i) => (
        <div key={i} className="flex items-center gap-3">
          <img className="w-8 h-8 rounded-full" src={participant.image} alt="profile-image" />
          <div className="flex-1">{participant.name}</div>
          <div className="flex gap-2">
            <img src={participant.isAudioActive ? micOn : micOff} alt={participant.isAudioActive ? "마이크 켜짐" : "마이크 꺼짐"} className="w-5 h-5" />
            <img src={participant.isVideoActive ? videoOn : videoOff} alt={participant.isVideoActive ? "비디오 켜짐" : "비디오 꺼짐"} className="w-5 h-5" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default Participant;
