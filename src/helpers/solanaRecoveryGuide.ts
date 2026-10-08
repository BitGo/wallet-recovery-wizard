const RECOVERY_GUIDE_BASE_URL =
  'https://github.com/BitGo/wallet-recovery-wizard/blob/master';

export type SolRecoveryCoin = 'sol' | 'tsol';

function isSolRecoveryCoin(coin: string): coin is SolRecoveryCoin {
  return coin === 'sol' || coin === 'tsol';
}

const SOL_RECOVERY_GUIDE_URLS: Record<SolRecoveryCoin, string> = {
  sol: `${RECOVERY_GUIDE_BASE_URL}/SOL_MAINNET_RECOVERY_GUIDE.md`,
  tsol: `${RECOVERY_GUIDE_BASE_URL}/SOL_DEVNET_RECOVERY_GUIDE.md`,
};

export function getSolRecoveryGuideUrl(coin: SolRecoveryCoin): string;
export function getSolRecoveryGuideUrl(coin: string): string | undefined;
export function getSolRecoveryGuideUrl(coin: string): string | undefined {
  return isSolRecoveryCoin(coin) ? SOL_RECOVERY_GUIDE_URLS[coin] : undefined;
}
