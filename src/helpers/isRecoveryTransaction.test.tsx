import { isRecoveryTransaction } from './index';

const BLOCKCHAIR_API_KEY = '';

const recoverInfo = {
  btc: {
    userKey: '',
    backupKey: '',
    bitgoKey: '',
    walletPassphrase: '',
    recoveryDestination: '',
  },
  ltc: {
    userKey: '',
    backupKey: '',
    bitgoKey: '',
    walletPassphrase: '',
    recoveryDestination: '',
  },
};

describe('isRecoveryTransaction()', () => {
  it('validates btc recovery', async () => {
    const recoverPayload = await window.commands.recover('btc', {
      ...recoverInfo.btc,
      ignoreAddressTypes: ['p2wsh'],
    });
    expect(isRecoveryTransaction(recoverPayload)).toBe(true);
  });
  it('validates ltc recovery', async () => {
    const recoverPayload = await window.commands.recover('btc', {
      ...recoverInfo.btc,
      ignoreAddressTypes: [],
      apiKey: BLOCKCHAIR_API_KEY,
    });
    expect(isRecoveryTransaction(recoverPayload)).toBe(true);
  });
});
