import React from 'react';
import { H3, P } from '../../../components/common/Typography';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';

interface LeavingConfirmPopupProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  popupTitle: string;
  popupText1: string;
  popupText2: string;
}

const LeavingConfirmPopup: React.FC<LeavingConfirmPopupProps> = ({ isOpen, onCancel, onConfirm, popupTitle, popupText1, popupText2 }) => {
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
            {popupTitle}
          </H3>
          <div className='flex flex-col gap-2'>
            {popupText1 !== "" &&
              <P className="text-white text-center">
                {popupText1}
              </P>
            }
            {popupText2 !== "" &&
              <P className="text-white text-center">
                {popupText2}
              </P>
            }
          </div>
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
            나가기
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default LeavingConfirmPopup; 