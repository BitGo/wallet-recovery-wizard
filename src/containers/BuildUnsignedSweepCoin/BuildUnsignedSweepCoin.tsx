import { useNavigate, useParams } from 'react-router-dom';
import { useAlertBanner } from '~/contexts';
import { BitcoinABCForm } from './BitcoinABCForm';
import { BitcoinCashForm } from './BitcoinCashForm';
import { BitcoinForm } from './BitcoinForm';
import { BitcoinSVForm } from './BitcoinSVForm';
import { Erc20TokenForm } from './Erc20TokenForm';
import { EthereumForm } from './EthereumForm';
import { LitecoinForm } from './LitecoinForm';
import { RippleForm } from './RippleForm';
import { TronForm } from './TronForm';

import { CoinsSelectAutocomplete } from '~/components';
import { assert, isRecoveryTransaction, safeEnv, toWei } from '~/helpers';

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

async function updateKeysFromIds<
  TParams extends {
    userKey: string;
    userKeyId?: string;
    backupKeyId?: string;
    backupKey: string;
  }
>(
  coin: string,
  params: TParams
): Promise<Omit<TParams, 'userKeyId' | 'backupKeyId'>> {
  const { userKeyId, backupKeyId, ...copy } = params;
  const data = [
    {
      id: userKeyId,
      key: copy.userKey,
      description: 'User Key Id',
      name: 'userKey',
    },
    {
      id: backupKeyId,
      key: copy.backupKey,
      description: 'Backup Key Id',
      name: 'backupKey',
    },
  ] as const;

  for await (const item of data) {
    if (item.id) {
      if (await isDerivationPath(item.id, item.description)) {
        copy[item.name] = await window.queries.deriveKeyByPath(
          item.key,
          item.id
        );
      } else {
        copy[item.name] = (
          await window.queries.deriveKeyWithSeed(coin, item.key, item.id)
        ).key;
      }
    }
  }

  return copy;
}

function Form() {
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
                  ...(await updateKeysFromIds(coin, values)),
                  ignoreAddressTypes: ['p2wsh'],
                }
              );

              assert(
                isRecoveryTransaction(recoverData),
                'Fully-signed recovery transaction not detected.'
              );

              const userXpub = values.userKeyId
                ? (
                    await window.queries.deriveKeyWithSeed(
                      coin,
                      values.userKey,
                      values.userKeyId
                    )
                  ).key
                : values.userKey;
              const backupXpub = values.backupKeyId
                ? (
                    await window.queries.deriveKeyWithSeed(
                      coin,
                      values.backupKey,
                      values.backupKeyId
                    )
                  ).key
                : values['backupKey'];

              const showSaveDialogData = await window.commands.showSaveDialog({
                filters: [
                  {
                    name: 'Custom File Type',
                    extensions: ['json'],
                  },
                ],
                defaultPath: `~/${chainData}-unsigned-sweep-${Date.now()}.json`,
              });

              if (!showSaveDialogData.filePath) {
                throw new Error('No file path selected');
              }

              await window.commands.writeFile(
                showSaveDialogData.filePath,
                JSON.stringify(
                  {
                    ...recoverData,
                    xpubsWithDerivationPath: {
                      user: {
                        xpub: userXpub,
                        derivedFromParentWithSeed: values.userKeyId
                          ? values.userKeyId
                          : undefined,
                      },
                      backup: {
                        xpub: backupXpub,
                        derivedFromParentWithSeed: values.backupKeyId
                          ? values.backupKeyId
                          : undefined,
                      },
                      bitgo: { xpub: values.bitgoKey },
                    },
                    pubs: [userXpub, backupXpub, values['bitgoKey']],
                  },
                  null,
                  2
                ),
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

              const { maxFeePerGas, maxPriorityFeePerGas, ...rest } =
                await updateKeysFromIds(coin, values);
              const recoverData = await window.commands.recover(
                coin,
                undefined,
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
                  ...(await updateKeysFromIds(coin, values)),
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
                  ...(await updateKeysFromIds(coin, values)),
                  bitgoKey: values.bitgoKey.replace(/\s+/g, ''),
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
                  ...(await updateKeysFromIds(coin, values)),
                  bitgoKey: values.bitgoKey.replace(/\s+/g, ''),
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
                  bitgoKey: values.bitgoKey.replace(/\s+/g, ''),
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
                  ...(await updateKeysFromIds(coin, values)),
                  bitgoKey: values.bitgoKey.replace(/\s+/g, ''),
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
                  ...(await updateKeysFromIds(coin, values)),
                  bitgoKey: values.bitgoKey.replace(/\s+/g, ''),
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
        <Erc20TokenForm
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
                  ...(await updateKeysFromIds(coin, values)),
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
      throw new Error(`Unsupported coin: ${String(coin)}`);
  }
}

export function BuildUnsignedSweepCoin() {
  const { env } = useParams<'env'>();
  const environment = safeEnv(env);
  const navigate = useNavigate();
  return (
    <>
      <div className="tw-mb-8">
        <CoinsSelectAutocomplete
          onChange={event => {
            navigate(
              `/${environment}/build-unsigned-sweep/${event.currentTarget.value}`
            );
          }}
        />
      </div>
      <Form />
    </>
  );
}
