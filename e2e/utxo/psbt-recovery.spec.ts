import { test, expect } from '@playwright/test';
import type { ElectronApplication, Page } from '@playwright/test';
import { launchApp } from './helpers';

const PSBT = 'cHNidP8BAHECAAAAA';
const USER_KEY = 'xprv_placeholder_user_key';
const BACKUP_KEY = 'xprv_placeholder_backup_key';
const BITGO_KEY = 'xpub_placeholder_bitgo_key';
const WALLET_PASSPHRASE = 'test-passphrase-123';

function stubRecoveryHandlers(app: ElectronApplication) {
  return app.evaluate(({ ipcMain }) => {
    for (const channel of [
      'setBitGoEnvironment',
      'getChain',
      'recoverWithPsbt',
      'showSaveDialog',
      'writeFile',
    ]) {
      ipcMain.removeHandler(channel);
    }

    ipcMain.handle('setBitGoEnvironment', () => undefined);
    ipcMain.handle('getChain', () => 'tbtc');
    ipcMain.handle('recoverWithPsbt', (_event, coin, params) => {
      if (coin !== 'tbtc')
        throw new Error(`Expected tbtc coin, received ${coin}`);
      if (params.psbt !== 'cHNidP8BAHECAAAAA')
        throw new Error('Unexpected PSBT');
      if (params.userKey !== 'xprv_placeholder_user_key')
        throw new Error('Unexpected user key');
      if (params.backupKey !== 'xprv_placeholder_backup_key')
        throw new Error('Unexpected backup key');
      if (params.bitgoKey !== 'xpub_placeholder_bitgo_key')
        throw new Error('Unexpected BitGo key');
      if (params.walletPassphrase !== 'test-passphrase-123')
        throw new Error('Unexpected wallet passphrase');
      if (params.krsProvider !== undefined)
        throw new Error('KRS provider must be omitted');

      return { txHex: 'deadbeef01020304' };
    });
    ipcMain.handle('showSaveDialog', () => ({
      filePath: '/tmp/test-psbt-recovery.json',
      canceled: false,
    }));
    ipcMain.handle('writeFile', () => undefined);
  });
}

test.describe('UTXO PSBT recovery', () => {
  let app: ElectronApplication;
  let page: Page;

  test.beforeEach(async () => {
    ({ app, page } = await launchApp());
    await stubRecoveryHandlers(app);
  });

  test.afterEach(async () => {
    await app.close();
  });

  test('tbtc PSBT recovery completes successfully', async () => {
    await page.evaluate(() => {
      window.location.hash = '/test/non-bitgo-recovery/tbtc';
    });
    await page.waitForSelector('[name="recoverySource"]');

    await page.selectOption('[name="recoverySource"]', 'psbt');
    await page.waitForSelector('[name="psbt"]');
    await page.fill('[name="userKey"]', USER_KEY);
    await page.fill('[name="backupKey"]', BACKUP_KEY);
    await page.fill('[name="bitgoKey"]', BITGO_KEY);
    await page.fill('[name="walletPassphrase"]', WALLET_PASSPHRASE);
    await page.fill('[name="psbt"]', PSBT);

    await page.click('button[type="submit"]');

    await page.waitForURL(/non-bitgo-recovery\/tbtc\/success/, {
      timeout: 10_000,
    });
    await expect(page.getByText('We recommend')).toBeVisible();
  });
});
