# Plan: Auto-generate `allCoinMetas` entries from SDK for EVM recovery coins

## Context

Currently, every time a new EVM chain is added to the `@bitgo/statics` SDK with `EVM_UNSIGNED_SWEEP_RECOVERY` or `EVM_NON_BITGO_RECOVERY` features, a developer must also manually add a corresponding entry in `allCoinMetas` inside `src/helpers/config.ts`. Without that entry, `assertMetadata()` returns false and the coin is silently excluded from recovery flows.

The goal is to auto-generate a sensible default `CoinMetadata` from the SDK coin object for any EVM recovery coin not already explicitly defined in `allCoinMetas`. After this change, an SDK bump alone is sufficient to surface new EVM recovery coins — no changes to this repo are needed. Manual entries in `allCoinMetas` remain supported as overrides.

---

## Critical File

- `src/helpers/config.ts` — only file to modify

## Key insight: deriving `ApiKeyProvider` from the SDK

Two-step lookup for `ApiKeyProvider`:

**Step 1** — `Environments[env].evm?.[coinName]?.baseUrl` from `@bitgo/sdk-core`  
Covers all coins using `SHARED_EVM_SDK` (the standard path for new EVM chains). Example:
- `inketh` (prod): `https://explorer.inkonchain.com/api` → `explorer.inkonchain.com`
- `tinketh` (test): `https://explorer-sepolia.inkonchain.com/api` → `explorer-sepolia.inkonchain.com` ✓

**Step 2** (fallback) — `coin.network.explorerUrl` from `@bitgo/statics` (already imported)  
31 testnet coins (`tunieth`, `thoodeth`, `thppeth`, etc.) have `EVM_NON_BITGO_RECOVERY` but are
NOT in the testnet `evm` map — they all have `explorerUrl` set. This fallback covers them.
Example: `thoodeth` → `https://explorer.testnet.chain.robinhood.com/tx/` → `explorer.testnet.chain.robinhood.com`

`@bitgo/sdk-core` is a safe import in `src/` — it's already a transitive dependency via
`@bitgo/sdk-coin-ada` (imported in `src/utils/types.ts`).

---

## Implementation

### Step 1 — Add `generateEvmCoinMeta` helper (after the `allCoinMetas` closing brace, before `assertMetadata`)

Add import at the top of config.ts:
```typescript
import { Environments } from '@bitgo/sdk-core';
```

```typescript
function generateEvmCoinMeta(coin: {
  name: string;
  fullName: string;
  network: { type: NetworkType; explorerUrl?: string };
}): CoinMetadata {
  const isTestnet = coin.network.type === NetworkType.TESTNET;
  // Testnet coins typically start with 't'; use the mainnet name for the icon
  const iconName = isTestnet && coin.name.startsWith('t') ? coin.name.slice(1) : coin.name;
  // Step 1: check Environments evm map (SHARED_EVM_SDK coins)
  const env = isTestnet ? 'test' : 'prod';
  const evmBaseUrl = Environments[env].evm?.[coin.name]?.baseUrl;
  // Step 2: fall back to statics explorerUrl (covers testnet coins missing from evm map)
  const fallbackUrl = coin.network.explorerUrl;
  const rawUrl = evmBaseUrl ?? fallbackUrl;
  const apiKeyProvider = rawUrl ? new URL(rawUrl).hostname : undefined;
  return {
    Title: coin.name.toUpperCase(),
    Description: coin.fullName,
    value: coin.name,
    Icon: iconName,
    ...(apiKeyProvider && { ApiKeyProvider: apiKeyProvider }),
    defaultGasLimit: '500,000',
    defaultGasLimitNum: 500000,
    defaultMaxFeePerGas: 20,
    defaultMaxPriorityFeePerGas: 10,
  };
}
```

### Step 2 — Modify the `coins.forEach` loop (lines 1567-1588)

Replace the existing loop with a version that auto-generates metadata instead of gating on `assertMetadata`:

```typescript
coins.forEach(coin => {
  if (coin.isToken) return;

  const name = coin.name;
  const isTestnet = coin.network.type === NetworkType.TESTNET;
  const hasUnsignedSweep = coin.features.includes(CoinFeature.EVM_UNSIGNED_SWEEP_RECOVERY);
  const hasNonBitgo = coin.features.includes(CoinFeature.EVM_NON_BITGO_RECOVERY);

  if (!hasUnsignedSweep && !hasNonBitgo) return;

  // Auto-generate metadata for any coin not already explicitly defined
  if (!Object.prototype.hasOwnProperty.call(allCoinMetas, name)) {
    allCoinMetas[name] = generateEvmCoinMeta(coin);
  }

  if (hasUnsignedSweep) {
    if (isTestnet) testEvmUnsignedSweepCoins.push(name);
    else prodEvmUnsignedSweepCoins.push(name);
  }

  if (hasNonBitgo) {
    if (isTestnet) testEvmNonBitgoRecoveryCoins.push(name);
    else prodEvmNonBitgoRecoveryCoins.push(name);
  }
});
```

### Step 3 — Remove `assertMetadata` function (now unused)

Delete lines 1552–1558. The auto-generation in step 2 replaces its gating role.

---

## Default values rationale

| Field | Default | Reason |
|---|---|---|
| `Icon` | strip `t` prefix for testnets | Matches existing pattern (`tinketh` → `inketh`) |
| `ApiKeyProvider` | `Environments[env].evm?.[coin].baseUrl` then `coin.network.explorerUrl` | evm map covers SHARED_EVM_SDK coins; explorerUrl fallback covers 31 testnet coins missing from evm map; both are undefined only for `phrs` (which has a TODO in the SDK) |
| `defaultGasLimit` | `'500,000'` / `500000` | Conservative safe default |
| `defaultMaxFeePerGas` | `20` | Matches most explicit entries |
| `defaultMaxPriorityFeePerGas` | `10` | Matches most explicit entries |

Explicit entries in `allCoinMetas` are checked first via `hasOwnProperty`, so any custom override (different gas limits, custom `ApiKeyProvider`, `isTssSupported`, etc.) is always respected.

---

## Verification

### Pre-verification: temporarily add `tempo` to `node_modules/@bitgo/sdk-core` evm map

`tempo` already has an explicit `allCoinMetas` entry (so it won't be auto-generated normally).
To test the auto-generation path end-to-end, temporarily:
1. Add `tempo: { baseUrl: 'https://dummy.alchemy.com/api' }` to the `evm` prod block in
   `node_modules/@bitgo/sdk-core/dist/src/bitgo/environments.js`
2. Temporarily **delete** the `tempo` entry from `allCoinMetas` in `config.ts`
3. Run verification script (below) — confirm `tempo` gets auto-generated with the correct `ApiKeyProvider: 'dummy.alchemy.com'`
4. Restore both changes

### After making changes, run inline Node.js snippets to verify:

**1. TypeScript type-check**
```bash
npx tsc --noEmit
```

**2. UI smoke-test**
- Start dev server, switch to testnet, open Unsigned Sweep and Non-BitGo Recovery
- Confirm existing EVM coins appear with correct gas defaults
- Confirm new auto-generated coins (e.g. `tunieth`, `thoodeth`) now appear in coin dropdown
