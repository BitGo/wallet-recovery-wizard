export type WalletType = 'cold' | 'hot';

export function getWalletTypeLabels(walletType: WalletType) {
  const userKeyLabel = walletType === 'cold' 
    ? 'User Public Key' 
    : 'Box A Value (Encrypted User Key)';
  
  const userKeyHelperText = walletType === 'cold'
    ? 'Your user public key, as found on your recovery KeyCard.'
    : 'The encrypted user key (Box A Value) as found on your recovery KeyCard.';

  const backupKeyLabel = walletType === 'cold' 
    ? 'Backup Public Key' 
    : 'Box B Value (Encrypted Backup Key)';
  
  const backupKeyHelperText = walletType === 'cold'
    ? 'The backup public key for the wallet, as found on your recovery KeyCard.'
    : 'The encrypted backup key (Box B Value) as found on your recovery KeyCard.';

  const bitgoKeyLabel = walletType === 'cold'
    ? 'BitGo Public Key'
    : 'Box C Value (BitGo Public Key)';

  const bitgoKeyHelperText = walletType === 'cold'
    ? 'The BitGo public key for the wallet, as found on your recovery KeyCard.'
    : 'The BitGo public key (Box C Value) for the wallet, as found on your recovery KeyCard.';

  const showWalletPassphrase = walletType === 'hot';

  return {
    userKeyLabel,
    userKeyHelperText,
    backupKeyLabel,
    backupKeyHelperText,
    bitgoKeyLabel,
    bitgoKeyHelperText,
    showWalletPassphrase,
  };
}

