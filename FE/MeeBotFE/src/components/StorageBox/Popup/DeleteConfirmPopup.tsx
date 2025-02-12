import React from 'react';
import { H3, P } from '../../common/Typography';
import Button from '../../common/Button';
import Modal from '../../common/Modal';

interface DeleteConfirmPopupProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const DeleteConfirmPopup: React.FC<DeleteConfirmPopupProps> = ({ isOpen, onCancel, onConfirm }) => {
  return (
    <Modal isOpen={isOpen} onClose={onCancel}>
      <div className="p-10 flex flex-col items-center gap-10">
        <div className="w-[95px] h-[95px]">
          <iframe
            src="https://lottie.host/embed/d7f2fe85-98b9-4741-81b7-020f7ec7a431/vnkcN8rhMz.lottie"
            className="w-full h-full"
            style={{ border: 'none' }}
          />
        </div>
        <div className="flex flex-col items-center gap-6">
          <H3 className="text-white text-center">
            정말로 요약본을 삭제하시겠습니까?
          </H3>
          <P className="text-white text-center">
            삭제된 요약본은 다시 복구할 수 없습니다
          </P>
        </div>
        <div className="flex gap-4">
          <Button
            variant="cancel"
            onClick={onCancel}
            className=""
          >
            취소
          </Button>
          <Button
            variant="normal"
            onClick={onConfirm}
            className="bg-[#F45757]"
          >
            삭제하기
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmPopup; 