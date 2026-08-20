import type { RecoveryCoin } from '../recoveryCoin';
import {
  AbstractUtxoCoin,
  type RecoveryProvider,
  type RecoverParams,
} from '@bitgo/abstract-utxo';
import { BlockstreamApi } from '@bitgo/blockapis';
import type { BitGoAPI } from '@bitgo/sdk-api';

/**
 * ---------------------------------------------------------------------------
 * WHY THIS QUERIES BTC/TBTC ESPLORAS INSTEAD OF AN ECX-SPECIFIC ONE
 * ---------------------------------------------------------------------------
 * We are deliberately NOT pointing this at any ecash-com/drivechain esplora
 * (e.g. drynet3's https://esplora.drynet3.drivechain.dev), even though that
 * infrastructure exists. Reasoning:
 *
 *   1. ECX is a 1:1 hard fork of Bitcoin — every BTC address/UTXO existing at
 *      the fork block is credited identically on eCash. Pre-fork, "ECX
 *      history" and "BTC history" are the exact same history: the BTC chain
 *      itself. So for recovering funds as of today (mainnet hasn't forked
 *      yet — see ecash-com/fast-facts), the correct and only source of truth
 *      for UTXO/fee data is the Bitcoin chain, full stop.
 *   2. There is currently no ECX esplora we trust for production use. The
 *      only ones that exist are pre-launch dry-run test networks
 *      (drynet1/2/3) run by a third party ahead of a fork that hasn't
 *      happened. Pointing prod fund-recovery traffic at that infrastructure
 *      would mean trusting an unaudited, pre-launch, third-party endpoint
 *      with real user recovery data for no benefit — the data it would
 *      return is BTC-identical anyway pre-fork.
 *
 * So: prod uses the real Blockstream BTC mainnet esplora, test uses the
 * Blockstream testnet (tbtc) esplora. This is a deliberate, understood
 * choice, not an oversight — revisit only once a trusted, launched ECX
 * esplora exists post-fork (watch drivechain.info/dev.txt).
 * ---------------------------------------------------------------------------
 */
function ecxEsploraCoin(sdk: BitGoAPI): 'btc' | 'tbtc' {
  return sdk.getEnv() === 'prod' ? 'btc' : 'tbtc';
}

/**
 * nLockTime replay-protection marker (drynet3 IsFinalTx scheme).
 * A tx stamped with nLockTime = 499_999_999 is final on eCash (patched) but
 * non-final on stock Bitcoin (~500M blocks out), so an ECX sweep cannot
 * replay onto BTC.  Value defined in the drynet3 branch of ecash-com/bitcoin:
 * https://github.com/ecash-com/bitcoin/commit/d2dec2fe9bde6787686b9673c00a643d8196c09e
 * (src/consensus/tx_verify.cpp#L19).  The mobile wallet mirrors this as
 * `replayProtectionLockHeight` (ecash-com/ecash-wallet-mobile, NetworkRegistry.swift:118).
 *
 * BLOCKER: only valid if ECX mainnet ships the drynet3 scheme.  If it ships
 * the magic-version branch instead, this locktime makes the tx unspendable.
 */
const ECX_REPLAY_LOCK_TIME = 499_999_999;

export function createEcxCoin(
  sdk: BitGoAPI,
  chain: 'ecx' | 'tecx'
): RecoveryCoin {
  return {
    // Always 'btc' here (not env-dependent like the esplora below): ECX
    // addresses are BTC-mainnet-format regardless of which WRW build the
    // user is running, so key derivation always uses mainnet params.
    deriveKeyWithSeed: (key, seed) =>
      sdk.coin('btc').deriveKeyWithSeed({ key, seed }),
    // Use the selected network name as the sweep-file prefix rather than
    // sdk.coin('btc').getChain(), which would write a BTC filename.
    getChain: () => chain,

    async recover(parameters: unknown) {
      const baseCoin = sdk.coin('btc') as AbstractUtxoCoin;
      // See the block comment above ecxEsploraCoin() for why this is a
      // BTC/TBTC esplora rather than anything ECX-specific.
      const recoveryProvider: RecoveryProvider<number> = BlockstreamApi.forCoin(
        ecxEsploraCoin(sdk)
      );
      const params: RecoverParams = {
        ...(parameters as RecoverParams),
        recoveryProvider,
        lockTime: ECX_REPLAY_LOCK_TIME,
      };
      return await baseCoin.recover(params);
    },

    // ECX unsigned sweeps are written to a file and signed/broadcast outside
    // WRW (see BuildUnsignedSweepCoin.tsx) — neither ECX alias is in
    // broadcastTransactionCoins, so this is unreachable from the UI.
    broadcast() {
      throw new Error(
        'ECX recovery does not support broadcasting through WRW; sign and broadcast the unsigned sweep externally.'
      );
    },
  };
}
