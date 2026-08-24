export type ZcashStatsResponse = {
  data?: {
    best_block_height?: unknown;
  };
};

export async function getCurrentZcashBlockHeight(apiKey?: string): Promise<number> {
  const url = new URL('https://api.blockchair.com/zcash/stats');
  if (apiKey) url.searchParams.set('key', apiKey);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Unable to fetch current Zcash block height: ${response.status}`);
  }

  const body = (await response.json()) as ZcashStatsResponse;
  const blockHeight = body.data?.best_block_height;
  if (!Number.isInteger(blockHeight) || blockHeight < 0) {
    throw new Error('Blockchair returned an invalid Zcash block height');
  }

  return blockHeight;
}
