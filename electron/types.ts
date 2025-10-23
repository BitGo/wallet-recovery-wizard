import {
  ConsolidationRecoveryBatch,
  ConsolidationRecoveryOptions,
} from '@bitgo/sdk-coin-trx';
import { Ada, Tada } from '@bitgo/sdk-coin-ada';
import { Dot, Tdot } from '@bitgo/sdk-coin-dot';
import { Tao, Ttao } from '@bitgo/sdk-coin-tao';
import { Polyx, Tpolyx } from '@bitgo/sdk-coin-polyx';
import { Sol, Tsol } from '@bitgo/sdk-coin-sol';
import { Hbar, Thbar } from '@bitgo/sdk-coin-hbar';
import { Algo, Talgo } from '@bitgo/sdk-coin-algo';
import { Sui, Tsui } from '@bitgo/sdk-coin-sui';
import { Icp, Ticp } from '@bitgo/sdk-coin-icp';
import { Near, TNear } from '@bitgo/sdk-coin-near';
import { Eth, Hteth } from '@bitgo/sdk-coin-eth';
import { Flr, Tflr } from '@bitgo/sdk-coin-flr';
import { Wemix, Twemix } from '@bitgo/sdk-coin-wemix';
import { Xdc, Txdc } from '@bitgo/sdk-coin-xdc';
import { Sgb, Tsgb } from '@bitgo/sdk-coin-sgb';
import { Oas, Toas } from '@bitgo/sdk-coin-oas';
import { Coredao, Tcoredao } from '@bitgo/sdk-coin-coredao';
import { Polygon, Tpolygon } from '@bitgo/sdk-coin-polygon';
import { Bsc, Tbsc } from '@bitgo/sdk-coin-bsc';
import { Ton, Tton } from '@bitgo/sdk-coin-ton';
import { Vet, Tvet } from '@bitgo-beta/sdk-coin-vet';

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
  >
>;

export type BroadcastTransactionOptions = Awaited<
  | Parameters<Hbar['broadcastTransaction']>[0]
  | Parameters<Thbar['broadcastTransaction']>[0]
  | Parameters<Algo['broadcastTransaction']>[0]
  | Parameters<Talgo['broadcastTransaction']>[0]
  | Parameters<Sui['broadcastTransaction']>[0]
  | Parameters<Tsui['broadcastTransaction']>[0]
  | Parameters<Near['broadcastTransaction']>[0]
  | Parameters<TNear['broadcastTransaction']>[0]
  | Parameters<Eth['broadcastTransaction']>[0]
  | Parameters<Hteth['broadcastTransaction']>[0]
  | Parameters<Flr['broadcastTransaction']>[0]
  | Parameters<Tflr['broadcastTransaction']>[0]
  | Parameters<Wemix['broadcastTransaction']>[0]
  | Parameters<Twemix['broadcastTransaction']>[0]
  | Parameters<Xdc['broadcastTransaction']>[0]
  | Parameters<Txdc['broadcastTransaction']>[0]
  | Parameters<Sgb['broadcastTransaction']>[0]
  | Parameters<Tsgb['broadcastTransaction']>[0]
  | Parameters<Oas['broadcastTransaction']>[0]
  | Parameters<Toas['broadcastTransaction']>[0]
  | Parameters<Coredao['broadcastTransaction']>[0]
  | Parameters<Tcoredao['broadcastTransaction']>[0]
  | Parameters<Polygon['broadcastTransaction']>[0]
  | Parameters<Tpolygon['broadcastTransaction']>[0]
  | Parameters<Bsc['broadcastTransaction']>[0]
  | Parameters<Icp['broadcastTransaction']>[0]
  | Parameters<Ticp['broadcastTransaction']>[0]
  | Parameters<Tbsc['broadcastTransaction']>[0]
  | Parameters<Ton['broadcastTransaction']>[0]
  | Parameters<Tton['broadcastTransaction']>[0]
  | Parameters<Vet['broadcastTransaction']>[0]
  | Parameters<Tvet['broadcastTransaction']>[0]
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
  ReturnType<Tao['recoverConsolidations'] | Ttao['recoverConsolidations']>
>;
export type SolRecoverConsolidationRecoveryBatch = Awaited<
  ReturnType<Sol['recoverConsolidations'] | Tsol['recoverConsolidations']>
>;
export type SuiRecoverConsolidationRecoveryBatch = Awaited<
  ReturnType<Sui['recoverConsolidations'] | Tsui['recoverConsolidations']>
>;
export type TrxConsolidationRecoveryBatch = ConsolidationRecoveryBatch;
