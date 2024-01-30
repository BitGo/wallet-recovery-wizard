import { Player } from '@lottiefiles/react-lottie-player';
import { Link } from 'react-router-dom';
import { Button } from '../../components';
import CelebrationCheck from './CelebrationCheck.json';

export function SuccessfulBroadcastTransaction() {
  return (
    <div className="tw-flex-col tw-items-center tw-p-16">
      <div className="tw-px-8 tw-mb-2">
        <div className="tw-mb-4">
          <Player
            autoplay
            keepLastFrame
            src={CelebrationCheck}
            style={{ height: '100px', width: '100px' }}
          />
        </div>
        <div className="tw-text-center tw-text-label-1 tw-text-gray-900 tw-pb-2 tw-max-w-prose">
          We recommend that you verify the transaction status using the
          downloaded transaction id in a public explorer.
        </div>
      </div>
      <div className="tw-flex tw-justify-center">
        <Button Tag={Link} to="/" Variant="secondary" Width="hug">
          Back to Home &rarr;
        </Button>
      </div>
    </div>
  );
}
