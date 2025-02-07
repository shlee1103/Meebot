import React from 'react';
import styled from 'styled-components';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <ModalWrap>
      <ModalBackground onClick={onClose} />
      <ModalContent>{children}</ModalContent>
    </ModalWrap>
  );
};

const ModalWrap = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
`;

const ModalBackground = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  cursor: pointer;
`;

const ModalContent = styled.div`
  position: relative;
  background: #171F2E;
  border-radius: 10px;
  z-index: 1000;
  min-width: 30px;
`;

export default Modal;