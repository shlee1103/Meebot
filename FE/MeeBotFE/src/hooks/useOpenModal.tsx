import { useState } from 'react'

type ModalType = "create" | "join" | null

const useOpenModal = () => {
  const [isOpenModal, setIsOpenModal] = useState(false)
  const [modalType, setModalType] = useState<ModalType>(null);

  const clickModal = (type: ModalType) => {
    setIsOpenModal(true);
    setModalType(type);
  };

  const closeModal = () => {
    setIsOpenModal(false);
    setModalType(null);
  };
  return { isOpenModal, modalType, clickModal, closeModal}
}

export default useOpenModal