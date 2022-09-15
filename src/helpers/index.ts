import type {
  BackupKeyRecoveryTransansaction,
  FormattedOfflineVaultTxInfo,
} from '@bitgo/abstract-utxo';

const GWEI = 10 ** 9;

export async function recoverWithToken(
  token: string,
  params: Parameters<typeof window.commands.recover>
) {
  const [coin, rest] = params;
  console.log(rest);
  try {
    return await window.commands.recover(token, rest);
  } catch (e) {
    return await window.commands.recover(coin, rest);
  }
}

export async function getTokenChain(
  token: string,
  ...params: Parameters<typeof window.queries.getChain>
) {
  const [coin] = params;
  try {
    return await window.queries.getChain(token);
  } catch (e) {
    return await window.queries.getChain(coin);
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

export function safeEnv(value: string | undefined): 'prod' | 'test' {
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
    ('txid' in value && !!value['txid'])
  );
}
