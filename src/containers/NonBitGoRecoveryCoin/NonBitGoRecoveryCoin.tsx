import { useNavigate, useParams } from 'react-router-dom';
import { CoinsSelectAutocomplete } from '~/components';
import { BackToHomeHelperText } from '~/components/BackToHomeHelperText';
import { useAlertBanner } from '~/contexts';
import {
  assert,
  getEthLikeRecoveryChainId,
  getTokenChain,
  isRecoveryTransaction,
  recoverWithToken,
  safeEnv,
  toWei,
} from '~/helpers';
import {
  nonBitgoRecoveryCoins,
  prodEvmNonBitgoRecoveryCoins,
  testEvmNonBitgoRecoveryCoins,
  tokenParentCoins,
} from '~/helpers/config';
import { AvalancheCForm } from './AvalancheCForm';
import { BitcoinABCForm } from './BitcoinABCForm';
import { BitcoinCashForm } from './BitcoinCashForm';
import { BitcoinForm } from './BitcoinForm';
import { CardanoForm } from './CardanoForm';
import { CosmosForm } from './CosmosForm';
import { DogecoinForm } from './DogecoinForm';
import { EthLikeTokenForm } from './EthLikeTokenForm';
import { EthereumForm } from './EthLikeForm';
import { EthereumWForm } from './EthereumWForm';
import { LitecoinForm } from './LitecoinForm';
import { PolkadotForm } from './PolkadotForm';
import { RippleForm } from './RippleForm';
import { SolanaForm } from './SolanaForm';
import { SolanaTokenForm } from './SolanaTokenForm';
import { TronForm } from './TronForm';
import { TronTokenForm } from './TronTokenForm';
import { AvalancheCTokenForm } from './AvalancheCTokenForm';
import { HederaForm } from './HederaForm';
import { AlgorandForm } from './AlgorandForm';
import { RippleTokenForm } from './RippleTokenForm';
import { HederaTokenForm } from './HederaTokenForm';
import { StacksForm } from './StacksForm';
import { IcpForm } from './IcpForm';
import { NearForm } from './NearForm';
import { CoinFeature, coins } from '@bitgo/statics';
import { TonForm } from './TonForm';

