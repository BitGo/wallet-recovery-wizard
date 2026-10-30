// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BitGoAPI } from '@bitgo/sdk-api';
import {
  buildSafeRecoverKeyParams,
  decryptSafeKeycard,
  deriveSafeWalletKeys,
  ErrorNoInputToRecover,
  IncorrectPasswordError,
  RecoveryKeyMismatchError,
  safeSlotsForCoin,
} from '@bitgo/sdk-core';
import type * as SdkCore from '@bitgo/sdk-core';
import type {
  DecryptedSafeRoots,
  DerivedSafeWalletKeys,
} from '@bitgo/sdk-core';
import type { RecoveryCoin } from '../recoveryCoin';
import type {
  SafeRecoveryProgress,
  SafeRecoveryRequest,
  SafeSlot,
} from '../../src/utils/safeRecovery';
import { recoverSafe } from './recoverSafe';

vi.mock('@bitgo/sdk-core', async () => ({
  ...(await vi.importActual<typeof SdkCore>('@bitgo/sdk-core')),
  decryptSafeKeycard: vi.fn(),
  safeSlotsForCoin: vi.fn(),
  deriveSafeWalletKeys: vi.fn(),
  buildSafeRecoverKeyParams: vi.fn(),
}));

const SECRET = 'SECRET-CHILD-PRV';
const SLOT_1 = 'secp256k1Multisig';
const SLOT_3 = 'ecdsaMpc';
const sdk = new BitGoAPI({ env: 'test' });

const mpcRoot = {
  user: { signing: Buffer.alloc(0), vrf: Buffer.alloc(0) },
  backup: { signing: Buffer.alloc(0), vrf: Buffer.alloc(0) },
  bitgo: 'bitgo-root',
};
const roots: DecryptedSafeRoots = {
  secp256k1Multisig: { user: 'u', backup: 'b', bitgo: 'g' },
  ed25519Multisig: {
    user: 'u',
    backup: { prv: 'p', chainCode: 'c' },
    bitgo: 'g',
  },
  ecdsaMpc: mpcRoot,
  eddsaMpc: mpcRoot,
};

function derived(slot: SafeSlot, account: number): DerivedSafeWalletKeys {
  const path = `m/44'/0'/${slot === SLOT_1 ? 1 : 3}'/${account}'`;
  if (slot === SLOT_1) {
    return {
      slot,
      path,
      keys: {
        user: { prv: SECRET, pub: `user-pub-${account}` },
        backup: { prv: SECRET, pub: `backup-pub-${account}` },
        bitgo: { pub: `bitgo-pub-${account}` },
      },
    };
  }
  return {
    slot: SLOT_3,
    path,
    keys: { commonKeychain: `ck-${account}`, user: SECRET, backup: SECRET },
  };
}

// Identifies the child in the key params the mocked SDK hands to recover().
const childTag = (keys: DerivedSafeWalletKeys['keys']): string =>
  'commonKeychain' in keys ? keys.commonKeychain : keys.user.pub;

type Recover = (params: Record<string, unknown>) => Promise<unknown>;

function fakeCoin(recover: Recover) {
  const recoverSpy = vi.fn(recover);
  const coin: RecoveryCoin = {
    deriveKeyWithSeed: () => ({ key: '', derivationPath: '' }),
    getChain: () => 'tbtc',
    recover: params => recoverSpy(params as Record<string, unknown>),
    broadcast: () => Promise.resolve(''),
  };
  return { coin, recoverSpy };
}

// The account a recover() call was made for, read back from the key params.
const text = (value: unknown): string =>
  typeof value === 'string' ? value : '';
const accountOf = (params: Record<string, unknown>): number =>
  Number(text(params.userKey).split('-').pop());

// recover() succeeds at the given accounts and reports an empty wallet elsewhere.
const fundedAt =
  (...accounts: number[]): Recover =>
  params =>
    accounts.includes(accountOf(params))
      ? Promise.resolve({ txHex: `tx-${accountOf(params)}` })
      : Promise.reject(new ErrorNoInputToRecover());

