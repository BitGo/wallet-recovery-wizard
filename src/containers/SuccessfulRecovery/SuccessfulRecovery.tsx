import { Link } from 'react-router-dom';
import { SuccessAnimation } from '../../components';

export function SuccessfulRecovery() {
  return (
    <div className="tw-flex-col tw-inline-block tw-items-center tw-border tw-border-solid tw-border-gray-700 tw-p-16">
      <div className="tw-px-8 tw-mb-2">
        <div className="tw-mb-4">
          <SuccessAnimation />
        </div>
        <div className="tw-text-center tw-text-label-1 tw-text-gray-900 tw-pb-2 tw-max-w-prose">
          We recommend that you use a third-party API to decode your txHex and
          verify its accuracy before broadcasting.
        </div>
      </div>
      <div className='tw-flex tw-justify-center'>
        <Link to="/">
          <div className="tw-inline tw-font-semibold tw-text-label-1 tw-text-gray-900 tw-px-3 tw-py-2 tw-rounded hover:tw-bg-gray-200">
            Back to Home &rarr;
          </div>
        </Link>
        </div>
    </div>
  );
}
