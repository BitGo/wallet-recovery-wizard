/* eslint-disable @typescript-eslint/no-namespace */
// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';
import type {
  RecoverParams,
  BackupKeyRecoveryTransansaction,
  FormattedOfflineVaultTxInfo,
} from '@bitgo/abstract-utxo';

type Commands = {
  recover(
    coin: string,
    parameters: RecoverParams
  ): Promise<BackupKeyRecoveryTransansaction | FormattedOfflineVaultTxInfo>;
  setBitGoEnvironment(environment: 'prod' | 'test'): Promise<void>;
};

type Queries = {
  getBitGoEnvironments(): Promise<['prod', 'test']>;
};

const queries: Queries = {
  getBitGoEnvironments() {
    return ipcRenderer.invoke('getBitgoEnvironments');
  },
};

const commands: Commands = {
  recover(coin, parameters) {
    return ipcRenderer.invoke('recover', coin, parameters);
  },
  setBitGoEnvironment(environment) {
    return ipcRenderer.invoke('setBitgoEnvironment', environment);
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
