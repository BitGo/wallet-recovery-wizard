import { useNavigate, useParams } from 'react-router-dom';
import { CoinsSelectAutocomplete } from '~/components';
import { useAlertBanner } from '~/contexts';
import { safeEnv } from '~/helpers';
import { broadcastTransactionCoins } from '~/helpers/config';
import { HederaForm } from './HederaForm';
import { BackToHomeHelperText } from '~/components/BackToHomeHelperText';
import { AlgorandForm } from '~/containers/BroadcastTransactionCoin/AlgorandForm';

function Form() {
  const { env, coin } = useParams<'env' | 'coin'>();
  const bitGoEnvironment = safeEnv(env);
  const [, setAlert] = useAlertBanner();
  const navigate = useNavigate();

  switch (coin) {
    case 'hbar':
    case 'thbar':
      return (
        <HederaForm
          key={coin}
          onSubmit={async (values, { setSubmitting }) => {
            setAlert(undefined);
            setSubmitting(true);
            try {
              await window.commands.setBitGoEnvironment(bitGoEnvironment, coin);
              const chainData = await window.queries.getChain(coin);
              const broadcastResult =
                await window.commands.broadcastTransaction(coin, {
                  serializedSignedTransaction: values.serializedSignedTx,
                  startTime: values.startTime as string | undefined,
                });
              const showSaveDialogData = await window.commands.showSaveDialog({
                filters: [
                  {
                    name: 'Custom File Type',
                    extensions: ['json'],
                  },
                ],
                defaultPath: `~/${chainData}-broadcast-transaction-${Date.now()}.json`,
              });

              if (!showSaveDialogData.filePath) {
                throw new Error('No file path selected');
              }

              await window.commands.writeFile(
                showSaveDialogData.filePath,
                JSON.stringify(broadcastResult, null, 2),
                { encoding: 'utf-8' }
              );

              navigate(
                `/${bitGoEnvironment}/broadcast-transaction/${coin}/success`
              );
            } catch (err) {
              if (err instanceof Error) {
                setAlert(err.message);
              } else {
                console.error(err);
              }
              setSubmitting(false);
            }
          }}
        />
      );
    case 'algo':
    case 'talgo':
      return (
        <AlgorandForm
          key={coin}
          onSubmit={async (values, { setSubmitting }) => {
            setAlert(undefined);
            setSubmitting(true);
            try {
              await window.commands.setBitGoEnvironment(bitGoEnvironment, coin);
              const chainData = await window.queries.getChain(coin);
              const broadcastResult =
                await window.commands.broadcastTransaction(coin, {
                  serializedSignedTransaction: values.serializedSignedTx,
                  nodeParams: values.nodeParams,
                });
              const showSaveDialogData = await window.commands.showSaveDialog({
                filters: [
                  {
                    name: 'Custom File Type',
                    extensions: ['json'],
                  },
                ],
                defaultPath: `~/${chainData}-broadcast-transaction-${Date.now()}.json`,
              });

              if (!showSaveDialogData.filePath) {
                throw new Error('No file path selected');
              }

              await window.commands.writeFile(
                showSaveDialogData.filePath,
                JSON.stringify(broadcastResult, null, 2),
                { encoding: 'utf-8' }
              );

              navigate(
                `/${bitGoEnvironment}/broadcast-transaction/${coin}/success`
              );
            } catch (err) {
              if (err instanceof Error) {
                setAlert(err.message);
              } else {
                console.error(err);
              }
              setSubmitting(false);
            }
          }}
        />
      );

    default:
      throw new Error(`Unsupported coin: ${String(coin)}`);
  }
}

export function BroadcastTransactionCoin() {
  const { env, coin } = useParams<'env' | 'coin'>();
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
          selectedCoin={coin}
          helperText={<BackToHomeHelperText env={environment} />}
        />
      </div>
      <Form />
    </>
  );
}
