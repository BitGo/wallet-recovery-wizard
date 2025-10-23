import { useNavigate, useParams } from 'react-router-dom';
import { CoinsSelectAutocomplete } from '~/components';
import { useAlertBanner } from '~/contexts';
import {
  assert,
  getEip1559Params,
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
  getTickerByCoinFamily,
} from '~/helpers';
import { useLocalStorageState } from '~/hooks';
import { AvalancheCForm } from './AvalancheCForm';
import { AvalancheCTokenForm } from './AvalancheCTokenForm';
import { BitcoinCashForm } from './BitcoinCashForm';
import { BitcoinForm } from './BitcoinForm';
import { BitcoinABCForm } from './BitcoinABCForm';
import { EthLikeTokenForm } from './EthLikeTokenForm';
import { EthLikeForm } from './EthLikeForm';
import { EthereumWForm } from './EthereumWForm';
import { LitecoinForm } from './LitecoinForm';
import { PolygonForm } from './PolygonForm';
import { RippleForm } from './RippleForm';
import { TronForm } from './TronForm';
import { TronTokenForm } from './TronTokenForm';
import { SolanaForm } from './SolanaForm';
import { SolanaTokenForm } from './SolanaTokenForm';
import { SuiTokenForm } from './SuiTokenForm';
import { CardanoForm } from './CardanoForm';
import { BackToHomeHelperText } from '~/components/BackToHomeHelperText';
import {
  buildUnsignedSweepCoins,
  prodEvmUnsignedSweepCoins,
  testEvmUnsignedSweepCoins,
  tokenParentCoins,
  ethMainnetChainId,
  ethTestnetChainId,
} from '~/helpers/config';
import { HederaForm } from './HederaForm';
import { AlgorandForm } from './AlgorandForm';
import { RippleTokenForm } from './RippleTokenForm';
import { HederaTokenForm } from './HederaTokenForm';
import { NearForm } from './NearForm';
import { IcpForm } from './IcpForm';
import { VetForm } from './VetForm';
import { StacksForm } from './StacksForm';
import { TonForm } from './TonForm';
import { CosmosForm } from './CosmosForm';
import { CoinFeature, coins } from '@bitgo/statics';
import { TezosForm } from './TezosForm';