const baseRequest: SafeRecoveryRequest = {
  derivationCoin: 'tbtc',
  recoverCoin: 'tbtc',
  mode: 'signed',
  baseParams: { recoveryDestination: 'dest', scan: 20 },
  keycard: { boxA: 'a', boxB: 'b', boxC: 'c' },
  password: 'pw',
  startAccount: 0,
  gap: 5,
  output: {
    dir: '/out',
    filePrefix: 'tbtc',
    bigintSafe: false,
    includePubs: false,
  },
};

function run(
  recover: Recover,
  overrides: Partial<SafeRecoveryRequest> = {},
  signal: AbortSignal = new AbortController().signal
) {
  const { coin, recoverSpy } = fakeCoin(recover);
  const files: Record<string, string> = {};
  const progress: SafeRecoveryProgress[] = [];
  const writeFile = vi.fn((file: string, data: string) => {
    files[file] = data;
    return Promise.resolve();
  });
  const done = recoverSafe(
    sdk,
    coin,
    { ...baseRequest, ...overrides },
    { writeFile, onProgress: p => progress.push(p), signal }
  );
  const probedAccounts = () => recoverSpy.mock.calls.map(([p]) => accountOf(p));
  const summary = () => {
    const name = Object.keys(files).find(file => file.includes('summary'));
    return name
      ? (JSON.parse(files[name]) as Record<string, unknown>)
      : undefined;
  };
  return {
    done,
    recoverSpy,
    files,
    progress,
    writeFile,
    probedAccounts,
    summary,
  };
}

beforeEach(() => {
  vi.mocked(decryptSafeKeycard).mockReset().mockResolvedValue(roots);
  vi.mocked(safeSlotsForCoin).mockReset().mockReturnValue([SLOT_1]);
  vi.mocked(deriveSafeWalletKeys)
    .mockReset()
    .mockImplementation(({ slot, account }) =>
      Promise.resolve(derived(slot, account))
    );
  vi.mocked(buildSafeRecoverKeyParams)
    .mockReset()
    .mockImplementation(({ keys }) =>
      Promise.resolve({
        slot: SLOT_1,
        userKey: `user-key-${childTag(keys)}`,
        backupKey: 'backup-key',
        bitgoKey: 'bitgo-key',
        walletPassphrase: 'ephemeral',
      })
    );
});

