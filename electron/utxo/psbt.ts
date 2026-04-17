import { AbstractUtxoCoin, transaction } from '@bitgo/abstract-utxo';
import { fixedScriptWallet, BIP32 } from '@bitgo/wasm-utxo';

export const UTXO_COINS = [
  'btc', 'tbtc', 'ltc', 'tltc', 'doge', 'tdoge',
  'dash', 'tdash', 'zec', 'tzec', 'bch', 'tbch', 'btg', 'tbtg',
] as const;

export type UtxoCoin = (typeof UTXO_COINS)[number];

export function isUtxoCoin(coin: string): coin is UtxoCoin {
  return (UTXO_COINS as readonly string[]).includes(coin);
}

export function isXprv(key: string): boolean {
  return /^[xt]prv/.test(key);
}

// Normalize PSBT string (hex or base64) to hex for abstract-utxo APIs
export function psbtToHex(psbt: string): string {
  if (/^[0-9a-fA-F]+$/.test(psbt)) return psbt;
  return Buffer.from(psbt, 'base64').toString('hex');
}

type Recipient = { address: string; amountSatoshi: string };

// If a recipient is given, decode the PSBT, append the output, re-serialize.
export function withRecipient(psbtHex: string, coin: AbstractUtxoCoin, recipient: Recipient): string {
  const psbt = transaction.decodePsbt(psbtHex, coin.getChain());
  psbt.addOutput(recipient.address, BigInt(recipient.amountSatoshi));
  return Buffer.from(psbt.serialize()).toString('hex');
}

// Sign the PSBT with the user key only → half-signed PSBT (hex).
// Uses the wasm-utxo BitGoPsbt API directly to avoid abstract-utxo version skew.
export function signPsbt(
  coin: AbstractUtxoCoin,
  psbtHex: string,
  xprv: string,
): string {
  const bytes = Buffer.from(psbtHex, 'hex');
  const psbt = fixedScriptWallet.BitGoPsbt.fromBytes(bytes, coin.getChain());
  psbt.sign(BIP32.fromBase58(xprv));
  return Buffer.from(psbt.serialize()).toString('hex');
}

function extractTxHex(result: unknown): string {
  const r = result as { halfSigned?: { txHex: string }; txHex: string };
  return r.halfSigned?.txHex ?? r.txHex;
}

// Sign a PSBT with both user and backup keys to produce a fully-signed transaction.
export async function signPsbtWithBothKeys(
  coin: AbstractUtxoCoin,
  psbtHex: string,
  userXprv: string,
  backupXprv: string,
): Promise<{ txHex: string }> {
  const half = await coin.signTransaction({
    txPrebuild: { txHex: psbtHex },
    prv: userXprv,
    isLastSignature: false,
  });
  const halfHex = extractTxHex(half);

  const full = await coin.signTransaction({
    txPrebuild: { txHex: halfHex },
    prv: backupXprv,
    isLastSignature: true,
  });
  return { txHex: extractTxHex(full) };
}