const evmCoins = [
  'eth',
  'hteth',
  'etc',
  'tetc',
  'arbeth',
  'tarbeth',
  'opeth',
  'topeth',
  'flr',
  'tflr',
  'wemix',
  'twemix',
  'xdc',
  'txdc',
  'sgb',
  'tsgb',
  'oas',
  'toas',
  'coredao',
  'tcoredao',
  'soneium',
  'tsoneium',
  'bsc',
  'tbsc',
  'flow',
  'tflow',
  'plume',
  'tplume',
  'kavaevm',
  'tkavaevm',
  ...testEvmUnsignedSweepCoins,
  ...prodEvmUnsignedSweepCoins,
];

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
                feeRate: values.feeRate ? Number(values.feeRate) : undefined,
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
    case 'txrpToken':
      return (
        <RippleTokenForm
          key={coin}
          onSubmit={async (values, { setSubmitting }) => {
            setAlert(undefined);
            setSubmitting(true);
            try {
              await window.commands.setBitGoEnvironment(bitGoEnvironment, coin);
              const parentCoin = tokenParentCoins[coin];
              const chainData = coin;
              const recoverData = await window.commands.recover(parentCoin, {
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
    case 'stx':
    case 'tstx':
    case 'sip10Token':
    case 'tsip10Token':
      return (
        <StacksForm
          key={coin}
          isToken={coin === 'sip10Token' || coin === 'tsip10Token'}
          onSubmit={async (values, { setSubmitting }) => {
            setAlert(undefined);
            setSubmitting(true);
            try {
              await window.commands.setBitGoEnvironment(bitGoEnvironment, coin);
              let parentCoin: string | undefined;
              if (coin === 'sip10Token' || coin === 'tsip10Token') {
                parentCoin = tokenParentCoins[coin];
              }
              const chainData = parentCoin
                ? parentCoin
                : await window.queries.getChain(coin);
              const callerCoin = parentCoin ? parentCoin : coin;
              const recoverData = await window.commands.recover(callerCoin, {
                ...(await updateKeysFromIds(coin, values)),
                userKey: values.userKey.replace(/\s+/g, ''),
                backupKey: values.backupKey.replace(/\s+/g, ''),
                bitgoKey: values.bitgoKey.replace(/\s+/g, ''),
                ignoreAddressTypes: [],
              });
              assert(
                isRecoveryTransaction(recoverData),
                'Unsigned recovery transaction not detected.'
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
                feeRate: values.feeRate ? Number(values.feeRate) : undefined,
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
    case 'trxToken':
    case 'ttrxToken':
      return (
        <TronTokenForm
          key={coin}
          onSubmit={async (values, { setSubmitting }) => {
            setAlert(undefined);
            setSubmitting(true);
            try {
              await window.commands.setBitGoEnvironment(bitGoEnvironment, coin);
              const parentCoin = env === 'test' ? 'ttrx' : 'trx';
              const chainData = await getTokenChain(
                values.tokenAddress,
                parentCoin
              );
              const recoverData = await window.commands.recover(parentCoin, {
                ...(await updateKeysFromIds(parentCoin, values)),
                bitgoKey: values.bitgoKey.replace(/\s+/g, ''),
                tokenContractAddress: values.tokenAddress,
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
                    ...(await includePubsFor(parentCoin, values)),
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
    case 'erc20':
    case 'hterc20':
    case 'arbethToken':
    case 'tarbethToken':
    case 'opethToken':
    case 'topethToken':
    case 'polygonToken':
    case 'tpolygonToken':
      return (
        <EthLikeTokenForm
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
              const parentCoin = tokenParentCoins[coin];
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

              const tokenTicker = getTickerByCoinFamily(
                values.tokenContractAddress,
                parentCoin
              );

              const recoverData = await recoverWithToken(
                tokenTicker,
                parentCoin,
                {
                  ...rest,
                  eip1559: {
                    maxFeePerGas: toWei(maxFeePerGas),
                    maxPriorityFeePerGas: toWei(maxPriorityFeePerGas),
                  },
                  replayProtectionOptions: {
                    chain:
                      bitGoEnvironment === 'prod'
                        ? ethMainnetChainId
                        : ethTestnetChainId,
                    hardfork: 'london',
                  },
                  bitgoKey: '',
                  ignoreAddressTypes: [],
                }
              );
              assert(
                recoverData !== undefined && isRecoveryTransaction(recoverData),
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
                          parentCoin,
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
                apiKey: values.apiKey,
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
    case 'solToken':
    case 'tsolToken':
      return (
        <SolanaTokenForm
          key={coin}
          onSubmit={async (values, { setSubmitting }) => {
            setAlert(undefined);
            setSubmitting(true);
            try {
              await window.commands.setBitGoEnvironment(bitGoEnvironment, coin);
              const parentCoin = env === 'test' ? 'tsol' : 'sol';
              const chainData = await getTokenChain(
                values.tokenAddress,
                parentCoin
              );
              const { publicKey, secretKey } = values;
              const durableNonce =
                publicKey && secretKey ? { publicKey, secretKey } : undefined;
              const recoverData = await window.commands.recover(parentCoin, {
                bitgoKey: values.bitgoKey.replace(/\s+/g, ''),
                ignoreAddressTypes: [],
                userKey: '',
                backupKey: '',
                recoveryDestination: values.recoveryDestination,
                tokenContractAddress: values.tokenAddress,
                programId: values.tokenProgramId,
                seed: values.seed,
                durableNonce,
                apiKey: values.apiKey,
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
    case 'tao':
    case 'ttao':
    case 'polyx':
    case 'tpolyx':
    case 'sui':
    case 'tsui':
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
    case 'suiToken':
    case 'tsuiToken':
      return (
        <SuiTokenForm
          key={coin}
          onSubmit={async (values, { setSubmitting }) => {
            setAlert(undefined);
            setSubmitting(true);
            try {
              await window.commands.setBitGoEnvironment(bitGoEnvironment, coin);
              const parentCoin = tokenParentCoins[coin];
              const chainData = coin;
              const recoverData = await window.commands.recover(parentCoin, {
                bitgoKey: values.bitgoKey.replace(/\s+/g, ''),
                tokenContractAddress: values.packageId,
                recoveryDestination: values.recoveryDestination,
                seed: values.seed,
                ignoreAddressTypes: [],
                userKey: '',
                backupKey: '',
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
    case 'hbarToken':
    case 'thbarToken':
      return (
        <HederaTokenForm
          key={coin}
          onSubmit={async (values, { setSubmitting }) => {
            setAlert(undefined);
            setSubmitting(true);
            try {
              await window.commands.setBitGoEnvironment(bitGoEnvironment, coin);
              const parentCoin = tokenParentCoins[coin];
              const chainData = await window.queries.getChain(parentCoin);
              const recoverData = await window.commands.recover(parentCoin, {
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
    case 'algo':
    case 'talgo':
      return (
        <AlgorandForm
          key={coin}
          onSubmit={async (values, { setSubmitting }) => {
            setAlert(undefined);
            setSubmitting(true);
            try {
              await window.commands.setBitGoEnvironment(bitGoEnvironment, coin);
              const chainData = await window.queries.getChain(coin);
              const recoverData = await window.commands.recover(coin, {
                ...(await updateKeysFromIds(coin, values)),
                bitgoKey: values.bitgoKey,
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
    case 'icp':
    case 'ticp':
      return (
        <IcpForm
          key={coin}
          onSubmit={async (values, { setSubmitting }) => {
            setAlert(undefined);
            setSubmitting(true);
            try {
              // Set the BitGo environment for the selected coin
              await window.commands.setBitGoEnvironment(bitGoEnvironment, coin);

              // Fetch chain-specific data
              const chainData = await window.queries.getChain(coin);

              // Recover data for the unsigned sweep
              const recoverData = await window.commands.recover(coin, {
                ...values,
                userKey: (values.userKey ?? '').replace(/\s+/g, ''),
                backupKey: (values.backupKey ?? '').replace(/\s+/g, ''),
                bitgoKey: values.bitgoKey, // Include the BitGo key
                recoveryDestination: values.recoveryDestination, // Include the recovery destination
                ignoreAddressTypes: [], // Update keys from IDs
                // Ignore specific address types if needed
              });

              // Ensure the recovery transaction is valid
              assert(
                isRecoveryTransaction(recoverData),
                'Recovery transaction not detected.'
              );

              // Show a save dialog for the unsigned sweep JSON file
              const showSaveDialogData = await window.commands.showSaveDialog({
                filters: [
                  {
                    name: 'Custom File Type',
                    extensions: ['json'],
                  },
                ],
                defaultPath: `~/${chainData}-unsigned-sweep-${Date.now()}.json`,
              });

              // Handle case where no file path is selected
              if (!showSaveDialogData.filePath) {
                throw new Error('No file path selected');
              }

              // Write the unsigned sweep data to the selected file
              await window.commands.writeFile(
                showSaveDialogData.filePath,
                JSON.stringify(
                  includePubsInUnsignedSweep
                    ? {
                        ...recoverData,
                        ...(await includePubsFor(coin, {
                          ...values,
                          userKey: values.userKey ?? '',
                          backupKey: values.backupKey ?? '', // Include public keys if required
                        })),
                      }
                    : recoverData,
                  null,
                  2
                ),
                { encoding: 'utf-8' }
              );

              // Navigate to the success page
              navigate(
                `/${bitGoEnvironment}/build-unsigned-sweep/${coin}/success`
              );
            } catch (err) {
              // Handle errors and display alerts
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
    case 'near':
    case 'tnear':
    case 'nep141Token':
    case 'tnep141Token':
      return (
        <NearForm
          key={coin}
          isToken={coin === 'nep141Token' || coin === 'tnep141Token'}
          onSubmit={async (values, { setSubmitting }) => {
            setAlert(undefined);
            setSubmitting(true);
            try {
              // Set the BitGo environment for the selected coin
              await window.commands.setBitGoEnvironment(bitGoEnvironment, coin);

              let parentCoin: string | undefined;
              if (coin === 'nep141Token' || coin === 'tnep141Token') {
                parentCoin = tokenParentCoins[coin];
              }

              // Fetch chain-specific data
              const chainData = parentCoin
                ? parentCoin
                : await window.queries.getChain(coin);
              const callerCoin = parentCoin ? parentCoin : coin;

              // Recover data for the unsigned sweep
              const recoverData = await window.commands.recover(callerCoin, {
                ...values,
                userKey: (values.userKey ?? '').replace(/\s+/g, ''),
                backupKey: (values.backupKey ?? '').replace(/\s+/g, ''),
                bitgoKey: values.bitgoKey, // Include the BitGo key
                recoveryDestination: values.recoveryDestination, // Include the recovery destination
                ignoreAddressTypes: [], // Update keys from IDs
                // Ignore specific address types if needed
              });

              // Ensure the recovery transaction is valid
              assert(
                isRecoveryTransaction(recoverData),
                'Recovery transaction not detected.'
              );

              // Show a save dialog for the unsigned sweep JSON file
              const showSaveDialogData = await window.commands.showSaveDialog({
                filters: [
                  {
                    name: 'Custom File Type',
                    extensions: ['json'],
                  },
                ],
                defaultPath: `~/${chainData}-unsigned-sweep-${Date.now()}.json`,
              });

              // Handle case where no file path is selected
              if (!showSaveDialogData.filePath) {
                throw new Error('No file path selected');
              }

              // Write the unsigned sweep data to the selected file
              await window.commands.writeFile(
                showSaveDialogData.filePath,
                JSON.stringify(
                  includePubsInUnsignedSweep
                    ? {
                        ...recoverData,
                        ...(await includePubsFor(coin, {
                          ...values,
                          userKey: values.userKey ?? '',
                          backupKey: values.backupKey ?? '', // Include public keys if required
                        })),
                      }
                    : recoverData,
                  null,
                  2
                ),
                { encoding: 'utf-8' }
              );

              // Navigate to the success page
              navigate(
                `/${bitGoEnvironment}/build-unsigned-sweep/${coin}/success`
              );
            } catch (err) {
              // Handle errors and display alerts
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
    case 'ton':
    case 'tton':
      return (
        <TonForm
          key={coin}
          onSubmit={async (values, { setSubmitting }) => {
            setAlert(undefined);
            setSubmitting(true);
            try {
              // Set the BitGo environment for the selected coin
              await window.commands.setBitGoEnvironment(
                bitGoEnvironment,
                coin,
                values.apiKey
              );

              // Fetch chain-specific data
              const chainData = await window.queries.getChain(coin);

              // Recover data for the unsigned sweep
              const recoverData = await window.commands.recover(coin, {
                ...values,
                userKey: (values.userKey ?? '').replace(/\s+/g, ''), // Clean up userKey
                backupKey: (values.backupKey ?? '').replace(/\s+/g, ''), // Clean up backupKey
                bitgoKey: values.bitgoKey, // Include the BitGo key
                recoveryDestination: values.recoveryDestination, // Include the recovery destination
                ignoreAddressTypes: [], // Ignore specific address types if needed
              });

              // Ensure the recovery transaction is valid
              assert(
                isRecoveryTransaction(recoverData),
                'Recovery transaction not detected.'
              );

              // Show a save dialog for the unsigned sweep JSON file
              const showSaveDialogData = await window.commands.showSaveDialog({
                filters: [
                  {
                    name: 'Custom File Type',
                    extensions: ['json'],
                  },
                ],
                defaultPath: `~/${chainData}-unsigned-sweep-${Date.now()}.json`,
              });

              // Handle case where no file path is selected
              if (!showSaveDialogData.filePath) {
                throw new Error('No file path selected');
              }

              // Write the unsigned sweep data to the selected file
              await window.commands.writeFile(
                showSaveDialogData.filePath,
                JSON.stringify(
                  includePubsInUnsignedSweep
                    ? {
                        ...recoverData,
                        ...(await includePubsFor(coin, {
                          ...values,
                          userKey: values.userKey ?? '',
                          backupKey: values.backupKey ?? '', // Include public keys if required
                        })),
                      }
                    : recoverData,
                  null,
                  2
                ),
                { encoding: 'utf-8' }
              );

              // Navigate to the success page
              navigate(
                `/${bitGoEnvironment}/build-unsigned-sweep/${coin}/success`
              );
            } catch (err) {
              // Handle errors and display alerts
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
    case 'vet':
    case 'tvet':
    case 'vetToken':
    case 'tvetToken':
      return (
        <VetForm
          key={coin}
          isToken={coin === 'vetToken' || coin === 'tvetToken'}
          onSubmit={async (values, { setSubmitting }) => {
            setAlert(undefined);
            setSubmitting(true);
            try {
              // Set the BitGo environment for the selected coin
              await window.commands.setBitGoEnvironment(bitGoEnvironment, coin);

              let parentCoin: string | undefined;
              if (coin === 'vetToken' || coin === 'tvetToken') {
                parentCoin = tokenParentCoins[coin];
              }

              // Fetch chain-specific data
              const chainData = parentCoin
                ? parentCoin
                : await window.queries.getChain(coin);
              const callerCoin = parentCoin ? parentCoin : coin;

              // Recover data for the unsigned sweep
              const recoverData = await window.commands.recover(callerCoin, {
                ...values,
                userKey: '',
                backupKey: '',
                bitgoKey: values.bitgoKey, // Include the BitGo key
                recoveryDestination: values.recoveryDestination, // Include the recovery destination
                ignoreAddressTypes: [], // Update keys from IDs
                // Ignore specific address types if needed
              });

              // Ensure the recovery transaction is valid
              assert(
                isRecoveryTransaction(recoverData),
                'Recovery transaction not detected.'
              );

              // Show a save dialog for the unsigned sweep JSON file
              const showSaveDialogData = await window.commands.showSaveDialog({
                filters: [
                  {
                    name: 'Custom File Type',
                    extensions: ['json'],
                  },
                ],
                defaultPath: `~/${chainData}-unsigned-sweep-${Date.now()}.json`,
              });

              // Handle case where no file path is selected
              if (!showSaveDialogData.filePath) {
                throw new Error('No file path selected');
              }

              // Write the unsigned sweep data to the selected file
              await window.commands.writeFile(
                showSaveDialogData.filePath,
                JSON.stringify(
                  includePubsInUnsignedSweep
                    ? {
                      ...recoverData,
                      ...(await includePubsFor(coin, {
                        ...values,
                        userKey: '',
                        backupKey: '',
                      })),
                    }
                    : recoverData,
                  null,
                  2
                ),
                { encoding: 'utf-8' }
              );

              // Navigate to the success page
              navigate(
                `/${bitGoEnvironment}/build-unsigned-sweep/${coin}/success`
              );
            } catch (err) {
              // Handle errors and display alerts
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
    case 'atom':
    case 'tatom':
    case 'baby':
    case 'tbaby':
    case 'bld':
    case 'tbld':
    case 'coreum':
    case 'tcoreum':
    case 'hash':
    case 'thash':
    case 'injective':
    case 'tinjective':
    case 'osmo':
    case 'tosmo':
    case 'thorchain:rune':
    case 'tthorchain:rune':
    case 'sei':
    case 'tsei':
    case 'tia':
    case 'ttia':
    case 'zeta':
    case 'tzeta':
    case 'asi':
    case 'tasi':
    case 'cronos':
    case 'tcronos':
    case 'initia':
    case 'tinitia':
    case 'mantra':
    case 'tmantra':
      return (
        <CosmosForm
          key={coin}
          onSubmit={async (values, { setSubmitting }) => {
            setAlert(undefined);
            setSubmitting(true);
            try {
              await window.commands.setBitGoEnvironment(bitGoEnvironment, coin);
              const chainData = await window.queries.getChain(coin);
              const recoverData = await window.commands.recover(coin, {
                ...values,
                scan: Number(values.scan),
                startingScanIndex: Number(values.startingScanIndex),
                userKey: (values.userKey ?? '').replace(/\s+/g, ''),
                backupKey: (values.backupKey ?? '').replace(/\s+/g, ''),
                bitgoKey: (values.bitgoKey ?? '').replace(/\s+/g, ''),
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
                  {
                    ...recoverData,
                    ...(await includePubsFor(coin, {
                      ...values,
                      userKey: values.userKey ?? '',
                      backupKey: values.backupKey ?? '',
                      bitgoKey: values.bitgoKey ?? '',
                    })),
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
    case 'xtz':
    case 'txtz':
      return (
        <TezosForm
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

              const recoverData = await window.commands.recover(coin, {
                ...values,
                isUnsignedSweep: true,
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
      if (coin && evmCoins.includes(coin)) {
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
                const supportsEip1559 = coins
                  .get(coin)
                  ?.features.includes(CoinFeature.EIP1559);
                const recoverData = await window.commands.recover(coin, {
                  ...rest,
                  gasPrice: toWei(maxFeePerGas),
                  eip1559: supportsEip1559
                    ? getEip1559Params(coin, maxFeePerGas, maxPriorityFeePerGas)
                    : undefined,
                  replayProtectionOptions: {
                    chain: getEthLikeRecoveryChainId(coin, bitGoEnvironment),
                    hardfork: supportsEip1559 ? 'london' : 'petersburg',
                  },
                  bitgoKey: '',
                  ignoreAddressTypes: [],
                });
                assert(
                  isRecoveryTransaction(recoverData),
                  'Fully-signed recovery transaction not detected.'
                );

                const showSaveDialogData = await window.commands.showSaveDialog(
                  {
                    filters: [
                      {
                        name: 'Custom File Type',
                        extensions: ['json'],
                      },
                    ],
                    defaultPath: `~/${chainData}-unsigned-sweep-${Date.now()}.json`,
                  }
                );

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
      }
  }
  throw new Error(`Unsupported coin: ${String(coin)}`);
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
