import { useNavigate, useParams } from 'react-router-dom';
import { CoinsSelectAutocomplete } from '~/components';
import { useAlertBanner } from '~/contexts';
import {
  assert,
  getChainWithToken,
  isRecoveryTransaction,
  recoverWithToken,
  safeEnv,
  toWei,
  getEthLikeRecoveryChainId,
} from '~/helpers';
import { useLocalStorageState } from '~/hooks';
import { AvalancheCForm } from './AvalancheCForm';
import { BitcoinCashForm } from './BitcoinCashForm';
import { BitcoinForm } from './BitcoinForm';
import { Erc20TokenForm } from './Erc20TokenForm';
import { EthereumForm } from './EthereumForm';
import { LitecoinForm } from './LitecoinForm';
import { RippleForm } from './RippleForm';
import { TronForm } from './TronForm';

async function deriveKeyWithSeedAndToken(
  token: string | undefined,
  ...params: Parameters<typeof window.queries.deriveKeyWithSeed>
) {
  const [coin, ...rest] = params;
  let keyAndDerivationPath;
  if (token) {
    try {
      keyAndDerivationPath = await window.queries.deriveKeyWithSeed(
        token,
        ...rest
      );
    } catch (e) {
      keyAndDerivationPath = await window.queries.deriveKeyWithSeed(
        coin,
        ...rest
      );
    }
  } else {
    keyAndDerivationPath = await window.queries.deriveKeyWithSeed(
      coin,
      ...rest
    );
  }
  return keyAndDerivationPath;
}

async function includePubsFor<
  TValues extends {
    userKey: string;
    userKeyId?: string;
    backupKey: string;
    backupKeyId?: string;
    bitgoKey?: string;
  }
