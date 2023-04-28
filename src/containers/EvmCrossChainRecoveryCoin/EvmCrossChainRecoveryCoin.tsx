import { NavigateFunction, useNavigate, useParams } from 'react-router-dom';
import { CoinsSelectAutocomplete } from '~/components';
import { useAlertBanner } from '~/contexts';
import {
  BitgoEnv,
  assert,
  isRecoveryTransaction,
  safeEnv,
  toWei,
} from '~/helpers';
import { BackToHomeHelperText } from '~/components/BackToHomeHelperText';
import { evmCrossChainRecoveryCoins } from '~/helpers/config';
import { ColdWalletForm } from './ColdWalletForm';
import { HotWalletForm } from './HotWalletForm';
import { CustodyWalletForm } from './CustodyWalletForm';
import { FormikHelpers } from 'formik';

async function handleOnSubmit(
  values: any,
  formikHelpers: FormikHelpers<any>,
  bitGoEnvironment: BitgoEnv,
  coin: string,
  navigate: NavigateFunction,
  setAlert: React.Dispatch<React.SetStateAction<string | undefined>>
) {  
  setAlert(undefined);
  formikHelpers.setSubmitting(true)
  
  try {
    await window.commands.setBitGoEnvironment(
      bitGoEnvironment,
      coin,
    );
    const chainData = await window.queries.getChain(coin as string);
    const recoverData = await window.commands.recover(coin as string, {
      ...values,
      eip1559: {
        maxFeePerGas: toWei(values.maxFeePerGas),
        maxPriorityFeePerGas: toWei(values.maxPriorityFeePerGas),
      },
      bitgoKey: '',
      userKey: values.hasOwnProperty('userKey') ? values.userKey : '',
      backupKey: '',
      ignoreAddressTypes: [],
    });
    assert(
      isRecoveryTransaction(recoverData),
      'Half-signed recovery transaction not detected.'
    );

    const showSaveDialogData = await window.commands.showSaveDialog({
      filters: [
        {
          name: 'Custom File Type',
          extensions: ['json'],
        },
      ],
      defaultPath: `~/${chainData}-unsigned-evmBasedRecovery-${Date.now()}.json`,
    });

    if (!showSaveDialogData.filePath) {
      throw new Error('No file path selected');
    }

    await window.commands.writeFile(
      showSaveDialogData.filePath,
      JSON.stringify(
        recoverData,
        null,
        2
      ),
      { encoding: 'utf-8' }
    );

    navigate(
      `/${bitGoEnvironment}/evm-cross-chain-recovery/${coin}/success`
    );
  } catch (err) {
    if (err instanceof Error) {
      setAlert(err.message);
    } else {
      console.error(err);
    }
    formikHelpers.setSubmitting(false);
  }
}

function getHotWalletCoinForm() {
  const { env, coin } = useParams<'env' | 'coin'>();
  const bitGoEnvironment = safeEnv(env);
  const [, setAlert] = useAlertBanner();

  const navigate = useNavigate();

  switch (coin) {
    case 'polygon':
    case 'tpolygon':
      return (
        <HotWalletForm
          key={coin} 
          onSubmit={(values, formikHelpers) => {
            handleOnSubmit(values, formikHelpers, bitGoEnvironment, coin, navigate, setAlert);
          }}
        />
      );

    default:
      throw new Error(`Unsupported coin: ${String(coin)}`);
  }
}

function getColdWalletCoinForm() {
  const { env, coin } = useParams<'env' | 'coin'>();
  const bitGoEnvironment = safeEnv(env);
  const [, setAlert] = useAlertBanner();

  const navigate = useNavigate();

  switch (coin) {
    case 'polygon':
    case 'tpolygon':
      return (
        <ColdWalletForm
          key={coin}
          onSubmit={(values, formikHelpers) => {
            handleOnSubmit(values, formikHelpers, bitGoEnvironment, coin, navigate, setAlert);
          }}
        />
      );

    default:
      throw new Error(`Unsupported coin: ${String(coin)}`);
  }
}

function getCustodyWalletCoinForm() {
  const { env, coin } = useParams<'env' | 'coin'>();
  const bitGoEnvironment = safeEnv(env);
  const [, setAlert] = useAlertBanner();

  const navigate = useNavigate();

  switch (coin) {
    case 'polygon':
    case 'tpolygon':
      return (
        <CustodyWalletForm
          key={coin}
          onSubmit={(values, formikHelpers) => {
            handleOnSubmit(values, formikHelpers, bitGoEnvironment, coin, navigate, setAlert);
          }}
        />
      );

    default:
      throw new Error(`Unsupported coin: ${String(coin)}`);
  }
}

function Form() {
  const { wallet } = useParams<'wallet'>();

  switch (wallet) {
    case 'hot':
      return getHotWalletCoinForm()
    case 'cold':
      return getColdWalletCoinForm()
    case 'custody':
      return getCustodyWalletCoinForm()
    
    default:
      throw new Error(`Unsupported wallet type: ${String(wallet)}`);
  }
}

export function EvmCrossChainRecoveryCoin() {
  const { env, coin, wallet } = useParams<'env' | 'coin' | 'wallet'>();
  const environment = safeEnv(env);
  const navigate = useNavigate();
  return (
    <>
      <div className="tw-mb-8">
        <CoinsSelectAutocomplete
          onChange={event => {
            navigate(
              `/${environment}/evm-cross-chain-recovery/${event.currentTarget.value}`
            );
          }}
          coins={evmCrossChainRecoveryCoins[environment]}
          selectedCoin={coin}
          helperText={<BackToHomeHelperText env={environment}/>}
        />
      </div>
      <Form />
    </>
  );
}
