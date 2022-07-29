import { INonBitgoRecoveriesFormValues } from './non-bitgo-recoveries-form';

export const krsProviders = [
  {
    label: 'None',
    value: undefined,
  },
  {
    label: 'Keyternal',
    value: 'keyternal',
  },
  {
    label: 'BitGo KRS',
    value: 'bitgoKRSv2',
  },
  {
    label: 'Coincover',
    value: 'dai', // Coincover used to be called 'DAI' and so on the backend, BitGo still refers to them as 'dai'
  },
];

export const displayedParams = {
  btc: ['userKey', 'backupKey', 'bitgoKey', 'walletPassphrase', 'recoveryDestination', 'scan'],
  bsv: ['userKey', 'backupKey', 'bitgoKey', 'walletPassphrase', 'recoveryDestination', 'scan', 'apiKey'],
  bch: ['userKey', 'backupKey', 'bitgoKey', 'walletPassphrase', 'recoveryDestination', 'scan', 'apiKey'],
  bcha: ['userKey', 'backupKey', 'bitgoKey', 'walletPassphrase', 'recoveryDestination', 'scan', 'apiKey'],
  ltc: ['userKey', 'backupKey', 'bitgoKey', 'walletPassphrase', 'recoveryDestination', 'scan', 'apiKey'],
  btg: ['userKey', 'backupKey', 'bitgoKey', 'walletPassphrase', 'recoveryDestination', 'scan', 'apiKey'],
  zec: ['userKey', 'backupKey', 'bitgoKey', 'walletPassphrase', 'recoveryDestination', 'scan', 'apiKey'],
  dash: ['userKey', 'backupKey', 'bitgoKey', 'walletPassphrase', 'recoveryDestination', 'scan', 'apiKey'],
  eth: [
    'userKey',
    'backupKey',
    'walletContractAddress',
    'walletPassphrase',
    'recoveryDestination',
    'apiKey',
    'gasLimit',
    'maxFeePerGas',
    'maxPriorityFeePerGas',
  ],
  xrp: ['userKey', 'backupKey', 'rootAddress', 'walletPassphrase', 'recoveryDestination'],
  xlm: ['userKey', 'backupKey', 'rootAddress', 'walletPassphrase', 'recoveryDestination'],
  trx: ['userKey', 'backupKey', 'bitgoKey', 'walletPassphrase', 'recoveryDestination'],
  token: [
    'userKey',
    'backupKey',
    'walletContractAddress',
    'tokenContractAddress',
    'walletPassphrase',
    'recoveryDestination',
    'apiKey',
    'gasLimit',
    'maxFeePerGas',
    'maxPriorityFeePerGas',
  ],
  eos: ['userKey', 'backupKey', 'rootAddress', 'walletPassphrase', 'recoveryDestination'],
  near: ['userKey', 'backupKey', 'bitgoKey', 'walletPassphrase', 'recoveryDestination', 'scan'],
  dot: ['userKey', 'backupKey', 'bitgoKey', 'walletPassphrase', 'recoveryDestination', 'scan'],
  sol: ['userKey', 'backupKey', 'bitgoKey', 'walletPassphrase', 'recoveryDestination', 'scan'],
};

export const getRecoveryParams = (values: INonBitgoRecoveriesFormValues) => {
  // This is like _.pick
  return [
    'userKey',
    'backupKey',
    'bitgoKey',
    'rootAddress',
    'walletContractAddress',
    'tokenAddress',
    'walletPassphrase',
    'recoveryDestination',
    'scan',
    'krsProvider',
    'gasLimit',
    'gasPrice',
    'maxFeePerGas',
    'maxPriorityFeePerGas',
  ].reduce((obj, param) => {
    let value = values[param];
    const type = typeof value;
    if (value) {
      // Strip all whitespace, could be problematic
      if (type === 'string') {
        value = value.replace(/\s/g, '');
      }
      return Object.assign(obj, { [param]: value });
    }
    return obj;
  }, {});
};
