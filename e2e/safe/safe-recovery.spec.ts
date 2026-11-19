import { test, expect } from '@playwright/test';
import type { ElectronApplication, Page } from '@playwright/test';
import { launchApp } from '../utxo/helpers';

// Real main-process handlers over the real preload bridge. Nothing is stubbed:
// each case fails before the first chain call.
const safeBox = JSON.stringify({
  secp256k1Multisig: 'a',
  ed25519Multisig: 'b',
  ecdsaMpc: 'c',
  eddsaMpc: 'd',
});
const keycard = { boxA: safeBox, boxB: safeBox, boxC: safeBox };

const walletRequest = {
  derivationCoin: 'tbtc',
  recoverCoin: 'tbtc',
  mode: 'signed' as const,
  baseParams: {},
  keycard,
  password: 'SECRET-PASSWORD',
};

test.describe('Safe recovery IPC', () => {
  let app: ElectronApplication;
  let page: Page;

  test.beforeEach(async () => {
    ({ app, page } = await launchApp());
  });

  test.afterEach(async () => {
    await app.close();
  });

  test('isSafeKeycard tells a Safe keycard from a normal one', async () => {
    const result = await page.evaluate(
      async ({ safe, normal }) => ({
        safe: await window.queries.isSafeKeycard(safe),
        normal: await window.queries.isSafeKeycard(normal),
      }),
      {
        safe: keycard,
        normal: {
          boxA: '{"iv":"a","salt":"b","ct":"c"}',
          boxB: '{"iv":"a","salt":"b","ct":"c"}',
          boxC: 'xpub661MyMwAqRbcFtXgS5sYJABqqG9YLmC4Q1Rdap9gSE8NqtwybGhePY2',
        },
      }
    );

    expect(result).toEqual({ safe: true, normal: false });
  });

  test('discoverSafeWallets rejects an out-of-range startAccount by field name', async () => {
    const message = await page.evaluate(
      async request =>
        window.commands
          .discoverSafeWallets(request)
          .then(() => '')
          .catch((e: Error) => e.message),
      { ...walletRequest, startAccount: -1 }
    );

    expect(message).toContain('Invalid Safe recovery request');
    expect(message).toContain('startAccount');
    expect(message).not.toContain('SECRET-PASSWORD');
  });

  test('discoverSafeWallets fails on a wrong password before any chain call', async () => {
    const message = await page.evaluate(
      async request =>
        window.commands
          .discoverSafeWallets(request)
          .then(() => '')
          .catch((e: Error) => e.message),
      { ...walletRequest, startAccount: 0 }
    );

    expect(message).toContain('unable to decrypt the safe keycard');
    expect(message).not.toContain('SECRET-PASSWORD');
  });

  test('recoverSafeWallet rejects a slot the coin does not have', async () => {
    const message = await page.evaluate(
      async request =>
        window.commands
          .recoverSafeWallet(request)
          .then(() => '')
          .catch((e: Error) => e.message),
      {
        ...walletRequest,
        // tbtc has no MPC slot
        target: { slot: 'eddsaMpc' as const, account: 0 },
      }
    );

    expect(message).toContain('eddsaMpc is not a Safe slot for tbtc');
  });

  test('cancelSafeRecovery resolves when nothing is running', async () => {
    await expect(
      page.evaluate(() => window.commands.cancelSafeRecovery())
    ).resolves.toBeUndefined();
  });

  test('a run does not block the next: the guard clears after a failure', async () => {
    const run = () =>
      page.evaluate(
        async request =>
          window.commands
            .discoverSafeWallets(request)
            .then(() => '')
            .catch((e: Error) => e.message),
        { ...walletRequest, startAccount: 0 }
      );

    const first = await run();
    const second = await run();

    expect(first).toContain('unable to decrypt');
    expect(second).toContain('unable to decrypt');
    expect(second).not.toContain('already running');
  });
});
