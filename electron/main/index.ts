import { TrxConsolidationRecoveryOptions } from '../types';
import EthereumCommon from '@ethereumjs/common';

process.env.DIST_ELECTRON = join(__dirname, '../..');
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist');
process.env.PUBLIC = app.isPackaged
  ? process.env.DIST
  : join(process.env.DIST_ELECTRON, '../public');

/* eslint-disable @typescript-eslint/unbound-method */
import { Atom, Tatom } from '@bitgo/sdk-coin-atom';
import { Asi, Tasi } from '@bitgo/sdk-coin-asi';
import { Arbeth, Tarbeth, ArbethToken } from '@bitgo/sdk-coin-arbeth';
import { Bld, Tbld } from '@bitgo/sdk-coin-bld';
import { Coreum, Tcoreum } from '@bitgo/sdk-coin-coreum';
import { Coredao, Tcoredao } from '@bitgo/sdk-coin-coredao';
import { CosmosSharedCoin } from '@bitgo/sdk-coin-cosmos';
import { Cronos, Tcronos } from '@bitgo/sdk-coin-cronos';
import { Hash, Thash } from '@bitgo/sdk-coin-hash';
import { Injective, Tinjective } from '@bitgo/sdk-coin-injective';
import { Initia, Tinitia } from '@bitgo/sdk-coin-initia';
import { Sei, Tsei } from '@bitgo/sdk-coin-sei';
import { Tia, Ttia } from '@bitgo/sdk-coin-tia';
import { AbstractUtxoCoin } from '@bitgo/abstract-utxo';
import { BitGoAPI } from '@bitgo/sdk-api';
import { Ada, Tada } from '@bitgo/sdk-coin-ada';
import { AvaxC, TavaxC, AvaxCToken } from '@bitgo/sdk-coin-avaxc';
import { Bch } from '@bitgo/sdk-coin-bch';
import { Bcha } from '@bitgo/sdk-coin-bcha';
import { Bsv } from '@bitgo/sdk-coin-bsv';
import { Btc, Tbtc } from '@bitgo/sdk-coin-btc';
import { Btg } from '@bitgo/sdk-coin-btg';
import { Dash } from '@bitgo/sdk-coin-dash';
import { Doge, Tdoge } from '@bitgo/sdk-coin-doge';
import { Dot, Tdot } from '@bitgo/sdk-coin-dot';
import { Eos, Teos } from '@bitgo/sdk-coin-eos';
import {
  AbstractEthLikeNewCoins,
  Erc20Token,
  Eth,
  Hteth,
} from '@bitgo/sdk-coin-eth';
import { Ethw } from '@bitgo/sdk-coin-ethw';
import { Etc, Tetc } from '@bitgo/sdk-coin-etc';
import { Flr, Tflr } from '@bitgo/sdk-coin-flr';
import { Ltc } from '@bitgo/sdk-coin-ltc';
import { Near, TNear, Nep141Token } from '@bitgo/sdk-coin-near';
import { Oas, Toas } from '@bitgo/sdk-coin-oas';
import { Opeth, Topeth, OpethToken } from '@bitgo/sdk-coin-opeth';
import { Osmo, Tosmo } from '@bitgo/sdk-coin-osmo';
import { Polygon, Tpolygon, PolygonToken } from '@bitgo/sdk-coin-polygon';
import { Rune, Trune } from '@bitgo/sdk-coin-rune';
import { Baby, Tbaby } from '@bitgo/sdk-coin-baby';
import { Sol, Tsol, SolToken } from '@bitgo/sdk-coin-sol';
import { Sgb, Tsgb } from '@bitgo/sdk-coin-sgb';
import { Trx, Ttrx, TrxToken } from '@bitgo/sdk-coin-trx';
import { Txlm, Xlm } from '@bitgo/sdk-coin-xlm';
import { Txrp, Xrp, XrpToken } from '@bitgo/sdk-coin-xrp';
import { Zec } from '@bitgo/sdk-coin-zec';
import { Zeta, Tzeta } from '@bitgo/sdk-coin-zeta';
import { Bsc, Tbsc } from '@bitgo/sdk-coin-bsc';
import { BaseCoin } from '@bitgo/sdk-core';
import assert from 'assert';
import BIP32Factory from 'bip32';
import { BrowserWindow, app, dialog, ipcMain, shell } from 'electron';
import fs from 'node:fs/promises';
import { release } from 'os';
import { join } from 'path';
import * as ecc from 'tiny-secp256k1';
import { Hbar, Thbar, HbarToken } from '@bitgo/sdk-coin-hbar';
import { Algo, Talgo } from '@bitgo/sdk-coin-algo';
import { EthLikeCoin, TethLikeCoin } from '@bitgo/sdk-coin-ethlike';
import { Sui, Tsui } from '@bitgo/sdk-coin-sui';
import { loadWebAssembly } from '@bitgo/sdk-opensslbytes';
import { Xdc, Txdc } from '@bitgo/sdk-coin-xdc';
import { Wemix, Twemix } from '@bitgo/sdk-coin-wemix';
import { Tao, Ttao } from '@bitgo/sdk-coin-tao';
import { Icp, Ticp } from '@bitgo/sdk-coin-icp';
import { Stx, Tstx, Sip10Token } from '@bitgo/sdk-coin-stx';
import { Soneium, Tsoneium } from '@bitgo/sdk-coin-soneium';
import { Polyx, Tpolyx } from '@bitgo/sdk-coin-polyx';
import { Vet, Tvet, VetToken } from '@bitgo-beta/sdk-coin-vet';
import { registerAll as EVMCoinRegisterAll } from '@bitgo/sdk-coin-evm';
import { CoinFeature, coins } from '@bitgo/statics';
import { Xtz, Txtz } from '@bitgo/sdk-coin-xtz';

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

