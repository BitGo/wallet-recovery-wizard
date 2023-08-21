import type {
  BackupKeyRecoveryTransansaction,
  FormattedOfflineVaultTxInfo,
} from '@bitgo/abstract-utxo';

const GWEI = 10 ** 9;

export async function recoverWithToken(
  token: string,
  ...args: Parameters<typeof window.commands.recover>
) {
  const [coin, ...rest] = args;
  try {
    return await window.commands.recover(token, ...rest);
  } catch {
    return await window.commands.recover(coin, ...rest);
  }
}

export async function getTokenChain(
  token: string,
  ...args: Parameters<typeof window.queries.getChain>
) {
  const [coin, ...rest] = args;
  try {
    return await window.queries.getChain(token, ...rest);
  } catch {
    return await window.queries.getChain(coin, ...rest);
  }
}

export function toWei(gas: number) {
  return gas * GWEI;
}

export function getEthLikeRecoveryChainId(
  coinName: string,
  bitGoEnvironment: string
) {
  return coinName === 'ethw' ? 10001 : bitGoEnvironment === 'prod' ? 1 : 5;
}

export type BitgoEnv = 'prod' | 'test';

export function safeEnv(value: string | undefined): BitgoEnv {
  if (value !== 'test' && value !== 'prod') {
    throw new Error(
      `expected value to be "test" or "prod" but got: ${String(value)}`
    );
  }
  return value;
}

export function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

export function isRecoveryTransaction(
  value: BackupKeyRecoveryTransansaction | FormattedOfflineVaultTxInfo
) {
  return (
    ('txHex' in value && !!value['txHex']) ||
    ('transactionHex' in value && !!value['transactionHex']) ||
    ('tx' in value && !!value['tx']) ||
    ('transaction' in value && !!value['transaction']) ||
    ('txid' in value && !!value['txid']) ||
    ('serializedTx' in value && !!value['serializedTx']) ||
    ('tokenTxs' in value && !!value['tokenTxs'])
  );
}

export function mapSdkErrorToAlert(message: string): string {
  switch (message) {
    case 'invalid_client':
      return 'Invalid email format';
    case 'invalid_grant':
      return 'Incorrect email or password';
    case 'needs_otp':
      return 'Invalid OTP';
    case 'request_source_unverified':
    case 'request_source_verification_pending':
      return 'You are trying to log in from an unverified IP address, please check your inbox for a verification email.';
    default:
      return message;
  }
}
