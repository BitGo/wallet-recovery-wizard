// @vitest-environment node
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/require-await, @typescript-eslint/unbound-method */
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { createEcxCoin } from './ecx';
import { BitGoAPI } from '@bitgo/sdk-api';
import { Btc } from '@bitgo/sdk-coin-btc';
import { BIP32, fixedScriptWallet, Transaction } from '@bitgo/wasm-utxo';
import type { RecoveryProvider, RecoverParams } from '@bitgo/abstract-utxo';

const { RootWalletKeys, ChainCode, address } = fixedScriptWallet;

const KEYCHAINS = [
  {
    pub: 'xpub661MyMwAqRbcGiQhVk1J7cD1YodF9tc5Y1B8vpTjjB1pcB1J1m1QX8fMtYP2sYqFmW6J2ra69tNoARKjvTGo9cGUrbPbJdjwrSzGGzPzWWS',
    prv: 'xprv9s21ZrQH143K4ELEPiUHkUGGzmnkkRtEAnFY8S48AqUqjNg9UDh9yLLt3FcfATyCjbsMB9JCGHAD8MeBTAK1P7trFppkoswu5ZAsHYASfbk',
  },
  {
    pub: 'xpub661MyMwAqRbcFzLXuganogQvd7MrefQQqCcJP2ZDumnCdQecf5cw1P1nD5qBz8SNS1yCLSC9VqpNUWnQU3V6qmnPt2r21oXhicQFzPA6Lby',
    prv: 'xprv9s21ZrQH143K3WG4of3nSYUC55XNFCgZTyghae9cMSFDkcKU7YJgTahJMpdTY9CjCcjgSo2TJ635uUVx176BufUMBFpieKYVJD9J3VvrGRm',
  },
  {
    pub: 'xpub661MyMwAqRbcFHpwWrzPB61U2CgBmdD21WNVM1JKUn9rEExkoGE4yafUVFbPSd78vdX8tWcEUQWaALFkU9fUbUM4Cc49DKEJSCYGRnbzCym',
    prv: 'xprv9s21ZrQH143K2okUQqTNox4jUAqhNAVAeHStYcthvScsMSdcFiupRnLzdxzfJithak5Zs92FQJeeJ9Jiya63KfUNxawuMZDCp2cGT9cdMKs',
  },
];

const ECX_REPLAY_LOCK_TIME = 499_999_999;
const RECOVERY_DESTINATION = 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4';
const COIN_NAME = 'btc';
const UNSPENT_VALUE = 100_000_000;

type WasmWalletKeys = ReturnType<typeof buildWalletKeys>;

function buildWalletKeys() {
  const xpubs = KEYCHAINS.map(k => BIP32.from(k.pub));
  return RootWalletKeys.from({
    triple: xpubs,
    derivationPrefixes: ['m/0/0', 'm/0/0', 'm/0/0'],
  });
}

function deriveP2wshAddress(walletKeys: WasmWalletKeys): string {
  const chain = ChainCode.value('p2wsh', 'external');
  return address(walletKeys, chain, 0, COIN_NAME);
}

function createMockRecoveryProvider(unspentAddress: string): RecoveryProvider {
  const unspent = {
    id: 'ab'.repeat(32) + ':0',
    address: unspentAddress,
    value: UNSPENT_VALUE,
  };

  return {
    async getAddressInfo(a: string) {
      if (a === unspentAddress) return { txCount: 1, balance: UNSPENT_VALUE };
      return { txCount: 0, balance: 0 };
    },
    async getUnspentsForAddresses(addresses: string[]) {
      return [unspent].filter(u => addresses.includes(u.address));
    },
    async getTransactionHex(): Promise<string> {
      throw new Error('not needed for segwit inputs');
    },
    async getTransactionIO() {
      throw new Error('not implemented');
    },
  };
}

