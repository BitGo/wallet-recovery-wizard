import { NavigateFunction, useNavigate, useParams } from 'react-router-dom';
import { useAlertBanner } from '~/contexts';
import {
  BitgoEnv,
  assert,
  isRecoveryTransaction,
  safeEnv,
  toWei,
} from '~/helpers';
import { ColdWalletForm } from './ColdWalletForm';
import { HotWalletForm } from './HotWalletForm';
import { CustodyWalletForm } from './CustodyWalletForm';
import { FormikHelpers } from 'formik';

async function isDerivationPath(id: string, description: string) {
  if (id.length > 2 && id.indexOf('m/') === 0) {
    const response = await window.commands.showMessageBox({
      type: 'question',
      buttons: ['Derivation Path', 'Seed'],
      title: 'Derivation Path?',
      message: `Is the provided value a Derivation Path or a Seed?\n${description}: ${id}\n`,
    });

    return !!response.response;
  }

  return false;
}

interface BaseParams {
  walletContractAddress: string;
  bitgoFeeAddress: string;
  recoveryDestination: string;
  gasLimit: number;
  maxFeePerGas: number;
  maxPriorityFeePerGas: number;
  tokenContractAddress?: string;
  apiKey: string;
  wrongChain: string;
  intendedChain: string;
}
interface HotWalletParams extends BaseParams {
  userKey: string;
  walletPassphrase: string;
}

interface ColdWalletParams extends BaseParams {
  userKey: string;
  userKeyId?: string;
}

type UpdateKeysFromsIdsDefaultParams = {
  userKey: string;
  userKeyId?: string;
};

async function updateKeysFromIds<
  TParams extends UpdateKeysFromsIdsDefaultParams
>(coin: string, params: TParams): Promise<Omit<TParams, 'userKeyId'>> {
  const { userKeyId, ...copy } = params;

  const item = {
    id: userKeyId,
    key: copy.userKey,
    description: 'User Key Id',
    name: 'userKey',
  } as const;

  if (item.id) {
    if (await isDerivationPath(item.id, item.description)) {
      copy[item.name] = await window.queries.deriveKeyByPath(item.key, item.id);
    } else {
      copy[item.name] = (
        await window.queries.deriveKeyWithSeed(coin, item.key, item.id)
      ).key;
    }
  }

  return copy;
}

async function handleOnSubmit(
  values: HotWalletParams | ColdWalletParams | BaseParams,
  formikHelpers: FormikHelpers<any>,
  bitGoEnvironment: BitgoEnv,
  defaultPath: string,
  navigate: NavigateFunction,
  setAlert: React.Dispatch<React.SetStateAction<string | undefined>>
) {
  setAlert(undefined);
  formikHelpers.setSubmitting(true);

  try {
    await window.commands.setBitGoEnvironment(
      bitGoEnvironment,
      values.wrongChain,
      values.apiKey
    );
    const { maxFeePerGas, maxPriorityFeePerGas, ...rest } =
      await updateKeysFromIds<ColdWalletParams>(
        values.wrongChain,
        values as ColdWalletParams
      );
    const recoverData = await window.commands.recover(values.wrongChain, {
      ...values,
      eip1559: {
        maxFeePerGas: toWei(maxFeePerGas),
        maxPriorityFeePerGas: toWei(maxPriorityFeePerGas),
      },
      bitgoKey: '',
      userKey: Object.prototype.hasOwnProperty.call(rest, 'userKey')
        ? rest.userKey
        : '',
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
      defaultPath,
    });

    if (!showSaveDialogData.filePath) {
      throw new Error('No file path selected');
    }

    await window.commands.writeFile(
      showSaveDialogData.filePath,
      JSON.stringify(recoverData, null, 2),
      { encoding: 'utf-8' }
    );

    navigate(`/${bitGoEnvironment}/evm-cross-chain-recovery/hot/success`);
  } catch (err) {
    if (err instanceof Error) {
      setAlert(err.message);
    } else {
      console.error(err);
    }
    formikHelpers.setSubmitting(false);
  }
}

function getHotWalletCoinForm(
  bitgoEnvironment: BitgoEnv,
  navigate: NavigateFunction,
  setAlert: React.Dispatch<React.SetStateAction<string | undefined>>
) {
  return (
    <HotWalletForm
      onSubmit={async (values, formikHelpers) => {
        const defaultPath = `~/recover-${
          values.walletContractAddress
        }-prepared.half-signed-${Date.now()}.json`;
        return handleOnSubmit(
          values,
          formikHelpers,
          bitgoEnvironment,
          defaultPath,
          navigate,
          setAlert
        );
      }}
    />
  );
}

function getColdWalletCoinForm(
  bitgoEnvironment: BitgoEnv,
  navigate: NavigateFunction,
  setAlert: React.Dispatch<React.SetStateAction<string | undefined>>
) {
  return (
    <ColdWalletForm
      onSubmit={async (values, formikHelpers) => {
        const defaultPath = `~/recover-${
          values.walletContractAddress
        }-prepared.unsigned-${Date.now()}.json`;
        return handleOnSubmit(
          values,
          formikHelpers,
          bitgoEnvironment,
          defaultPath,
          navigate,
          setAlert
        );
      }}
    />
  );
}

function getCustodyWalletCoinForm(
  bitgoEnvironment: BitgoEnv,
  navigate: NavigateFunction,
  setAlert: React.Dispatch<React.SetStateAction<string | undefined>>
) {
  return (
    <CustodyWalletForm
      onSubmit={async (values, formikHelpers) => {
        const defaultPath = `~/recover-${
          values.walletContractAddress
        }-prepared.unsigned-${Date.now()}.json`;
        return handleOnSubmit(
          values,
          formikHelpers,
          bitgoEnvironment,
          defaultPath,
          navigate,
          setAlert
        );
      }}
    />
  );
}

function Form() {
  const { wallet } = useParams<'wallet'>();
  const { env } = useParams<'env'>();
  const bitGoEnvironment = safeEnv(env);
  const [, setAlert] = useAlertBanner();
  const navigate = useNavigate();
  switch (wallet) {
    case 'hot':
      return getHotWalletCoinForm(bitGoEnvironment, navigate, setAlert);
    case 'cold':
      return getColdWalletCoinForm(bitGoEnvironment, navigate, setAlert);
    case 'custody':
      return getCustodyWalletCoinForm(bitGoEnvironment, navigate, setAlert);

    default:
      throw new Error(`Unsupported wallet type: ${String(wallet)}`);
  }
}

export function EvmCrossChainRecoveryWallet() {
  return <Form />;
}
