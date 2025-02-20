import Lottie from "lottie-react";
import MeeU from "../../assets/MeeU.json";
import useOpenModal from "../../hooks/useOpenModal";
import Modal from "../common/Modal";
import MeetingJoinPopup from "../MeetingPopup/MeetingJoinPopup";
import MeetingCreatePopup from "../MeetingPopup/MeetingCreatePopup";
import LoginPopup from "../Login/LoginPopup";
import useAuth from "../../hooks/useAuth";
import { H1, P } from "../common/Typography";
import { useState } from "react";

const Hero = () => {
  const { isOpenModal, modalType, clickModal, closeModal } = useOpenModal();
  const { accessToken } = useAuth();
  const [showBlockPopup, setShowBlockPopup] = useState(false);

  // 시연을 위한 관리자 이메일 목록
  const adminEmails = ["qowlgo00@gmail.com", "sunju701@gmail.com", "thdgml1103@gmail.com", "threefours3443@gmail.com", "shee981103@gmail.com", "wpehdrbs12365@gmail.com", "siyun2072@gmail.com"];

  // 시연 시 회의 생성을 비허용하는 로직
  const handleCreateMeeting = () => {
    const userEmail = localStorage.getItem("email");
    if (userEmail) {
      if (adminEmails.includes(userEmail)) {
        clickModal("create");
      } else {
        setShowBlockPopup(true);
      }
    } else {
      clickModal("create");
    }
  };

  return (
    <>
      <div className="container mx-auto px-4 relative">
        <div className="absolute right-0 top-1/2 -translate-y-[60%] z-0 hidden lg:block w-[400px] lg:w-[500px] xl:w-[600px]">
          <Lottie
            animationData={MeeU}
            loop={false}
            autoplay={true}
            style={{
              width: "100%",
              height: "100%",
              filter: "drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.2))",
            }}
          />
        </div>

        <div className="max-w-6xl mx-auto flex flex-col items-center lg:items-start relative z-10">
          <div className="flex flex-col gap-2 mb-4 w-full max-w-xl animate-fade-in-up">
            <div className="relative">
              <H1 className="pb-2 text-white text-shadow-sm bg-gradient-to-r from-white to-[#1AEBB8] bg-clip-text text-transparent font-extrabold tracking-tight text-4xl md:text-5xl lg:text-6xl">
                MeeBot과 함께하는
              </H1>
              <H1 className="pb-6 text-white text-shadow-sm bg-gradient-to-r from-white to-[#1AEBB8] bg-clip-text text-transparent font-extrabold tracking-tight text-4xl md:text-5xl lg:text-6xl">
                스마트한 화상 회의
              </H1>
              <div className="absolute -top-4 -left-8 w-16 h-16 bg-[#1AEBB8]/10 rounded-full blur-xl animate-pulse"></div>
            </div>

            <P className="pb-8 text-white/90 leading-relaxed tracking-wide !font-light text-lg animate-fade-in animation-delay-400">
              <span className="font-medium text-white relative">
                AI 사회자 MeeU
                <span className="absolute bottom-0 left-0 w-full h-[0.2em] bg-[#1AEBB8]/30"></span>
              </span>
              와 함께 더 효율적이고 스마트한 화상 회의를 시작하세요
            </P>

            <div className="flex flex-col gap-2 text-white/80 animate-fade-in-up animation-delay-800">
              <div className="flex items-center gap-2 hover:translate-x-2 transition-transform duration-300">
                <svg className="w-5 h-5 text-[#1AEBB8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-pretendard font-medium">AI가 자동으로 발표회를 진행하고 요약해드립니다</span>
              </div>
              <div className="flex items-center gap-2 hover:translate-x-2 transition-transform duration-300">
                <svg className="w-5 h-5 text-[#1AEBB8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-pretendard font-medium">실시간 음성 인식으로 발표 내용을 텍스트로 확인</span>
              </div>
              <div className="flex items-center gap-2 hover:translate-x-2 transition-transform duration-300">
                <svg className="w-5 h-5 text-[#1AEBB8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-pretendard font-medium">AI가 발표회에 맞는 질문을 추천해드립니다</span>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full max-w-xl animate-fade-in-up animation-delay-600">
              <button
                onClick={handleCreateMeeting}
                className="feature-card w-full sm:w-64 bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] backdrop-blur-sm rounded-xl py-4 px-8 border border-[#8B5CF6]/20 transition-all duration-300 hover:shadow-lg hover:shadow-[#8B5CF6]/20 hover:scale-[1.02] hover:-translate-y-1"
              >
                <span className="text-white font-pretendard font-semibold text-xl">새 회의 시작하기</span>
              </button>

              <button
                onClick={() => clickModal("join")}
                className="feature-card w-full sm:w-64 bg-white/[0.02] backdrop-blur-sm rounded-xl py-4 px-8 border border-[#8B5CF6]/70 transition-all duration-300 hover:bg-[#8B5CF6]/10 hover:border-[#8B5CF6]/90 hover:scale-[1.02] hover:-translate-y-1"
              >
                <span className="text-white/90 font-pretendard font-medium text-xl">회의 참여하기</span>
              </button>
            </div>
          </div>
        </div>
        <Modal isOpen={isOpenModal} onClose={closeModal}>
          {modalType === "create" && accessToken && <MeetingCreatePopup onClose={closeModal} />}
          {modalType === "create" && !accessToken && <LoginPopup onClose={closeModal} />}
          {modalType === "join" && <MeetingJoinPopup onClose={closeModal} />}
        </Modal>
      </div>

      {/* 시연 시 회의 생성을 비허용하는 팝업 */}
      {showBlockPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999]">
          {/* 배경 */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowBlockPopup(false)} />

          {/* 팝업 내용 */}
          <div
            className="relative bg-[#1f2937] border border-white/10 rounded-2xl 
                        shadow-xl w-[400px] overflow-hidden
                        animate-[popIn_0.3s_ease-out]"
          >
            {/* 헤더 */}
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white font-pretendard">알림</h3>
              </div>
              <p className="mt-4 text-white/80 font-pretendard">시연 중에는 회의를 생성할 수 없습니다.</p>
            </div>

            {/* 푸터 */}
            <div className="px-6 py-4 bg-white/[0.02] flex justify-end">
              <button
                onClick={() => setShowBlockPopup(false)}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 
                         text-white text-sm font-medium transition-colors duration-200
                         font-pretendard"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default Hero;
