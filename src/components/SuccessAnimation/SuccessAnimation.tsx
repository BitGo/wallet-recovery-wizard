import { Player } from '@lottiefiles/react-lottie-player';
import CelebrationCheck from '../../assets/styles/CelebrationCheck.json';

export function SuccessAnimation() {
  return (
    <div>
      <Player
        autoplay
        keepLastFrame
        src={CelebrationCheck}
        style={{ height: '100px', width: '100px' }}
      />
    </div>
  );
}
