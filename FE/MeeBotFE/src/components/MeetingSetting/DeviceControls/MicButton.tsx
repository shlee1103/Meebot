import { useSelector, useDispatch } from 'react-redux';
import { RootState, toggleMic } from '../../../stores/store';
import Button from '../../common/Button';
import MicOn from '../../../assets/mic_on_icon.svg'
import MicOff from '../../../assets/mic_off_icon.svg'

const MicButton = () => {
  const isMicEnabled = useSelector((state: RootState) => state.device.isMicEnabled);
  const dispatch = useDispatch();

  return (
    <Button
      variant='control'
      onClick={() => dispatch(toggleMic()) }
      icon={
        <img 
          src={isMicEnabled ? MicOn : MicOff} 
          alt={isMicEnabled ? "오디오 켜기" : "오디오 끄기"}
          className={`w-5 h-5 ${isMicEnabled ? 'text-[#1EEBBA]' : 'text-white'}`}
        />
      }

      className={`${isMicEnabled ? 'text-[#1EEBBA]' : 'text-white'}`}
    >
      {isMicEnabled ? '오디오 켜기' : '오디오 끄기' }
    </Button>
  )
}

export default MicButton