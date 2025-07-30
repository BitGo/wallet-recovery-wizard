import { TrxConsolidationRecoveryOptions } from '../types';
import coinFactory from '../coinFactory';
import EthereumCommon from '@ethereumjs/common';

process.env.DIST_ELECTRON = join(__dirname, '../..');
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist');
process.env.PUBLIC = app.isPackaged
  ? process.env.DIST
  : join(process.env.DIST_ELECTRON, '../public');

/* eslint-disable @typescript-eslint/unbound-method */
import { AbstractUtxoCoin } from '@bitgo/abstract-utxo';
import { BitGoAPI } from '@bitgo/sdk-api';
import { Ada, Tada } from '@bitgo/sdk-coin-ada';
import { Dot, Tdot } from '@bitgo/sdk-coin-dot';
import { AbstractEthLikeNewCoins } from '@bitgo/sdk-coin-eth';
import { Sol, Tsol, SolToken } from '@bitgo/sdk-coin-sol';
import { Trx, Ttrx, TrxToken } from '@bitgo/sdk-coin-trx';
import { BaseCoin } from '@bitgo/sdk-core';
import assert from 'assert';
import BIP32Factory from 'bip32';
import { BrowserWindow, app, dialog, ipcMain, shell } from 'electron';
import fs from 'node:fs/promises';
import { release } from 'os';
import { join } from 'path';
import * as ecc from 'tiny-secp256k1';
import { loadWebAssembly } from '@bitgo/sdk-opensslbytes';
import { Tao, Ttao } from '@bitgo/sdk-coin-tao';
import { CoinFeature, coins } from '@bitgo/statics';

const bip32 = BIP32Factory(ecc);

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

let win: BrowserWindow | null = null;
// Here, you can also use other preload
const preload = join(__dirname, '../preload/index.js');
const url = String(process.env.VITE_DEV_SERVER_URL);
const indexHtml = join(process.env.DIST, 'index.html');

let sdk = new BitGoAPI({
  env: 'test',
});

function handleSdkError(e: unknown): string {
  if (typeof e === 'string' && e !== null) {
    return e;
  } else if (
    typeof e === 'object' &&
    e !== null &&
    'message' in e &&
    typeof e.message === 'string'
  ) {
    return e.message;
  }
  return 'unknown sdk error';
}

function isAbstractUtxoCoin(coin: BaseCoin): coin is AbstractUtxoCoin {
  return coin instanceof AbstractUtxoCoin;
}

function assertsIsAbstractUtxoCoin(
  coin: BaseCoin
): asserts coin is AbstractUtxoCoin {
  assert(
    isAbstractUtxoCoin(coin),
    new Error(`coin ${coin.getChain()} is not an instance of AbstractUtxoCoin`)
  );
}

