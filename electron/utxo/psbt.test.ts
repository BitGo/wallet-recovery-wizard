// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { BitGoAPI } from '@bitgo/sdk-api';
import { Btc } from '@bitgo/sdk-coin-btc';
import { BIP32, Transaction, fixedScriptWallet } from '@bitgo/wasm-utxo';
import type { AbstractUtxoCoin } from '@bitgo/abstract-utxo';
import type { CoinConstructor } from '@bitgo/sdk-core';
import { signPsbtWithBothKeys } from './psbt';

const INPUT_VALUE = 100_000_000n;
const OUTPUT_VALUE = 99_900_000n;
const RECOVERY_DESTINATION = 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4';
const { ChainCode, RootWalletKeys } = fixedScriptWallet;
const btcCoinConstructor: CoinConstructor = bitgo => Btc.createInstance(bitgo);
const userKey = BIP32.fromSeedSha256('psbt-signing.0');
const backupKey = BIP32.fromSeedSha256('psbt-signing.1');
const bitgoKey = BIP32.fromSeedSha256('psbt-signing.2');

function createUnsignedPsbt(): string {
  const walletKeys = RootWalletKeys.from({
    triple: [userKey, backupKey, bitgoKey],
    derivationPrefixes: ['m/0/0', 'm/0/0', 'm/0/0'],
  });
  const psbt = fixedScriptWallet.BitGoPsbt.createEmpty('btc', walletKeys, {
    version: 2,
    lockTime: 0,
  });

  psbt.addWalletInput(
    { txid: 'ab'.repeat(32), vout: 0, value: INPUT_VALUE },
    walletKeys,
    {
      scriptId: { chain: ChainCode.value('p2wsh', 'external'), index: 0 },
      signPath: { signer: 'user', cosigner: 'bitgo' },
    }
  );
  psbt.addOutput(RECOVERY_DESTINATION, OUTPUT_VALUE);

  return Buffer.from(psbt.serialize()).toString('hex');
}

describe('signPsbtWithBothKeys', () => {
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