describe('account scan', () => {
  it('stops a slot after `gap` empty accounts in a row, and resets the gap on a recovery', async () => {
    const { done, probedAccounts, files } = run(fundedAt(0, 2, 7));
    const results = await done;

    expect(probedAccounts()).toEqual([
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    ]);
    expect(results.filter(r => r.status === 'recovered')).toHaveLength(3);
    expect(Object.keys(files).filter(f => !f.includes('summary'))).toHaveLength(
      3
    );
  });

  it('starts at startAccount', async () => {
    const { done, probedAccounts } = run(fundedAt(), {
      startAccount: 10,
      gap: 2,
    });
    await done;
    expect(probedAccounts()).toEqual([10, 11]);
  });

  it('keeps an independent gap counter per slot', async () => {
    vi.mocked(safeSlotsForCoin).mockReturnValue([SLOT_1, SLOT_3]);
    vi.mocked(buildSafeRecoverKeyParams).mockImplementation(({ slot, keys }) =>
      Promise.resolve({
        slot: SLOT_1,
        userKey: `${slot}-${childTag(keys)}`,
        backupKey: 'backup-key',
        bitgoKey: 'bitgo-key',
      })
    );
    vi.mocked(deriveSafeWalletKeys).mockImplementation(({ slot, account }) =>
      Promise.resolve(derived(slot, account))
    );
    const { done, recoverSpy } = run(params => {
      const [slot] = text(params.userKey).split('-');
      const account = accountOf(params);
      return (slot === SLOT_1 && account === 1) ||
        (slot === SLOT_3 && account === 3)
        ? Promise.resolve({ txHex: 'tx' })
        : Promise.reject(new ErrorNoInputToRecover());
    });
    const results = await done;

    const probesFor = (slot: SafeSlot) =>
      recoverSpy.mock.calls.filter(([p]) => text(p.userKey).startsWith(slot))
        .length;
    // slot 1: 0..6 (found at 1, then 5 empties); slot 3: 0..8 (found at 3, then 5 empties)
    expect(probesFor(SLOT_1)).toBe(7);
    expect(probesFor(SLOT_3)).toBe(9);
    expect(
      results.flatMap(r =>
        r.status === 'recovered' ? [r.slot, r.account] : []
      )
    ).toEqual([SLOT_1, 1, SLOT_3, 3]);
  });

  it('records an error row with its account and counts it toward the gap', async () => {
    const { done, probedAccounts } = run(params =>
      accountOf(params) === 0
        ? Promise.resolve({ txHex: 'tx' })
        : accountOf(params) === 4
          ? Promise.reject(new Error('explorer timeout'))
          : Promise.reject(new ErrorNoInputToRecover())
    );
    const results = await done;

    // 0 recovered, then 1-5 are the five misses (account 4 is an error)
    expect(probedAccounts()).toEqual([0, 1, 2, 3, 4, 5]);
    expect(results.find(r => r.status === 'error')).toMatchObject({
      account: 4,
      error: 'explorer timeout',
    });
  });

  it('fails before the first recover() when the password is wrong', async () => {
    vi.mocked(decryptSafeKeycard).mockRejectedValue(
      new IncorrectPasswordError('bad password')
    );
    const { done, recoverSpy, writeFile } = run(fundedAt(0));

    await expect(done).rejects.toBeInstanceOf(IncorrectPasswordError);
    expect(recoverSpy).not.toHaveBeenCalled();
    expect(writeFile).not.toHaveBeenCalled();
  });

  it('fails when the coin has no Safe slots', async () => {
    vi.mocked(safeSlotsForCoin).mockReturnValue([]);
    const { done, recoverSpy } = run(fundedAt(0));

    await expect(done).rejects.toThrow('has no Safe slots');
    expect(recoverSpy).not.toHaveBeenCalled();
  });

  it('derives with derivationCoin and recovers with the coin it was given', async () => {
    const { done } = run(fundedAt(0), { derivationCoin: 'tbtc4' });
    await done;
    expect(vi.mocked(safeSlotsForCoin)).toHaveBeenCalledWith('tbtc4');
    expect(vi.mocked(deriveSafeWalletKeys)).toHaveBeenCalledWith(
      expect.objectContaining({ coin: 'tbtc4', roots })
    );
    expect(vi.mocked(buildSafeRecoverKeyParams)).toHaveBeenCalledWith(
      expect.objectContaining({ coin: 'tbtc4', mode: 'signed' })
    );
  });
});

describe('recover() params', () => {
  it('is baseParams + perWallet value + locator + the key params, key params last', async () => {
    const { done, recoverSpy } = run(fundedAt(0), {
      baseParams: { recoveryDestination: 'dest', userKey: 'form-key' },
      locator: { field: 'rootAddress', addresses: ['rA'] },
      perWallet: { param: 'durableNonce', values: ['n1'] },
    });
    await done;

    expect(recoverSpy.mock.calls[0][0]).toEqual({
      recoveryDestination: 'dest',
      durableNonce: 'n1',
      rootAddress: 'rA',
      slot: SLOT_1,
      userKey: 'user-key-user-pub-0',
      backupKey: 'backup-key',
      bitgoKey: 'bitgo-key',
      walletPassphrase: 'ephemeral',
    });
  });
});

