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

import type { Chain, Hardfork } from '@ethereumjs/common';
import type {
  MessageBoxOptions,
  MessageBoxReturnValue,
  SaveDialogOptions,
  SaveDialogReturnValue,
} from 'electron';
import type { ObjectEncodingOptions } from 'node:fs';
import {
  AdaRecoveryConsolidationRecoveryBatch,
  AdaRecoveryConsolidationRecoveryOptions,
  BroadcastableSweepTransaction,
  BroadcastTransactionResult,
  BroadcastTransactionOptions,
  createAdaBroadcastableSweepTransactionParameters,
  createDotBroadcastableSweepTransactionParameters,
  createTaoBroadcastableSweepTransactionParameters,
  createPolyxBroadcastableSweepTransactionParameters,
  createSolBroadcastableSweepTransactionParameters,
  createSuiBroadcastableSweepTransactionParameters,
  createIcpBroadcastableSweepTransactionParameters,
  createVetBroadcastableSweepTransactionParameters,
  createNearBroadcastableSweepTransactionParameters,
  createEthBroadcastableSweepTransactionParameters,
  createTonBroadcastableSweepTransactionParameters,
  DotRecoverConsolidationRecoveryBatch,
  TaoRecoverConsolidationRecoveryBatch,
  DotRecoveryConsolidationRecoveryOptions,
  TaoRecoveryConsolidationRecoveryOptions,
  SolRecoverConsolidationRecoveryBatch,
  SolRecoveryConsolidationRecoveryOptions,
  SuiRecoverConsolidationRecoveryBatch,
  SuiRecoveryConsolidationRecoveryOptions,
  TrxConsolidationRecoveryBatch,
  TrxConsolidationRecoveryOptions,
  RecoverWithPsbtParams,
  SignPsbtParams,
  SignPsbtResult,
} from '~/utils/types';
import type * as EthLikeCommon from '@ethereumjs/common';
import { EvmCcrNonBitgoCoinConfigType } from '~/helpers/config';

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
      | createTaoBroadcastableSweepTransactionParameters
      | createPolyxBroadcastableSweepTransactionParameters
      | createSolBroadcastableSweepTransactionParameters
      | createSuiBroadcastableSweepTransactionParameters
      | createIcpBroadcastableSweepTransactionParameters
      | createVetBroadcastableSweepTransactionParameters
      | createNearBroadcastableSweepTransactionParameters
      | createEthBroadcastableSweepTransactionParameters
      | createTonBroadcastableSweepTransactionParameters
  ): Promise<Error | BroadcastableSweepTransaction>;
  unlock(otp: string);
  sweepV1(coin: string, parameters);
  recoverConsolidations(
    coin: string,
    params:
      | TrxConsolidationRecoveryOptions
      | AdaRecoveryConsolidationRecoveryOptions
      | DotRecoveryConsolidationRecoveryOptions
      | TaoRecoveryConsolidationRecoveryOptions
      | SolRecoveryConsolidationRecoveryOptions
      | SuiRecoveryConsolidationRecoveryOptions
  ): Promise<
    | Error
    | TrxConsolidationRecoveryBatch
    | AdaRecoveryConsolidationRecoveryBatch
    | DotRecoverConsolidationRecoveryBatch
    | TaoRecoverConsolidationRecoveryBatch
    | SolRecoverConsolidationRecoveryBatch
    | SuiRecoverConsolidationRecoveryBatch
  >;
  writeFile(
    file: string,
    data: string,
    options?: ObjectEncodingOptions
  ): Promise<void>;
  showMessageBox(options: MessageBoxOptions): Promise<MessageBoxReturnValue>;
  showSaveDialog(options: SaveDialogOptions): Promise<SaveDialogReturnValue>;
  recoverNestedAta(
    coin: string,
    parameters: {
      userKey: string;
      backupKey: string;
      bitgoKey: string;
      walletPassphrase: string;
      recoveryDestination: string;
      nestedAtaAddress: string;
      ownerAtaAddress: string;
      tokenMintAddress: string;
      apiKey?: string;
      seed?: string;
    }
  ): Promise<{ txId?: string }>;
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
        chain: 10001 | 560048 | (typeof Chain)[keyof typeof Chain];
        hardfork: `${Hardfork}`;
      };
      walletContractAddress?: string;
      durableNonce?: {
        publicKey: string;
        secretKey: string;
      };
      tokenContractAddress?: string;
      startingScanIndex?: number;
      seed?: string;
      common?: EthLikeCommon.default;
      ethCommonParams?: EvmCcrNonBitgoCoinConfigType | undefined;
      isUnsignedSweep?: boolean;
      issuerAddress?: string; // eg. xrpl token
      currencyCode?: string; // eg. xrpl token
      reserveWithdrawal?: boolean; // xrp: delete the account and recover the full balance including reserve
      tokenId?: string; // eg. hbar token
      contractId?: string; // eg. stacks sip10 token
      programId?: string; // eg. solana spl 2022 token
      apiKey?: string; // eg. alchemy api key
      fullnodeRpcUrl?: string; // eg. custom fullnode rpc url
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
  recoverWithPsbt(
    coin: string,
    params: RecoverWithPsbtParams
  ): Promise<{ txHex: string }>;
  signPsbt(coin: string, params: SignPsbtParams): Promise<SignPsbtResult>;
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
