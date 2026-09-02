import { resolve } from 'node:path';
import { _electron as electron } from '@playwright/test';
import type { ElectronApplication, Page } from '@playwright/test';

const SENSITIVE_FIELD_SELECTORS = [
  '[name="userKey"]',
  '[name="backupKey"]',
  '[name="bitgoKey"]',
  '[name="apiKey"]',
  '#transaction-hex',
].join(', ');

const SENSITIVE_FIELD_STYLES = `
  ${SENSITIVE_FIELD_SELECTORS} {
    color: transparent !important;
    -webkit-text-fill-color: transparent !important;
    caret-color: transparent !important;
    filter: blur(4px);
  }
`;

function getRecordingCheckpointDelay(): number {
  const configuredValue = process.env.RECOVERY_VIDEO_SLOW_MO_MS;
  if (configuredValue === undefined) {
    return process.env.RECORD_KEYCARD_VIDEO === '1' ? 250 : 0;
  }

  const slowMoMilliseconds = Number(configuredValue);
  if (!Number.isFinite(slowMoMilliseconds) || slowMoMilliseconds < 0) {
    throw new Error('RECOVERY_VIDEO_SLOW_MO_MS must be a non-negative number');
  }
  return slowMoMilliseconds;
}

export async function launchApp(): Promise<{
  app: ElectronApplication;
  page: Page;
}> {
  const videoDirectory =
    process.env.RECOVERY_VIDEO_DIR ??
    resolve(__dirname, '../../artifacts/keycard-recovery-videos');
  const app = await electron.launch({
    args: ['.', '--no-sandbox'],
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: '',
      VITE_DEV_SERVER_URL:
        process.env.VITE_DEV_SERVER_URL ?? 'http://127.0.0.1:5173',
    },
    recordVideo:
      process.env.RECORD_KEYCARD_VIDEO === '1'
        ? { dir: videoDirectory, size: { width: 1440, height: 900 } }
        : undefined,
  });
  const page = await app.firstWindow();
  await app.evaluate(({ BrowserWindow }) => {
    BrowserWindow.getAllWindows()[0].setSize(1440, 900);
  });
  await page.waitForSelector('#root');
  return { app, page };
}

export async function redactSensitiveFieldsForVideo(page: Page): Promise<void> {
  if (process.env.RECORD_KEYCARD_VIDEO !== '1') return;

  await page.addStyleTag({ content: SENSITIVE_FIELD_STYLES });
}

export async function waitForRecordingCheckpoint(page: Page): Promise<void> {
  const checkpointDelay = getRecordingCheckpointDelay();
  if (checkpointDelay > 0) {
    await page.waitForTimeout(checkpointDelay);
  }
}
