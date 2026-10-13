import type { BitGoAPI } from '@bitgo/sdk-api';
import type { RecoveryCoin } from '../recoveryCoin';
import { createEcxCoin } from './ecx';
import { createPearlCoin } from './pearl';

type NonSdkUtxoCoinFactory = (sdk: BitGoAPI) => RecoveryCoin;

/**
 * UTXO coins that need a custom RecoveryCoin (custom esplora RecoveryProvider)
 * rather than the SDK's default BlockchairApi lookup. ECX is genuinely non-SDK;
 * Pearl is registered in the SDK (via @bitgo/sdk-coin-pearl) but is
 * service-backed (wasm-utxo) and has no BlockchairApi entry, so its esplora
 * provider is overridden here too.
 */
const NON_SDK_UTXO_COINS: Record<string, NonSdkUtxoCoinFactory> = {
  ecx: sdk => createEcxCoin(sdk, 'ecx'),
  tecx: sdk => createEcxCoin(sdk, 'tecx'),
  pearl: sdk => createPearlCoin(sdk, 'pearl'),
  tpearl: sdk => createPearlCoin(sdk, 'tpearl'),
};

export function isNonSdkUtxoCoin(coin: string): boolean {
  return coin in NON_SDK_UTXO_COINS;
}

export function getNonSdkUtxoCoin(sdk: BitGoAPI, coin: string): RecoveryCoin {
  const factory = NON_SDK_UTXO_COINS[coin];
  if (!factory) throw new Error(`not a non-SDK UTXO coin: ${coin}`);
  return factory(sdk);
}
