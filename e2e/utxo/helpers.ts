import { _electron as electron } from '@playwright/test';
import type { ElectronApplication, Page } from '@playwright/test';

export async function launchApp(): Promise<{ app: ElectronApplication; page: Page }> {
  const app = await electron.launch({
    args: ['.', '--no-sandbox'],
    env: { ...process.env, ELECTRON_RUN_AS_NODE: '' },
  });
  const page = await app.firstWindow();
  await app.evaluate(({ BrowserWindow }) => {
    BrowserWindow.getAllWindows()[0].setSize(1440, 900);
  });
  await page.waitForSelector('#root');
  return { app, page };
}
