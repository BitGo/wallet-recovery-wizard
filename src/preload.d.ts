/* eslint-disable @typescript-eslint/no-namespace */
// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';
import type {
  RecoverParams,
  BackupKeyRecoveryTransansaction,
  FormattedOfflineVaultTxInfo,
} from '@bitgo/abstract-utxo';
import type { ObjectEncodingOptions } from 'node:fs';
import type { Hardfork, Chain } from '@ethereumjs/common';

type Commands = {
  writeFile(
    file: string,
    data: string,
    options?: ObjectEncodingOptions
  ): Promise<void>;
  showMessageBox(
    options: Electron.MessageBoxOptions
  ): Promise<Electron.MessageBoxReturnValue>;
  showSaveDialog(
    options: Electron.SaveDialogOptions
  ): Promise<Electron.SaveDialogReturnValue>;
  recover(
    coin: string,
    token: string | undefined,
    parameters: RecoverParams & {
      rootAddress?: string;
      gasLimit?: number;
      eip1559?: {
        maxFeePerGas: number;
        maxPriorityFeePerGas: number;
      };
      replayProtectionOptions?: {
        chain: typeof Chain[keyof typeof Chain];
        hardfork: `${Hardfork}`;
      };
      walletContractAddress?: string;
      tokenContractAddress?: string;
    }
  ): Promise<BackupKeyRecoveryTransansaction | FormattedOfflineVaultTxInfo>;
  setBitGoEnvironment(
    environment: 'prod' | 'test',
    apiKey?: string
  ): Promise<void>;
};

type Queries = {
  deriveKeyWithSeed(
    coin: string,
    key: string,
    seed: string
  ): Promise<{
    key: string;
    derivationPath: string;
  }>;
  deriveKeyByPath(key: string, id: string): Promise<string>;
  getChain(coin: string, token?: string): Promise<string>;
};

const queries: Queries = {
  deriveKeyWithSeed(coin, key, seed) {
    return ipcRenderer.invoke('deriveKeyWithSeed', coin, key, seed);
  },
  deriveKeyByPath(key, id) {
    return ipcRenderer.invoke('deriveKeyByPath', key, id);
  },
  getChain(coin, token) {
    return ipcRenderer.invoke('getChain', coin, token);
  },
};

const commands: Commands = {
  writeFile(file, data, options) {
    return ipcRenderer.invoke('writeFile', file, data, options);
  },
  showMessageBox(options) {
    return ipcRenderer.invoke('showMessageBox', options);
  },
  showSaveDialog(options) {
    return ipcRenderer.invoke('showSaveDialog', options);
  },
  recover(coin, token, parameters) {
    return ipcRenderer.invoke('recover', coin, token, parameters);
  },
  setBitGoEnvironment(environment, apiKey) {
    return ipcRenderer.invoke('setBitgoEnvironment', environment, apiKey);
  },
};

contextBridge.exposeInMainWorld('commands', commands);
contextBridge.exposeInMainWorld('queries', queries);

// This is needed due to collisions of Electron.Parameters in the Electron namespace
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TParameters<T extends (...args: any) => any> = Parameters<T>;

declare global {
  namespace Electron {
    export interface IpcRenderer {
      invoke<TChannel extends keyof Commands>(
        channel: TChannel,
        ...args: TParameters<Commands[TChannel]>
      ): ReturnType<Commands[TChannel]>;
      invoke<TChannel extends keyof Queries>(
        channel: TChannel,
        ...args: TParameters<Queries[TChannel]>
      ): ReturnType<Queries[TChannel]>;
    }
    export interface IpcMain {
      handle<TChannel extends keyof Commands>(
        channel: TChannel,
        listener: (
          event: IpcMainEvent,
          ...args: TParameters<Commands[TChannel]>
        ) => void
      ): void;
      handle<TChannel extends keyof Queries>(
        channel: TChannel,
        listener: (
          event: IpcMainEvent,
          ...args: TParameters<Queries[TChannel]>
        ) => void
      ): void;
    }
  }
  interface Window {
    queries: Queries;
    commands: Commands;
  }
}
