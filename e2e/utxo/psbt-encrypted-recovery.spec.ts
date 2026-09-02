import { test, expect } from '@playwright/test';
import type { ElectronApplication, Page } from '@playwright/test';
import { encrypt } from '@bitgo/sdk-api';
import { BIP32, fixedScriptWallet, Transaction } from '@bitgo/wasm-utxo';
import { launchApp } from './helpers';

const { BitGoPsbt, ChainCode, RootWalletKeys } = fixedScriptWallet;
const WALLET_PASSPHRASE = 'psbt-integration-passphrase';
const RECOVERY_DESTINATION = 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx';

function buildUnsignedPsbt(
  userKey: BIP32,
  backupKey: BIP32,
  bitgoKey: BIP32
): string {
  const walletKeys = RootWalletKeys.from({
    triple: [userKey, backupKey, bitgoKey],
    derivationPrefixes: ['m/0/0', 'm/0/0', 'm/0/0'],
  });
  const psbt = BitGoPsbt.createEmpty('tbtc', walletKeys, {
    version: 2,
    lockTime: 0,
  });

  psbt.addWalletInput(
    { txid: 'ab'.repeat(32), vout: 0, value: BigInt(100_000) },
    walletKeys,
    {
      scriptId: { chain: ChainCode.value('p2wsh', 'external'), index: 0 },
      signPath: { signer: 'user', cosigner: 'bitgo' },
    }
  );
  psbt.addOutput(RECOVERY_DESTINATION, BigInt(90_000));

  return Buffer.from(psbt.serialize()).toString('base64');
}

async function buildFixture() {
  const userKey = BIP32.fromSeedSha256('encrypted-recovery.0');
  const backupKey = BIP32.fromSeedSha256('encrypted-recovery.1');
  const bitgoKey = BIP32.fromSeedSha256('encrypted-recovery.2');

  return {
    backupKey: await encrypt(WALLET_PASSPHRASE, backupKey.toBase58(), {
      encryptionVersion: 1,
    }),
    bitgoKey: bitgoKey.neutered().toBase58(),
    psbt: buildUnsignedPsbt(userKey, backupKey, bitgoKey),
    userKey: await encrypt(WALLET_PASSPHRASE, userKey.toBase58(), {
      encryptionVersion: 1,
    }),
  };
}

function stubUiHandlers(app: ElectronApplication) {
  return app.evaluate(({ ipcMain }) => {
    for (const channel of [
      'setBitGoEnvironment',
      'showSaveDialog',
      'writeFile',
      'broadcastTransaction',
    ]) {
      ipcMain.removeHandler(channel);
    }

    ipcMain.handle('setBitGoEnvironment', () => undefined);
    ipcMain.handle('showSaveDialog', () => ({
      filePath: '/tmp/test-encrypted-psbt-recovery.json',
      canceled: false,
    }));
    ipcMain.handle('writeFile', () => undefined);
    ipcMain.handle('broadcastTransaction', () => {
      throw new Error('Broadcast must not be called by this test');
    });
  });
}

test.describe('UTXO PSBT recovery with encrypted generated keys', () => {
  let app: ElectronApplication;
  let page: Page;

  test.beforeEach(async () => {
    ({ app, page } = await launchApp());
    await stubUiHandlers(app);
  });

  test.afterEach(async () => {
    await app.close();
  });

  test('decrypts both keys and generates a fully signed transaction', async () => {
    const fixture = await buildFixture();

    await page.evaluate(() => {
      window.location.hash = '/test/non-bitgo-recovery/tbtc';
    });
    await page.waitForSelector('[name="recoverySource"]');
    await page.selectOption('[name="recoverySource"]', 'psbt');
    await page.waitForSelector('[name="psbt"]');
    await page.fill('[name="userKey"]', fixture.userKey);
    await page.fill('[name="backupKey"]', fixture.backupKey);
    await page.fill('[name="bitgoKey"]', fixture.bitgoKey);
    await page.fill('[name="walletPassphrase"]', WALLET_PASSPHRASE);
    await page.fill('[name="psbt"]', fixture.psbt);
    await page.click('button[type="submit"]');

    await page.waitForURL(/non-bitgo-recovery\/tbtc\/success/, {
      timeout: 10_000,
    });
    await expect(page.getByText('We recommend')).toBeVisible();
    await page.getByText('Show transaction hex').click();

    const transactionHex = await page
      .getByLabel('Transaction Hex')
      .inputValue();
    const transaction = Transaction.fromBytes(
      Buffer.from(transactionHex, 'hex'),
      'tbtc'
    );
    const witness = transaction.getInputs()[0]?.witness ?? [];

    expect(transaction.getInputs()).toHaveLength(1);
    expect(transaction.getOutputs()).toHaveLength(1);
    expect(witness).toHaveLength(4);
    expect(witness.slice(0, -1).filter(item => item.length > 0)).toHaveLength(
      2
    );
  });
});
