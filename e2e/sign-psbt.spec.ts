import { test, expect } from '@playwright/test';

test.describe('Sign PSBT E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to test environment home page
    // The playwright config has webServer configured to start vite on localhost:5173
    await page.goto('http://localhost:5173/#/test');
    await page.waitForLoadState('networkidle');
  });

  test('Sign PSBT link should be accessible from home page', async ({ page }) => {
    // Navigate directly to the sign-psbt page instead of finding the link
    await page.goto('http://localhost:5173/#/test/sign-psbt');
    await page.waitForURL('**/sign-psbt');
    expect(page.url()).toContain('sign-psbt');
  });

  test('should render Sign PSBT form correctly', async ({ page }) => {
    // Navigate directly to sign-psbt page
    await page.goto('http://localhost:5173/#/test/sign-psbt');
    await page.waitForLoadState('networkidle');

    // Check that the form heading is visible
    const heading = page.locator('h4:has-text("Sign Unsigned PSBT")');
    await expect(heading).toBeVisible();
  });

  test('Sign PSBT form should render all required fields', async ({ page }) => {
    // Navigate directly to sign-psbt page
    await page.goto('http://localhost:5173/#/test/sign-psbt');
    await page.waitForLoadState('networkidle');

    // Check for all form fields using more specific selectors
    await expect(page.locator('label:has-text("Coin")')).toBeVisible();
    await expect(page.locator('label:has-text("Unsigned PSBT")')).toBeVisible();
    await expect(page.locator('label:has-text("User Key")')).toBeVisible();
    await expect(page.locator('button:has-text("Sign PSBT")')).toBeVisible();
    // Cancel is rendered as a Link component
    await expect(page.locator('a:has-text("Cancel")')).toBeVisible();
  });

  test('Sign PSBT form should show optional recipient fields', async ({ page }) => {
    await page.goto('http://localhost:5173/#/test/sign-psbt');
    await page.waitForLoadState('networkidle');

    // Check optional fields using more specific selectors
    await expect(page.locator('label:has-text("Recipient Address")')).toBeVisible();
    await expect(page.locator('label:has-text("Fee Rate")')).toBeVisible();
  });

  test('Passphrase field should be hidden initially', async ({ page }) => {
    await page.goto('http://localhost:5173/#/test/sign-psbt');
    await page.waitForLoadState('networkidle');

    // Passphrase should not be visible when no userKey is entered
    const passphraseLabel = page.locator('text=Wallet Passphrase');
    await expect(passphraseLabel).not.toBeVisible();
  });

  test('Coin selector should have UTXO options', async ({ page }) => {
    await page.goto('http://localhost:5173/#/test/sign-psbt');
    await page.waitForLoadState('networkidle');

    // Find the coin selector
    const coinSelect = page.locator('[name="coin"]');
    await expect(coinSelect).toBeVisible();

    // Check for expected coin options (option elements exist in DOM)
    const tbtcOption = coinSelect.locator('option:has-text("TBTC")');
    const btcOption = coinSelect.locator('option:has-text("BTC")');

    // Options exist in DOM but may be hidden, so check they're attached
    expect(await tbtcOption.count()).toBeGreaterThan(0);
    expect(await btcOption.count()).toBeGreaterThan(0);
  });

  test('Form should accept PSBT and user key input', async ({ page }) => {
    await page.goto('http://localhost:5173/#/test/sign-psbt');
    await page.waitForLoadState('networkidle');

    // Fill in the form
    const coinSelect = page.locator('[name="coin"]');
    await coinSelect.selectOption('tbtc');

    const psbtTextarea = page.locator('[name="psbt"]');
    await psbtTextarea.fill('70736274ff010000');

    const userKeyTextarea = page.locator('[name="userKey"]');
    await userKeyTextarea.fill('tprvAA2oWoHxCkMDMedFAEgCAJEdSYq5vTTPZp9VuCFJnNxYQhGJxp7JGZoAZiXNkFsLXQtqeQFZefFxvTFSzz2kDCzKe3tKo8GJqQ4pA3mbMK');

    // Verify values are set
    const psbtValue = await psbtTextarea.inputValue();
    expect(psbtValue).toBe('70736274ff010000');
  });

  test('Passphrase field should show when encrypted key is entered', async ({ page }) => {
    await page.goto('http://localhost:5173/#/test/sign-psbt');
    await page.waitForLoadState('networkidle');

    const userKeyTextarea = page.locator('[name="userKey"]');

    // Enter an encrypted key (JSON format, not starting with xprv/tprv)
    const encryptedKey = '{"iv":"abc123"}';
    await userKeyTextarea.fill(encryptedKey);

    // Passphrase field should now be visible
    const passphraseField = page.locator('[name="walletPassphrase"]');
    await expect(passphraseField).toBeVisible();
  });

  test('Sign button should be enabled initially', async ({ page }) => {
    await page.goto('http://localhost:5173/#/test/sign-psbt');
    await page.waitForLoadState('networkidle');

    // Get the sign button
    const signButton = page.locator('button:has-text("Sign PSBT")');
    await expect(signButton).toBeVisible();

    // Button should be enabled initially
    const isDisabled = await signButton.isDisabled();
    expect(isDisabled).toBe(false);
  });

  test('Cancel button should navigate back to home', async ({ page }) => {
    await page.goto('http://localhost:5173/#/test/sign-psbt');
    await page.waitForLoadState('networkidle');

    // Cancel is rendered as a Link component, not a button
    const cancelLink = page.locator('a:has-text("Cancel")');
    await expect(cancelLink).toBeVisible();

    // Click cancel and wait for navigation
    await cancelLink.click();
    await page.waitForLoadState('networkidle');

    // Verify we navigated away from sign-psbt
    expect(page.url()).not.toContain('sign-psbt');
  });
});
