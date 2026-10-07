import { describe, expect, it } from 'vitest';
import { getSolRecoveryGuideUrl } from './solanaRecoveryGuide';

describe('getSolRecoveryGuideUrl', () => {
  it('maps sol to the mainnet recovery guide', () => {
    expect(getSolRecoveryGuideUrl('sol')).toBe(
      'https://github.com/BitGo/wallet-recovery-wizard/blob/master/SOL_MAINNET_RECOVERY_GUIDE.md'
    );
  });

  it('maps tsol to the devnet recovery guide', () => {
    expect(getSolRecoveryGuideUrl('tsol')).toBe(
      'https://github.com/BitGo/wallet-recovery-wizard/blob/master/SOL_DEVNET_RECOVERY_GUIDE.md'
    );
  });

  it('returns undefined for non-Solana coins', () => {
    expect(getSolRecoveryGuideUrl('btc')).toBeUndefined();
  });
});
