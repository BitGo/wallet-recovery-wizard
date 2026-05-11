import { Player } from '@lottiefiles/react-lottie-player';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../../components';
import CelebrationCheck from './CelebrationCheck.json';

export function SuccessfulRecovery() {
  const location = useLocation();
  const txId = (location.state as { txId?: string } | null)?.txId;

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
        {txId ? (
          <div className="tw-text-center tw-pb-2 tw-max-w-prose">
            <div className="tw-text-label-1 tw-text-gray-900 tw-mb-2">
              Transaction broadcast successfully.
            </div>
            <div className="tw-text-label-2 tw-text-gray-700 tw-mb-1">
              Transaction ID:
            </div>
            <div className="tw-font-mono tw-text-xs tw-break-all tw-mb-3">
              {txId}
            </div>
            <a
              href={`https://solscan.io/tx/${txId}`}
              target="_blank"
              rel="noreferrer"
              className="tw-text-blue-500 tw-underline"
            >
              View on Solscan &rarr;
            </a>
          </div>
        ) : (
          <div className="tw-text-center tw-text-label-1 tw-text-gray-900 tw-pb-2 tw-max-w-prose">
            We recommend that you use a third-party API to decode your txHex and
            verify its accuracy before broadcasting.
          </div>
        )}
      </div>
      <div className="tw-flex tw-justify-center tw-mt-4">
        <Button Tag={Link} to="/" Variant="secondary" Width="hug">
          Back to Home &rarr;
        </Button>
      </div>
    </div>
  );
}
