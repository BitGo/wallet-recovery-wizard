import { test, expect } from '@playwright/test';
import type { ElectronApplication, Page } from '@playwright/test';
import { launchApp } from './helpers';

function stubRecoveryHandlers(app: ElectronApplication) {
  return app.evaluate(({ ipcMain }) => {
    for (const ch of ['setBitGoEnvironment', 'getChain', 'recover', 'showSaveDialog', 'writeFile'])
      ipcMain.removeHandler(ch);
    ipcMain.handle('setBitGoEnvironment', () => undefined);
    ipcMain.handle('getChain',            () => 'tbtc');
    ipcMain.handle('recover',             () => ({ txHex: 'deadbeef01020304' }));
    ipcMain.handle('showSaveDialog',      () => ({ filePath: '/tmp/test-recovery.json', canceled: false }));
    ipcMain.handle('writeFile',           () => undefined);
  });
}

test.describe('UTXO blockchain recovery', () => {
  let app: ElectronApplication;
  let page: Page;

  test.beforeEach(async () => {
    ({ app, page } = await launchApp());
    await stubRecoveryHandlers(app);
  });

  test.afterEach(async () => {
    await app.close();
  });

  test('tbtc blockchain recovery completes successfully', async () => {
    await page.evaluate(() => { window.location.hash = '/test/non-bitgo-recovery/tbtc'; });
    await page.waitForSelector('[name="userKey"]');

    await page.fill('[name="userKey"]',            'xprv_placeholder_user_key');
    await page.fill('[name="backupKey"]',           'xprv_placeholder_backup_key');
    await page.fill('[name="bitgoKey"]',            'xpub_placeholder_bitgo_key');
    await page.fill('[name="walletPassphrase"]',    'test-passphrase-123');
    await page.fill('[name="recoveryDestination"]', 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx');
    await page.fill('[name="apiKey"]',              'blockchair-test-api-key');

    await page.click('button[type="submit"]');

    await page.waitForURL(/non-bitgo-recovery\/tbtc\/success/, { timeout: 10_000 });
    await expect(page.getByText('We recommend')).toBeVisible();
  });
});
