import {
  getSolRecoveryGuideUrl,
  type SolRecoveryCoin,
} from '~/helpers/solanaRecoveryGuide';
import { Icon } from '../Icon';
import { Notice } from '../Notice';

export type SolanaRecoveryNoticeProps = {
  coin: SolRecoveryCoin;
};

export function SolanaRecoveryNotice({ coin }: SolanaRecoveryNoticeProps) {
  return (
    <Notice
      Variant="Secondary"
      IconLeft={<Icon Name="warning-sign" Size="small" />}
    >
      Solana transactions have a broadcast window of 60 seconds. By filling out
      the Durable Nonce: Public Key and Durable Nonce: Secret Key fields, you
      can extend this window. See the{' '}
      <a
        href={getSolRecoveryGuideUrl(coin)}
        target="_blank"
        rel="noreferrer"
        className="tw-text-blue-500 tw-underline"
      >
        Solana recovery guide
      </a>{' '}
      for full instructions.
    </Notice>
  );
}
