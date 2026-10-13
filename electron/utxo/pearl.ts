import type { RecoveryCoin } from '../recoveryCoin';
import {
  AbstractUtxoCoin,
  type RecoveryProvider,
  type RecoverParams,
  type Unspent,
} from '@bitgo/abstract-utxo';
import type { AddressInfo, TransactionIO } from '@bitgo/blockapis';
import type { BitGoAPI } from '@bitgo/sdk-api';

/**
 * Pearl (PRL) is a taproot-only UTXO chain served through @bitgo/wasm-utxo
 * (service-backed) rather than @bitgo/utxo-lib. Its recovery data source is the
 * Pearl blockbook explorer, which is NOT esplora-compatible — it returns its own
 * response shapes (e.g. `addrStr`/`txApperances` instead of `chain_stats.tx_count`,
 * and `/utxo/:address` instead of `/address/:address/utxo`). So we implement the
 * RecoveryProvider interface directly against blockbook's endpoints.
 */
class BlockbookApi implements RecoveryProvider<number> {
  constructor(private readonly baseUrl: string) {}

  private async get<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`);
    if (!res.ok) {
      throw new Error(
        `blockbook request failed: ${res.status} ${res.statusText} for ${path}`
      );
    }
    return (await res.json()) as T;
  }

  async getUnspentsForAddresses(
    addresses: string[]
  ): Promise<Unspent<number>[]> {
    const unspents: Unspent<number>[] = [];
    for (const address of addresses) {
      const utxos = await this.get<
        Array<{ txid: string; vout: number; satoshis: number }>
      >(`/utxo/${address}`);
      for (const u of utxos) {
        unspents.push({
          id: `${u.txid}:${u.vout}`,
          address,
          value: u.satoshis,
        });
      }
    }
    return unspents;
  }

  async getAddressInfo(address: string): Promise<AddressInfo> {
    const info = await this.get<{ txApperances: number; balance: string }>(
      `/address/${address}`
    );
    return { txCount: info.txApperances, balance: Number(info.balance) };
  }

  async getTransactionHex(txid: string): Promise<string> {
    const tx = await this.get<{ hex: string }>(`/v2/tx/${txid}`);
    return tx.hex;
  }

  async getTransactionIO(txid: string): Promise<TransactionIO> {
    const tx = await this.get<{
      vin: Array<{ addresses?: string[] }>;
      vout: Array<{ addresses?: string[] }>;
    }>(`/tx/${txid}`);
    return {
      inputs: (tx.vin ?? []).map(v => ({ address: v.addresses?.[0] ?? '' })),
      outputs: (tx.vout ?? []).map(v => ({ address: v.addresses?.[0] ?? '' })),
    };
  }
}

function pearlBlockbookUrl(chain: 'pearl' | 'tpearl'): string {
  return chain === 'pearl'
    ? 'https://blockbook.pearlresearch.ai/api'
    : 'https://blockbook.testnet.pearlresearch.ai/api';
}

export function createPearlCoin(
  sdk: BitGoAPI,
  chain: 'pearl' | 'tpearl'
): RecoveryCoin {
  return {
    deriveKeyWithSeed: (key, seed) =>
      sdk.coin(chain).deriveKeyWithSeed({ key, seed }),

    getChain: () => chain,

    async recover(parameters: unknown) {
      const baseCoin = sdk.coin(chain) as AbstractUtxoCoin;
      const recoveryProvider: RecoveryProvider<number> = new BlockbookApi(
        pearlBlockbookUrl(chain)
      );
      const params: RecoverParams = {
        ...(parameters as RecoverParams),
        recoveryProvider,
      };
      return await baseCoin.recover(params);
    },

    async broadcast(parameters) {
      return await sdk.coin(chain).broadcastTransaction(parameters);
    },
  };
}
