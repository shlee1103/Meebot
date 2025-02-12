import React from 'react';
import Button from './Button';
import Modal from './Modal';
import LoginPopup from './../Login/LoginPopup';
import MeeBotLogo from '../../assets/MeeBotLogo.svg'
import useOpenModal from '../../hooks/useOpenModal'
import useAuth from '../../hooks/useAuth';
import UserProfile from '../Login/UserProfile';
import { useNavigate } from 'react-router';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const { isOpenModal, clickModal, closeModal } = useOpenModal();
  const { accessToken } = useAuth();
  const navigate = useNavigate()

  return (
    <header className={`flex justify-between items-center py-10 px-6 md:px-12 lg:px-24 absolute top-0 w-full ${className}`} id="header">
      <a href="#" onClick={(e) => {
        e.preventDefault()
        navigate('/')
      }
      }>
        <img src={MeeBotLogo} alt="MeeBotLogo" className='h-10' />
      </a>
      {accessToken ? (
        <UserProfile />
      ) : (
        <div>
          <Button onClick={() => clickModal(null)} variant='login'>로그인</Button>
          <Modal isOpen={isOpenModal} onClose={closeModal}>
            <LoginPopup onClose={closeModal} />
          </Modal>
        </div>
      )}
    </header>
  )
}

export default Header;