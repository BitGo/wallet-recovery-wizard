import { useAlertBanner } from '~/contexts';
import { useParams } from 'react-router-dom';
import { BitcoinForm } from './BitcoinForm';
import { EthereumForm } from './EthereumForm';
import { RippleForm } from './RippleForm';

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
              let recoveryTransaction;
              if ('txHex' in recoverData) {
                recoveryTransaction = recoverData.txHex;
              } else if ('transactionHex' in recoverData) {
                recoveryTransaction = recoverData.transactionHex;
              }
              if (!recoveryTransaction) {
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
    case 'teth':
      return (
        <EthereumForm
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
              let recoveryTransaction;
              if ('txHex' in recoverData) {
                recoveryTransaction = recoverData.txHex;
              } else if ('transactionHex' in recoverData) {
                recoveryTransaction = recoverData.transactionHex;
              }
              if (!recoveryTransaction) {
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
      return (
        <RippleForm
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
              let recoveryTransaction;
              if ('txHex' in recoverData) {
                recoveryTransaction = recoverData.txHex;
              } else if ('transactionHex' in recoverData) {
                recoveryTransaction = recoverData.transactionHex;
              }
              if (!recoveryTransaction) {
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
