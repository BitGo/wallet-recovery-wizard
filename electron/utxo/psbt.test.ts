// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { BitGoAPI } from '@bitgo/sdk-api';
import { Btc } from '@bitgo/sdk-coin-btc';
import { BIP32, Transaction, fixedScriptWallet } from '@bitgo/wasm-utxo';
import type { AbstractUtxoCoin } from '@bitgo/abstract-utxo';
import type { CoinConstructor } from '@bitgo/sdk-core';
import { signPsbt, signPsbtWithBothKeys } from './psbt';

const INPUT_VALUE = 100_000_000n;
const OUTPUT_VALUE = 99_900_000n;
const RECOVERY_DESTINATION = 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4';
const ATTACKER_DESTINATION = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh';
const { ChainCode, RootWalletKeys } = fixedScriptWallet;
const btcCoinConstructor: CoinConstructor = bitgo => Btc.createInstance(bitgo);
const userKey = BIP32.fromSeedSha256('psbt-signing.0');
const backupKey = BIP32.fromSeedSha256('psbt-signing.1');
const bitgoKey = BIP32.fromSeedSha256('psbt-signing.2');

function createUnsignedPsbt(inputCount = 1, includeOutput = true): string {
  const walletKeys = RootWalletKeys.from({
    triple: [userKey, backupKey, bitgoKey],
    derivationPrefixes: ['m/0/0', 'm/0/0', 'm/0/0'],
  });
  const psbt = fixedScriptWallet.BitGoPsbt.createEmpty('btc', walletKeys, {
    version: 2,
    lockTime: 0,
  });

  for (let inputIndex = 0; inputIndex < inputCount; inputIndex++) {
    psbt.addWalletInput(
      {
        txid: inputIndex.toString(16).padStart(2, '0').repeat(32),
        vout: inputIndex,
        value: INPUT_VALUE,
      },
      walletKeys,
      {
        scriptId: {
          chain: ChainCode.value('p2wsh', 'external'),
          index: inputIndex,
        },
        signPath: { signer: 'user', cosigner: 'bitgo' },
      }
    );
  }
  if (includeOutput) {
    psbt.addOutput(RECOVERY_DESTINATION, OUTPUT_VALUE);
  }

  return Buffer.from(psbt.serialize()).toString('hex');
}

function readCompactSize(bytes: Buffer, offset: number): [number, number] {
  const prefix = bytes[offset];
  if (prefix < 0xfd) return [prefix, offset + 1];
  if (prefix === 0xfd) return [bytes.readUInt16LE(offset + 1), offset + 3];
  if (prefix === 0xfe) return [bytes.readUInt32LE(offset + 1), offset + 5];
  return [Number(bytes.readBigUInt64LE(offset + 1)), offset + 9];
}

function rewriteInputSighashType(
  psbtHex: string,
  inputIndex: number,
  sighashType?: number
): string {
  const bytes = Buffer.from(psbtHex, 'hex');
  let offset = 5;

  function readMap(targetInput: boolean): Buffer | undefined {
    while (offset < bytes.length) {
      const entryStart = offset;
      const [keyLength, keyStart] = readCompactSize(bytes, offset);
      offset = keyStart;
      if (keyLength === 0) return undefined;

      const keyType = keyLength === 1 ? bytes[offset] : -1;
      offset += keyLength;
      const [valueLength, valueStart] = readCompactSize(bytes, offset);
      offset = valueStart;
      const valueEnd = valueStart + valueLength;

      if (targetInput && keyType === 0x03) {
        if (sighashType === undefined) {
          return Buffer.concat([
            bytes.subarray(0, entryStart),
            bytes.subarray(valueEnd),
          ]);
        }
        if (valueLength !== 4) {
          throw new Error('Expected a four-byte PSBT sighash value');
        }
        bytes.writeUInt32LE(sighashType, valueStart);
        return bytes;
      }
      offset = valueEnd;
    }
    return undefined;
  }

  readMap(false); // Global map.
  for (let index = 0; index <= inputIndex; index++) {
    const rewritten = readMap(index === inputIndex);
    if (rewritten) return rewritten.toString('hex');
  }
  throw new Error(`No sighash type found for input ${inputIndex}`);
}

function createBtcCoin(): AbstractUtxoCoin {
  const sdk = new BitGoAPI({ env: 'test' });
  sdk.register('btc', btcCoinConstructor);
  return sdk.coin('btc') as AbstractUtxoCoin;
}

