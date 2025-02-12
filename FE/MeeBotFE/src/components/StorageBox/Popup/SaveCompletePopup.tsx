import React, { useEffect } from 'react';
import { H3, P } from '../../common/Typography';
import Modal from '../../common/Modal';

interface SaveCompletePopupProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'notion' | 'pdf';
}

const SaveCompletePopup: React.FC<SaveCompletePopupProps> = ({ isOpen, onClose, type }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 1800);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-10 flex flex-col items-center gap-10">
        <div className="w-[95px] h-[95px]">
          <iframe
            src="https://lottie.host/embed/ea4a1151-bc3c-4f88-aeba-eafc838a16dc/XrTSVN42Q4.lottie"
            className="w-full h-full"
            style={{ border: 'none' }}
          />
        </div>
        <div className="flex flex-col items-center gap-6">
          <H3 className="text-white text-center">
            {type === 'notion' ? 'Notion' : 'PDF'} 저장이 완료되었습니다
          </H3>
          <P className="text-white text-center">
            {type === 'notion' 
              ? '노션에서 저장된 요약본을 확인해보세요' 
              : '다운로드 폴더에서 저장된 요약본을 확인해보세요'}
          </P>
        </div>
      </div>
    </Modal>
  );
};

export default SaveCompletePopup; 