describe('per-address scan', () => {
  // address -> the account whose keys control it
  const owners: Record<string, number> = { A: 0, B: 3 };
  const ownedBy = (): Recover => params =>
    owners[text(params.rootAddress)] === accountOf(params)
      ? Promise.resolve({ txHex: `tx-${text(params.rootAddress)}` })
      : Promise.reject(new RecoveryKeyMismatchError());
  const accountsAndAddresses = (
    recoverSpy: ReturnType<typeof run>['recoverSpy']
  ) =>
    recoverSpy.mock.calls.map(([p]) => [p.rootAddress, accountOf(p)] as const);

  it('matches addresses [B, A] to accounts [3, 0], moving on after a key mismatch', async () => {
    const { done, recoverSpy } = run(ownedBy(), {
      locator: { field: 'rootAddress', addresses: ['B', 'A'] },
    });
    const results = await done;

    expect(accountsAndAddresses(recoverSpy)).toEqual([
      ['B', 0],
      ['B', 1],
      ['B', 2],
      ['B', 3],
      ['A', 0],
    ]);
    expect(
      results.map(r => [r.status, 'address' in r ? r.address : undefined])
    ).toEqual([
      ['recovered', 'B'],
      ['recovered', 'A'],
    ]);
  });

  it('does not probe an account that already matched another address', async () => {
    const { done, recoverSpy } = run(ownedBy(), {
      locator: { field: 'rootAddress', addresses: ['A', 'B'] },
    });
    await done;

    expect(accountsAndAddresses(recoverSpy)).toEqual([
      ['A', 0],
      ['B', 1],
      ['B', 2],
      ['B', 3],
    ]);
  });

  it('reports no-match with the searched window for an address no key controls', async () => {
    const { done, probedAccounts } = run(ownedBy(), {
      locator: { field: 'rootAddress', addresses: ['unknown'] },
    });
    const results = await done;

    // window = [0, 0 + 1 address + 5 gap)
    expect(probedAccounts()).toEqual([0, 1, 2, 3, 4, 5]);
    expect(results).toEqual([
      expect.objectContaining({
        status: 'no-match',
        address: 'unknown',
        error: expect.stringContaining('accounts 0-5') as string,
      }),
    ]);
  });

  it('treats an empty wallet as settled and tries no further accounts', async () => {
    const { done, probedAccounts } = run(fundedAt(), {
      locator: { field: 'walletContractAddress', addresses: ['w1'] },
    });
    const results = await done;

    expect(probedAccounts()).toEqual([0]);
    expect(results).toEqual([
      expect.objectContaining({ status: 'empty', account: 0, address: 'w1' }),
    ]);
  });

  it('records a provider error and moves to the next address', async () => {
    const { done, recoverSpy } = run(
      params =>
        params.rootAddress === 'bad'
          ? Promise.reject(new Error('rpc down'))
          : Promise.resolve({ txHex: 'tx' }),
      { locator: { field: 'rootAddress', addresses: ['bad', 'good'] } }
    );
    const results = await done;

    expect(recoverSpy).toHaveBeenCalledTimes(2);
    expect(results.map(r => r.status)).toEqual(['error', 'recovered']);
  });

  it('does not search a slot past an address already settled on an earlier slot', async () => {
    vi.mocked(safeSlotsForCoin).mockReturnValue([SLOT_1, SLOT_3]);
    const { done, recoverSpy } = run(() => Promise.resolve({ txHex: 'tx' }), {
      locator: { field: 'rootAddress', addresses: ['A'] },
    });
    await done;
    expect(recoverSpy).toHaveBeenCalledTimes(1);
  });
});

describe('perWallet values', () => {
  it('gives each recovered wallet the next value and stops with `stopped` when they run out', async () => {
    const { done, recoverSpy, probedAccounts } = run(fundedAt(0, 3, 5), {
      perWallet: { param: 'durableNonce', values: ['n1', 'n2'] },
    });
    const results = await done;

    // n1 for the wallet at 0; the empty probes at 1-2 and the wallet at 3 share n2
    expect(recoverSpy.mock.calls.map(([p]) => p.durableNonce)).toEqual([
      'n1',
      'n2',
      'n2',
      'n2',
    ]);
    expect(probedAccounts()).toEqual([0, 1, 2, 3]);
    expect(results.map(r => r.status)).toEqual([
      'recovered',
      'empty',
      'empty',
      'recovered',
      'stopped',
    ]);
    expect(results[results.length - 1]).toMatchObject({
      account: 4,
      error: expect.stringContaining('Out of durableNonce values') as string,
    });
  });

  it('never calls recover() when there are no values at all', async () => {
    const { done, recoverSpy } = run(fundedAt(0), {
      perWallet: { param: 'durableNonce', values: [] },
    });
    const results = await done;

    expect(recoverSpy).not.toHaveBeenCalled();
    expect(results.map(r => r.status)).toEqual(['stopped']);
  });
});

