import { useNavigate, useParams } from 'react-router-dom';
import { CoinsSelectAutocomplete } from '~/components';
import { useAlertBanner } from '~/contexts';
import {
  assert,
  getEthLikeRecoveryChainId,
  getTokenChain,
  includePubsFor,
  includePubsForToken,
  isRecoveryTransaction,
  recoverWithToken,
  safeEnv,
  toWei,
  updateKeysFromIds,
  updateKeysFromIdsWithToken,
} from '~/helpers';
import { useLocalStorageState } from '~/hooks';
import { AvalancheCForm } from './AvalancheCForm';
import { AvalancheCTokenForm } from './AvalancheCTokenForm';
import { BitcoinCashForm } from './BitcoinCashForm';
import { BitcoinForm } from './BitcoinForm';
import { BitcoinABCForm } from './BitcoinABCForm';
import { Erc20TokenForm } from './Erc20TokenForm';
import { EthLikeForm } from './EthLikeForm';
import { EthereumWForm } from './EthereumWForm';
import { LitecoinForm } from './LitecoinForm';
import { PolygonForm } from './PolygonForm';
import { RippleForm } from './RippleForm';
import { TronForm } from './TronForm';
import { SolanaForm } from './SolanaForm';
import { CardanoForm } from './CardanoForm';
import { BackToHomeHelperText } from '~/components/BackToHomeHelperText';
import { buildUnsignedSweepCoins } from '~/helpers/config';
import { HederaForm } from './HederaForm';

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
              await window.commands.setBitGoEnvironment(bitGoEnvironment, coin);
              const chainData = await window.queries.getChain(coin);
              const recoverData = await window.commands.recover(coin, {
                ...(await updateKeysFromIds(coin, values)),
                scan: Number(values.scan),
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
                    ...(await includePubsFor(coin, values)),
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
    case 'hteth':
    case 'arbeth':
    case 'tarbeth':
    case 'opeth':
    case 'topeth':
      return (
        <EthLikeForm
          key={coin}
          coinName={coin}
          onSubmit={async (values, { setSubmitting }) => {
            setAlert(undefined);
            setSubmitting(true);
            try {
              await window.commands.setBitGoEnvironment(
                bitGoEnvironment,
                coin,
                values.apiKey
              );
              const chainData = await window.queries.getChain(coin);

              const { maxFeePerGas, maxPriorityFeePerGas, ...rest } =
                await updateKeysFromIds(coin, values);
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
                        ...(await includePubsFor(coin, values)),
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
    case 'ethw':
      return (
        <EthereumWForm
          key={coin}
          onSubmit={async (values, { setSubmitting }) => {
            setAlert(undefined);
            setSubmitting(true);
            try {
              await window.commands.setBitGoEnvironment(bitGoEnvironment, coin);
              const chainData = await window.queries.getChain(coin);

              const { maxFeePerGas, maxPriorityFeePerGas, ...rest } =
                await updateKeysFromIds(coin, values);
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
                        ...(await includePubsFor(coin, values)),
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
              await window.commands.setBitGoEnvironment(bitGoEnvironment, coin);
              const chainData = await window.queries.getChain(coin);

              const recoverData = await window.commands.recover(coin, {
                ...(await updateKeysFromIds(coin, values)),
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
                        ...(await includePubsFor(coin, values)),
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
    case 'avaxcToken':
    case 'tavaxcToken':
      return (
        <AvalancheCTokenForm
          key={coin}
          onSubmit={async (values, { setSubmitting }) => {
            setAlert(undefined);
            setSubmitting(true);
            try {
              await window.commands.setBitGoEnvironment(bitGoEnvironment, coin);
              const parentCoin = env === 'test' ? 'tavaxc' : 'avaxc';
              const chainData = await getTokenChain(
                values.tokenContractAddress.toLowerCase(),
                parentCoin
              );
              const recoverData = await window.commands.recover(parentCoin, {
                ...(await updateKeysFromIds(coin, values)),
                tokenContractAddress: values.tokenContractAddress.toLowerCase(),
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
                        ...(await includePubsForToken(
                          values.tokenContractAddress.toLowerCase(),
                          coin,
                          values
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
              await window.commands.setBitGoEnvironment(bitGoEnvironment, coin);
              const chainData = await window.queries.getChain(coin);
              const recoverData = await window.commands.recover(coin, {
                ...(await updateKeysFromIds(coin, values)),
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
                        ...(await includePubsFor(coin, values)),
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
                coin,
                values.apiKey
              );
              const chainData = await window.queries.getChain(coin);
              const recoverData = await window.commands.recover(coin, {
                ...(await updateKeysFromIds(coin, values)),
                scan: Number(values.scan),
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
                    ...(await includePubsFor(coin, values)),
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
    case 'bcha':
      return (
        <BitcoinABCForm
          key={coin}
          onSubmit={async (values, { setSubmitting }) => {
            setAlert(undefined);
            setSubmitting(true);
            try {
              await window.commands.setBitGoEnvironment(
                bitGoEnvironment,
                coin,
                values.apiKey
              );
              const chainData = await window.queries.getChain(coin);
              const recoverData = await window.commands.recover(coin, {
                ...(await updateKeysFromIds(coin, values)),
                scan: Number(values.scan),
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
                    ...(await includePubsFor(coin, values)),
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
    case 'doge':
    case 'tdoge':
      return (
        <LitecoinForm
          key={coin}
          onSubmit={async (values, { setSubmitting }) => {
            setAlert(undefined);
            setSubmitting(true);
            try {
              await window.commands.setBitGoEnvironment(
                bitGoEnvironment,
                coin,
                values.apiKey
              );
              const chainData = await window.queries.getChain(coin);
              const recoverData = await window.commands.recover(coin, {
                ...(await updateKeysFromIds(coin, values)),
                scan: Number(values.scan),
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
                    ...(await includePubsFor(coin, values)),
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
    case 'near':
    case 'tnear':
      return (
        <TronForm
          key={coin}
          onSubmit={async (values, { setSubmitting }) => {
            setAlert(undefined);
            setSubmitting(true);
            try {
              await window.commands.setBitGoEnvironment(bitGoEnvironment, coin);
              const chainData = await window.queries.getChain(coin);
              const recoverData = await window.commands.recover(coin, {
                ...(await updateKeysFromIds(coin, values)),
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
                    ...(await includePubsFor(coin, values)),
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
    case 'polygon':
    case 'tpolygon':
      return (
        <PolygonForm
          key={coin}
          onSubmit={async (values, { setSubmitting }) => {
            setAlert(undefined);
            setSubmitting(true);
            try {
              await window.commands.setBitGoEnvironment(
                bitGoEnvironment,
                coin,
                values.apiKey
              );
              const chainData = await window.queries.getChain(coin);

              const { maxFeePerGas, maxPriorityFeePerGas, ...rest } =
                await updateKeysFromIds(coin, values);
              const recoverData = await window.commands.recover(coin, {
                ...rest,
                eip1559: {
                  maxFeePerGas: toWei(maxFeePerGas),
                  maxPriorityFeePerGas: toWei(maxPriorityFeePerGas),
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
                        ...(await includePubsFor(coin, values)),
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
    case 'erc20':
    case 'hterc20':
      return (
        <Erc20TokenForm
          key={coin}
          onSubmit={async (values, { setSubmitting }) => {
            setAlert(undefined);
            setSubmitting(true);
            try {
              await window.commands.setBitGoEnvironment(
                bitGoEnvironment,
                coin,
                values.apiKey
              );
              const parentCoin = env === 'test' ? 'hteth' : 'eth';
              const chainData = await getTokenChain(
                values.tokenContractAddress.toLowerCase(),
                parentCoin
              );
              const { maxFeePerGas, maxPriorityFeePerGas, ...rest } =
                await updateKeysFromIdsWithToken(
                  values.tokenContractAddress.toLowerCase(),
                  parentCoin,
                  values
                );

              const recoverData = await recoverWithToken(
                values.tokenContractAddress.toLowerCase(),
                parentCoin,
                {
                  ...rest,
                  eip1559: {
                    maxFeePerGas: toWei(maxFeePerGas),
                    maxPriorityFeePerGas: toWei(maxPriorityFeePerGas),
                  },
                  replayProtectionOptions: {
                    chain: bitGoEnvironment === 'prod' ? 1 : 17000,
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
                        ...(await includePubsForToken(
                          values.tokenContractAddress.toLowerCase(),
                          coin,
                          values
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
    case 'sol':
    case 'tsol':
      return (
        <SolanaForm
          key={coin}
          onSubmit={async (values, { setSubmitting }) => {
            setAlert(undefined);
            setSubmitting(true);
            try {
              await window.commands.setBitGoEnvironment(bitGoEnvironment, coin);
              const chainData = await window.queries.getChain(coin);
              const { publicKey, secretKey } = values;
              const durableNonce =
                publicKey && secretKey ? { publicKey, secretKey } : undefined;
              const recoverData = await window.commands.recover(coin, {
                bitgoKey: values.bitgoKey.replace(/\s+/g, ''),
                ignoreAddressTypes: [],
                userKey: '',
                backupKey: '',
                recoveryDestination: values.recoveryDestination,
                seed: values.seed,
                durableNonce,
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
    case 'ada':
    case 'tada':
    case 'dot':
    case 'tdot':
      return (
        <CardanoForm
          key={coin}
          onSubmit={async (values, { setSubmitting }) => {
            setAlert(undefined);
            setSubmitting(true);
            try {
              await window.commands.setBitGoEnvironment(bitGoEnvironment, coin);
              const chainData = await window.queries.getChain(coin);
              const recoverData = await window.commands.recover(coin, {
                bitgoKey: values.bitgoKey.replace(/\s+/g, ''),
                ignoreAddressTypes: [],
                userKey: '',
                backupKey: '',
                recoveryDestination: values.recoveryDestination,
                seed: values.seed,
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
              const recoverData = await window.commands.recover(coin, {
                ...(await updateKeysFromIds(coin, values)),
                bitgoKey: '',
                ignoreAddressTypes: [],
              });
              assert(
                isRecoveryTransaction(recoverData),
                'Recovery transaction not detected.'
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
                        ...(await includePubsFor(coin, values)),
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
    default:
      throw new Error(`Unsupported coin: ${String(coin)}`);
  }
}

export function BuildUnsignedSweepCoin() {
  const { env, coin } = useParams<'env' | 'coin'>();
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
          coins={buildUnsignedSweepCoins[environment]}
          selectedCoin={coin}
          helperText={<BackToHomeHelperText env={environment} />}
        />
      </div>
      <Form />
    </>
  );
}
