import * as t from 'io-ts';

export type SafeSlot =
  | 'secp256k1Multisig'
  | 'ed25519Multisig'
  | 'ecdsaMpc'
  | 'eddsaMpc';

export const MAX_SAFE_ACCOUNT = 2 ** 31 - 1;
export const MAX_SAFE_GAP = 50;
export const MAX_SAFE_ADDRESSES = 50;

const boundedInteger = (name: string, min: number, max: number) =>
  t.refinement(
    t.number,
    value => Number.isInteger(value) && value >= min && value <= max,
    name
  );

// The prefix becomes part of a file name, so it must not carry path separators.
const FilePrefix = t.refinement(
  t.string,
  value => /^[\w.-]+$/.test(value),
  'FilePrefix'
);

const AddressList = t.refinement(
  t.array(t.string),
  addresses =>
    addresses.length >= 1 &&
    addresses.length <= MAX_SAFE_ADDRESSES &&
    new Set(addresses).size === addresses.length,
  'AddressList'
);

export const SafeRecoveryRequest = t.intersection([
  t.type({
    derivationCoin: t.string,
    recoverCoin: t.string,
    mode: t.union([t.literal('signed'), t.literal('unsigned')]),
    baseParams: t.record(t.string, t.unknown),
    keycard: t.type({ boxA: t.string, boxB: t.string, boxC: t.string }),
    password: t.string,
    startAccount: boundedInteger('StartAccount', 0, MAX_SAFE_ACCOUNT),
    gap: boundedInteger('Gap', 1, MAX_SAFE_GAP),
    output: t.type({
      dir: t.string,
      filePrefix: FilePrefix,
      bigintSafe: t.boolean,
      includePubs: t.boolean,
    }),
  }),
  t.partial({
    locator: t.type({
      field: t.union([
        t.literal('rootAddress'),
        t.literal('walletContractAddress'),
      ]),
      addresses: AddressList,
    }),
    perWallet: t.type({ param: t.string, values: t.array(t.unknown) }),
  }),
]);
export type SafeRecoveryRequest = t.TypeOf<typeof SafeRecoveryRequest>;

/**
 * Decodes an IPC payload. The error names the failing fields only: the payload
 * carries the password and keycard, which must not come back in a message.
 */
export function parseSafeRecoveryRequest(input: unknown): SafeRecoveryRequest {
  const decoded = SafeRecoveryRequest.decode(input);
  if (decoded._tag === 'Left') {
    const fields = decoded.left.map(({ context }) =>
      context.map(({ key }) => key).join('.')
    );
    throw new Error(`Invalid Safe recovery request: ${fields.join(', ')}`);
  }
  return decoded.right;
}

export type SafeWalletResult = {
  slot: SafeSlot;
  account: number;
  path?: string;
  address?: string;
  // stopped: the run was cancelled or ran out of per-wallet values
  status: 'recovered' | 'empty' | 'error' | 'stopped';
  file?: string;
  error?: string;
};

// An address-level row: nothing matched it, or the run stopped before it was searched.
export type SafeAddressResult = {
  status: 'no-match' | 'stopped';
  address: string;
  error: string;
};

export type SafeRecoveryResult = SafeWalletResult | SafeAddressResult;

export type SafeRecoveryProgress = Pick<
  SafeWalletResult,
  'slot' | 'account' | 'address' | 'status'
>;
