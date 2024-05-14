import { useNavigate, useParams } from 'react-router-dom';
import { BackToHomeHelperText } from '~/components/BackToHomeHelperText';
import { WalletTypeSelect } from '~/components/WalletTypeSelect';
import { safeEnv } from '~/helpers';
import { evmCrossChainRecoveryWallets } from '~/helpers/config';

export function EvmCrossChainRecoveryIndex() {
  const { env } = useParams<'env'>();
  const environment = safeEnv(env);
  const navigate = useNavigate();

  return (
    <>
      <div className="tw-mb-8">
        <WalletTypeSelect
          onChange={event => {
            console.log(event.currentTarget.value);
            navigate(
              `/${environment}/evm-cross-chain-recovery/${event.currentTarget.value}`
            );
          }}
          wallets={evmCrossChainRecoveryWallets}
          helperText={<BackToHomeHelperText env={environment} />}
        />
      </div>
      <p className="tw-text-center tw-text-label-2 tw-font-medium tw-py-8 tw-border tw-border-dashed tw-my-4 tw-rounded tw-text-gray-700 tw-border-gray-700">
        Please select a wallet type above.
      </p>
    </>
  );
}
