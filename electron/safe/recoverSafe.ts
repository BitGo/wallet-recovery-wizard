import assert from 'node:assert';
import path from 'node:path';
import {
  buildSafeRecoverKeyParams,
  decryptSafeKeycard,
  deriveSafeWalletKeys,
  ErrorNoInputToRecover,
  RecoveryKeyMismatchError,
  safeSlotsForCoin,
} from '@bitgo/sdk-core';
import type {
  BitGoBase,
  DerivedSafeWalletKeys,
  SafeRecoverKeyParams,
} from '@bitgo/sdk-core';
import type {
  SafeRecoveryProgress,
  SafeRecoveryRequest,
  SafeRecoveryResult,
  SafeSlot,
  SafeWalletResult,
} from '../../src/utils/safeRecovery';
import type { RecoveryCoin } from '../recoveryCoin';

export type SafeRecoveryDeps = {
  writeFile(file: string, data: string): Promise<void>;
  onProgress(progress: SafeRecoveryProgress): void;
  signal: AbortSignal;
};

type Attempt = 'recovered' | 'empty' | 'error' | 'mismatch' | 'stopped';

function bigintToString(_: string, value: unknown): unknown {
  return typeof value === 'bigint' ? String(value) : value;
}

/**
 * The child pubs in the shape `includePubsFor` writes today. They come from the
 * unsigned key params, so each coin gets the pub format its form takes. MPC
 * params carry only the common keychain, so they add nothing.
 */
function childPubsFields(keyParams: SafeRecoverKeyParams) {
  if (!('userKey' in keyParams && 'backupKey' in keyParams)) return {};
  const { userKey, backupKey, bitgoKey } = keyParams;
  return {
    xpubsWithDerivationPath: {
      user: { xpub: userKey },
      backup: { xpub: backupKey },
      bitgo: { xpub: bitgoKey },
    },
    pubs: [userKey, backupKey, bitgoKey],
  };
}

/**
 * Recovers every wallet of a Safe through the coin's existing `recover()`.
 * Coin-agnostic: derivation, key formatting and the empty / key-mismatch
 * signals all come from the SDK. Roots and child keys never leave this call.
 */
