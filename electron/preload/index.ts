/* eslint-disable @typescript-eslint/no-namespace */
// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import type {
  BackupKeyRecoveryTransansaction,
  CrossChainRecoverySigned,
  CrossChainRecoveryUnsigned,
  FormattedOfflineVaultTxInfo,
  RecoverFromWrongChainOptions,
  RecoverParams,
} from '@bitgo/abstract-utxo';
import type {
  ConsolidationRecoveryOptions as TrxConsolidationRecoveryOptions,
  ConsolidationRecoveryBatch as TrxConsolidationRecoveryBatch,
} from '@bitgo/sdk-coin-trx';
import type { Chain, Hardfork } from '@ethereumjs/common';
import { contextBridge, ipcRenderer } from 'electron';
import type { ObjectEncodingOptions } from 'node:fs';
import {
  AdaRecoveryConsolidationRecoveryBatch,
  AdaRecoveryConsolidationRecoveryOptions,
  BroadcastableSweepTransaction,
  BroadcastTransactionResult,
  BroadcastTransactionOptions,
  createAdaBroadcastableSweepTransactionParameters,
  createDotBroadcastableSweepTransactionParameters,
  createSolBroadcastableSweepTransactionParameters,
  DotRecoverConsolidationRecoveryBatch,
  DotRecoveryConsolidationRecoveryOptions,
  SolRecoverConsolidationRecoveryBatch,
  SolRecoveryConsolidationRecoveryOptions,
} from '../types';

type User = { username: string };

type Commands = {
  broadcastTransaction(
    coin: string,
    options: BroadcastTransactionOptions
  ): Promise<Error | BroadcastTransactionResult>;
  createBroadcastableSweepTransaction(
    coin: string,
    parameters:
      | createAdaBroadcastableSweepTransactionParameters
      | createDotBroadcastableSweepTransactionParameters
      | createSolBroadcastableSweepTransactionParameters
  ): Promise<Error | BroadcastableSweepTransaction>;
  recoverConsolidations(
    coin: string,
    params:
      | TrxConsolidationRecoveryOptions
      | AdaRecoveryConsolidationRecoveryOptions
      | DotRecoveryConsolidationRecoveryOptions
      | SolRecoveryConsolidationRecoveryOptions
  ): Promise<
    | Error
    | TrxConsolidationRecoveryBatch
    | AdaRecoveryConsolidationRecoveryBatch
    | DotRecoverConsolidationRecoveryBatch
    | SolRecoverConsolidationRecoveryBatch
  >;
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
    parameters: RecoverParams & {
      rootAddress?: string;
      gasLimit?: number;
      gasPrice?: number;
      eip1559?: {
        maxFeePerGas: number;
        maxPriorityFeePerGas: number;
      };
      replayProtectionOptions?: {
        chain: 10001 | typeof Chain[keyof typeof Chain];
        hardfork: `${Hardfork}`;
      };
      walletContractAddress?: string;
      durableNonce?: {
        publicKey: string;
        secretKey: string;
      };
      tokenContractAddress?: string;
      startingScanIndex?: number;
    }
  ): Promise<BackupKeyRecoveryTransansaction | FormattedOfflineVaultTxInfo>;
  wrongChainRecover(
    sourceCoin: string,
    destinationCoin: string,
    parameters: RecoverFromWrongChainOptions
  ): Promise<Error | CrossChainRecoverySigned | CrossChainRecoveryUnsigned>;
  setBitGoEnvironment(
    environment: 'prod' | 'test',
    coin?: string,
    apiKey?: string
  ): Promise<void>;
  login(username: string, password: string, otp: string): Promise<Error | User>;
  logout(): Promise<Error | undefined>;
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
  getVersion(): Promise<string>;
  deriveKeyByPath(key: string, id: string): Promise<string>;
  getChain(coin: string): Promise<string>;
  getUser(): Promise<Error | User>;
  isSdkAuthenticated(): Promise<boolean>;
};

const queries: Queries = {
  getVersion() {
    return ipcRenderer.invoke('getVersion');
  },
  deriveKeyWithSeed(coin, key, seed) {
    return ipcRenderer.invoke('deriveKeyWithSeed', coin, key, seed);
  },
  deriveKeyByPath(key, id) {
    return ipcRenderer.invoke('deriveKeyByPath', key, id);
  },
  getChain(coin) {
    return ipcRenderer.invoke('getChain', coin);
  },
  getUser() {
    return ipcRenderer.invoke('getUser');
  },
  isSdkAuthenticated() {
    return ipcRenderer.invoke('isSdkAuthenticated');
  },
};

const commands: Commands = {
  broadcastTransaction(coin: string, options: BroadcastTransactionOptions) {
    return ipcRenderer.invoke('broadcastTransaction', coin, options);
  },
  createBroadcastableSweepTransaction(
    coin,
    parameters
  ): Promise<Error | BroadcastableSweepTransaction> {
    return ipcRenderer.invoke(
      'createBroadcastableSweepTransaction',
      coin,
      parameters
    );
  },
  recoverConsolidations(
    coin: string,
    params:
      | TrxConsolidationRecoveryOptions
      | AdaRecoveryConsolidationRecoveryOptions
      | DotRecoveryConsolidationRecoveryOptions
      | SolRecoveryConsolidationRecoveryOptions
  ): Promise<
    | Error
    | TrxConsolidationRecoveryBatch
    | AdaRecoveryConsolidationRecoveryBatch
    | DotRecoverConsolidationRecoveryBatch
    | SolRecoverConsolidationRecoveryBatch
  > {
    return ipcRenderer.invoke('recoverConsolidations', coin, params);
  },
  writeFile(file, data, options) {
    return ipcRenderer.invoke('writeFile', file, data, options);
  },
  showMessageBox(options) {
    return ipcRenderer.invoke('showMessageBox', options);
  },
  showSaveDialog(options) {
    return ipcRenderer.invoke('showSaveDialog', options);
  },
  recover(coin, parameters) {
    return ipcRenderer.invoke('recover', coin, parameters);
  },
  wrongChainRecover(sourceCoin, destinationCoin, parameters) {
    return ipcRenderer.invoke(
      'wrongChainRecover',
      sourceCoin,
      destinationCoin,
      parameters
    );
  },
  setBitGoEnvironment(environment, coin, apiKey) {
    return ipcRenderer.invoke('setBitGoEnvironment', environment, coin, apiKey);
  },
  login(username, password, otp) {
    return ipcRenderer.invoke('login', username, password, otp);
  },
  logout() {
    return ipcRenderer.invoke('logout');
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
          event: IpcMainInvokeEvent,
          ...args: TParameters<Commands[TChannel]>
        ) => ReturnType<Commands[TChannel]>
      ): void;
      handle<TChannel extends keyof Queries>(
        channel: TChannel,
        listener: (
          event: IpcMainInvokeEvent,
          ...args: TParameters<Queries[TChannel]>
        ) => ReturnType<Queries[TChannel]>
      ): void;
    }
  }
  interface Window {
    queries: Queries;
    commands: Commands;
  }
}
