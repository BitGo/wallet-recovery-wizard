import assert from 'node:assert';
import path from 'node:path';
import {
  buildSafeRecoverKeyParams,
  decryptSafeKeycard,
  deriveSafeWalletKeys,
  ErrorNoInputToRecover,
  parseSafeKeycardBox,
  RecoveryKeyMismatchError,
  safeSlotsForCoin,
} from '@bitgo/sdk-core';
import type {
  BitGoBase,
  DecryptedSafeRoots,
  DerivedSafeWalletKeys,
  SafeRecoverKeyParams,
} from '@bitgo/sdk-core';
import type { RootKeyType } from '@bitgo/public-types';
import type {
  SafeDiscoveryRequest,
  SafeDiscoveryRow,
  SafeRecoverOneRequest,
  SafeRecoveryProgress,
  SafeRecoveryRequest,
  SafeRecoveryResult,
  SafeKeycardBoxes,
  SafeWalletRequest,
  SafeWalletResult,
} from './safeRecovery';
import { SAFE_WALLET_GAP } from './safeRecovery';
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

// The child pubs `includePubsFor` writes; MPC key params carry none.
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
 * Whether any box is a Safe keycard box. Any, not all: a Safe keycard with a
 * torn box must reach the Safe flow and fail there, not fall back silently to
 * the standard one.
 */
export function isSafeKeycard(boxes: SafeKeycardBoxes): boolean {
  return Object.values(boxes).some(box => {
    try {
      parseSafeKeycardBox(box);
      return true;
    } catch {
      return false;
    }
  });
}

type Roots = DecryptedSafeRoots;

type WalletProbe =
  | {
      status: 'ok';
      tx: unknown;
      derived: DerivedSafeWalletKeys;
      keyParams: SafeRecoverKeyParams;
    }
  | { status: 'failed'; path?: string; cause: Error };

const decryptRoots = (sdk: BitGoBase, req: SafeWalletRequest) =>
  decryptSafeKeycard({
    bitgo: sdk,
    userKeyBox: req.keycard.boxA,
    backupKeyBox: req.keycard.boxB,
    bitgoKeyBox: req.keycard.boxC,
    password: req.password,
  });

function slotsFor(derivationCoin: string): RootKeyType[] {
  const slots = safeSlotsForCoin(derivationCoin);
  assert(slots.length > 0, `${derivationCoin} has no Safe slots`);
  return slots;
}

// One derive -> format keys -> recover() round. Never throws: the caller
// classifies the failure.
async function probeWallet(
  sdk: BitGoBase,
  coin: RecoveryCoin,
  req: SafeWalletRequest,
  roots: Roots,
  slot: RootKeyType,
  account: number,
  extraParams: Record<string, unknown> = {}
): Promise<WalletProbe> {
  let derived: DerivedSafeWalletKeys | undefined;
  try {
    derived = await deriveSafeWalletKeys({
      coin: req.derivationCoin,
      slot,
      account,
      roots,
    });
    const keyParams = await buildSafeRecoverKeyParams({
      bitgo: sdk,
      coin: req.derivationCoin,
      mode: req.mode,
      ...derived,
    });
    const tx = await coin.recover({
      ...req.baseParams,
      ...extraParams,
      ...keyParams,
    });
    return { status: 'ok', tx, derived, keyParams };
  } catch (e) {
    const cause = e instanceof Error ? e : new Error(String(e));
    return { status: 'failed', path: derived?.path, cause };
  }
}

// Walks accounts from `startAccount` until `gap` in a row have no funds.
async function walkAccounts(
  startAccount: number,
  gap: number,
  shouldStop: () => boolean,
  isFunded: (account: number) => Promise<boolean>
) {
  let misses = 0;
  for (let account = startAccount; misses < gap && !shouldStop(); account++) {
    misses = (await isFunded(account)) ? 0 : misses + 1;
  }
}

function discoveryRow(
  slot: RootKeyType,
  account: number,
  probe: WalletProbe
): SafeDiscoveryRow {
  if (probe.status === 'ok') {
    return { slot, account, path: probe.derived.path, status: 'funded' };
  }
  const { path, cause } = probe;
  return cause instanceof ErrorNoInputToRecover
    ? { slot, account, path, status: 'empty' }
    : { slot, account, path, status: 'error', error: cause.message };
}

