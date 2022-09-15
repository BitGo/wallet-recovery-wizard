import type {
  BackupKeyRecoveryTransansaction,
  FormattedOfflineVaultTxInfo,
  RecoverParams,
} from '@bitgo/abstract-utxo';
import type { Chain, Hardfork } from '@ethereumjs/common';

const GWEI = 10 ** 9;

export async function recover(
  coin: string,
  token: string | undefined,
  params: RecoverParams & {
    rootAddress?: string;
    gasLimit?: number;
    gasPrice?: number;
    eip1559?: {
      maxFeePerGas: number;
      maxPriorityFeePerGas: number;
    };
    replayProtectionOptions?: {
      chain: typeof Chain[keyof typeof Chain];
      hardfork: `${Hardfork}`;
    };
    walletContractAddress?: string;
    tokenAddress?: string;
  }
) {
  let recoverPayload;
  if (token) {
    try {
      recoverPayload = await window.commands.recover(token, params);
    } catch (e) {
      recoverPayload = await window.commands.recover(coin, params);
    }
  } else {
    recoverPayload = await window.commands.recover(coin, params);
  }
  return recoverPayload;
}

export async function getChain(coin: string, token?: string) {
  let chain;
  if (token) {
    try {
      chain = await window.queries.getChain(token);
    } catch (e) {
      chain = await window.queries.getChain(coin);
    }
  } else {
    chain = await window.queries.getChain(coin);
  }
  return chain;
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
