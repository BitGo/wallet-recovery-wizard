import * as t from 'io-ts';
import { RootKeyType } from '@bitgo/public-types';

export const MAX_SAFE_ACCOUNT = 2 ** 31 - 1;
// Discovery stops after this many wallets in a row without funds.
export const SAFE_WALLET_GAP = 5;

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
    addresses.length >= 1 && new Set(addresses).size === addresses.length,
  'AddressList'
);

const AccountIndex = boundedInteger('Account', 0, MAX_SAFE_ACCOUNT);

// What every Safe request carries: the coin, the keycard and the password.
export const SafeWalletRequest = t.type({
  derivationCoin: t.string,
  recoverCoin: t.string,
  mode: t.union([t.literal('signed'), t.literal('unsigned')]),
  baseParams: t.record(t.string, t.unknown),
  keycard: t.type({ boxA: t.string, boxB: t.string, boxC: t.string }),
  password: t.string,
});
export type SafeWalletRequest = t.TypeOf<typeof SafeWalletRequest>;

export const SafeRecoveryRequest = t.intersection([
  SafeWalletRequest,
  t.type({
    startAccount: AccountIndex,
    gap: boundedInteger('Gap', 1, MAX_SAFE_ACCOUNT),
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

// The wallet gap is fixed for discovery, so it is not a request field.
export const SafeDiscoveryRequest = t.intersection([
  SafeWalletRequest,
  t.type({ startAccount: AccountIndex }),
]);
export type SafeDiscoveryRequest = t.TypeOf<typeof SafeDiscoveryRequest>;

export const SafeRecoverOneRequest = t.intersection([
  SafeWalletRequest,
  t.type({ target: t.type({ slot: RootKeyType, account: AccountIndex }) }),
]);
export type SafeRecoverOneRequest = t.TypeOf<typeof SafeRecoverOneRequest>;

/**
 * Decodes an IPC payload. The error names the failing fields only: the payload
 * carries the password and keycard, which must not come back in a message.
 */
function parseRequest<A>(codec: t.Decoder<unknown, A>, input: unknown): A {
  const decoded = codec.decode(input);
  if (decoded._tag === 'Left') {
    const fields = decoded.left.map(({ context }) =>
      context.map(({ key }) => key).join('.')
    );
    throw new Error(`Invalid Safe recovery request: ${fields.join(', ')}`);
  }
  return decoded.right;
}

export const parseSafeRecoveryRequest = (input: unknown) =>
  parseRequest(SafeRecoveryRequest, input);
export const parseSafeDiscoveryRequest = (input: unknown) =>
  parseRequest(SafeDiscoveryRequest, input);
export const parseSafeRecoverOneRequest = (input: unknown) =>
  parseRequest(SafeRecoverOneRequest, input);

// Box C is optional on a non-Safe keycard, so detection accepts any subset.
export const SafeKeycardBoxes = t.partial({
  boxA: t.string,
  boxB: t.string,
  boxC: t.string,
});
export type SafeKeycardBoxes = t.TypeOf<typeof SafeKeycardBoxes>;

export const parseSafeKeycardBoxes = (input: unknown) =>
  parseRequest(SafeKeycardBoxes, input);

export type SafeWalletResult = {
  slot: RootKeyType;
  account: number;
  path?: string;
  address?: string;
  // stopped: the run was cancelled or ran out of per-wallet values
  status: 'recovered' | 'empty' | 'error' | 'stopped';
  file?: string;
  error?: string;
};

// Nothing matched the address, or the run stopped before it was searched.
export type SafeAddressResult = {
  status: 'no-match' | 'stopped';
  address: string;
  error: string;
};

export type SafeRecoveryResult = SafeWalletResult | SafeAddressResult;

// A discovered wallet. No file, tx or key material: the screen only lists it.
export type SafeDiscoveryRow = {
  slot: RootKeyType;
  account: number;
  path?: string;
  status: 'funded' | 'empty' | 'error';
  error?: string;
};

export type SafeRecoveryProgress =
  | Pick<SafeWalletResult, 'slot' | 'account' | 'address' | 'status'>
  | SafeDiscoveryRow;