function buildRecoverParams(
  walletKeys: WasmWalletKeys,
  lockTime: number
): RecoverParams {
  const addr = deriveP2wshAddress(walletKeys);
  return {
    userKey: KEYCHAINS[0].prv,
    backupKey: KEYCHAINS[1].prv,
    bitgoKey: KEYCHAINS[2].pub,
    recoveryDestination: RECOVERY_DESTINATION,
    recoveryProvider: createMockRecoveryProvider(addr),
    feeRate: 100,
    scan: 1,
    ignoreAddressTypes: ['p2sh', 'p2shP2wsh', 'p2trLegacy', 'p2trMusig2'],
    lockTime,
  };
}

function extractTxHex(result: Record<string, unknown>): string {
  return (result.transactionHex ?? result.txHex) as string;
}

describe('createEcxCoin', () => {
  it('sets lockTime = 499_999_999 in recover params', async () => {
    const mockRecover = vi.fn().mockResolvedValue({});
    const mockBaseCoin = {
      deriveKeyWithSeed: vi.fn(),
      getChain: vi.fn().mockReturnValue('btc'),
      recover: mockRecover,
    };
    const mockSdk = {
      coin: vi.fn().mockReturnValue(mockBaseCoin),
      getEnv: vi.fn().mockReturnValue('prod'),
    };

    const ecxCoin = createEcxCoin(mockSdk as any, 'tecx');

    await ecxCoin.recover({
      userKey: 'xpub-user',
      backupKey: 'xpub-backup',
      bitgoKey: 'xpub-bitgo',
      recoveryDestination: 'ecx-addr',
    });

    expect(mockRecover).toHaveBeenCalledTimes(1);
    const recoverParams = mockRecover.mock.calls[0][0] as Record<
      string,
      unknown
    >;
    expect(recoverParams.lockTime).toBe(ECX_REPLAY_LOCK_TIME);
  });

  it.each(['ecx', 'tecx'] as const)('uses %s as the chain', chain => {
    const mockSdk = { coin: vi.fn(), getEnv: vi.fn() };

    expect(createEcxCoin(mockSdk as any, chain).getChain()).toBe(chain);
  });
});

describe('SDK recover() lockTime sensitivity', () => {
  let coin: any;
  let walletKeys: WasmWalletKeys;

  beforeAll(() => {
    const sdk = new BitGoAPI({ env: 'test' });
    sdk.register('btc', Btc.createInstance);
    coin = sdk.coin('btc');
    walletKeys = buildWalletKeys();
  });

  it('encodes lockTime=499_999_999 in the recovered transaction', async () => {
    const result = (await coin.recover(
      buildRecoverParams(walletKeys, ECX_REPLAY_LOCK_TIME)
    )) as Record<string, unknown>;
    const hex = extractTxHex(result);
    const tx = Transaction.fromBytes(Buffer.from(hex, 'hex'), COIN_NAME);
    expect(tx.lockTime()).toBe(ECX_REPLAY_LOCK_TIME);
  });

  it('encodes lockTime=0 when lockTime is set to 0', async () => {
    const result = (await coin.recover(
      buildRecoverParams(walletKeys, 0)
    )) as Record<string, unknown>;
    const hex = extractTxHex(result);
    const tx = Transaction.fromBytes(Buffer.from(hex, 'hex'), COIN_NAME);
    expect(tx.lockTime()).toBe(0);
  });

  it('produces different transactions for different lockTime values', async () => {
    const resultWithLock = (await coin.recover(
      buildRecoverParams(walletKeys, ECX_REPLAY_LOCK_TIME)
    )) as Record<string, unknown>;
    const resultWithoutLock = (await coin.recover(
      buildRecoverParams(walletKeys, 0)
    )) as Record<string, unknown>;

    const hexWithLock = extractTxHex(resultWithLock);
    const hexWithoutLock = extractTxHex(resultWithoutLock);

    expect(hexWithLock).not.toBe(hexWithoutLock);
  });
});
