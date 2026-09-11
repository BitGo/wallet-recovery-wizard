import { test, expect } from '@playwright/test';
import type { ElectronApplication, Page } from '@playwright/test';
import { BIP32, Transaction, fixedScriptWallet } from '@bitgo/wasm-utxo';
import {
  decryptKeycardBoxValue,
  getKeycardBoxValue,
  hasKeycardPdfFixture,
  loadKeycardEntriesFromEnv,
} from '../keycard';
import {
  launchApp,
  redactSensitiveFieldsForVideo,
  waitForRecordingCheckpoint,
} from './helpers';

const RECOVERY_COIN = process.env.RECOVERY_COIN ?? 'tecx';
const RECOVERY_ENVIRONMENT = process.env.RECOVERY_ENVIRONMENT ?? 'test';
const RECOVERY_SCAN = process.env.RECOVERY_SCAN ?? '20';
const RECOVERY_API_KEY =
  process.env.RECOVERY_BLOCKCHAIR_API_KEY ?? process.env.BLOCKCHAIR_TOKEN;

async function deriveRecoveryDestination(
  userKey: string,
  backupKey: string,
  bitgoKey: string,
  walletPassphrase: string
): Promise<string> {
  const [userXprv, backupXprv] = await Promise.all([
    decryptKeycardBoxValue(userKey, walletPassphrase),
    decryptKeycardBoxValue(backupKey, walletPassphrase),
  ]);
  const walletKeys = fixedScriptWallet.RootWalletKeys.from({
    triple: [
      BIP32.fromBase58(userXprv),
      BIP32.fromBase58(backupXprv),
      BIP32.fromBase58(bitgoKey),
    ],
    derivationPrefixes: ['m/0/0', 'm/0/0', 'm/0/0'],
  });

  return fixedScriptWallet.address(
    walletKeys,
    fixedScriptWallet.ChainCode.value('p2wsh', 'internal'),
    0,
    'btc'
  );
}

function stubUiHandlers(app: ElectronApplication) {
  return app.evaluate(({ ipcMain }) => {
    for (const channel of [
      'showSaveDialog',
      'writeFile',
      'broadcastTransaction',
    ]) {
      ipcMain.removeHandler(channel);
    }

    ipcMain.handle('showSaveDialog', () => ({
      filePath: '/tmp/test-keycard-recovery.json',
      canceled: false,
    }));
    ipcMain.handle('writeFile', () => undefined);
    ipcMain.handle('broadcastTransaction', () => {
      throw new Error('Broadcast must not be called by this test');
    });
  });
}

test.use({ screenshot: 'off', trace: 'off', video: 'off' });

test.describe('UTXO recovery from a CI keycard PDF', () => {
  test.skip(
    !hasKeycardPdfFixture(),
    'Recovery keycard fixture is available only in CI'
  );

  let app: ElectronApplication;
  let page: Page;

  test.beforeEach(async () => {
    ({ app, page } = await launchApp());
    await redactSensitiveFieldsForVideo(page);
  });

  test.afterEach(async () => {
    if (process.env.RECOVERY_KEEP_OPEN === '1') {
      console.log(
        'Recovery app is kept open; close the Electron window to finish the test.'
      );
      await new Promise<void>(resolve => app.once('close', () => resolve()));
      return;
    }
    await app.close();
  });

  test('parses a keycard and performs a full blockchain recovery', async () => {
    if (process.env.RECOVERY_KEEP_OPEN === '1') {
      test.setTimeout(0);
    } else {
      test.setTimeout(120_000);
    }

    const walletPassphrase = process.env.RECOVERY_WALLET_PASSPHRASE;
    if (!walletPassphrase) {
      throw new Error('Set RECOVERY_WALLET_PASSPHRASE for this test');
    }
    if (
      RECOVERY_COIN !== 'ecx' &&
      RECOVERY_COIN !== 'tecx' &&
      !RECOVERY_API_KEY
    ) {
      throw new Error(
        'Set RECOVERY_BLOCKCHAIR_API_KEY or BLOCKCHAIR_TOKEN for this coin'
      );
    }

    const entries = await loadKeycardEntriesFromEnv();
    const userKey = getKeycardBoxValue(entries, 'A');
    const backupKey = getKeycardBoxValue(entries, 'B');
    const bitgoKey = getKeycardBoxValue(entries, 'C');
    const recoveryDestination = await deriveRecoveryDestination(
      userKey,
      backupKey,
      bitgoKey,
      walletPassphrase
    );
    await stubUiHandlers(app);

    const recoveryPath = `/${RECOVERY_ENVIRONMENT}/non-bitgo-recovery/${RECOVERY_COIN}`;
    await page.evaluate(path => {
      window.location.hash = path;
    }, recoveryPath);
    await page.waitForSelector('[name="recoverySource"]');
    await waitForRecordingCheckpoint(page);

    await expect(page.locator('[name="recoverySource"]')).toHaveValue(
      'blockchain'
    );
    await page.waitForSelector('[name="recoveryDestination"]');
    await waitForRecordingCheckpoint(page);

    await page.fill('[name="userKey"]', userKey);
    await page.fill('[name="backupKey"]', backupKey);
    await page.fill('[name="bitgoKey"]', bitgoKey);
    await page.fill('[name="walletPassphrase"]', walletPassphrase);
    await page.fill('[name="recoveryDestination"]', recoveryDestination);
    await page.fill('[name="scan"]', RECOVERY_SCAN);
    if (
      RECOVERY_COIN !== 'ecx' &&
      RECOVERY_COIN !== 'tecx' &&
      RECOVERY_API_KEY
    ) {
      await page.fill('[name="apiKey"]', RECOVERY_API_KEY);
    }
    await waitForRecordingCheckpoint(page);

    await page.click('button[type="submit"]');
    await page.waitForURL(
      new RegExp(`non-bitgo-recovery/${RECOVERY_COIN}/success`),
      { timeout: 120_000 }
    );
    await expect(page.getByText('We recommend')).toBeVisible();
    await waitForRecordingCheckpoint(page);

    await page.getByText('Show transaction hex').click();
    const generatedTransactionHex = await page
      .getByLabel('Transaction Hex')
      .inputValue();
    expect(generatedTransactionHex).toMatch(/^[0-9a-f]+$/i);
    expect(generatedTransactionHex.length).toBeGreaterThan(0);

    const generatedTransaction = Transaction.fromBytes(
      Buffer.from(generatedTransactionHex, 'hex'),
      'tbtc'
    );
    expect(generatedTransaction.getInputs().length).toBeGreaterThan(0);
    expect(generatedTransaction.getOutputs()).toHaveLength(1);
    expect(generatedTransaction.getOutputsWithAddress('btc')[0]?.address).toBe(
      recoveryDestination
    );

    for (const input of generatedTransaction.getInputs()) {
      const witness = input.witness ?? [];
      const hasWitnessSignature = witness
        .slice(0, -1)
        .some(item => item.length > 0);
      const hasLegacySignature = input.scriptSig.length > 0;
      expect(hasWitnessSignature || hasLegacySignature).toBe(true);
    }
  });
});