const evmCoins = [
  'eth',
  'hteth',
  'etc',
  'tetc',
  'arbeth',
  'tarbeth',
  'coredao',
  'tcoredao',
  'oas',
  'toas',
  'opeth',
  'topeth',
  'polygon',
  'tpolygon',
  'bsc',
  'tbsc',
  'flr',
  'tflr',
  'sgb',
  'tsgb',
  'wemix',
  'twemix',
  'xdc',
  'txdc',
  'soneium',
  'tsoneium',
  ...testEvmNonBitgoRecoveryCoins,
  ...prodEvmNonBitgoRecoveryCoins,
];

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
              await window.commands.setBitGoEnvironment(bitGoEnvironment, coin);
              const chainData = await window.queries.getChain(coin);
              const recoverData = await window.commands.recover(coin, {
                ...values,
                scan: Number(values.scan),
                feeRate: values.feeRate ? Number(values.feeRate) : undefined,
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
    case 'dot':
    case 'tdot':
    case 'tao':
    case 'ttao':
      return (
        <PolkadotForm
          key={coin}
          onSubmit={async (values, { setSubmitting }) => {
            setAlert(undefined);
            setSubmitting(true);
            try {
              await window.commands.setBitGoEnvironment(bitGoEnvironment, coin);
              const chainData = await window.queries.getChain(coin);
              const recoverData = await window.commands.recover(coin, {
                ...values,
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
              await window.commands.setBitGoEnvironment(bitGoEnvironment, coin);
              let parentCoin: string | undefined;
              if (coin === 'nep141Token' || coin === 'tnep141Token') {
                parentCoin = tokenParentCoins[coin];
              }
              const chainData = parentCoin ? parentCoin : await window.queries.getChain(coin);
              const callerCoin = parentCoin ? parentCoin : coin;
              const recoverData = await window.commands.recover(callerCoin, {
                ...values,
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
    case 'ada':
    case 'tada':
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
              const { publicKey, secretKey, ...rest } = values;
              const durableNonce =
                publicKey && secretKey ? { publicKey, secretKey } : undefined;
              const recoverData = await window.commands.recover(coin, {
                ...rest,
                durableNonce,
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
              const { publicKey, secretKey, ...rest } = values;
              const durableNonce =
                publicKey && secretKey ? { publicKey, secretKey } : undefined;
              const recoverData = await window.commands.recover(parentCoin, {
                ...rest,
                durableNonce,
                bitgoKey: values.bitgoKey.replace(/\s+/g, ''),
                tokenContractAddress: values.tokenAddress,
                programId: values.tokenProgramId,
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

              const { maxFeePerGas, maxPriorityFeePerGas, ...rest } = values;

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
              await window.commands.setBitGoEnvironment(bitGoEnvironment, coin);
              const chainData = await window.queries.getChain(coin);
              const recoverData = await window.commands.recover(coin, {
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
                ...values,
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
              await window.commands.setBitGoEnvironment(bitGoEnvironment, coin);
              const chainData = await window.queries.getChain(coin);
              const recoverData = await window.commands.recover(coin, {
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
              const chainData = parentCoin ? parentCoin : await window.queries.getChain(coin);
              const callerCoin = parentCoin ? parentCoin : coin;
              const recoverData = await window.commands.recover(callerCoin, {
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
                ...values,
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
                ...values,
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
                coin,
                values.apiKey
              );
              const chainData = await window.queries.getChain(coin);
              const recoverData = await window.commands.recover(coin, {
                ...values,
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
    case 'doge':
    case 'tdoge':
      return (
        <DogecoinForm
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
                ...values,
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
                defaultPath: `~/${chainData}-recovery-${Date.now()}.json`,
              });

              if (!showSaveDialogData.filePath) {
                throw new Error('No file path selected');
              }

              await window.commands.writeFile(
                showSaveDialogData.filePath,
                JSON.stringify(
                  recoverData,
                  (key, value) =>
                    typeof value === 'bigint' ? value.toString() : value,
                  2
                ),
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
              await window.commands.setBitGoEnvironment(bitGoEnvironment, coin);
              const chainData = await window.queries.getChain(coin);
              const recoverData = await window.commands.recover(coin, {
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
    case 'trxToken':
    case 'ttrxToken':
    case 'suiToken':
    case 'tsuiToken':
      return (
        <TronTokenForm
          key={coin}
          onSubmit={async (values, { setSubmitting }) => {
            setAlert(undefined);
            setSubmitting(true);
            try {
              await window.commands.setBitGoEnvironment(bitGoEnvironment, coin);
              const parentCoin = tokenParentCoins[coin];
              let chainData = await getTokenChain(values.tokenAddress, parentCoin);
              const recoverData = await window.commands.recover(parentCoin, {
                ...values,
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
              const { maxFeePerGas, maxPriorityFeePerGas, ...rest } = values;

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
    case 'atom':
    case 'tatom':
    case 'osmo':
    case 'tosmo':
    case 'tia':
    case 'ttia':
    case 'injective':
    case 'tinjective':
    case 'bld':
    case 'tbld':
    case 'hash':
    case 'thash':
    case 'sei':
    case 'tsei':
    case 'zeta':
    case 'tzeta':
    case 'coreum':
    case 'tcoreum':
    case 'sui':
    case 'tsui':
    case 'thorchain:rune':
    case 'tthorchain:rune':
    case 'baby':
    case 'tbaby':
    case 'cronos':
    case 'tcronos':
    case 'initia':
    case 'tinitia':
    case 'asi':
    case 'tasi':
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
    case 'thbar':
    case 'hbar':
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
    case 'thbarToken':
    case 'hbarToken':
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
    case 'talgo':
    case 'algo':
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
                ...values,
                bitgoKey: values.bitgoKey,
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
    case 'icp':
    case 'ticp':
      return (
        <IcpForm
          key={coin}
          onSubmit={async (values, { setSubmitting }) => {
            setAlert(undefined);
            setSubmitting(true);
            try {
              await window.commands.setBitGoEnvironment(bitGoEnvironment, coin);
              const chainData = await window.queries.getChain(coin);
              const recoverData = await window.commands.recover(coin, {
                ...values,
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
    case 'ton':
    case 'tton':
      return (
        <TonForm
          key={coin}
          onSubmit={async (values, { setSubmitting }) => {
            setAlert(undefined);
            setSubmitting(true);
            try {
              // Set the BitGo environment for TON Coin
              await window.commands.setBitGoEnvironment(
                bitGoEnvironment,
                coin,
                values.apiKey
              );

              // Fetch chain data for TON Coin
              const chainData = await window.queries.getChain(coin);

              // Perform the recovery process
              const recoverData = await window.commands.recover(coin, {
                ...values,
                bitgoKey: values.bitgoKey?.replace(/\s+/g, '') || '',
                ignoreAddressTypes: [],
              });

              // Ensure the recovery data is valid
              assert(
                isRecoveryTransaction(recoverData),
                'Fully-signed recovery transaction not detected.'
              );

              // Show a save dialog to save the recovery data
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

              // Write the recovery data to the selected file
              await window.commands.writeFile(
                showSaveDialogData.filePath,
                JSON.stringify(recoverData, null, 2),
                { encoding: 'utf-8' }
              );

              // Navigate to the success page
              navigate(`/${bitGoEnvironment}/non-bitgo-recovery/${coin}/success`);
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
      if (coin && evmCoins.includes(coin)) {
        return (
          <EthereumForm
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


                const { maxFeePerGas, maxPriorityFeePerGas, ...rest } = values;
                const supportsEip1559 = coins.get(coin)?.features.includes(CoinFeature.EIP1559);
                const recoverData = await window.commands.recover(coin, {
                  ...rest,
                  gasPrice: toWei(maxFeePerGas),
                  eip1559: supportsEip1559 ? {
                    maxFeePerGas: toWei(maxFeePerGas),
                    maxPriorityFeePerGas: toWei(maxPriorityFeePerGas),
                  } : undefined,
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
      }
  }
  throw new Error(`Unsupported coin: ${String(coin)}`);
}

export function NonBitGoRecoveryCoin() {
  const { env, coin } = useParams<'env' | 'coin'>();
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
          coins={nonBitgoRecoveryCoins[environment]}
          selectedCoin={coin}
          helperText={<BackToHomeHelperText env={environment} />}
        />
      </div>
      <Form />
    </>
  );
}
