/**
 * Unified interface for coin operations used by the WRW IPC handlers.
 *
 * SDK coins are wrapped by getRecoveryCoin() so that non-SDK coins (coins not
 * registered in the BitGo SDK) can provide their own implementation and the
 * IPC handlers don't need to branch on coin type.
 */
export interface RecoveryCoin {
  deriveKeyWithSeed(
    key: string,
    seed: string
  ): { key: string; derivationPath: string };
  getChain(): string;
  recover(parameters: unknown): Promise<unknown>;
  broadcast(parameters: unknown): Promise<string>;
}
