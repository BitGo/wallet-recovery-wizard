import type {
  BackupKeyRecoveryTransansaction,
  FormattedOfflineVaultTxInfo,
} from '@bitgo/abstract-utxo';

const GWEI = 10 ** 9;

export async function recoverWithToken(
  token: string,
  ...args: Parameters<typeof window.commands.recover>
) {
  const [coin, ...rest] = args;
  try {
    return await window.commands.recover(token, ...rest);
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    } else {
      console.error(err)
    }
  }
}

export async function getTokenChain(
  token: string,
  ...args: Parameters<typeof window.queries.getChain>
) {
  const [coin, ...rest] = args;
  try {
    return await window.queries.getChain(token, ...rest);
  } catch {
    return await window.queries.getChain(coin, ...rest);
  }
}

export function toWei(gas: number) {
  return gas * GWEI;
}

export function getEthLikeRecoveryChainId(
  coinName: string,
  bitGoEnvironment: string
) {
  if(coinName === 'ethw') {
    return 10001;
  } else if(coinName === 'polygon') {
      return 137;
  } else if(coinName === 'tpolygon') {
      return 80002;
  }
  // default to eth
  return bitGoEnvironment === 'prod' ? 1 : 17000;
}

export type BitgoEnv = 'prod' | 'test';

export function safeEnv(value: string | undefined): BitgoEnv {
  if (value !== 'test' && value !== 'prod') {
    throw new Error(
      `expected value to be "test" or "prod" but got: ${String(value)}`
    );
  }
  return value;
}

export function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

export function isRecoveryTransaction(
  value: BackupKeyRecoveryTransansaction | FormattedOfflineVaultTxInfo
) {
  return (
    ('txHex' in value && !!value['txHex']) ||
    ('txBase64' in value && !!value['txBase64']) ||
    ('transactionHex' in value && !!value['transactionHex']) ||
    ('tx' in value && !!value['tx']) ||
    ('transaction' in value && !!value['transaction']) ||
    ('txid' in value && !!value['txid']) ||
    ('serializedTx' in value && !!value['serializedTx']) ||
    ('txRequests' in value && !!value['txRequests'])
  );
}

export function mapSdkErrorToAlert(message: string): string {
  switch (message) {
    case 'invalid_client':
      return 'Invalid email format';
    case 'invalid_grant':
      return 'Incorrect email or password';
    case 'needs_otp':
      return 'Invalid OTP';
    case 'request_source_unverified':
    case 'request_source_verification_pending':
      return 'You are trying to log in from an unverified IP address, please check your inbox for a verification email.';
    default:
      return message;
  }
}

export async function includePubsFor<
  TValues extends {
    userKey: string;
    userKeyId?: string;
    backupKey: string;
    backupKeyId?: string;
    bitgoKey?: string;
  }
>(coin: string, values: TValues) {
  const userXpub = values.userKeyId
    ? (
        await window.queries.deriveKeyWithSeed(
          coin,
          values.userKey,
          values.userKeyId
        )
      ).key
    : values.userKey;
  const backupXpub = values.backupKeyId
    ? (
        await window.queries.deriveKeyWithSeed(
          coin,
          values.backupKey,
          values.backupKeyId
        )
      ).key
    : values.backupKey;

  return {
    xpubsWithDerivationPath: {
      user: {
        xpub: userXpub,
        derivedFromParentWithSeed: values.userKeyId
          ? values.userKeyId
          : undefined,
      },
      backup: {
        xpub: backupXpub,
        derivedFromParentWithSeed: values.backupKeyId
          ? values.backupKeyId
          : undefined,
      },
      bitgo: { xpub: values.bitgoKey },
    },
    pubs: [userXpub, backupXpub, values.bitgoKey],
  };
}

export async function includePubsForToken(
  token: string,
  ...args: Parameters<typeof includePubsFor>
) {
  const [coin, ...rest] = args;

  try {
    return includePubsFor(token, ...rest);
  } catch {
    return includePubsFor(coin, ...rest);
  }
}

export async function isDerivationPath(id: string, description: string) {
  if (id.length > 2 && id.indexOf('m/') === 0) {
    const response = await window.commands.showMessageBox({
      type: 'question',
      buttons: ['Derivation Path', 'Seed'],
      title: 'Derivation Path?',
      message: `Is the provided value a Derivation Path or a Seed?\n${description}: ${id}\n`,
    });

    return !!response.response;
  }

  return false;
}

export type UpdateKeysFromsIdsDefaultParams = {
  userKey: string;
  userKeyId?: string;
  backupKeyId?: string;
  backupKey: string;
}

export async function updateKeysFromIds<
  TParams extends UpdateKeysFromsIdsDefaultParams
>(
  coin: string,
  params: TParams,
): Promise<Omit<TParams, 'userKeyId' | 'backupKeyId'>> {
  const { userKeyId, backupKeyId, ...copy } = params;
  const data = [
    {
      id: userKeyId,
      key: copy.userKey,
      description: 'User Key Id',
      name: 'userKey',
    },
    {
      id: backupKeyId,
      key: copy.backupKey,
      description: 'Backup Key Id',
      name: 'backupKey',
    },
  ] as const;

  for await (const item of data) {
    if (item.id) {
      if (await isDerivationPath(item.id, item.description)) {
        copy[item.name] = await window.queries.deriveKeyByPath(
          item.key,
          item.id,
        );
      } else {
        copy[item.name] = (
          await window.queries.deriveKeyWithSeed(coin, item.key, item.id)
        ).key;
      }
    }
  }

  return copy;
}

export function updateKeysFromIdsWithToken<TParams extends UpdateKeysFromsIdsDefaultParams>(token: string, ...args: Parameters<typeof updateKeysFromIds<TParams>>) {
  const [coin, ...rest] = args;

  try {
    return updateKeysFromIds(token, ...rest);
  } catch {
    return updateKeysFromIds(coin, ...rest);
  }
}
