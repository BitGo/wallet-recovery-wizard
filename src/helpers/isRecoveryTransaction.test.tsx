import { isRecoveryTransaction } from './index';

async function validateRecovery(
  ...args: Parameters<typeof window.commands.recover>
) {
  const [coin, ...rest] = args;
  await window.commands.setBitGoEnvironment('prod');
  const recoverPayload = await window.commands.recover(coin, ...rest);
  expect(isRecoveryTransaction(recoverPayload)).toBe(true);
}

describe('isRecoveryTransaction()', () => {
  it('validates btc recovery', async () => {
    await validateRecovery({
      /* A bunch of parameters */
    });
  });
});
