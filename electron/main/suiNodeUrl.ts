import { Environments } from '@bitgo/sdk-core';

/**
 * Sui Foundation disabled JSON-RPC on fullnode.*.sui.io (week of 27 Jul 2026).
 * WRW recover only uses BitGo env `test` | `prod`.
 */
export const SUI_JSON_RPC_TESTNET = 'https://sui-testnet-rpc.publicnode.com';
export const SUI_JSON_RPC_MAINNET = 'https://sui-rpc.publicnode.com';

export function applySuiNodeUrls(
  environments: typeof Environments = Environments
): void {
  environments.test.suiNodeUrl = SUI_JSON_RPC_TESTNET;
  environments.prod.suiNodeUrl = SUI_JSON_RPC_MAINNET;
}