sdk.register('btc', Btc.createInstance);
sdk.register('tbtc', Tbtc.createInstance);
sdk.register('eth', Eth.createInstance);
sdk.register('hteth', Hteth.createInstance);
sdk.register('ethw', Ethw.createInstance);
sdk.register('etc', Etc.createInstance);
sdk.register('tetc', Tetc.createInstance);
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
sdk.register('arbeth', Arbeth.createInstance);
sdk.register('tarbeth', Tarbeth.createInstance);
sdk.register('opeth', Opeth.createInstance);
sdk.register('topeth', Topeth.createInstance);
sdk.register('near', Near.createInstance);
sdk.register('tnear', TNear.createInstance);
sdk.register('dot', Dot.createInstance);
sdk.register('tdot', Tdot.createInstance);
sdk.register('tao', Tao.createInstance);
sdk.register('ttao', Ttao.createInstance);
sdk.register('sol', Sol.createInstance);
sdk.register('tsol', Tsol.createInstance);
sdk.register('polygon', Polygon.createInstance);
sdk.register('tpolygon', Tpolygon.createInstance);
sdk.register('bsc', Bsc.createInstance);
sdk.register('tbsc', Tbsc.createInstance);
sdk.register('doge', Doge.createInstance);
sdk.register('tdoge', Tdoge.createInstance);
sdk.register('ada', Ada.createInstance);
sdk.register('tada', Tada.createInstance);
sdk.register('atom', Atom.createInstance);
sdk.register('tatom', Tatom.createInstance);
sdk.register('asi', Asi.createInstance);
sdk.register('tasi', Tasi.createInstance);
sdk.register('osmo', Osmo.createInstance);
sdk.register('tosmo', Tosmo.createInstance);
sdk.register('tia', Tia.createInstance);
sdk.register('ttia', Ttia.createInstance);
sdk.register('injective', Injective.createInstance);
sdk.register('tinjective', Tinjective.createInstance);
sdk.register('initia', Initia.createInstance);
sdk.register('tinitia', Tinitia.createInstance);
sdk.register('bld', Bld.createInstance);
sdk.register('tbld', Tbld.createInstance);
sdk.register('hash', Hash.createInstance);
sdk.register('thash', Thash.createInstance);
sdk.register('sei', Sei.createInstance);
sdk.register('tsei', Tsei.createInstance);
sdk.register('zeta', Zeta.createInstance);
sdk.register('tzeta', Tzeta.createInstance);
sdk.register('coreum', Coreum.createInstance);
sdk.register('tcoreum', Tcoreum.createInstance);
sdk.register('cronos', Cronos.createInstance);
sdk.register('tcronos', Tcronos.createInstance);
sdk.register('mantra', CosmosSharedCoin.createInstance);
sdk.register('tmantra', CosmosSharedCoin.createInstance);
sdk.register('hbar', Hbar.createInstance);
sdk.register('thbar', Thbar.createInstance);
sdk.register('algo', Algo.createInstance);
sdk.register('talgo', Talgo.createInstance);
sdk.register('baseeth', EthLikeCoin.createInstance);
sdk.register('tbaseeth', TethLikeCoin.createInstance);
sdk.register('sui', Sui.createInstance);
sdk.register('tsui', Tsui.createInstance);
sdk.register('thorchain:rune', Rune.createInstance);
sdk.register('tthorchain:rune', Trune.createInstance);
sdk.register('baby', Baby.createInstance);
sdk.register('tbaby', Tbaby.createInstance);
sdk.register('coredao', Coredao.createInstance);
sdk.register('tcoredao', Tcoredao.createInstance);
sdk.register('oas', Oas.createInstance);
sdk.register('toas', Toas.createInstance);
sdk.register('flr', Flr.createInstance);
sdk.register('tflr', Tflr.createInstance);
sdk.register('sgb', Sgb.createInstance);
sdk.register('tsgb', Tsgb.createInstance);
sdk.register('xdc', Xdc.createInstance);
sdk.register('txdc', Txdc.createInstance);
sdk.register('wemix', Wemix.createInstance);
sdk.register('twemix', Twemix.createInstance);
sdk.register('icp', Icp.createInstance);
sdk.register('ticp', Ticp.createInstance);
sdk.register('vet', Vet.createInstance);
sdk.register('tvet', Tvet.createInstance);
sdk.register('stx', Stx.createInstance);
sdk.register('tstx', Tstx.createInstance);
sdk.register('soneium', Soneium.createInstance);
sdk.register('tsoneium', Tsoneium.createInstance);
sdk.register('polyx', Polyx.createInstance);
sdk.register('tpolyx', Tpolyx.createInstance);
sdk.register('xtz', Xtz.createInstance);
sdk.register('txtz', Txtz.createInstance);
EVMCoinRegisterAll(sdk);

