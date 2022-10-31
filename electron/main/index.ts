/* eslint-disable @typescript-eslint/unbound-method */
import { AbstractUtxoCoin } from '@bitgo/abstract-utxo';
import { BitGoAPI } from '@bitgo/sdk-api';
import { AvaxC, TavaxC } from '@bitgo/sdk-coin-avaxc';
import { Bch } from '@bitgo/sdk-coin-bch';
import { Bcha } from '@bitgo/sdk-coin-bcha';
import { Bsv } from '@bitgo/sdk-coin-bsv';
import { Btc, Tbtc } from '@bitgo/sdk-coin-btc';
import { Btg } from '@bitgo/sdk-coin-btg';
import { Dash } from '@bitgo/sdk-coin-dash';
import { Dot, Tdot } from '@bitgo/sdk-coin-dot';
import { Eos, Teos } from '@bitgo/sdk-coin-eos';
import { Erc20Token, Eth, Gteth } from '@bitgo/sdk-coin-eth';
import { Ethw } from '@bitgo/sdk-coin-ethw';
import { Ltc } from '@bitgo/sdk-coin-ltc';
import { Near, TNear } from '@bitgo-beta/sdk-coin-near';
import { Polygon, Tpolygon } from '@bitgo/sdk-coin-polygon';
import { Trx, Ttrx } from '@bitgo/sdk-coin-trx';
import { Txlm, Xlm } from '@bitgo/sdk-coin-xlm';
import { Txrp, Xrp } from '@bitgo/sdk-coin-xrp';
import { Sol, Tsol } from '@bitgo/sdk-coin-sol';
import { Zec } from '@bitgo/sdk-coin-zec';
import { fromBase58 } from 'bip32';
import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron';
import fs from 'node:fs/promises';
import { release } from 'os';
import { join } from 'path';

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

export const ROOT_PATH = {
  // /dist
  dist: join(__dirname, '../..'),
  // /dist or /public
  public: join(__dirname, app.isPackaged ? '../..' : '../../../public'),
};

let win: BrowserWindow | null = null;
// Here, you can also use other preload
const preload = join(__dirname, '../preload/index.js');
const url = String(process.env.VITE_DEV_SERVER_URL);
const indexHtml = join(ROOT_PATH.dist, 'index.html');

let sdk = new BitGoAPI({
  env: 'test',
});
sdk.register('btc', Btc.createInstance);
sdk.register('tbtc', Tbtc.createInstance);
sdk.register('eth', Eth.createInstance);
sdk.register('gteth', Gteth.createInstance);
sdk.register('ethw', Ethw.createInstance);
sdk.register('eos', Eos.createInstance);
sdk.register('teos', Teos.createInstance);
sdk.register('xlm', Xlm.createInstance);
sdk.register('txlm', Txlm.createInstance);
sdk.register('xrp', Xrp.createInstance);
sdk.register('txrp', Txrp.createInstance);
sdk.register('bch', Bch.createInstance);
sdk.register('ltc', Ltc.createInstance);
sdk.register('btg', Btg.createInstance);
sdk.register('dash', Dash.createInstance);
sdk.register('zec', Zec.createInstance);
sdk.register('bcha', Bcha.createInstance);
sdk.register('bsv', Bsv.createInstance);
sdk.register('trx', Trx.createInstance);
sdk.register('ttrx', Ttrx.createInstance);
sdk.register('avaxc', AvaxC.createInstance);
sdk.register('tavaxc', TavaxC.createInstance);
sdk.register('near', Near.createInstance);
sdk.register('tnear', TNear.createInstance);
sdk.register('dot', Dot.createInstance);
sdk.register('tdot', Tdot.createInstance);
sdk.register('sol', Sol.createInstance);
sdk.register('tsol', Tsol.createInstance);
sdk.register('polygon', Polygon.createInstance);
sdk.register('tpolygon', Tpolygon.createInstance);
Erc20Token.createTokenConstructors().forEach(({ name, coinConstructor }) => {
  sdk.register(name, coinConstructor);
});

async function createWindow() {
  win = new BrowserWindow({
    title: 'Wallet Recovery Wizard',
    icon: join(ROOT_PATH.public, 'icon-256x256.png'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload,
    },
  });

  if (app.isPackaged) {
    await win.loadFile(indexHtml);
  } else {
    await win.loadURL(String(url));
    // win.webContents.openDevTools()
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString());
  });

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) void shell.openExternal(url);
    return { action: 'deny' };
  });

  // commands
  ipcMain.handle(
    'setBitGoEnvironment',
    async (event, coin, environment, apiKey) => {
      switch (coin) {
        case 'eth':
        case 'gteth':
        case 'ethw':
        case 'erc20':
        case 'gterc20':
        case 'avaxc':
        case 'tavaxc':
          sdk = new BitGoAPI({ env: environment, etherscanApiToken: apiKey });
          break;
        case 'polygon':
        case 'tpolygon':
          sdk = new BitGoAPI({ env: environment, polygonscanApiToken: apiKey });
          break;
        default:
          sdk = new BitGoAPI({ env: environment });
      }
      return await Promise.resolve();
    }
  );

  ipcMain.handle('recover', async (event, coin, parameters) => {
    const baseCoin = sdk.coin(coin) as AbstractUtxoCoin;
    return await baseCoin.recover(parameters);
  });

  ipcMain.handle('showSaveDialog', async (event, options) => {
    return await dialog.showSaveDialog(options);
  });

  ipcMain.handle('writeFile', async (event, file, data, options) => {
    return await fs.writeFile(file, data, options);
  });

  // queries

  ipcMain.handle('getVersion', () => {
    return app.getVersion();
  });

  ipcMain.handle('deriveKeyWithSeed', (event, coin, key, seed) => {
    return sdk.coin(coin).deriveKeyWithSeed({ key, seed });
  });

  ipcMain.handle('deriveKeyByPath', (event, key, id) => {
    const node = fromBase58(key);
    const derivedNode = node.derivePath(id);
    return derivedNode.toBase58();
  });

  ipcMain.handle('getChain', (event, coin) => {
    return sdk.coin(coin).getChain();
  });
}

void app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  win = null;
  if (process.platform !== 'darwin') app.quit();
});

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    void createWindow();
  }
});