>(values: TValues, coin: string, token?: string) {
  const userXpub = values.userKeyId
    ? (
        await deriveKeyWithSeedAndToken(
          token,
          coin,
          values.userKey,
          values.userKeyId
        )
      ).key
    : values.userKey;
  const backupXpub = values.backupKeyId
    ? (
        await deriveKeyWithSeedAndToken(
          token,
          coin,
          values.backupKey,
          values.backupKeyId
        )
      ).key
    : values.backupKey;

  return {
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
    pubs: [userXpub, backupXpub, values.bitgoKey],
  };
}

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
  token: string | undefined,
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
          await deriveKeyWithSeedAndToken(token, coin, item.key, item.id)
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
  const [includePubsInUnsignedSweep] = useLocalStorageState(
    false,
    'includePubsInUnsignedSweep'
  );
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
              const chainData = await window.queries.getChain(coin);
              const recoverData = await window.commands.recover(coin, {
                ...(await updateKeysFromIds(coin, undefined, values)),
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
                    ...(await includePubsFor(values, coin)),
                  },
                  null,
                  2
                ),
                { encoding: 'utf-8' }
              );

              navigate(
                `/${bitGoEnvironment}/build-unsigned-sweep/${coin}/success`
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
              const chainData = await window.queries.getChain(coin);

              const { maxFeePerGas, maxPriorityFeePerGas, ...rest } =
                await updateKeysFromIds(coin, undefined, values);
              const recoverData = await window.commands.recover(coin, {
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
                defaultPath: `~/${chainData}-unsigned-sweep-${Date.now()}.json`,
              });

              if (!showSaveDialogData.filePath) {
                throw new Error('No file path selected');
              }

              await window.commands.writeFile(
                showSaveDialogData.filePath,
                JSON.stringify(
                  includePubsInUnsignedSweep
                    ? {
                        ...recoverData,
                        ...(await includePubsFor(values, coin)),
                      }
                    : recoverData,
                  null,
                  2
                ),
                { encoding: 'utf-8' }
              );

              navigate(
                `/${bitGoEnvironment}/build-unsigned-sweep/${coin}/success`
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
              const chainData = await window.queries.getChain(coin);

              const recoverData = await window.commands.recover(coin, {
                ...(await updateKeysFromIds(coin, undefined, values)),
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
                defaultPath: `~/${chainData}-unsigned-sweep-${Date.now()}.json`,
              });

              if (!showSaveDialogData.filePath) {
                throw new Error('No file path selected');
              }

              await window.commands.writeFile(
                showSaveDialogData.filePath,
                JSON.stringify(
                  includePubsInUnsignedSweep
                    ? {
                        ...recoverData,
                        ...(await includePubsFor(values, coin)),
                      }
                    : recoverData,
                  null,
                  2
                ),
                { encoding: 'utf-8' }
              );

              navigate(
                `/${bitGoEnvironment}/build-unsigned-sweep/${coin}/success`
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
              const chainData = await window.queries.getChain(coin);
              const recoverData = await window.commands.recover(coin, {
                ...(await updateKeysFromIds(coin, undefined, values)),
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
                defaultPath: `~/${chainData}-unsigned-sweep-${Date.now()}.json`,
              });

              if (!showSaveDialogData.filePath) {
                throw new Error('No file path selected');
              }

              await window.commands.writeFile(
                showSaveDialogData.filePath,
                JSON.stringify(
                  includePubsInUnsignedSweep
                    ? {
                        ...recoverData,
                        ...(await includePubsFor(values, coin)),
                      }
                    : recoverData,
                  null,
                  2
                ),
                { encoding: 'utf-8' }
              );

              navigate(
                `/${bitGoEnvironment}/build-unsigned-sweep/${coin}/success`
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
              const chainData = await window.queries.getChain(coin);
              const recoverData = await window.commands.recover(coin, {
                ...(await updateKeysFromIds(coin, undefined, values)),
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
                    ...(await includePubsFor(values, coin)),
                  },
                  null,
                  2
                ),
                { encoding: 'utf-8' }
              );

              navigate(
                `/${bitGoEnvironment}/build-unsigned-sweep/${coin}/success`
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
              const chainData = await window.queries.getChain(coin);
              const recoverData = await window.commands.recover(coin, {
                ...(await updateKeysFromIds(coin, undefined, values)),
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
                    ...(await includePubsFor(values, coin)),
                  },
                  null,
                  2
                ),
                { encoding: 'utf-8' }
              );

              navigate(
                `/${bitGoEnvironment}/build-unsigned-sweep/${coin}/success`
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
              const chainData = await window.queries.getChain(coin);
              const recoverData = await window.commands.recover(coin, {
                ...(await updateKeysFromIds(coin, undefined, values)),
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
                    ...(await includePubsFor(values, coin)),
                  },
                  null,
                  2
                ),
                { encoding: 'utf-8' }
              );

              navigate(
                `/${bitGoEnvironment}/build-unsigned-sweep/${coin}/success`
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
              const chainData = await getChainWithToken(
                parentCoin,
                values.tokenAddress.toLowerCase()
              );
              const { maxFeePerGas, maxPriorityFeePerGas, ...rest } =
                await updateKeysFromIds(
                  parentCoin,
                  values.tokenAddress.toLowerCase(),
                  values
                );

              const recoverData = await recoverWithToken(
                values.tokenAddress.toLowerCase(),
                [
                  parentCoin,
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
                  },
                ]
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
                defaultPath: `~/${chainData}-unsigned-sweep-${Date.now()}.json`,
              });

              if (!showSaveDialogData.filePath) {
                throw new Error('No file path selected');
              }

              await window.commands.writeFile(
                showSaveDialogData.filePath,
                JSON.stringify(
                  includePubsInUnsignedSweep
                    ? {
                        ...recoverData,
                        ...(await includePubsFor(
                          values,
                          coin,
                          values.tokenAddress.toLowerCase()
                        )),
                      }
                    : recoverData,
                  null,
                  2
                ),
                { encoding: 'utf-8' }
              );

              navigate(
                `/${bitGoEnvironment}/build-unsigned-sweep/${coin}/success`
              );
            } catch (err) {
              if (err instanceof Error) {
                setAlert(err.message);
              } else {
                console.error(err);
              }
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
