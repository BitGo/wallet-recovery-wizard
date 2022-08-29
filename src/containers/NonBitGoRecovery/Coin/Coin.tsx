import { useAlertBanner } from '~/contexts';
import { useParams } from 'react-router-dom';
import { BitcoinForm } from './BitcoinForm';
import { EthereumForm } from './EthereumForm';
import { RippleForm } from './RippleForm';
import { BitcoinCashForm } from './BitcoinCashForm';
import { LitecoinForm } from './LitecoinForm';
import { BitcoinABCForm } from './BitcoinABCForm';
import { BitcoinSVForm } from './BitcoinSVForm';
import { TronForm } from './TronForm';
import { ERC20Form } from './ERC20TokenForm';

import {
  BackupKeyRecoveryTransansaction,
  FormattedOfflineVaultTxInfo,
} from '@bitgo/abstract-utxo';

const GWEI = 10 ** 9;
function toWei(gas: number) {
  return gas * GWEI;
}

function safeEnv(value: string | undefined): 'prod' | 'test' {
  if (value !== 'test' && value !== 'prod') {
    throw new Error(`expected value to be "test" or "prod" but got: ${value}`);
  }
  return value;
}

function isRecoveryTransaction(
  recoverData: BackupKeyRecoveryTransansaction | FormattedOfflineVaultTxInfo
) {
  return (
    ('txHex' in recoverData && !!recoverData['txHex']) ||
    ('transactionHex' in recoverData && !!recoverData['transactionHex']) ||
    ('tx' in recoverData && !!recoverData['tx']) ||
    ('transaction' in recoverData && !!recoverData['transaction']) ||
    ('txid' in recoverData && !!recoverData['txid'])
  );
}

