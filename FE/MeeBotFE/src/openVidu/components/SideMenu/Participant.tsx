import { BsMicFill, BsMicMuteFill } from "react-icons/bs";
import { BsCameraVideoFill, BsCameraVideoOffFill } from "react-icons/bs";
import { ParticipantInfo } from "../../hooks/useOpenVidu";
import { useSelector } from "react-redux";
import { RootState } from "../../../stores/store";

interface ParticipantProps {
  participantsList: ParticipantInfo[];
}

const Participant: React.FC<ParticipantProps> = ({ participantsList }) => {
  const myUserName = useSelector((state: RootState) => state.myUsername.myUsername);

  return (
    <div className="flex flex-col gap-3 py-4 font-pretendard">
      {participantsList.map((participant, i) => {
        const isMe = participant.name === myUserName;
        const isAdmin = participant.role === 'admin';

        return (
          <div
            key={i}
            className="flex items-center p-3 rounded-2xl bg-white/5 backdrop-blur-sm 
            hover:bg-white/10 transition-all duration-200 shadow-sm"
          >
            {/* 프로필 이미지 섹션 */}
            <div className="relative">
              <img
                className="w-11 h-11 rounded-full border border-white/10 
                  shadow-lg hover:scale-105 transition-transform duration-200"
                src={participant.image}
                alt="profile"
              />
              {/* 활성 상태 표시 */}
              <div className={`absolute -bottom-0 -right-0 w-3 h-3 rounded-full 
                ${participant.isAudioActive || participant.isVideoActive
                ? 'bg-gradient-to-r from-cyan-400 to-teal-400 animate-pulse'
                : 'bg-gray-500/50'
                } border-1 border-white/10 shadow-md`}
              />
            </div>

            {/* 참가자 정보 섹션 */}
            <div className="flex-1 ml-4">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-medium text-white/90">
                    {participant.name}
                  </span>
                  <div className="flex gap-1">
                    {isMe && (
                      <span className="px-1.5 py-[2px] text-[10px] font-medium bg-cyan-500/10 
                        text-cyan-300/90 rounded-full leading-none">
                        나
                      </span>
                    )}
                    {isAdmin && (
                      <span className="px-1.5 py-[2px] text-[10px] font-medium bg-purple-500/10 
                        text-purple-300/90 rounded-full leading-none">
                        관리자
                      </span>
                    )}
                  </div>
                </div>
                {participant.email && (
                  <div className="text-[11px] text-white/40 mt-0.5 tracking-tight">
                    {participant.email}
                  </div>
                )}
              </div>
            </div>

            {/* 디바이스 상태 섹션 */}
            <div className="flex gap-2 items-center">
              <div className={`p-1.5 rounded-lg transition-all duration-300
                ${participant.isAudioActive
                ? 'bg-gradient-to-r from-cyan-400/20 to-teal-400/20 hover:from-cyan-400/30 hover:to-teal-400/30'
                : 'bg-red-500/20 hover:bg-red-500/30'
                }`}
              >
                {participant.isAudioActive ? (
                  <BsMicFill className="w-3.5 h-3.5 text-cyan-200" />
                ) : (
                  <BsMicMuteFill className="w-3.5 h-3.5 text-red-400" />
                )}
              </div>
              <div className={`p-1.5 rounded-lg transition-all duration-300
                ${participant.isVideoActive
                ? 'bg-gradient-to-r from-cyan-400/20 to-teal-400/20 hover:from-cyan-400/30 hover:to-teal-400/30'
                : 'bg-red-500/20 hover:bg-red-500/30'
                }`}
              >
                {participant.isVideoActive ? (
                  <BsCameraVideoFill className="w-3.5 h-3.5 text-cyan-200" />
                ) : (
                  <BsCameraVideoOffFill className="w-3.5 h-3.5 text-red-400" />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Participant;
