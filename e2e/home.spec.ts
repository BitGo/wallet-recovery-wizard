import { test, expect, _electron as electron } from '@playwright/test';

test('title should be BitGo Wallet Recovery Wizard', async () => {
  const app = await electron.launch({
    args: ['.', '--no-sandbox'],
  });
  const window = await app.firstWindow();
  await window.waitForSelector('#root');
  const title = await window.title();
  expect(title).toBe('BitGo Wallet Recovery Wizard');
  await window.screenshot({
    path: 'test-results/screenshots/home.png',
    fullPage: true,
  });
  await app.close();
});
