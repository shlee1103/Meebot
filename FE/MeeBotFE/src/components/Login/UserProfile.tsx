import { useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import { Sm, Mn } from '../common/Typography';

const UserProfile = () => {
  const [userInfo, setUserInfo] = useState<{ name: string; profile: string } | null>(null);
  const [showDropdown, setShowDropdown] = useState(false)
  const { accessToken, logout } = useAuth();

  useEffect(() => {
    if (accessToken) {
      const name = localStorage.getItem('name');
      const profile = localStorage.getItem('profile');
      if (name && profile) {
        setUserInfo({ name, profile });
      }
    }
  }, [accessToken]);

  const handleProfileClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.profile-container')) {
      setShowDropdown(false);
    }
  };

  const handleArchiveClick = () => {
    // 보관함으로 이동
    setShowDropdown(false);
  };

  useEffect(() => {
    if (showDropdown) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showDropdown]);

  {
    return (
      <div className='relative profile-container'>
        <div className="flex items-center gap-3 cursor-pointer" onClick={handleProfileClick}>
          <img src={userInfo?.profile} alt="Profile" className="w-8 h-8 rounded-full" />
          <Sm className='font-pretendard font-medium text-[22px] text-[#E9E5FF]'>{userInfo?.name}님</Sm>
        </div>
        {showDropdown && (
          <div className="absolute right-0 top-12 min-w-[148px] bg-[rgba(153,153,153,0.2)] rounded-[5px]">
            <div className="flex flex-col py-4 px-6 whitespace-nowrap">
              <button onClick={handleArchiveClick}>
                <Mn className="w-full text-white text-right cursor-pointer hover:text-[#757575] transition-colors duration-300">
                  보관함으로 이동
                </Mn>
              </button>
              <div className="w-full h-[1px] my-3 bg-[rgba(255,255,255,0.1)]" />
              <button onClick={logout}>
                <Mn className="w-full text-white text-right cursor-pointer hover:text-[#757575] transition-colors duration-300">
                  로그아웃
                </Mn>
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }
};

export default UserProfile