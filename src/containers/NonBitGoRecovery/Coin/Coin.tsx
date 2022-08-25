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

import { Chain, Hardfork } from '@ethereumjs/common';
import {
  BackupKeyRecoveryTransansaction,
  FormattedOfflineVaultTxInfo,
} from '@bitgo/abstract-utxo';

const GWEI = 10 ** 9;
function toWei(gas: number) {
  return gas * GWEI;
}

function isRecoveryTransaction(
  recoverData: BackupKeyRecoveryTransansaction | FormattedOfflineVaultTxInfo
) {
  if ('txHex' in recoverData && Boolean(recoverData['txHex'])) {
    return true;
  } else if ('transactionHex' in recoverData && Boolean(recoverData['transactionHex'])) {
    return true
  } else if ('tx' in recoverData && Boolean(recoverData['tx'])) {
    return true;
  } else if ('transaction' in recoverData && Boolean(recoverData['transaction'])) {
    return true;
  } else if ('txid' in recoverData && Boolean(recoverData['txid'])) {
    return true;
  }
  return false;
}

export function Coin() {
  const { coin } = useParams<'coin'>();
  console.log(coin);
  const [, setAlert] = useAlertBanner();

  switch (coin) {
    case 'btc':
    case 'tbtc':
      return (
        <BitcoinForm
          onSubmit={async (values, { setSubmitting }) => {
            setSubmitting(true);
            try {
              const chainData = await window.queries.getChain(coin);
              const recoverData = await window.commands.recover(coin, {
                ...values,
                bitgoKey: values.bitgoKey.split(/\s+/).join(''),
                scan: Number(values.scan),
                ignoreAddressTypes: ['p2wsh'],
              });
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
                setAlert(
                  err.message.replace(
                    "Error invoking remote method 'recover': ",
                    ''
                  )
                );
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
            setSubmitting(true);
            try {
              const bitGoEnvironment = coin === 'eth' ? 'prod' : 'test';
              await window.commands.setBitGoEnvironment(
                bitGoEnvironment,
                values.apiKey
              );
              const chainData = await window.queries.getChain(coin);

              const { gasLimit, maxFeePerGas, maxPriorityFeePerGas, ...rest } =
                values;
              if (
                Number(gasLimit) <= 0 ||
                Number(gasLimit) !== parseInt(gasLimit, 10)
              ) {
                throw new Error('Gas limit must be a positive integer');
              }
              const recoveryParams = {
                ...rest,
                eip1559: {
                  maxFeePerGas: toWei(Number(maxFeePerGas)),
                  maxPriorityFeePerGas: toWei(Number(maxPriorityFeePerGas)),
                },
                replayProtectionOptions: {
                  chain: bitGoEnvironment === 'prod' ? 1 : 5, //REPLACE WITH CHAIN
                  hardfork: 'london', //REPLACE WITH HARDFORK
                },
                bitgoKey: '',
                ignoreAddressTypes: [],
              };

              const recoverData = await window.commands.recover(
                coin,
                recoveryParams
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
                setAlert(
                  err.message.replace(
                    "Error invoking remote method 'recover': ",
                    ''
                  )
                );
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
            setSubmitting(true);
            try {
              const chainData = await window.queries.getChain(coin);
              const recoverData = await window.commands.recover(coin, {
                ...values,
                bitgoKey: '',
                ignoreAddressTypes: [],
              });
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
                setAlert(
                  err.message.replace(
                    "Error invoking remote method 'recover': ",
                    ''
                  )
                );
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
            setSubmitting(true);
            try {
              const bitGoEnvironment = 'prod';
              await window.commands.setBitGoEnvironment(
                bitGoEnvironment,
                values.apiKey
              );
              const chainData = await window.queries.getChain(coin);
              const recoverData = await window.commands.recover(coin, {
                ...values,
                bitgoKey: values.bitgoKey.split(/\s+/).join(''),
                scan: Number(values.scan),
                ignoreAddressTypes: [],
              });
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
                setAlert(
                  err.message.replace(
                    "Error invoking remote method 'recover': ",
                    ''
                  )
                );
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
            setSubmitting(true);
            try {
              const bitGoEnvironment = 'prod';
              await window.commands.setBitGoEnvironment(
                bitGoEnvironment,
                values.apiKey
              );
              const chainData = await window.queries.getChain(coin);
              const recoverData = await window.commands.recover(coin, {
                ...values,
                bitgoKey: values.bitgoKey.split(/\s+/).join(''),
                scan: Number(values.scan),
                ignoreAddressTypes: [],
              });
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
                setAlert(
                  err.message.replace(
                    "Error invoking remote method 'recover': ",
                    ''
                  )
                );
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
            console.log(values);
            setSubmitting(true);
            try {
              const bitGoEnvironment = 'prod';
              await window.commands.setBitGoEnvironment(
                bitGoEnvironment,
                values.apiKey
              );
              const chainData = await window.queries.getChain(coin);
              const recoverData = await window.commands.recover(coin, {
                ...values,
                bitgoKey: values.bitgoKey.split(/\s+/).join(''),
                scan: Number(values.scan),
                ignoreAddressTypes: [],
              });
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
                setAlert(
                  err.message.replace(
                    "Error invoking remote method 'recover': ",
                    ''
                  )
                );
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
            console.log(values);
            setSubmitting(true);
            try {
              const bitGoEnvironment = 'prod';
              await window.commands.setBitGoEnvironment(
                bitGoEnvironment,
                values.apiKey
              );
              const chainData = await window.queries.getChain(coin);
              const recoverData = await window.commands.recover(coin, {
                ...values,
                bitgoKey: values.bitgoKey.split(/\s+/).join(''),
                scan: Number(values.scan),
                ignoreAddressTypes: [],
              });
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
                setAlert(
                  err.message.replace(
                    "Error invoking remote method 'recover': ",
                    ''
                  )
                );
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
            setSubmitting(true);
            try {
              const chainData = await window.queries.getChain(coin);
              console.log(chainData);
              const recoverData = await window.commands.recover(coin, {
                ...values,
                bitgoKey: values.bitgoKey.split(/\s+/).join(''),
                ignoreAddressTypes: [],
              });
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
                setAlert(
                  err.message.replace(
                    "Error invoking remote method 'recover': ",
                    ''
                  )
                );
              } else {
                console.error(err);
              }
            } finally {
              setSubmitting(false);
            }
          }}
        />
      );
    case 'erc': //THIS DEFINITELY NEEDS WORK
    case 'gterc':
      return (
        <ERC20Form
          onSubmit={async (values, { setSubmitting }) => {
            setSubmitting(true);
            try {
              const bitGoEnvironment = coin === 'erc' ? 'prod' : 'test';
              await window.commands.setBitGoEnvironment(
                bitGoEnvironment,
                values.apiKey
              );
              const chainData = await window.queries.getChain(coin);
              const recoverData = await window.commands.recover(coin, {
                ...values,
                bitgoKey: '',
                ignoreAddressTypes: [],
              });
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
                setAlert(
                  err.message.replace(
                    "Error invoking remote method 'recover': ",
                    ''
                  )
                );
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
