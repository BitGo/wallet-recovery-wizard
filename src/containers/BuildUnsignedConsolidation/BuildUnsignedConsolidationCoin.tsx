import { useNavigate, useParams } from 'react-router-dom';
import { assert, BitgoEnv, includePubsFor, safeEnv, updateKeysFromIds } from '~/helpers';
import { TronForm } from '~/containers/BuildUnsignedConsolidation/TronForm';
import { CoinsSelectAutocomplete } from '~/components';
import { buildUnsignedConsolidationCoins  } from '~/helpers/config';
import { BackToHomeHelperText } from '~/components/BackToHomeHelperText';
import { ConsolidationRecoveryBatch } from '@bitgo/sdk-coin-trx';
import { useAlertBanner } from '~/contexts';

type ConsolidationFormProps = {
  coin?: string;
  environment: BitgoEnv;
}

function isRecoveryConsolidationTransaction(result: any): result is ConsolidationRecoveryBatch {
  const consolidationRecoveryBatch = result as ConsolidationRecoveryBatch;
  return consolidationRecoveryBatch && consolidationRecoveryBatch.transactions !== undefined;
}

function ConsolidationForm({ coin, environment }: ConsolidationFormProps) {
  const [, setAlert ] = useAlertBanner();
  const navigate = useNavigate();

  switch (coin) {
    case 'trx':
    case 'ttrx':
      return <TronForm  onSubmit={async (values, { setSubmitting }) => {
        setSubmitting(true);
        try {
          await window.commands.setBitGoEnvironment(environment);
          const chainData = await window.queries.getChain(coin);
          const pubsForOvc = await includePubsFor(coin, values);
          const consolidateData = await window.commands.recoverConsolidations(coin, {
            ...(await updateKeysFromIds(coin, values)),
            bitgoKey: values.bitgoKey.replace(/\s+/g, ''),
          }) as ConsolidationRecoveryBatch;

          if (consolidateData instanceof Error) {
            throw consolidateData;
          }

          assert(isRecoveryConsolidationTransaction(consolidateData), 'Recovery consolidation transaction not found');

          if (consolidateData.transactions.length === 0) {
            setAlert('No transactions found for consolidation');
            return;
          }

          const consolidateDataWithPubs = {
            transactions: consolidateData.transactions.map((transaction) => {
              return {
                ...transaction,
                ...pubsForOvc
              };
            })};

          const showSaveDialogData = await window.commands.showSaveDialog({
            filters: [
              {
                name: 'Custom File Type',
                extensions: ['json'],
              },
            ],
            defaultPath: `~/${chainData}-unsigned-consolidation-${Date.now()}.json`,
          });
          if (!showSaveDialogData.filePath) {
            throw new Error('No file path selected');
          }

          await window.commands.writeFile(
            showSaveDialogData.filePath,
            JSON.stringify(consolidateDataWithPubs, null, 2),
            { encoding: 'utf8' },
          );
          navigate(`/${environment}/build-unsigned-consolidation/${coin}/success`);
        } catch (e) {
          if (e instanceof  Error) {
            setAlert(e.message);
          } else {
            console.log(e);
          }

          setSubmitting(false);
        }
      }}/>;
    default:
      throw new Error (`Unsupported coin: ${String(coin)}`);
  }
}

export function BuildUnsignedConsolidationCoin() {
  const { env, coin } = useParams<'env' | 'coin'>();
  const environment = safeEnv(env);
  const navigate = useNavigate();

  return (
    <>
      <div className="tw-mb-8">
        <CoinsSelectAutocomplete
          onChange={event => {
            navigate(
              `/${environment}/build-unsigned-consolidation/${event.currentTarget.value}`
            );
          }}
          coins={buildUnsignedConsolidationCoins[environment]}
          selectedCoin={coin}
          helperText={<BackToHomeHelperText env={environment}/>}
        />
      </div>
      <ConsolidationForm coin={coin} environment={environment} />
    </>
  )
}
