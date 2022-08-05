import { test, expect, _electron as electron } from '@playwright/test';

test('title should be home', async () => {
  const app = await electron.launch({
    args: ['main/index.js'],
    cwd: '.webpack',
  });
  const window = await app.firstWindow();
  await window.waitForSelector('#root');
  await window.screenshot({
    path: 'test-results/screenshots/home.png',
    fullPage: true,
  });
  const title = await window.title();
  expect(title).toBe('Home');
  await app.close();
});