Erc20Token.createTokenConstructors().forEach(({ name, coinConstructor }) => {
  sdk.register(name, coinConstructor);
});
AvaxCToken.createTokenConstructors().forEach(({ name, coinConstructor }) => {
  sdk.register(name, coinConstructor);
});
ArbethToken.createTokenConstructors().forEach(({ name, coinConstructor }) => {
  sdk.register(name, coinConstructor);
});
OpethToken.createTokenConstructors().forEach(({ name, coinConstructor }) => {
  sdk.register(name, coinConstructor);
});
PolygonToken.createTokenConstructors().forEach(({ name, coinConstructor }) => {
  sdk.register(name, coinConstructor);
});
SolToken.createTokenConstructors().forEach(({ name, coinConstructor }) => {
  sdk.register(name, coinConstructor);
});
TrxToken.createTokenConstructors().forEach(({ name, coinConstructor }) => {
  sdk.register(name, coinConstructor);
});
XrpToken.createTokenConstructors().forEach(({ name, coinConstructor }) => {
  sdk.register(name, coinConstructor);
});
HbarToken.createTokenConstructors().forEach(({ name, coinConstructor }) => {
  sdk.register(name, coinConstructor);
});
Sip10Token.createTokenConstructors().forEach(({ name, coinConstructor }) => {
  sdk.register(name, coinConstructor);
});
Nep141Token.createTokenConstructors().forEach(({ name, coinConstructor }) => {
  sdk.register(name, coinConstructor);
});
VetToken.createTokenConstructors().forEach(({ name, coinConstructor }) => {
  sdk.register(name, coinConstructor);
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
      if (
        coins.has(coin) &&
        coins.get(coin).features.includes(CoinFeature.SHARED_EVM_SDK)
      ) {
        sdk = new BitGoAPI({
          env: environment,
          evm: { [coin]: { apiToken: apiKey } },
        });
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
          sdk = new BitGoAPI({
            env: environment,
            coredaoExplorerApiToken: apiKey,
          });
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
          sdk = new BitGoAPI({
            env: environment,
            wemixExplorerApiToken: apiKey,
          });
        case 'baseeth':
        case 'tbaseeth':
          sdk = new BitGoAPI({ env: environment, baseethApiToken: apiKey });
        case 'soneium':
        case 'tsoneium':
          sdk = new BitGoAPI({
            env: environment,
            soneiumExplorerApiToken: apiKey,
          });
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
          const mpcCoin = sdk.coin(coin) as
            | Ada
            | Tada
            | Dot
            | Tdot
            | Tao
            | Ttao;
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
