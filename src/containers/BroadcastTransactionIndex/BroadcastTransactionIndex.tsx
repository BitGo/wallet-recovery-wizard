import { useNavigate, useParams } from 'react-router-dom';
import { CoinsSelectAutocomplete } from '~/components';
import { BackToHomeHelperText } from '~/components/BackToHomeHelperText';
import { safeEnv } from '~/helpers';
import { broadcastTransactionCoins } from '~/helpers/config';

export function BroadcastTransactionIndex() {
  const { env } = useParams<'env'>();
  const environment = safeEnv(env);
  const navigate = useNavigate();
  return (
    <>
      <div className="tw-mb-8">
        <CoinsSelectAutocomplete
          onChange={event => {
            navigate(
              `/${environment}/broadcast-transaction/${event.currentTarget.value}`
            );
          }}
          coins={broadcastTransactionCoins[environment]}
          helperText={<BackToHomeHelperText env={environment} />}
        />
      </div>
      <p className="tw-text-center tw-text-label-2 tw-font-medium tw-py-8 tw-border tw-border-dashed tw-my-4 tw-rounded tw-text-gray-700 tw-border-gray-700">
        Please select a currency above.
      </p>
    </>
  );
}
