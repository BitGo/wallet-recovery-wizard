import { test, expect, _electron as electron } from '@playwright/test';
import type { ElectronApplication, Page } from '@playwright/test';

const MOCK_TX_ID = 'mockTxId1234567890abcdef';

function stubNestedAtaHandlers(app: ElectronApplication) {
  return app.evaluate(
    ({ ipcMain }, txId) => {
      for (const ch of ['setBitGoEnvironment', 'recoverNestedAta'])
        ipcMain.removeHandler(ch);
      ipcMain.handle('setBitGoEnvironment', () => undefined);
      ipcMain.handle('recoverNestedAta', () => ({ txId }));
    },
    MOCK_TX_ID
  );
}

test.describe('Solana nested ATA recovery', () => {
  let app: ElectronApplication;
  let page: Page;

  test.beforeEach(async () => {
    app = await electron.launch({ args: ['.', '--no-sandbox'] });
    page = await app.firstWindow();
    await page.waitForSelector('#root');
    await stubNestedAtaHandlers(app);
  });

  test.afterEach(async () => {
    await app.close();
  });

  test('renders NestedATAForm for solNestedATA coin', async () => {
    await page.evaluate(() => {
      window.location.hash = '/prod/non-bitgo-recovery/solNestedATA';
    });

    await page.waitForSelector('[name="nestedAtaAddress"]');

    await expect(page.locator('[name="userKey"]')).toBeVisible();
    await expect(page.locator('[name="backupKey"]')).toBeVisible();
    await expect(page.locator('[name="bitgoKey"]')).toBeVisible();
    await expect(page.locator('[name="walletPassphrase"]')).toBeVisible();
    await expect(page.locator('[name="recoveryDestination"]')).toBeVisible();
    await expect(page.locator('[name="nestedAtaAddress"]')).toBeVisible();
    await expect(page.locator('[name="ownerAtaAddress"]')).toBeVisible();
    await expect(page.locator('[name="tokenMintAddress"]')).toBeVisible();
  });

  test('shows validation errors when submitted empty', async () => {
    await page.evaluate(() => {
      window.location.hash = '/prod/non-bitgo-recovery/solNestedATA';
    });
    await page.waitForSelector('[name="nestedAtaAddress"]');

    await page.click('button[type="submit"]');

    // Formik marks fields as touched on submit — the Textarea component signals
    // errors via tw-border-red-500 (not aria-invalid)
    await expect(page.locator('[name="userKey"]')).toHaveClass(/tw-border-red-500/);
    await expect(page.locator('[name="nestedAtaAddress"]')).toHaveClass(/tw-border-red-500/);
  });

  test('completes recovery and shows txId on success page', async () => {
    await page.evaluate(() => {
      window.location.hash = '/prod/non-bitgo-recovery/solNestedATA';
    });
    await page.waitForSelector('[name="nestedAtaAddress"]');

    await page.fill('[name="userKey"]',            '{"iv":"abc","v":1,"iter":10000,"ks":256,"ts":64,"mode":"ccm","adata":"","cipher":"aes","ct":"encryptedUserKey"}');
    await page.fill('[name="backupKey"]',           '{"iv":"def","v":1,"iter":10000,"ks":256,"ts":64,"mode":"ccm","adata":"","cipher":"aes","ct":"encryptedBackupKey"}');
    await page.fill('[name="bitgoKey"]',            'xpub661MyMwAqRbcGHoJePkfLFqgzNBjqAqMjZaRVPMd3su2mTJ7HJQNFVkBkzVHBG7yWVZvLgXSZDmDj8mqqVFnzWijVhKanGj6ygSWfzFQ6eB');
    await page.fill('[name="walletPassphrase"]',    'test-passphrase-123');
    await page.fill('[name="recoveryDestination"]', '7YbcLmVorrH7KCKMj38rFidsruisWi2CmvCTs4cygf8K');
    await page.fill('[name="nestedAtaAddress"]',    'FGuZSBhtreqSUsE86xokyjKz2i8VBtJzy6uMXXKyGHug');
    await page.fill('[name="ownerAtaAddress"]',     'Zfm98ZpVafydhFTYcsY6bHgubhB4cFgWFvbdEJxYhTA');
    await page.fill('[name="tokenMintAddress"]',    'ZBCNpuD7YMXzTHB2fhGkGi78MNsHGLRXUhRewNRm9RU');

    await page.click('button[type="submit"]');

    await page.waitForURL(/non-bitgo-recovery\/solNestedATA\/success/, { timeout: 10_000 });
    await expect(page.getByText(MOCK_TX_ID)).toBeVisible();
    await expect(page.getByText('View on Solscan')).toBeVisible();
  });

  test('renders NestedATAForm for tsolNestedATA coin (testnet)', async () => {
    await page.evaluate(() => {
      window.location.hash = '/test/non-bitgo-recovery/tsolNestedATA';
    });
    await page.waitForSelector('[name="nestedAtaAddress"]');
    await expect(page.locator('[name="nestedAtaAddress"]')).toBeVisible();
  });
});