/** Recovers every wallet of a Safe through the coin's existing `recover()`. */
export async function recoverSafe(
  sdk: BitGoBase,
  coin: RecoveryCoin,
  req: SafeRecoveryRequest,
  deps: SafeRecoveryDeps
): Promise<SafeRecoveryResult[]> {
  const roots = await decryptRoots(sdk, req);
  const slots = slotsFor(req.derivationCoin);

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
    slot: RootKeyType,
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

  const attempt = async (
    slot: RootKeyType,
    account: number,
    address?: string
  ): Promise<Attempt> => {
    const reason = stopReason(account);
    if (reason) {
      halted = true;
      record({ slot, account, address, status: 'stopped', error: reason });
      return 'stopped';
    }

    const probe = await probeWallet(sdk, coin, req, roots, slot, account, {
      ...(req.perWallet
        ? { [req.perWallet.param]: req.perWallet.values[recoveredCount] }
        : {}),
      ...(req.locator && address !== undefined
        ? { [req.locator.field]: address }
        : {}),
    });
    if (probe.status === 'failed') {
      const { cause, path: derivedPath } = probe;
      if (cause instanceof RecoveryKeyMismatchError && address !== undefined) {
        return 'mismatch';
      }
      if (cause instanceof ErrorNoInputToRecover) {
        record({ slot, account, path: derivedPath, address, status: 'empty' });
        return 'empty';
      }
      record({
        slot,
        account,
        path: derivedPath,
        address,
        status: 'error',
        error: cause.message,
      });
      return 'error';
    }

    // probeWallet never throws, so a failed write aborts the run instead of
    // becoming an 'error' row.
    const file = await writeResultFile(
      slot,
      account,
      probe.tx,
      probe.keyParams
    );
    recoveredCount++;
    record({
      slot,
      account,
      path: probe.derived.path,
      address,
      status: 'recovered',
      file,
    });
    return 'recovered';
  };

  const scanAccounts = (slot: RootKeyType) =>
    walkAccounts(
      req.startAccount,
      req.gap,
      () => halted,
      async account => (await attempt(slot, account)) === 'recovered'
    );

  if (req.locator) {
    const { addresses } = req.locator;
    const windowEnd = req.startAccount + addresses.length + req.gap;
    const matched = new Set<string>();

    // true once the address is settled: recovered, empty, errored or stopped.
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

  // No key material in the summary; also written on cancel.
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

/**
 * Lists a Safe's wallets with funds. Writes nothing and returns no tx or key
 * material: the screen only shows the rows, then recovers one wallet.
 */
export async function discoverSafeWallets(
  sdk: BitGoBase,
  coin: RecoveryCoin,
  req: SafeDiscoveryRequest,
  deps: Pick<SafeRecoveryDeps, 'onProgress' | 'signal'>
): Promise<SafeDiscoveryRow[]> {
  const roots = await decryptRoots(sdk, req);
  const rows: SafeDiscoveryRow[] = [];

  for (const slot of slotsFor(req.derivationCoin)) {
    await walkAccounts(
      req.startAccount,
      SAFE_WALLET_GAP,
      () => deps.signal.aborted,
      async account => {
        const row = discoveryRow(
          slot,
          account,
          await probeWallet(sdk, coin, req, roots, slot, account)
        );
        rows.push(row);
        deps.onProgress(row);
        return row.status === 'funded';
      }
    );
  }
  return rows;
}

/** Returns the coin's `recover()` result for one wallet of a Safe. */
export async function recoverSafeWallet(
  sdk: BitGoBase,
  coin: RecoveryCoin,
  req: SafeRecoverOneRequest
): Promise<unknown> {
  const { slot, account } = req.target;
  assert(
    slotsFor(req.derivationCoin).includes(slot),
    `${slot} is not a Safe slot for ${req.derivationCoin}`
  );
  const roots = await decryptRoots(sdk, req);

  const probe = await probeWallet(sdk, coin, req, roots, slot, account);
  if (probe.status === 'ok') return probe.tx;
  if (probe.cause instanceof ErrorNoInputToRecover) {
    throw new Error('Nothing to recover at this wallet');
  }
  throw probe.cause;
}