export function Coin() {
  const { env, coin } = useParams<'env' | 'coin'>();
  const bitGoEnvironment = safeEnv(env);
  const [, setAlert] = useAlertBanner();

  switch (coin) {
    case 'btc':
    case 'tbtc':
      return (
        <BitcoinForm
          onSubmit={async (values, { setSubmitting }) => {
            setAlert(undefined);
            setSubmitting(true);
            try {
              const chainData = await window.queries.getChain(coin);
              const recoverData = await window.commands.recover(
                coin,
                undefined,
                {
                  ...values,
                  bitgoKey: values.bitgoKey.split(/\s+/).join(''),
                  scan: Number(values.scan),
                  ignoreAddressTypes: ['p2wsh'],
                }
              );
              if (!isRecoveryTransaction(recoverData)) {
                throw new Error(
                  'Fully-signed recovery transaction not detected.'
                );
              }

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
            } catch (err) {
              if (err instanceof Error) {
                setAlert(err.message);
              } else {
                console.error(err);
              }
            } finally {
              setSubmitting(false);
            }
          }}
        />
      );
    case 'eth':
    case 'gteth':
      return (
        <EthereumForm
          onSubmit={async (values, { setSubmitting }) => {
            setAlert(undefined);
            setSubmitting(true);
            try {
              await window.commands.setBitGoEnvironment(
                bitGoEnvironment,
                values.apiKey
              );
              const chainData = await window.queries.getChain(coin);

              const { gasLimit, maxFeePerGas, maxPriorityFeePerGas, ...rest } =
                values;

              const recoverData = await window.commands.recover(
                coin,
                undefined,
                {
                  ...rest,
                  gasLimit: Number(gasLimit),
                  eip1559: {
                    maxFeePerGas: toWei(Number(maxFeePerGas)),
                    maxPriorityFeePerGas: toWei(Number(maxPriorityFeePerGas)),
                  },
                  replayProtectionOptions: {
                    chain: bitGoEnvironment === 'prod' ? 1 : 5,
                    hardfork: 'london',
                  },
                  bitgoKey: '',
                  ignoreAddressTypes: [],
                }
              );
              if (!isRecoveryTransaction(recoverData)) {
                throw new Error(
                  'Fully-signed recovery transaction not detected.'
                );
              }

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
            } catch (err) {
              if (err instanceof Error) {
                setAlert(err.message);
              } else {
                console.error(err);
              }
            } finally {
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
          onSubmit={async (values, { setSubmitting }) => {
            setAlert(undefined);
            setSubmitting(true);
            try {
              const chainData = await window.queries.getChain(coin);
              const recoverData = await window.commands.recover(
                coin,
                undefined,
                {
                  ...values,
                  bitgoKey: '',
                  ignoreAddressTypes: [],
                }
              );
              if (!isRecoveryTransaction(recoverData)) {
                throw new Error(
                  'Fully-signed recovery transaction not detected.'
                );
              }

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
            } catch (err) {
              if (err instanceof Error) {
                setAlert(err.message);
              } else {
                console.error(err);
              }
            } finally {
              setSubmitting(false);
            }
          }}
        />
      );
    case 'bch':
      return (
        <BitcoinCashForm
          onSubmit={async (values, { setSubmitting }) => {
            setAlert(undefined);
            setSubmitting(true);
            try {
              await window.commands.setBitGoEnvironment(
                bitGoEnvironment,
                values.apiKey
              );
              const chainData = await window.queries.getChain(coin);
              const recoverData = await window.commands.recover(
                coin,
                undefined,
                {
                  ...values,
                  bitgoKey: values.bitgoKey.split(/\s+/).join(''),
                  scan: Number(values.scan),
                  ignoreAddressTypes: [],
                }
              );
              if (!isRecoveryTransaction(recoverData)) {
                throw new Error(
                  'Fully-signed recovery transaction not detected.'
                );
              }

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
            } catch (err) {
              if (err instanceof Error) {
                setAlert(err.message);
              } else {
                console.error(err);
              }
            } finally {
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
          onSubmit={async (values, { setSubmitting }) => {
            setAlert(undefined);
            setSubmitting(true);
            try {
              await window.commands.setBitGoEnvironment(
                bitGoEnvironment,
                values.apiKey
              );
              const chainData = await window.queries.getChain(coin);
              const recoverData = await window.commands.recover(
                coin,
                undefined,
                {
                  ...values,
                  bitgoKey: values.bitgoKey.split(/\s+/).join(''),
                  scan: Number(values.scan),
                  ignoreAddressTypes: [],
                }
              );
              if (!isRecoveryTransaction(recoverData)) {
                throw new Error(
                  'Fully-signed recovery transaction not detected.'
                );
              }

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
            } catch (err) {
              if (err instanceof Error) {
                setAlert(err.message);
              } else {
                console.error(err);
              }
            } finally {
              setSubmitting(false);
            }
          }}
        />
      );
    case 'bcha':
      return (
        <BitcoinABCForm
          onSubmit={async (values, { setSubmitting }) => {
            setAlert(undefined);
            setSubmitting(true);
            try {
              await window.commands.setBitGoEnvironment(
                bitGoEnvironment,
                values.apiKey
              );
              const chainData = await window.queries.getChain(coin);
              const recoverData = await window.commands.recover(
                coin,
                undefined,
                {
                  ...values,
                  bitgoKey: values.bitgoKey.split(/\s+/).join(''),
                  scan: Number(values.scan),
                  ignoreAddressTypes: [],
                }
              );
              if (!isRecoveryTransaction(recoverData)) {
                throw new Error(
                  'Fully-signed recovery transaction not detected.'
                );
              }

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
            } catch (err) {
              if (err instanceof Error) {
                setAlert(err.message);
              } else {
                console.error(err);
              }
            } finally {
              setSubmitting(false);
            }
          }}
        />
      );
    case 'bsv':
      return (
        <BitcoinSVForm
          onSubmit={async (values, { setSubmitting }) => {
            setAlert(undefined);
            setSubmitting(true);
            try {
              await window.commands.setBitGoEnvironment(
                bitGoEnvironment,
                values.apiKey
              );
              const chainData = await window.queries.getChain(coin);
              const recoverData = await window.commands.recover(
                coin,
                undefined,
                {
                  ...values,
                  bitgoKey: values.bitgoKey.split(/\s+/).join(''),
                  scan: Number(values.scan),
                  ignoreAddressTypes: [],
                }
              );
              if (!isRecoveryTransaction(recoverData)) {
                throw new Error(
                  'Fully-signed recovery transaction not detected.'
                );
              }

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
            } catch (err) {
              if (err instanceof Error) {
                setAlert(err.message);
              } else {
                console.error(err);
              }
            } finally {
              setSubmitting(false);
            }
          }}
        />
      );
    case 'trx':
    case 'ttrx':
      return (
        <TronForm
          onSubmit={async (values, { setSubmitting }) => {
            setAlert(undefined);
            setSubmitting(true);
            try {
              const recoverData = await window.commands.recover(
                coin,
                undefined,
                {
                  ...values,
                  bitgoKey: values.bitgoKey.split(/\s+/).join(''),
                  ignoreAddressTypes: [],
                }
              );
              if (!isRecoveryTransaction(recoverData)) {
                throw new Error(
                  'Fully-signed recovery transaction not detected.'
                );
              }

              const showSaveDialogData = await window.commands.showSaveDialog({
                filters: [
                  {
                    name: 'Custom File Type',
                    extensions: ['json'],
                  },
                ],
                defaultPath: `~/${coin}-recovery-${Date.now()}.json`,
              });

              if (!showSaveDialogData.filePath) {
                throw new Error('No file path selected');
              }

              await window.commands.writeFile(
                showSaveDialogData.filePath,
                JSON.stringify(recoverData, null, 2),
                { encoding: 'utf-8' }
              );
            } catch (err) {
              if (err instanceof Error) {
                setAlert(err.message);
              } else {
                console.error(err);
              }
            } finally {
              setSubmitting(false);
            }
          }}
        />
      );
    case 'erc':
    case 'gterc':
      return (
        <ERC20Form
          onSubmit={async (values, { setSubmitting }) => {
            setAlert(undefined);
            setSubmitting(true);
            try {
              await window.commands.setBitGoEnvironment(
                bitGoEnvironment,
                values.apiKey
              );
              const parentCoin = env === 'test' ? 'gteth' : 'eth';
              const chainData = await window.queries.getChain(
                parentCoin,
                values.tokenAddress
              );
              const { gasLimit, maxFeePerGas, maxPriorityFeePerGas, ...rest } =
                values;

              const recoverData = await window.commands.recover(
                parentCoin,
                values.tokenAddress,
                {
                  ...rest,
                  gasLimit: Number(gasLimit),
                  eip1559: {
                    maxFeePerGas: toWei(Number(maxFeePerGas)),
                    maxPriorityFeePerGas: toWei(Number(maxPriorityFeePerGas)),
                  },
                  replayProtectionOptions: {
                    chain: bitGoEnvironment === 'prod' ? 1 : 5,
                    hardfork: 'london',
                  },
                  bitgoKey: '',
                  ignoreAddressTypes: [],
                }
              );
              if (!isRecoveryTransaction(recoverData)) {
                throw new Error(
                  'Fully-signed recovery transaction not detected.'
                );
              }

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
            } catch (err) {
              if (err instanceof Error) {
                setAlert(err.message);
              } else {
                console.error(err);
              }
            } finally {
              setSubmitting(false);
            }
          }}
        />
      );
    default:
      throw new Error(`Unsupported coin: ${coin}`);
  }
}
