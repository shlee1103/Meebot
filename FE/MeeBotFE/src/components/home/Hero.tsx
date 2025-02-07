import Button from '../common/Button'
import Lottie from "lottie-react";
import MeeU from "../../assets/MeeU.json";
import useOpenModal from '../../hooks/useOpenModal';
import Modal from '../common/Modal';
import MeetingJoinPopup from '../MeetingPopup/MeetingJoinPopup';
import MeetingCreatePopup from '../MeetingPopup/MeetingCreatePopup';
import LoginPopup from '../Login/LoginPopup';
import useAuth from '../../hooks/useAuth';

const Hero = () => {
  const { isOpenModal, modalType, clickModal, closeModal } = useOpenModal();
  const { accessToken } = useAuth();
  
  return (
    <div className="flex flex-col lg:flex-row justify-between items-center px-4">
      <div className="w-full text-center lg:text-left lg:px-0 l-4 md:pl-8 lg:pl-36">
        <h1 className="font-stunning text-h1-sm md:text-h1-md lg:text-h1-lg font-h1 pb-6 text-white text-shadow-sm">
          MeeBot 미봇
        </h1>
        <p className="font-pretendard text-paragraph-sm md:text-paragraph-md lg:text-paragraph-lg font-paragraph pb-6 text-white">
          AI가 진행하는 스마트한 <span className='text-[#1AEBB8] font-semibold'>온라인 발표</span>,
          <br className="hidden lg:block" />
          이제 사회자 <span className='font-bold'>MeeU</span>와 함께
          <br className="hidden lg:block" />
          더욱 전문적인 발표 환경을 경험하세요.
          <br className="hidden lg:block" />
          <br className="hidden lg:block" />
          <span className='text-[#1AEBB8] font-semibold'>실시간 스크립트</span>부터 <span className='text-[#1AEBB8] font-semibold'>발표 요약</span>,
          <br className="hidden lg:block" />
          <span className='text-[#1AEBB8] font-semibold'>맞춤형 질문 추천</span>까지
          <br className="hidden lg:block" />
          효율적인 발표 진행을 위한 기능을 제공합니다.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-2 justify-center lg:justify-start">
          <Button onClick={() => clickModal("create")} variant='filled'>화상 모임 생성</Button>
          <Button onClick={() => clickModal("join")}  variant='outline'>화상 모임 참여</Button>
          <Modal isOpen={isOpenModal} onClose={closeModal}>
            {modalType === "create" && accessToken && <MeetingCreatePopup onClose={closeModal} />}
            {modalType === "create" && !accessToken && <LoginPopup onClose={closeModal}/>}
            {modalType === "join" && <MeetingJoinPopup onClose={closeModal} />}
          </Modal>
        </div>
      </div>
      <div className="mt-8 lg:mt-0 lg:absolute lg:right-0">
        <Lottie
          animationData={MeeU}
          loop={false}
          autoplay={true}
          className="w-[350px] h-[350px] md:w-[450px] md:h-[450px] lg:w-[550px] lg:h-[550px]"
        />
      </div>
    </div>
  )
}
export default Hero