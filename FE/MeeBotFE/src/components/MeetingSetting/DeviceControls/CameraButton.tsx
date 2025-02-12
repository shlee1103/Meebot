import { useSelector, useDispatch } from 'react-redux';
import { RootState, toggleCamera } from '../../../stores/store';
import Button from '../../common/Button';
import CameraOn from '../../../assets/camera_on_icon.svg'
import CameraOff from '../../../assets/camera_off_icon.svg'

const CameraButton = () => {
  const isCameraEnabled = useSelector((state: RootState) => state.device.isCameraEnabled);
  const dispatch = useDispatch();

  return (
    <Button
      variant='control'
      onClick={() => dispatch(toggleCamera())}
      icon={
        <img 
          src={isCameraEnabled ? CameraOn : CameraOff} 
          alt={isCameraEnabled ? "카메라 켜기" : "카메라 끄기"}
          className={`w-5 h-5 ${isCameraEnabled ? 'text-[#1EEBBA]' : 'text-white'}`}
        />
      }
      className={`${isCameraEnabled ? 'text-[#1EEBBA]' : 'text-white'}`}
    >
      {isCameraEnabled ? '카메라 켜기' : '카메라 끄기' }
    </Button>
  )
}

export default CameraButton