describe('signPsbt', () => {
  const unsafeSighashModes = [
    { name: 'SIGHASH_NONE', type: 0x02, inputCount: 1, inputIndex: 0 },
    {
      name: 'SIGHASH_SINGLE without a corresponding output',
      type: 0x03,
      inputCount: 2,
      inputIndex: 1,
    },
    { name: 'ANYONECANPAY', type: 0x80, inputCount: 1, inputIndex: 0 },
    {
      name: 'SIGHASH_ALL|ANYONECANPAY',
      type: 0x81,
      inputCount: 1,
      inputIndex: 0,
    },
    {
      name: 'SIGHASH_NONE|ANYONECANPAY',
      type: 0x82,
      inputCount: 2,
      inputIndex: 1,
    },
    {
      name: 'SIGHASH_SINGLE|ANYONECANPAY',
      type: 0x83,
      inputCount: 2,
      inputIndex: 1,
    },
  ];

  for (const mode of unsafeSighashModes) {
    it(`rejects ${mode.name} before signing`, () => {
      const psbtHex = rewriteInputSighashType(
        createUnsignedPsbt(mode.inputCount, false),
        mode.inputIndex,
        mode.type
      );

      expect(() =>
        signPsbt(
          createBtcCoin(),
          psbtHex,
          userKey.toBase58(),
          RECOVERY_DESTINATION,
          1
        )
      ).toThrow(/Only SIGHASH_ALL/);
    });
  }

  it('accepts an omitted sighash type using the signer default', () => {
    const psbtHex = rewriteInputSighashType(
      createUnsignedPsbt(1, false),
      0
    );
    const signedHex = signPsbt(
      createBtcCoin(),
      psbtHex,
      userKey.toBase58(),
      RECOVERY_DESTINATION,
      1
    );
    const signedPsbt = fixedScriptWallet.BitGoPsbt.fromBytes(
      Buffer.from(signedHex, 'hex'),
      'btc'
    );
    const userSignatures = signedPsbt
      .getInputKeyValues(0)
      .filter(
        keyValue =>
          keyValue.type === 'known' &&
          keyValue.key === 'PSBT_IN_PARTIAL_SIG'
      );

    expect(userSignatures).toHaveLength(1);
    expect(userSignatures[0].value[userSignatures[0].value.length - 1]).toBe(
      0x01
    );
    expect(signedPsbt.verifySignature(0, userKey.neutered())).toBe(true);
  });

  it('verifies every signature and rejects output replacement', () => {
    const signedHex = signPsbt(
      createBtcCoin(),
      createUnsignedPsbt(2, false),
      userKey.toBase58(),
      RECOVERY_DESTINATION,
      1
    );
    const signedPsbt = fixedScriptWallet.BitGoPsbt.fromBytes(
      Buffer.from(signedHex, 'hex'),
      'btc'
    );

    expect(signedPsbt.getOutputs()).toHaveLength(1);
    expect(signedPsbt.verifySignature(0, userKey.neutered())).toBe(true);
    expect(signedPsbt.verifySignature(1, userKey.neutered())).toBe(true);

    const outputValue = signedPsbt.getOutputs()[0].value;
    signedPsbt.removeOutput(0);
    signedPsbt.addOutput(ATTACKER_DESTINATION, outputValue);

    for (let inputIndex = 0; inputIndex < 2; inputIndex++) {
      let signatureValid = false;
      try {
        signatureValid = signedPsbt.verifySignature(
          inputIndex,
          userKey.neutered()
        );
      } catch {
        // An invalid signature may be reported as a verification error.
      }
      expect(signatureValid).toBe(false);
    }
  });
});

describe('signPsbtWithBothKeys', () => {
  it('rejects unsafe sighash types before the SDK signer runs', async () => {
    const coin = createBtcCoin();
    const signTransactionSpy = vi.spyOn(coin, 'signTransaction');
    const unsafePsbt = rewriteInputSighashType(
      createUnsignedPsbt(),
      0,
      0x02
    );

    await expect(
      signPsbtWithBothKeys(
        coin,
        unsafePsbt,
        userKey.toBase58(),
        backupKey.toBase58(),
        bitgoKey.neutered().toBase58()
      )
    ).rejects.toThrow(/Only SIGHASH_ALL/);
    expect(signTransactionSpy).not.toHaveBeenCalled();
  });

  it('produces a finalized transaction with user and backup signatures', async () => {
    const sdk = new BitGoAPI({ env: 'test' });
    sdk.register('btc', btcCoinConstructor);
    const coin = sdk.coin('btc') as AbstractUtxoCoin;
    const signTransactionSpy = vi.spyOn(coin, 'signTransaction');

    const result = await signPsbtWithBothKeys(
      coin,
      createUnsignedPsbt(),
      userKey.toBase58(),
      backupKey.toBase58(),
      bitgoKey.neutered().toBase58()
    );
    const transaction = Transaction.fromBytes(
      Buffer.from(result.txHex, 'hex'),
      'btc'
    );
    const witness = transaction.getInputs()[0]?.witness ?? [];

    expect(transaction.getInputs()).toHaveLength(1);
    expect(transaction.getOutputs()).toHaveLength(1);
    expect(witness).toHaveLength(4);
    expect(witness.slice(0, -1).filter(item => item.length > 0)).toHaveLength(
      2
    );
    const expectedPubs = [
      userKey.neutered().toBase58(),
      backupKey.neutered().toBase58(),
      bitgoKey.neutered().toBase58(),
    ];
    expect(
      signTransactionSpy.mock.calls.map(([params]) => params.pubs)
    ).toEqual([expectedPubs, expectedPubs]);
  });
});
