// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getCurrentZcashBlockHeight } from './zec';

describe('getCurrentZcashBlockHeight', () => {
  afterEach(() => vi.restoreAllMocks());

  it('returns the current height and passes the Blockchair API key', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ data: { best_block_height: 3_459_244 } }),
    } as Response);

    await expect(getCurrentZcashBlockHeight('test-key')).resolves.toBe(3_459_244);
    expect(fetchMock).toHaveBeenCalledWith(
      new URL('https://api.blockchair.com/zcash/stats?key=test-key')
    );
  });

  it('rejects an invalid response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ data: { best_block_height: 'stale' } }),
    } as Response);

    await expect(getCurrentZcashBlockHeight()).rejects.toThrow(
      'Blockchair returned an invalid Zcash block height'
    );
  });

  it('rejects a failed request', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false, status: 503 } as Response);

    await expect(getCurrentZcashBlockHeight()).rejects.toThrow(
      'Unable to fetch current Zcash block height: 503'
    );
  });
});