describe('cancel', () => {
  it('stops before the next recover(), keeps partial results and still writes the summary', async () => {
    const abort = new AbortController();
    const { done, probedAccounts, files, summary } = run(
      params => {
        if (accountOf(params) === 1) abort.abort();
        return fundedAt(0)(params);
      },
      {},
      abort.signal
    );
    const results = await done;

    expect(probedAccounts()).toEqual([0, 1]);
    expect(results.map(r => r.status)).toEqual([
      'recovered',
      'empty',
      'stopped',
    ]);
    expect(results[results.length - 1]).toMatchObject({
      account: 2,
      error: 'Cancelled',
    });
    expect(summary()?.results).toEqual(JSON.parse(JSON.stringify(results)));
    expect(
      Object.keys(files).some(f => f.includes('-safe-secp256k1Multisig-0-'))
    ).toBe(true);
  });

  it('does not probe at all when already cancelled, and does not scan other slots', async () => {
    vi.mocked(safeSlotsForCoin).mockReturnValue([SLOT_1, SLOT_3]);
    const abort = new AbortController();
    abort.abort();
    const { done, recoverSpy, summary } = run(fundedAt(0), {}, abort.signal);
    const results = await done;

    expect(recoverSpy).not.toHaveBeenCalled();
    expect(results).toHaveLength(1);
    expect(summary()).toBeDefined();
  });

  it('lists every address it did not get to, so a cancelled run is not mistaken for no-match', async () => {
    const abort = new AbortController();
    const { done, summary } = run(
      params => {
        abort.abort();
        return Promise.resolve({ txHex: `tx-${text(params.rootAddress)}` });
      },
      { locator: { field: 'rootAddress', addresses: ['A', 'B', 'C'] } },
      abort.signal
    );
    const results = await done;

    expect(
      results.map(r => [r.status, 'address' in r ? r.address : ''])
    ).toEqual([
      ['recovered', 'A'],
      ['stopped', 'B'],
      ['stopped', 'C'],
    ]);
    expect(summary()?.results).toEqual(JSON.parse(JSON.stringify(results)));
  });
});