async function createWindow() {
  win = new BrowserWindow({
    title: 'Wallet Recovery Wizard',
    icon: join(process.env.PUBLIC, 'icon-256x256.png'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    // electron-vite-vue#298
    await win.loadURL(url);
    // Open devTool if the app is not packaged
    // win.webContents.openDevTools();
  } else {
    await win.loadFile(indexHtml);
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
  ipcMain.handle('login', async (event, username, password, otp) => {
    try {
      const res = (await sdk.authenticate({
        username,
        password,
        otp,
      })) as Error | { user: { username: string } };
      if (res instanceof Error) {
        return res;
      }
      return res.user as Error | { username: string };
    } catch (e: unknown) {
      return new Error(handleSdkError(e));
    }
  });

  ipcMain.handle('logout', async event => {
    try {
      await sdk.logout();
      return undefined;
    } catch (e: unknown) {
      return new Error(handleSdkError(e));
    }
  });

  ipcMain.handle(
    'setBitGoEnvironment',
    async (event, environment, coin, apiKey) => {
      await coinFactory.registerCoin(coin, sdk);

      if (coins.has(coin) && coins.get(coin).features.includes(CoinFeature.SHARED_EVM_SDK)) {
        sdk = new BitGoAPI({ env: environment, evm: { [coin]: { apiToken: apiKey} } });
        return await Promise.resolve();
      }

      switch (coin) {
        case 'eth':
        case 'hteth':
        case 'ethw':
        case 'erc20':
        case 'hterc20':
          sdk = new BitGoAPI({ env: environment, etherscanApiToken: apiKey });
          break;
        case 'avaxc':
        case 'tavaxc':
          sdk = new BitGoAPI({ env: environment });
          break;
        case 'arbeth':
        case 'tarbeth':
        case 'arbethToken':
        case 'tarbethToken':
          sdk = new BitGoAPI({ env: environment, arbiscanApiToken: apiKey });
          break;
        case 'coredao':
        case 'tcoredao':
          sdk = new BitGoAPI({ env: environment, coredaoExplorerApiToken: apiKey });
          break;
        case 'oas':
        case 'toas':
          sdk = new BitGoAPI({ env: environment, oasExplorerApiToken: apiKey });
          break;
        case 'opeth':
        case 'topeth':
        case 'opethToken':
        case 'topethToken':
          sdk = new BitGoAPI({
            env: environment,
            optimisticEtherscanApiToken: apiKey,
          });
          break;
        case 'polygon':
        case 'tpolygon':
        case 'polygonToken':
        case 'tpolygonToken':
          sdk = new BitGoAPI({ env: environment, polygonscanApiToken: apiKey });
          break;
        case 'bsc':
        case 'tbsc':
          sdk = new BitGoAPI({ env: environment, bscscanApiToken: apiKey });
        case 'flr':
        case 'tflr':
          sdk = new BitGoAPI({ env: environment, flrExplorerApiToken: apiKey });
        case 'sgb':
        case 'tsgb':
          sdk = new BitGoAPI({ env: environment, sgbExplorerApiToken: apiKey });
        case 'xdc':
        case 'txdc':
          sdk = new BitGoAPI({ env: environment, xdcExplorerApiToken: apiKey });
        case 'wemix':
        case 'twemix':
          sdk = new BitGoAPI({ env: environment, wemixExplorerApiToken: apiKey});
        case 'baseeth':
        case 'tbaseeth':
          sdk = new BitGoAPI({ env: environment, baseethApiToken: apiKey });
        case 'soneium':
        case 'tsoneium':
          sdk = new BitGoAPI({ env: environment, soneiumExplorerApiToken: apiKey });
          break;
        default:
          sdk = new BitGoAPI({ env: environment });
      }
      return await Promise.resolve();
    }
  );

  ipcMain.handle('recover', async (event, coin, parameters) => {
    const baseCoin = sdk.coin(coin) as AbstractEthLikeNewCoins;
    if (parameters.ethCommonParams) {
      parameters.common = EthereumCommon.custom({
        ...parameters.ethCommonParams,
      });
    }
    const openSSLBytes = loadWebAssembly().buffer;
    return await baseCoin.recover(
      {
        ...parameters,
        openSSLBytes,
      },
      openSSLBytes
    );
  });

  ipcMain.handle('broadcastTransaction', async (event, coin, parameters) => {
    const baseCoin = sdk.coin(coin);
    return await baseCoin.broadcastTransaction(parameters);
  });

  ipcMain.handle('recoverConsolidations', async (event, coin, params) => {
    try {
      switch (coin) {
        case 'ada':
        case 'tada':
        case 'dot':
        case 'tdot':
        case 'tao':
        case 'ttao':
        case 'sui':
        case 'tsui': {
          const mpcCoin = sdk.coin(coin) as Ada | Tada | Dot | Tdot | Tao | Ttao;
          return await mpcCoin.recoverConsolidations(params);
        }
        case 'sol':
        case 'tsol': {
          if (
            !('durableNonces' in params) ||
            params.durableNonces.publicKeys === undefined ||
            !params.durableNonces.publicKeys.length ||
            params.durableNonces.secretKey === undefined ||
            params.durableNonces.secretKey === ''
          ) {
            throw new Error(
              'Missing Durable Nonces for Solana Recovery Consolidation'
            );
          }
          const mpcCoin = sdk.coin(coin) as Sol | Tsol;
          return await mpcCoin.recoverConsolidations(params);
        }
        case 'trx':
        case 'ttrx': {
          // Batch Consolidations only implemented for Tron for now so have
          // to reference Trx Coin directly instead of Basecoin;
          const trxCoin = sdk.coin(coin) as Trx | Ttrx;
          return await trxCoin.recoverConsolidations(
            params as TrxConsolidationRecoveryOptions
          );
        }
        default:
          throw new Error(
            `Coin: ${coin} does not support consolidation recovery`
          );
      }
    } catch (e) {
      return new Error(handleSdkError(e));
    }
  });

  ipcMain.handle(
    'wrongChainRecover',
    async (event, sourceCoin, destinationCoin, parameters) => {
      try {
        const sourceBaseCoin = sdk.coin(sourceCoin);
        const destinationBaseCoin = sdk.coin(destinationCoin);
        assertsIsAbstractUtxoCoin(sourceBaseCoin);
        assertsIsAbstractUtxoCoin(destinationBaseCoin);
        parameters.recoveryCoin = destinationBaseCoin;
        return await sourceBaseCoin.recoverFromWrongChain(parameters);
      } catch (e) {
        return new Error(handleSdkError(e));
      }
    }
  );

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
    const node = bip32.fromBase58(key);
    const derivedNode = node.derivePath(id);
    return derivedNode.toBase58();
  });

  ipcMain.handle('getChain', (event, coin) => {
    return sdk.coin(coin).getChain();
  });

  ipcMain.handle('getUser', () => {
    try {
      return sdk.me();
    } catch (e: unknown) {
      return new Error(handleSdkError(e));
    }
  });

  ipcMain.handle('isSdkAuthenticated', async event => {
    const sdkJson = sdk.toJSON();
    return Promise.resolve(sdkJson.user || sdkJson.token);
  });

  ipcMain.handle(
    'createBroadcastableSweepTransaction',
    async (event, coin, parameters) => {
      const coinInstance = sdk.coin(coin) as BaseCoin;
      return coinInstance.createBroadcastableSweepTransaction(parameters);
    }
  );

  ipcMain.handle('unlock', async (event, otp) => {
    const response = await sdk.unlock({ otp });
    return response;
  });

  ipcMain.handle('sweepV1', async (event, coin, parameters) => {
    switch (coin) {
      case 'btc':
      case 'tbtc': {
        const coinInstance = sdk.coin(coin) as AbstractUtxoCoin;
        return await coinInstance.sweepV1(parameters);
      }
      default:
        return new Error(`Coin: ${coin} does not support v1 wallets sweep`);
    }
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
