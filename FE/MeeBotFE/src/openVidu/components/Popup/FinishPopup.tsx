import { H3, P } from "../../../components/common/Typography";
import Modal from "../../../components/common/Modal";
import useAuth from "../../../hooks/useAuth";
import Button from "../../../components/common/Button";
import { useNavigate } from "react-router-dom";

interface FinishPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const FinishPopup: React.FC<FinishPopupProps> = ({ isOpen, onClose }) => {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  const handleMoveButton = () => {
    onClose();
    const email = localStorage.getItem("email");
    if (email) {
      navigate(`/storage-box?email=${email}`);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-10 flex flex-col items-center gap-10">
        <div className="w-[95px] h-[95px]">
          <iframe src="https://lottie.host/embed/ea4a1151-bc3c-4f88-aeba-eafc838a16dc/XrTSVN42Q4.lottie" className="w-full h-full" style={{ border: "none" }} />
        </div>
        <div className="flex flex-col items-center gap-6">
          <H3 className="text-white text-center">발표회가 종료되었습니다.</H3>
          {accessToken && <P className="text-white text-center">발표 요약본은 개인 보관함에서 확인 가능합니다.</P>}
        </div>
        <div className="flex gap-4">
          <Button variant="cancel" onClick={onClose} className="">
            닫기
          </Button>
          {accessToken && (
            <Button variant="normal" onClick={handleMoveButton} className="bg-[#59B189]">
              보관함으로 이동하기
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default FinishPopup;