describe('output', () => {
  it('writes one file per recovered wallet, named by slot and account, plus a summary', async () => {
    const { done, files } = run(fundedAt(0, 2), { gap: 2 });
    await done;

    const names = Object.keys(files);
    expect(
      names.filter(f =>
        /^\/out\/tbtc-safe-secp256k1Multisig-0-\d+\.json$/.test(f)
      )
    ).toHaveLength(1);
    expect(
      names.filter(f =>
        /^\/out\/tbtc-safe-secp256k1Multisig-2-\d+\.json$/.test(f)
      )
    ).toHaveLength(1);
    expect(
      names.filter(f => /^\/out\/tbtc-safe-recovery-summary-\d+\.json$/.test(f))
    ).toHaveLength(1);
  });

  describe('includePubs', () => {
    const recoveredFile = (written: Record<string, string>): unknown => {
      const name = Object.keys(written).find(f => f.includes('-safe-secp'));
      return name ? (JSON.parse(written[name]) as unknown) : undefined;
    };
    const withPubs = { ...baseRequest.output, includePubs: true };
    // Unsigned slot-2 key params: pubs in the coin's own format, not raw hex.
    const useUnsignedKeyParams = () =>
      vi.mocked(buildSafeRecoverKeyParams).mockImplementation(({ keys }) =>
        Promise.resolve({
          slot: 'ed25519Multisig',
          mode: 'unsigned',
          userKey: `user-addr-${childTag(keys).split('-').pop()}`,
          backupKey: 'backup-addr',
          bitgoKey: 'bitgo-addr',
        })
      );

    it('writes the unsigned key-param pubs in the coin format', async () => {
      useUnsignedKeyParams();
      const { done, files } = run(fundedAt(0), {
        gap: 1,
        mode: 'unsigned',
        output: withPubs,
      });
      await done;

      expect(recoveredFile(files)).toEqual({
        txHex: 'tx-0',
        xpubsWithDerivationPath: {
          user: { xpub: 'user-addr-0' },
          backup: { xpub: 'backup-addr' },
          bitgo: { xpub: 'bitgo-addr' },
        },
        pubs: ['user-addr-0', 'backup-addr', 'bitgo-addr'],
      });
    });

    it('writes the recover() result alone when includePubs is off', async () => {
      useUnsignedKeyParams();
      const { done, files } = run(fundedAt(0), { gap: 1, mode: 'unsigned' });
      await done;

      expect(recoveredFile(files)).toEqual({ txHex: 'tx-0' });
    });

    it('never writes pubs in signed mode, where the key params are encrypted prvs', async () => {
      const { done, files } = run(fundedAt(0), { gap: 1, output: withPubs });
      await done;

      expect(recoveredFile(files)).toEqual({ txHex: 'tx-0' });
    });

    it('adds nothing for MPC unsigned params, which carry only the common keychain', async () => {
      vi.mocked(buildSafeRecoverKeyParams).mockImplementation(({ keys }) =>
        Promise.resolve({
          slot: SLOT_3,
          mode: 'unsigned',
          bitgoKey: `ck-${childTag(keys).split('-').pop()}`,
          isTss: true,
          broadcast: false,
        })
      );
      const { done, files } = run(
        params =>
          params.bitgoKey === 'ck-0'
            ? Promise.resolve({ txHex: 'tx-0' })
            : Promise.reject(new ErrorNoInputToRecover()),
        { gap: 1, mode: 'unsigned', output: withPubs }
      );
      await done;

      expect(recoveredFile(files)).toEqual({ txHex: 'tx-0' });
    });
  });

  it('serializes bigint values only when bigintSafe is set', async () => {
    const recover: Recover = params =>
      accountOf(params) === 0
        ? Promise.resolve({ amount: BigInt(10) })
        : Promise.reject(new ErrorNoInputToRecover());
    const safe = run(recover, {
      gap: 1,
      output: { ...baseRequest.output, bigintSafe: true },
    });
    await safe.done;
    const name = Object.keys(safe.files).find(f => f.includes('-safe-secp'));
    expect(name && (JSON.parse(safe.files[name]) as unknown)).toEqual({
      amount: '10',
    });

    await expect(run(recover, { gap: 1 }).done).rejects.toThrow(/BigInt/);
  });

  it('aborts the run when a result file cannot be written instead of recording an error row', async () => {
    const { coin } = fakeCoin(fundedAt(0));
    const writeFile = vi.fn(() => Promise.reject(new Error('disk full')));

    await expect(
      recoverSafe(sdk, coin, baseRequest, {
        writeFile,
        onProgress: () => undefined,
        signal: new AbortController().signal,
      })
    ).rejects.toThrow('disk full');
  });

  it('reports progress for every attempt, without key material', async () => {
    const { done, progress } = run(fundedAt(0), { gap: 1 });
    await done;

    expect(progress).toEqual([
      { slot: SLOT_1, account: 0, address: undefined, status: 'recovered' },
      { slot: SLOT_1, account: 1, address: undefined, status: 'empty' },
    ]);
  });

  it('keeps key material out of the summary, results and progress', async () => {
    const { done, summary, progress } = run(fundedAt(0), { gap: 1 });
    const results = await done;

    for (const output of [summary(), results, progress]) {
      const text = JSON.stringify(output);
      expect(text).not.toContain(SECRET);
      expect(text).not.toContain('ephemeral');
      expect(text).not.toContain('pw');
    }
    expect(summary()).toMatchObject({
      chain: 'tbtc',
      mode: 'signed',
      startAccount: 0,
      gap: 1,
    });
  });
});
