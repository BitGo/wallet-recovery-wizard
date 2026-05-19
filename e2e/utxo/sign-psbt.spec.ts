import { test, expect } from '@playwright/test';
import type { ElectronApplication, Page } from '@playwright/test';
import { fixedScriptWallet, BIP32 } from '@bitgo/wasm-utxo';
import { launchApp } from './helpers';

const { BitGoPsbt, RootWalletKeys, ChainCode } = fixedScriptWallet;

const RECIPIENT = 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx';
const FEE_RATE = '10';

function buildFixture() {
  const userKey   = BIP32.fromSeedSha256('default.0');
  const backupKey = BIP32.fromSeedSha256('default.1');
  const bitgoKey  = BIP32.fromSeedSha256('default.2');

  const walletKeys = RootWalletKeys.from({
    triple: [userKey, backupKey, bitgoKey],
    derivationPrefixes: ['m/0/0', 'm/0/0', 'm/0/0'],
  });

  const psbt = BitGoPsbt.createEmpty('tbtc', walletKeys, { version: 2, lockTime: 0 });

  const externalChain = ChainCode.value('p2wsh', 'external');
  psbt.addWalletInput(
    { txid: '0'.repeat(64), vout: 0, value: BigInt(1_000_000) },
    walletKeys,
    { scriptId: { chain: externalChain, index: 0 }, signPath: { signer: 'user', cosigner: 'bitgo' } },
  );
  // No outputs — the backend derives the output from inputs + fee rate.

  return {
    psbtBase64: Buffer.from(psbt.serialize()).toString('base64'),
    userXprv: userKey.toBase58(),
  };
}

function stubFileHandlers(app: ElectronApplication) {
  return app.evaluate(({ ipcMain }) => {
    for (const ch of ['showSaveDialog', 'writeFile']) ipcMain.removeHandler(ch);
    ipcMain.handle('showSaveDialog', () => ({ filePath: '/tmp/test-signed.psbt', canceled: false }));
    ipcMain.handle('writeFile', () => undefined);
  });
}

test.describe('Sign PSBT – real signing', () => {
  let app: ElectronApplication;
  let page: Page;

  test.beforeEach(async () => {
    ({ app, page } = await launchApp());
    await stubFileHandlers(app);
  });

  test.afterEach(async () => {
    await app.close();
  });

  test('signs a tbtc p2wsh PSBT with the user key', async () => {
    const { psbtBase64, userXprv } = buildFixture();

    await page.evaluate(() => { window.location.hash = '/test/sign-psbt'; });
    await page.waitForSelector('[name="coin"]');
    await page.screenshot({ path: 'test-results/sign-psbt-1-form-loaded.png' });

    await page.selectOption('[name="coin"]', 'tbtc');
    await page.fill('[name="psbt"]', psbtBase64);
    await page.fill('[name="userKey"]', userXprv);
    await page.fill('[name="recipientAddress"]', RECIPIENT);
    await page.fill('[name="feeRateSatVB"]', FEE_RATE);
    await page.screenshot({ path: 'test-results/sign-psbt-2-filled.png' });

    await page.click('button[type="submit"]');
    await page.screenshot({ path: 'test-results/sign-psbt-3-submitted.png' });

    const errorDiv = page.locator('.tw-text-red-700');
    await Promise.race([
      page.waitForURL(/sign-psbt\/success/, { timeout: 20_000 }),
      errorDiv.waitFor({ state: 'visible', timeout: 20_000 }).then(async () => {
        const msg = await errorDiv.textContent();
        throw new Error(`Sign PSBT failed: ${msg}`);
      }),
    ]);

    await expect(page.getByText('We recommend')).toBeVisible();
  });
});
