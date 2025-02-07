// import micOn from "../../assets/images/mic_on.png";
import micOff from "../../assets/images/mic_off.png";
// import videoOn from "../../assets/images/video_on.png";
import videoOff from "../../assets/images/video_off.png";

interface ParticipantProps {
    participantsList:  string[]
}

const Participant:React.FC<ParticipantProps> = ({participantsList}) => {
  return (
    <div className="flex flex-col gap-2 p-4">
      {participantsList.map((participant, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full" />
          <div className="flex-1">{participant}</div>
          <div className="flex gap-2">
            <img src={micOff} alt="스크립트" className="w-5 h-5" />
            <img src={videoOff} alt="스크립트" className="w-5 h-5" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default Participant

