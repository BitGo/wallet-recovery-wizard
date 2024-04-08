import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CoinsSelectAutocomplete } from '~/components/CoinsSelectAutocomplete';
import { useAlertBanner } from '~/contexts';
import { mapSdkErrorToAlert, safeEnv } from '~/helpers';
import {
  allCoinMetas,
  CoinMetadata,
  wrongChainRecoveryCoins,
} from '~/helpers/config';
import { WrongChainRecoveryForm } from './WrongChainRecoveryForm';

export function WrongChainRecovery() {
  const { env } = useParams<'env'>();
  const navigate = useNavigate();
  const [_, setAlert] = useAlertBanner();

  const environment = safeEnv(env);

  const sourceCoins: readonly CoinMetadata[] = Object.keys(
    wrongChainRecoveryCoins[environment]
  ).map(key => {
    return allCoinMetas[key as keyof typeof allCoinMetas];
  });
  const [sourceCoin, setSourceCoin] = useState<string | undefined>(
    sourceCoins[0]?.value
  );

  const destinationCoins = useMemo(() => {
    return sourceCoin ? wrongChainRecoveryCoins[environment][sourceCoin] : [];
  }, [environment, sourceCoin]);

  const [destinationCoin, setDestinationCoin] = useState<string | undefined>(
    destinationCoins[0]?.value
  );

  useEffect(() => {
    if (
      destinationCoins.length &&
      !destinationCoins.find(item => item.value === destinationCoin)
    ) {
      setDestinationCoin(destinationCoins[0].value);
    }
  }, [destinationCoins, destinationCoin]);

  const apiProvider = (): 'Block Chair' | undefined => {
    return 'Block Chair';
  };

  return (
    <>
      {!sourceCoin || !destinationCoin ? (
        // TODO(BG-67581): testnet only has 1 coin enabled for cross chain recovery
        <>
          This feature is not supported on&nbsp;
          <span className="tw-font-semibold">
            {environment === 'prod' ? 'Mainnet' : 'Testnet'}.
          </span>
        </>
      ) : (
        <>
          <div className="tw-flex tw-flex-col tw-gap-4 md:tw-flex-row md:tw-gap-16 tw-mb-4">
            <CoinsSelectAutocomplete
              coins={sourceCoins}
              selectedCoin={sourceCoin}
              onChange={event => {
                setSourceCoin(event.currentTarget.value);
              }}
              helperText={
                <span className="tw-text-gray-700">
                  This is the coin that was sent to the wrong address.
                  <br />
                  For instance, if you sent BTC to an LTC address, the source
                  coin would be BTC.
                </span>
              }
            />
            <CoinsSelectAutocomplete
              coins={destinationCoins}
              selectedCoin={destinationCoin}
              onChange={event => {
                setDestinationCoin(event.currentTarget.value);
              }}
              helperText={
                <span className="tw-text-gray-700">
                  This is the coin of the wallet that received the source coin.
                  <br />
                  For instance, if you sent BTC to an LTC address, the
                  destination coin would be LTC.
                </span>
              }
            />
          </div>
          <WrongChainRecoveryForm
            sourceCoin={sourceCoin}
            destinationCoin={destinationCoin}
            apiProvider={apiProvider()}
            onSubmit={async (values, { setSubmitting }) => {
              setSubmitting(true);
              setAlert(undefined);
              if (!(await window.queries.isSdkAuthenticated())) {
                setAlert('Not logged in');
                setSubmitting(false);
                navigate(`/${environment}/wrong-chain-recovery`);
                return;
              }
              const res = await window.commands.wrongChainRecover(
                sourceCoin,
                destinationCoin,
                {
                  txid: values.transactionId,
                  recoveryAddress: values.destinationAddress,
                  wallet: values.walletId,
                  walletPassphrase: values.walletPassphrase,
                  xprv: values.privateKey,
                  apiKey: values.apiKey,
                }
              );
              setSubmitting(false);
              if (res instanceof Error) {
                setAlert(mapSdkErrorToAlert(res.message));
              } else {
                const showSaveDialogData = await window.commands.showSaveDialog(
                  {
                    filters: [
                      {
                        name: 'Custom File Type',
                        extensions: ['json'],
                      },
                    ],
                    defaultPath: `~/wrong-chain-recovery-${sourceCoin}-${destinationCoin}-${Date.now()}.json`,
                  }
                );
                if (!showSaveDialogData.filePath) {
                  throw new Error('No file path selected');
                }
                await window.commands.writeFile(
                  showSaveDialogData.filePath,
                  JSON.stringify(res, null, 2),
                  { encoding: 'utf-8' }
                );
                navigate(
                  `/${environment}/wrong-chain-recovery/${sourceCoin}/success`
                );
              }
            }}
          />
        </>
      )}
    </>
  );
}
