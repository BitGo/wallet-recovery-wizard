import { AbstractUtxoCoin } from '@bitgo/abstract-utxo';
import { fixedScriptWallet, BIP32, Dimensions, type CoinName } from '@bitgo/wasm-utxo';

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

// Validate the PSBT has no outputs, then compute and add the single recipient output.
// Output value = totalInputValue - (feeRate * estimatedVsize).
function buildOutput(
  psbtHex: string,
  coinName: string,
  recipientAddress: string,
  feeRateSatVB: number,
): string {
  const bytes = Buffer.from(psbtHex, 'hex');
  const psbt = fixedScriptWallet.BitGoPsbt.fromBytes(bytes, coinName as CoinName);

  const existingDims = Dimensions.fromPsbt(psbt);
  if (existingDims.getOutputVSize() > 0) {
    throw new Error('PSBT must have no outputs. Remove all outputs before signing.');
  }

  const inputs = psbt.getInputs();
  const totalInput = inputs.reduce((sum, inp) => {
    if (!inp.witnessUtxo) throw new Error('Must use psbt-lite format with witnessUtxo for fee calculation');
    return sum + inp.witnessUtxo.value;
  }, BigInt(0));

  const outputDims = Dimensions.fromOutput(recipientAddress, coinName as CoinName);
  const vsize = existingDims.plus(outputDims).getVSize('max');

  const fee = BigInt(feeRateSatVB) * BigInt(vsize);
  const outputValue = totalInput - fee;
  if (outputValue <= BigInt(0)) {
    throw new Error(`Fee (${fee} sat) exceeds total input value (${totalInput} sat)`);
  }

  psbt.addOutput(recipientAddress, outputValue);
  return Buffer.from(psbt.serialize()).toString('hex');
}

// Add the recipient output, then sign with the user key → half-signed PSBT (hex).
export function signPsbt(
  coin: AbstractUtxoCoin,
  psbtHex: string,
  xprv: string,
  recipientAddress: string,
  feeRateSatVB: number,
): string {
  const withOutput = buildOutput(psbtHex, coin.getChain(), recipientAddress, feeRateSatVB);
  const bytes = Buffer.from(withOutput, 'hex');
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
