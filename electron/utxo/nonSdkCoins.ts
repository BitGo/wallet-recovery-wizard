import type { BitGoAPI } from '@bitgo/sdk-api';
import type { RecoveryCoin } from '../recoveryCoin';
import { createEcxCoin } from './ecx';

type NonSdkUtxoCoinFactory = (sdk: BitGoAPI) => RecoveryCoin;

const NON_SDK_UTXO_COINS: Record<string, NonSdkUtxoCoinFactory> = {
  tecx: createEcxCoin,
};

export function isNonSdkUtxoCoin(coin: string): boolean {
  return coin in NON_SDK_UTXO_COINS;
}

export function getNonSdkUtxoCoin(sdk: BitGoAPI, coin: string): RecoveryCoin {
  const factory = NON_SDK_UTXO_COINS[coin];
  if (!factory) throw new Error(`not a non-SDK UTXO coin: ${coin}`);
  return factory(sdk);
}
