import { describe, expect, it } from 'vitest';
import {
  MAX_SAFE_ACCOUNT,
  parseSafeDiscoveryRequest,
  parseSafeKeycardBoxes,
  parseSafeRecoverOneRequest,
  parseSafeRecoveryRequest,
} from './safeRecovery';

const valid = {
  derivationCoin: 'tbtc',
  recoverCoin: 'tbtc',
  mode: 'signed',
  baseParams: { recoveryDestination: 'dest' },
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

const accepts = (request: unknown): boolean => {
  try {
    parseSafeRecoveryRequest(request);
    return true;
  } catch {
    return false;
  }
};

describe('SafeRecoveryRequest', () => {
  it('accepts a minimal request, with or without locator and perWallet', () => {
    expect(accepts(valid)).toBe(true);
    expect(
      accepts({
        ...valid,
        locator: { field: 'rootAddress', addresses: ['rA'] },
        perWallet: { param: 'durableNonce', values: ['n1'] },
      })
    ).toBe(true);
  });

  it.each([
    ['gap below 1', { gap: 0 }, false],
    ['gap at the maximum', { gap: MAX_SAFE_ACCOUNT }, true],
    ['gap above the maximum', { gap: MAX_SAFE_ACCOUNT + 1 }, false],
    ['fractional gap', { gap: 2.5 }, false],
    ['negative startAccount', { startAccount: -1 }, false],
    [
      'startAccount at the hardened index ceiling',
      { startAccount: MAX_SAFE_ACCOUNT },
      true,
    ],
    [
      'startAccount past the hardened index ceiling',
      { startAccount: MAX_SAFE_ACCOUNT + 1 },
      false,
    ],
    ['NaN startAccount', { startAccount: NaN }, false],
    ['unknown mode', { mode: 'sign' }, false],
  ])('%s', (_name, override, expected) => {
    expect(accepts({ ...valid, ...override })).toBe(expected);
  });

  it.each([
    ['a path separator', '../evil'],
    ['an absolute path', '/etc/passwd'],
    ['a space', 'tbtc recovery'],
    ['empty', ''],
  ])('rejects a file prefix with %s', (_name, filePrefix) => {
    expect(accepts({ ...valid, output: { ...valid.output, filePrefix } })).toBe(
      false
    );
  });

  it.each([
    ['no addresses', [], false],
    ['duplicate addresses', ['rA', 'rA'], false],
  ])('locator with %s', (_name, addresses, expected) => {
    expect(
      accepts({ ...valid, locator: { field: 'rootAddress', addresses } })
    ).toBe(expected);
  });

  it('rejects a locator field the engine does not know', () => {
    expect(
      accepts({ ...valid, locator: { field: 'address', addresses: ['rA'] } })
    ).toBe(false);
  });

  it('rejects missing keycard boxes', () => {
    expect(accepts({ ...valid, keycard: { boxA: 'a', boxB: 'b' } })).toBe(
      false
    );
  });
});

describe('parseSafeRecoveryRequest', () => {
  it('returns the decoded request', () => {
    expect(parseSafeRecoveryRequest(valid).gap).toBe(5);
  });

  it('names the invalid fields and never echoes their values', () => {
    const secrets = { password: 12345678, keycard: { boxA: 'BOX-A-SECRET' } };
    let message = '';
    try {
      parseSafeRecoveryRequest({ ...valid, ...secrets, gap: 0 });
    } catch (e) {
      message = e instanceof Error ? e.message : '';
    }

    expect(message).toContain('password');
    expect(message).toContain('gap');
    expect(message).not.toContain('12345678');
    expect(message).not.toContain('BOX-A-SECRET');
  });
});

const { derivationCoin, recoverCoin, mode, baseParams, keycard, password } =
  valid;
const walletFields = {
  derivationCoin,
  recoverCoin,
  mode,
  baseParams,
  keycard,
  password,
};

describe('SafeDiscoveryRequest', () => {
  const discovery = { ...walletFields, startAccount: 0 };
  const accepts = (request: unknown): boolean => {
    try {
      parseSafeDiscoveryRequest(request);
      return true;
    } catch {
      return false;
    }
  };

  it('needs no gap or output: the gap is fixed and nothing is written', () => {
    expect(accepts(discovery)).toBe(true);
  });

  it('bounds startAccount', () => {
    expect(accepts({ ...discovery, startAccount: MAX_SAFE_ACCOUNT })).toBe(
      true
    );
    expect(accepts({ ...discovery, startAccount: MAX_SAFE_ACCOUNT + 1 })).toBe(
      false
    );
    expect(accepts({ ...discovery, startAccount: -1 })).toBe(false);
    expect(accepts({ ...discovery, startAccount: 1.5 })).toBe(false);
  });

  it('rejects missing keycard boxes', () => {
    expect(accepts({ ...discovery, keycard: { boxA: 'a', boxB: 'b' } })).toBe(
      false
    );
  });
});

describe('SafeRecoverOneRequest', () => {
  const recoverOne = {
    ...walletFields,
    target: { slot: 'secp256k1Multisig', account: 3 },
  };
  const accepts = (request: unknown): boolean => {
    try {
      parseSafeRecoverOneRequest(request);
      return true;
    } catch {
      return false;
    }
  };

  it('accepts a target slot and account', () => {
    expect(accepts(recoverOne)).toBe(true);
  });

  it('rejects an unknown slot', () => {
    expect(
      accepts({ ...recoverOne, target: { slot: 'btc', account: 3 } })
    ).toBe(false);
  });

  it('bounds the target account', () => {
    const target = (account: number) => ({ slot: 'ecdsaMpc', account });
    expect(accepts({ ...recoverOne, target: target(MAX_SAFE_ACCOUNT) })).toBe(
      true
    );
    expect(
      accepts({ ...recoverOne, target: target(MAX_SAFE_ACCOUNT + 1) })
    ).toBe(false);
    expect(accepts({ ...recoverOne, target: target(-1) })).toBe(false);
  });

  it('needs a target', () => {
    expect(accepts(walletFields)).toBe(false);
  });

  it('names the invalid fields and never echoes the password or keycard', () => {
    let message = '';
    try {
      parseSafeRecoverOneRequest({
        ...recoverOne,
        password: 12345678,
        keycard: { boxA: 'BOX-A-SECRET' },
      });
    } catch (e) {
      message = e instanceof Error ? e.message : '';
    }
    expect(message).toContain('password');
    expect(message).not.toContain('12345678');
    expect(message).not.toContain('BOX-A-SECRET');
  });
});

describe('parseSafeKeycardBoxes', () => {
  it('accepts any subset of the boxes', () => {
    expect(parseSafeKeycardBoxes({})).toEqual({});
    expect(parseSafeKeycardBoxes({ boxA: 'a', boxC: 'c' })).toEqual({
      boxA: 'a',
      boxC: 'c',
    });
  });

  it('rejects a box that is not a string', () => {
    expect(() => parseSafeKeycardBoxes({ boxA: 1 })).toThrow('boxA');
    expect(() => parseSafeKeycardBoxes('boxes')).toThrow(
      'Invalid Safe recovery request'
    );
  });
});
