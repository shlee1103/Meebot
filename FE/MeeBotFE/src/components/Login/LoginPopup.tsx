import React from 'react';
import apiClient from '../../apis/apiClient';
import Button from '../common/Button';
import googleIcon from '../../assets/google_icon.svg'
import closeIcon from '../../assets/close_icon.svg'
import MainLogo from '../../assets/MeeBotLogo.svg'
import { Sm } from '../common/Typography';

interface LoginPopupProps {
  onClose: () => void;
}

const LoginPopup: React.FC<LoginPopupProps> = ({ onClose }) => {
  const handleLogin = async () => {
    try {
      const { data } = await apiClient.post('api/v1/oauth2/google');
      window.location.href = data;
    } catch (error) {
      console.error('로그인 실패:', error);
    }
  };

  return (
    <div>
      <button onClick={onClose} className='absolute right-6 top-6'>
        <img src={closeIcon} alt="닫기" />
      </button>
      <div className='flex flex-col items-center gap-[84px] py-[96px] px-[72px]'>
        <div className="flex flex-col items-center gap-2">
          <img src={MainLogo} alt="" className='w-full'/>
          <div className="h-[1px] w-full bg-white" />
          <Sm className="text-white">
            AI 사회자와 함께하는 화상채팅 플랫폼
          </Sm>
        </div>
        <Button variant="glow" icon={<img src={googleIcon}></img>} onClick={handleLogin}>구글 계정으로 시작하기</Button>
      </div>
    </div >
  );
};

export default LoginPopup;