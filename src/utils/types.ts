import { Ada, Tada } from '@bitgo-beta/sdk-coin-ada';
import { Dot, Tdot } from '@bitgo-beta/sdk-coin-dot';
import { Sol, Tsol } from '@bitgo-beta/sdk-coin-sol';

export type createAdaBroadcastableSweepTransactionParameters = Parameters<Ada['createBroadcastableSweepTransaction']>[0] | Parameters<Tada['createBroadcastableSweepTransaction']>[0];
export type createDotBroadcastableSweepTransactionParameters = Parameters<Dot['createBroadcastableSweepTransaction']>[0] | Parameters<Tdot['createBroadcastableSweepTransaction']>[0];
export type createSolBroadcastableSweepTransactionParameters = Parameters<Sol['createBroadcastableSweepTransaction']>[0] | Parameters<Tsol['createBroadcastableSweepTransaction']>[0];

export type BroadcastableSweepTransaction = Awaited<ReturnType<
  Ada['createBroadcastableSweepTransaction'] | Tada['createBroadcastableSweepTransaction'] |
  Dot['createBroadcastableSweepTransaction'] | Tdot['createBroadcastableSweepTransaction'] |
  Sol ['createBroadcastableSweepTransaction'] | Tsol['createBroadcastableSweepTransaction']
>>;
