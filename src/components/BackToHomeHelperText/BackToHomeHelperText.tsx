import { Link } from 'react-router-dom';
import { BitgoEnv } from '~/helpers';

export type BackToHomeHeaderProps = {
  env?: BitgoEnv;
};

export function BackToHomeHelperText({ env }: BackToHomeHeaderProps) {
  return (
    <div>
      <span className="tw-text-gray-700">
        Current environment: &nbsp;
        <span className="tw-font-semibold">
          {env === 'prod' ? 'Mainnet' : 'Testnet'}
        </span>
        . &nbsp;
      </span>
      <Link to="/" className="tw-text-blue-200 hover:tw-underline">
        Go back to change &rarr;
      </Link>
    </div>
  );
}
