import {
  ConsolidationRecoveryBatch,
  ConsolidationRecoveryOptions,
} from '@bitgo/sdk-coin-trx';
import { Ada, Tada } from '@bitgo/sdk-coin-ada';
import { Dot, Tdot } from '@bitgo/sdk-coin-dot';
import { Sol, Tsol } from '@bitgo/sdk-coin-sol';
import { Hbar, Thbar } from '@bitgo/sdk-coin-hbar';

export type createAdaBroadcastableSweepTransactionParameters =
  | Parameters<Ada['createBroadcastableSweepTransaction']>[0]
  | Parameters<Tada['createBroadcastableSweepTransaction']>[0];
export type createDotBroadcastableSweepTransactionParameters =
  | Parameters<Dot['createBroadcastableSweepTransaction']>[0]
  | Parameters<Tdot['createBroadcastableSweepTransaction']>[0];
export type createSolBroadcastableSweepTransactionParameters =
  | Parameters<Sol['createBroadcastableSweepTransaction']>[0]
  | Parameters<Tsol['createBroadcastableSweepTransaction']>[0];

export type BroadcastableSweepTransaction = Awaited<
  ReturnType<
    | Ada['createBroadcastableSweepTransaction']
    | Tada['createBroadcastableSweepTransaction']
    | Dot['createBroadcastableSweepTransaction']
    | Tdot['createBroadcastableSweepTransaction']
    | Sol['createBroadcastableSweepTransaction']
    | Tsol['createBroadcastableSweepTransaction']
  >
>;

export type BroadcastTransactionOptions = Awaited<
  | Parameters<Hbar['broadcastTransaction']>[0]
  | Parameters<Thbar['broadcastTransaction']>[0]
>;

export type BroadcastTransactionResult = Awaited<
  ReturnType<Hbar['broadcastTransaction'] | Thbar['broadcastTransaction']>
>;

export type AdaRecoveryConsolidationRecoveryOptions =
  | Parameters<Ada['recoverConsolidations']>[0]
  | Parameters<Tada['recoverConsolidations']>[0];
export type DotRecoveryConsolidationRecoveryOptions =
  | Parameters<Dot['recoverConsolidations']>[0]
  | Parameters<Tdot['recoverConsolidations']>[0];
export type SolRecoveryConsolidationRecoveryOptions =
  | Parameters<Sol['recoverConsolidations']>[0]
  | Parameters<Tsol['recoverConsolidations']>[0];
export type TrxConsolidationRecoveryOptions = ConsolidationRecoveryOptions;

export type AdaRecoveryConsolidationRecoveryBatch = Awaited<
  ReturnType<Ada['recoverConsolidations'] | Tada['recoverConsolidations']>
>;
export type DotRecoverConsolidationRecoveryBatch = Awaited<
  ReturnType<Dot['recoverConsolidations'] | Tdot['recoverConsolidations']>
>;
export type SolRecoverConsolidationRecoveryBatch = Awaited<
  ReturnType<Sol['recoverConsolidations'] | Tsol['recoverConsolidations']>
>;
export type TrxConsolidationRecoveryBatch = ConsolidationRecoveryBatch;
