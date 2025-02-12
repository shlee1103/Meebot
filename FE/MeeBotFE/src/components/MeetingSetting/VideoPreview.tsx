import { useSelector } from "react-redux";
import { RootState } from "../../stores/store";
import Webcam from "react-webcam";
import userIcon from "../../assets/user_icon.svg"

const VideoPreview = () => {
  const isCameraEnabled = useSelector((state: RootState) => state.device.isCameraEnabled);

  return (
    <div className='bg-[#3A3A3A] rounded-lg w-full relative aspect-[4/3] flex items-center justify-center'>
      {isCameraEnabled && (
        <Webcam
          className="absolute top-0 left-0 w-full h-full rounded-lg"
        />
      )}

      {
        (localStorage.getItem('profile')) ?
        <img src={localStorage.getItem('profile')!} alt="Profile" className="w-12 h-12 rounded-full" />
        :
        <img src={userIcon} alt="Profile" className="w-16 h-16 rounded-full" />
      }
    </div>
  )
}

export default VideoPreview