export async function recoverSafe(
  sdk: BitGoBase,
  coin: RecoveryCoin,
  req: SafeRecoveryRequest,
  deps: SafeRecoveryDeps
): Promise<SafeRecoveryResult[]> {
  // Fails before any chain call when the password is wrong.
  const roots = await decryptSafeKeycard({
    bitgo: sdk,
    userKeyBox: req.keycard.boxA,
    backupKeyBox: req.keycard.boxB,
    bitgoKeyBox: req.keycard.boxC,
    password: req.password,
  });
  const slots = safeSlotsForCoin(req.derivationCoin);
  assert(slots.length > 0, `${req.derivationCoin} has no Safe slots`);

  const results: SafeRecoveryResult[] = [];
  let recoveredCount = 0;
  let halted = false;

  const record = (result: SafeWalletResult) => {
    results.push(result);
    const { slot, account, address, status } = result;
    deps.onProgress({ slot, account, address, status });
  };

  const stopReason = (account: number): string | undefined => {
    if (deps.signal.aborted) return 'Cancelled';
    if (req.perWallet && recoveredCount >= req.perWallet.values.length) {
      return `Out of ${req.perWallet.param} values at account ${account}; rerun from account ${account} with more values`;
    }
    return undefined;
  };

  const writeResultFile = async (
    slot: SafeSlot,
    account: number,
    tx: unknown,
    keyParams: SafeRecoverKeyParams
  ): Promise<string> => {
    const file = path.join(
      req.output.dir,
      `${req.output.filePrefix}-safe-${slot}-${account}-${Date.now()}.json`
    );
    // Signed key params hold encrypted prvs: only unsigned pubs are written.
    const content =
      req.output.includePubs &&
      req.mode === 'unsigned' &&
      typeof tx === 'object' &&
      tx !== null
        ? { ...tx, ...childPubsFields(keyParams) }
        : tx;
    await deps.writeFile(
      file,
      JSON.stringify(
        content,
        req.output.bigintSafe ? bigintToString : undefined,
        2
      )
    );
    return file;
  };

  // One derive -> format keys -> recover() round for a (slot, account).
  const attempt = async (
    slot: SafeSlot,
    account: number,
    address?: string
  ): Promise<Attempt> => {
    const reason = stopReason(account);
    if (reason) {
      halted = true;
      record({ slot, account, address, status: 'stopped', error: reason });
      return 'stopped';
    }

    let derived: DerivedSafeWalletKeys | undefined;
    let keyParams: SafeRecoverKeyParams | undefined;
    let tx: unknown;
    try {
      derived = await deriveSafeWalletKeys({
        coin: req.derivationCoin,
        slot,
        account,
        roots,
      });
      keyParams = await buildSafeRecoverKeyParams({
        bitgo: sdk,
        coin: req.derivationCoin,
        mode: req.mode,
        ...derived,
      });
      tx = await coin.recover({
        ...req.baseParams,
        ...(req.perWallet
          ? { [req.perWallet.param]: req.perWallet.values[recoveredCount] }
          : {}),
        ...(req.locator && address !== undefined
          ? { [req.locator.field]: address }
          : {}),
        ...keyParams,
      });
    } catch (e) {
      const derivedPath = derived?.path;
      if (e instanceof RecoveryKeyMismatchError && address !== undefined) {
        return 'mismatch';
      }
      if (e instanceof ErrorNoInputToRecover) {
        record({ slot, account, path: derivedPath, address, status: 'empty' });
        return 'empty';
      }
      const error = e instanceof Error ? e.message : String(e);
      record({
        slot,
        account,
        path: derivedPath,
        address,
        status: 'error',
        error,
      });
      return 'error';
    }

    // Outside the try: a failed write must abort the run, not become an 'error' row.
    const file = await writeResultFile(slot, account, tx, keyParams);
    recoveredCount++;
    record({
      slot,
      account,
      path: derived.path,
      address,
      status: 'recovered',
      file,
    });
    return 'recovered';
  };

  const scanAccounts = async (slot: SafeSlot) => {
    let gap = 0;
    for (let account = req.startAccount; gap < req.gap && !halted; account++) {
      gap = (await attempt(slot, account)) === 'recovered' ? 0 : gap + 1;
    }
  };

  if (req.locator) {
    const { addresses } = req.locator;
    const windowEnd = req.startAccount + addresses.length + req.gap;
    const matched = new Set<string>();

    // true once the address is settled: recovered, empty, errored or the run stopped.
    const scanAddress = async (address: string): Promise<boolean> => {
      for (const slot of slots) {
        for (let account = req.startAccount; account < windowEnd; account++) {
          const taken = `${slot}/${account}`;
          if (matched.has(taken)) continue;
          const outcome = await attempt(slot, account, address);
          if (outcome === 'mismatch') continue;
          if (outcome === 'recovered') matched.add(taken);
          return true;
        }
      }
      return false;
    };

    for (const address of addresses) {
      if (halted) {
        results.push({
          status: 'stopped',
          address,
          error: 'Not searched: the run stopped before this address',
        });
      } else if (!(await scanAddress(address))) {
        results.push({
          status: 'no-match',
          address,
          error: `No key in accounts ${req.startAccount}-${windowEnd - 1} controls this address`,
        });
      }
    }
  } else {
    for (const slot of slots) {
      if (halted) break;
      await scanAccounts(slot);
    }
  }

  // Holds the audit trail and no key material. Also written on cancel.
  await deps.writeFile(
    path.join(
      req.output.dir,
      `${coin.getChain()}-safe-recovery-summary-${Date.now()}.json`
    ),
    JSON.stringify(
      {
        chain: coin.getChain(),
        mode: req.mode,
        startAccount: req.startAccount,
        gap: req.gap,
        results,
      },
      null,
      2
    )
  );
  return results;
}
