import { Ada, Tada } from '@bitgo/sdk-coin-ada';
import { Dot, Tdot } from '@bitgo/sdk-coin-dot';
import { Tao, Ttao } from '@bitgo/sdk-coin-tao';
import { Polyx, Tpolyx } from '@bitgo/sdk-coin-polyx';
import { Sol, Tsol } from '@bitgo/sdk-coin-sol';
import { Icp, Ticp } from '@bitgo/sdk-coin-icp';
import { Vet, Tvet } from '@bitgo-beta/sdk-coin-vet';
import {
  ConsolidationRecoveryBatch,
  ConsolidationRecoveryOptions,
} from '@bitgo/sdk-coin-trx';
import { Hbar, Thbar } from '@bitgo/sdk-coin-hbar';
import { Algo, Talgo } from '@bitgo/sdk-coin-algo';
import { Sui, Tsui } from '@bitgo/sdk-coin-sui';

export type createAdaBroadcastableSweepTransactionParameters =
  | Parameters<Ada['createBroadcastableSweepTransaction']>[0]
  | Parameters<Tada['createBroadcastableSweepTransaction']>[0];
export type createDotBroadcastableSweepTransactionParameters =
  | Parameters<Dot['createBroadcastableSweepTransaction']>[0]
  | Parameters<Tdot['createBroadcastableSweepTransaction']>[0];
export type createTaoBroadcastableSweepTransactionParameters =
  | Parameters<Tao['createBroadcastableSweepTransaction']>[0]
  | Parameters<Ttao['createBroadcastableSweepTransaction']>[0];
export type createPolyxBroadcastableSweepTransactionParameters =
  | Parameters<Polyx['createBroadcastableSweepTransaction']>[0]
  | Parameters<Tpolyx['createBroadcastableSweepTransaction']>[0];
export type createSolBroadcastableSweepTransactionParameters =
  | Parameters<Sol['createBroadcastableSweepTransaction']>[0]
  | Parameters<Tsol['createBroadcastableSweepTransaction']>[0];
export type createSuiBroadcastableSweepTransactionParameters =
  | Parameters<Sui['createBroadcastableSweepTransaction']>[0]
  | Parameters<Tsui['createBroadcastableSweepTransaction']>[0];
export type createIcpBroadcastableSweepTransactionParameters =
  | Parameters<Icp['createBroadcastableSweepTransaction']>[0]
  | Parameters<Ticp['createBroadcastableSweepTransaction']>[0];
export type createVetBroadcastableSweepTransactionParameters =
  | Parameters<Vet['createBroadcastableSweepTransaction']>[0]
  | Parameters<Tvet['createBroadcastableSweepTransaction']>[0];

export type BroadcastableSweepTransaction = Awaited<
  ReturnType<
    | Ada['createBroadcastableSweepTransaction']
    | Tada['createBroadcastableSweepTransaction']
    | Dot['createBroadcastableSweepTransaction']
    | Tdot['createBroadcastableSweepTransaction']
    | Tao['createBroadcastableSweepTransaction']
    | Ttao['createBroadcastableSweepTransaction']
    | Polyx['createBroadcastableSweepTransaction']
    | Tpolyx['createBroadcastableSweepTransaction']
    | Sol['createBroadcastableSweepTransaction']
    | Tsol['createBroadcastableSweepTransaction']
    | Sui['createBroadcastableSweepTransaction']
    | Tsui['createBroadcastableSweepTransaction']
    | Icp['createBroadcastableSweepTransaction']
    | Ticp['createBroadcastableSweepTransaction']
    | Vet['createBroadcastableSweepTransaction']
    | Tvet['createBroadcastableSweepTransaction']
  >
>;

export type suiBroadcastTransactionParameters =
  | Parameters<Sui['broadcastTransaction']>[0]
  | Parameters<Tsui['broadcastTransaction']>[0];

export type BroadcastTransactionOptions = Awaited<
  | Parameters<Hbar['broadcastTransaction']>[0]
  | Parameters<Thbar['broadcastTransaction']>[0]
  | Parameters<Algo['broadcastTransaction']>[0]
  | Parameters<Talgo['broadcastTransaction']>[0]
  | Parameters<Sui['broadcastTransaction']>[0]
  | Parameters<Tsui['broadcastTransaction']>[0]
>;

export type BroadcastTransactionResult = Awaited<
  ReturnType<
    | Hbar['broadcastTransaction']
    | Thbar['broadcastTransaction']
    | Algo['broadcastTransaction']
    | Talgo['broadcastTransaction']
    | Sui['broadcastTransaction']
    | Tsui['broadcastTransaction']>
>;

export type AdaRecoveryConsolidationRecoveryOptions =
  | Parameters<Ada['recoverConsolidations']>[0]
  | Parameters<Tada['recoverConsolidations']>[0];
export type DotRecoveryConsolidationRecoveryOptions =
  | Parameters<Dot['recoverConsolidations']>[0]
  | Parameters<Tdot['recoverConsolidations']>[0];
export type TaoRecoveryConsolidationRecoveryOptions =
  | Parameters<Tao['recoverConsolidations']>[0]
  | Parameters<Ttao['recoverConsolidations']>[0];
export type SolRecoveryConsolidationRecoveryOptions =
  | Parameters<Sol['recoverConsolidations']>[0]
  | Parameters<Tsol['recoverConsolidations']>[0];
export type SuiRecoveryConsolidationRecoveryOptions =
  | Parameters<Sui['recoverConsolidations']>[0]
  | Parameters<Tsui['recoverConsolidations']>[0];
export type TrxConsolidationRecoveryOptions = ConsolidationRecoveryOptions;

export type AdaRecoveryConsolidationRecoveryBatch = Awaited<
  ReturnType<Ada['recoverConsolidations'] | Tada['recoverConsolidations']>
>;
export type DotRecoverConsolidationRecoveryBatch = Awaited<
  ReturnType<Dot['recoverConsolidations'] | Tdot['recoverConsolidations']>
>;
export type TaoRecoverConsolidationRecoveryBatch = Awaited<
  ReturnType<Tao['recoverConsolidations'] | Tdot['recoverConsolidations']>
>;
export type SolRecoverConsolidationRecoveryBatch = Awaited<
  ReturnType<Sol['recoverConsolidations'] | Tsol['recoverConsolidations']>
>;
export type SuiRecoverConsolidationRecoveryBatch = Awaited<
  ReturnType<Sui['recoverConsolidations'] | Tsui['recoverConsolidations']>
>;
export type TrxConsolidationRecoveryBatch = ConsolidationRecoveryBatch;
