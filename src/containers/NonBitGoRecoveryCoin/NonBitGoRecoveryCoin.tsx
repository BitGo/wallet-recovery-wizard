import { useNavigate, useParams } from 'react-router-dom';
import { CoinsSelectAutocomplete } from '~/components';
import { useAlertBanner } from '~/contexts';
import {
  assert,
  getChain,
  getEthLikeRecoveryChainId,
  isRecoveryTransaction,
  recover,
  safeEnv,
  toWei,
} from '~/helpers';
import { AvalancheCForm } from './AvalancheCForm';
import { BitcoinCashForm } from './BitcoinCashForm';
import { BitcoinForm } from './BitcoinForm';
import { Erc20TokenForm } from './Erc20TokenForm';
import { EthereumForm } from './EthereumForm';
import { LitecoinForm } from './LitecoinForm';
import { RippleForm } from './RippleForm';
import { TronForm } from './TronForm';

function Form() {
  const { env, coin } = useParams<'env' | 'coin'>();
  const bitGoEnvironment = safeEnv(env);
  const [, setAlert] = useAlertBanner();
  const navigate = useNavigate();

  switch (coin) {
    case 'btc':
    case 'tbtc':
      return (
        <BitcoinForm
          key={coin}
          onSubmit={async (values, { setSubmitting }) => {
            setAlert(undefined);
            setSubmitting(true);
            try {
              await window.commands.setBitGoEnvironment(bitGoEnvironment);
              const chainData = await getChain(coin);
              const recoverData = await recover(coin, undefined, {
                ...values,
                bitgoKey: values.bitgoKey.replace(/\s+/g, ''),
                ignoreAddressTypes: ['p2wsh'],
              });
              assert(
                isRecoveryTransaction(recoverData),
                'Fully-signed recovery transaction not detected.'
              );

              const showSaveDialogData = await window.commands.showSaveDialog({
                filters: [
                  {
                    name: 'Custom File Type',
                    extensions: ['json'],
                  },
                ],
                defaultPath: `~/${chainData}-recovery-${Date.now()}.json`,
              });

              if (!showSaveDialogData.filePath) {
                throw new Error('No file path selected');
              }

              await window.commands.writeFile(
                showSaveDialogData.filePath,
                JSON.stringify(recoverData, null, 2),
                { encoding: 'utf-8' }
              );

              navigate(
                `/${bitGoEnvironment}/non-bitgo-recovery/${coin}/success`
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
    case 'eth':
    case 'gteth':
    case 'ethw':
      return (
        <EthereumForm
          key={coin}
          onSubmit={async (values, { setSubmitting }) => {
            setAlert(undefined);
            setSubmitting(true);
            try {
              await window.commands.setBitGoEnvironment(
                bitGoEnvironment,
                values.apiKey
              );
              const chainData = await getChain(coin);

              const { maxFeePerGas, maxPriorityFeePerGas, ...rest } = values;

              const recoverData = await recover(coin, undefined, {
                ...rest,
                eip1559: {
                  maxFeePerGas: toWei(maxFeePerGas),
                  maxPriorityFeePerGas: toWei(maxPriorityFeePerGas),
                },
                replayProtectionOptions: {
                  chain: getEthLikeRecoveryChainId(coin, bitGoEnvironment),
                  hardfork: 'london',
                },
                bitgoKey: '',
                ignoreAddressTypes: [],
              });
              assert(
                isRecoveryTransaction(recoverData),
                'Fully-signed recovery transaction not detected.'
              );

              const showSaveDialogData = await window.commands.showSaveDialog({
                filters: [
                  {
                    name: 'Custom File Type',
                    extensions: ['json'],
                  },
                ],
                defaultPath: `~/${chainData}-recovery-${Date.now()}.json`,
              });

              if (!showSaveDialogData.filePath) {
                throw new Error('No file path selected');
              }

              await window.commands.writeFile(
                showSaveDialogData.filePath,
                JSON.stringify(recoverData, null, 2),
                { encoding: 'utf-8' }
              );

              navigate(
                `/${bitGoEnvironment}/non-bitgo-recovery/${coin}/success`
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
    case 'avaxc':
    case 'tavaxc':
      return (
        <AvalancheCForm
          key={coin}
          onSubmit={async (values, { setSubmitting }) => {
            setAlert(undefined);
            setSubmitting(true);
            try {
              await window.commands.setBitGoEnvironment(
                bitGoEnvironment,
                values.apiKey
              );
              const chainData = await getChain(coin);
              const recoverData = await recover(coin, undefined, {
                ...values,
                gasPrice: toWei(values.gasPrice),
                bitgoKey: '',
                ignoreAddressTypes: [],
              });
              assert(
                isRecoveryTransaction(recoverData),
                'Fully-signed recovery transaction not detected.'
              );

              const showSaveDialogData = await window.commands.showSaveDialog({
                filters: [
                  {
                    name: 'Custom File Type',
                    extensions: ['json'],
                  },
                ],
                defaultPath: `~/${chainData}-recovery-${Date.now()}.json`,
              });

              if (!showSaveDialogData.filePath) {
                throw new Error('No file path selected');
              }

              await window.commands.writeFile(
                showSaveDialogData.filePath,
                JSON.stringify(recoverData, null, 2),
                { encoding: 'utf-8' }
              );

              navigate(
                `/${bitGoEnvironment}/non-bitgo-recovery/${coin}/success`
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
    case 'xrp':
    case 'txrp':
    case 'xlm':
    case 'txlm':
    case 'eos':
    case 'teos':
      return (
        <RippleForm
          key={coin}
          onSubmit={async (values, { setSubmitting }) => {
            setAlert(undefined);
            setSubmitting(true);
            try {
              await window.commands.setBitGoEnvironment(bitGoEnvironment);
              const chainData = await getChain(coin);
              const recoverData = await recover(coin, undefined, {
                ...values,
                bitgoKey: '',
                ignoreAddressTypes: [],
              });
              assert(
                isRecoveryTransaction(recoverData),
                'Fully-signed recovery transaction not detected.'
              );

              const showSaveDialogData = await window.commands.showSaveDialog({
                filters: [
                  {
                    name: 'Custom File Type',
                    extensions: ['json'],
                  },
                ],
                defaultPath: `~/${chainData}-recovery-${Date.now()}.json`,
              });

              if (!showSaveDialogData.filePath) {
                throw new Error('No file path selected');
              }

              await window.commands.writeFile(
                showSaveDialogData.filePath,
                JSON.stringify(recoverData, null, 2),
                { encoding: 'utf-8' }
              );

              navigate(
                `/${bitGoEnvironment}/non-bitgo-recovery/${coin}/success`
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
    case 'bch':
      return (
        <BitcoinCashForm
          key={coin}
          onSubmit={async (values, { setSubmitting }) => {
            setAlert(undefined);
            setSubmitting(true);
            try {
              await window.commands.setBitGoEnvironment(
                bitGoEnvironment,
                values.apiKey
              );
              const chainData = await getChain(coin);
              const recoverData = await recover(coin, undefined, {
                ...values,
                bitgoKey: values.bitgoKey.replace(/\s+/g, ''),
                ignoreAddressTypes: [],
              });
              assert(
                isRecoveryTransaction(recoverData),
                'Fully-signed recovery transaction not detected.'
              );

              const showSaveDialogData = await window.commands.showSaveDialog({
                filters: [
                  {
                    name: 'Custom File Type',
                    extensions: ['json'],
                  },
                ],
                defaultPath: `~/${chainData}-recovery-${Date.now()}.json`,
              });

              if (!showSaveDialogData.filePath) {
                throw new Error('No file path selected');
              }

              await window.commands.writeFile(
                showSaveDialogData.filePath,
                JSON.stringify(recoverData, null, 2),
                { encoding: 'utf-8' }
              );

              navigate(
                `/${bitGoEnvironment}/non-bitgo-recovery/${coin}/success`
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
    case 'ltc':
    case 'btg':
    case 'dash':
    case 'zec':
      return (
        <LitecoinForm
          key={coin}
          onSubmit={async (values, { setSubmitting }) => {
            setAlert(undefined);
            setSubmitting(true);
            try {
              await window.commands.setBitGoEnvironment(
                bitGoEnvironment,
                values.apiKey
              );
              const chainData = await getChain(coin);
              const recoverData = await recover(coin, undefined, {
                ...values,
                bitgoKey: values.bitgoKey.replace(/\s+/g, ''),
                ignoreAddressTypes: [],
              });
              assert(
                isRecoveryTransaction(recoverData),
                'Fully-signed recovery transaction not detected.'
              );

              const showSaveDialogData = await window.commands.showSaveDialog({
                filters: [
                  {
                    name: 'Custom File Type',
                    extensions: ['json'],
                  },
                ],
                defaultPath: `~/${chainData}-recovery-${Date.now()}.json`,
              });

              if (!showSaveDialogData.filePath) {
                throw new Error('No file path selected');
              }

              await window.commands.writeFile(
                showSaveDialogData.filePath,
                JSON.stringify(recoverData, null, 2),
                { encoding: 'utf-8' }
              );

              navigate(
                `/${bitGoEnvironment}/non-bitgo-recovery/${coin}/success`
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
    case 'trx':
    case 'ttrx':
      return (
        <TronForm
          key={coin}
          onSubmit={async (values, { setSubmitting }) => {
            setAlert(undefined);
            setSubmitting(true);
            try {
              await window.commands.setBitGoEnvironment(bitGoEnvironment);
              const chainData = await getChain(coin);
              const recoverData = await recover(coin, undefined, {
                ...values,
                bitgoKey: values.bitgoKey.replace(/\s+/g, ''),
                ignoreAddressTypes: [],
              });
              assert(
                isRecoveryTransaction(recoverData),
                'Fully-signed recovery transaction not detected.'
              );

              const showSaveDialogData = await window.commands.showSaveDialog({
                filters: [
                  {
                    name: 'Custom File Type',
                    extensions: ['json'],
                  },
                ],
                defaultPath: `~/${chainData}-recovery-${Date.now()}.json`,
              });

              if (!showSaveDialogData.filePath) {
                throw new Error('No file path selected');
              }

              await window.commands.writeFile(
                showSaveDialogData.filePath,
                JSON.stringify(recoverData, null, 2),
                { encoding: 'utf-8' }
              );

              navigate(
                `/${bitGoEnvironment}/non-bitgo-recovery/${coin}/success`
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
    case 'erc20':
    case 'gterc20':
      return (
        <Erc20TokenForm
          key={coin}
          onSubmit={async (values, { setSubmitting }) => {
            setAlert(undefined);
            setSubmitting(true);
            try {
              await window.commands.setBitGoEnvironment(
                bitGoEnvironment,
                values.apiKey
              );
              const parentCoin = env === 'test' ? 'gteth' : 'eth';
              const chainData = await getChain(
                parentCoin,
                values.tokenAddress.toLowerCase()
              );
              const { maxFeePerGas, maxPriorityFeePerGas, ...rest } = values;

              const recoverData = await recover(
                parentCoin,
                values.tokenAddress.toLowerCase(),
                {
                  ...rest,
                  eip1559: {
                    maxFeePerGas: toWei(maxFeePerGas),
                    maxPriorityFeePerGas: toWei(maxPriorityFeePerGas),
                  },
                  replayProtectionOptions: {
                    chain: bitGoEnvironment === 'prod' ? 1 : 5,
                    hardfork: 'london',
                  },
                  bitgoKey: '',
                  ignoreAddressTypes: [],
                }
              );
              assert(
                isRecoveryTransaction(recoverData),
                'Fully-signed recovery transaction not detected.'
              );

              const showSaveDialogData = await window.commands.showSaveDialog({
                filters: [
                  {
                    name: 'Custom File Type',
                    extensions: ['json'],
                  },
                ],
                defaultPath: `~/${chainData}-recovery-${Date.now()}.json`,
              });

              if (!showSaveDialogData.filePath) {
                throw new Error('No file path selected');
              }

              await window.commands.writeFile(
                showSaveDialogData.filePath,
                JSON.stringify(recoverData, null, 2),
                { encoding: 'utf-8' }
              );

              navigate(
                `/${bitGoEnvironment}/non-bitgo-recovery/${coin}/success`
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

export function NonBitGoRecoveryCoin() {
  const { env } = useParams<'env'>();
  const environment = safeEnv(env);
  const navigate = useNavigate();
  return (
    <>
      <div className="tw-mb-8">
        <CoinsSelectAutocomplete
          onChange={event => {
            navigate(
              `/${environment}/non-bitgo-recovery/${event.currentTarget.value}`
            );
          }}
        />
      </div>
      <Form />
    </>
  );
}
