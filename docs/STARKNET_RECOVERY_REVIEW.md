# Starknet Recovery Code Review

**Scope:** BitGoJS commit `e82f3a3725510141b9e0b5b9f1e84bfef43be6c9` (`modules/sdk-coin-starknet/`)  
**Compared against:** BGMS `wallet-platform/.../starknet/starknet.ts`, peer coins (Sui, Near, ICP, Vet), WRW integration  
**Review date:** 2026-06-29  
**Validation:** Independently re-reviewed by Opus 4.6 subagent

---

## Summary

| Category | Count |
|----------|-------|
| Confirmed at original severity | 3 |
| Confirmed, severity downgraded | 7 |
| Overstated | 1 |
| False positive | 1 |
| New issues (missed in first pass) | 5 |
| **Total distinct issues** | **20** |

**Production blockers (WRW index-0 STRK sweep today):** signed recovery at `index > 0` (#1), non-STRK sweeps without STRK gas (#3).

---

## Issue Index

| ID | Title | Severity | Status |
|----|-------|----------|--------|
| [#1](#1-signed-recovery-signs-at-m0-regardless-of-index) | Signed recovery signs at `m/0` regardless of `index` | Critical | Confirmed |
| [#2](#2-no-address-scanning) | No address scanning | Medium | Overstated (was Critical) |
| [#3](#3-no-strk-gas-check-for-non-strk-token-sweeps) | No STRK gas check for non-STRK token sweeps | Critical | Confirmed |
| [#4](#4-silent-nonce-fallback-on-rpc-failure) | Silent nonce fallback on RPC failure | High | Confirmed |
| [#5](#5-l2_gas_min_price_per_unit-mismatch-with-bgms) | `L2_GAS_MIN_PRICE_PER_UNIT` mismatch with BGMS | Low | Confirmed, overstated (was High) |
| [#6](#6-deploy--sweep-ordering-not-enforced) | Deploy + sweep ordering not enforced | Medium | Confirmed, overstated (was High) |
| [#7](#7-misleading-error-on-zero-balance) | Misleading error on zero balance | Low | Confirmed, overstated (was High) |
| [#8](#8-no-broadcasttransaction--createbroadcastablesweeptransaction) | No `broadcastTransaction` / `createBroadcastableSweepTransaction` | Medium | Confirmed |
| [#9](#9-tests-stub-signing) | Tests stub signing | Medium | Confirmed |
| [#10](#10-isunsignedsweep-uses-or-logic) | `isUnsignedSweep` uses OR logic | Medium | Confirmed |
| [#11](#11-gas-price-source-public-rpc-vs-ims) | Gas price source: public RPC vs IMS | N/A | False positive |
| [#12](#12-fee-option-dead-code) | `fee` option dead code | Low | Confirmed |
| [#13](#13-coin-as-any-getbuilderfactory-cast) | `(coin as any).getBuilderFactory()` cast | Low | Confirmed |
| [#14](#14-coinspecificcommonkeychain-uses-raw-bitgokey) | `coinSpecific.commonKeychain` uses raw `bitgoKey` | Low | Confirmed |
| [#15](#15-no-zero-amount-guard-on-token-transfer) | No zero-amount guard on token transfer | Low | Confirmed |
| [M1](#m1-no-timeout-or-retry-on-rpc-calls) | No timeout or retry on RPC calls | Low | New |
| [M2](#m2-balance_of-response-parsing-silently-returns-0) | `balance_of` response parsing silently returns 0 | Medium | New |
| [M3](#m3-pervasive-coin-as-any-casts) | Pervasive `(coin as any)` casts | Low | New |
| [M4](#m4-unsigned-sweep-deploy-tx-lacks-broadcastformat) | Unsigned sweep deploy tx lacks `broadcastFormat` | Medium | New |
| [M5](#m5-hardcoded-public-rpc-defaults) | Hardcoded public RPC defaults | Low | New |

---

## Original Findings

### 1. Signed recovery signs at `m/0` regardless of `index`

**Severity:** Critical  
**Status:** Confirmed

**Location:** `recovery.ts:146-172`, `starknet.ts:198-204`, `sdk-core/.../ecdsaMPCv2.ts:1511-1518`

**Problem:** Recovery derives the sender address at `m/${index}` via `ecdsa.deriveUnhardened(commonKeyChain, derivationPath)`, but signed recovery calls `ECDSAUtils.signRecoveryMpcV2()`, which hardcodes `'m/0'` in both DSG instances and signature verification.

For `index > 0`, the transaction hash is signed with the key at `m/0` while the sender address corresponds to `m/${index}`. Starknet EthAccount `__validate__` will reject the signature. Index 0 works; any other index produces an invalid signed tx.

**Fix (short-term):**

```typescript
if (index !== 0 && !isUnsignedSweep) {
  throw new Error(
    `Signed recovery at address index ${index} is not yet supported. Use unsigned sweep and sign via OVC, or recover at index 0.`
  );
}
```

**Fix (long-term):** Add `derivationPath` parameter to `signRecoveryMpcV2` and pass it from `recovery.ts`.

---

### 2. No address scanning

**Severity:** Medium *(downgraded from Critical)*  
**Status:** Overstated

**Location:** `recovery.ts:146-147`; WRW `StarknetForm.tsx` (no `index`/`scan` fields)

**Problem:** Unlike Sui (`sui.ts:353-354`) and Near, recovery only checks a single address at `m/${index}` (default `0`). WRW forms do not expose `index` or scanning parameters. Funds on receive addresses (`m/1`, `m/2`, …) are not discovered automatically.

**Nuance:** BitGo Starknet wallets are architected around a single root address at derivation index 0 (BGMS `createWallet()` derives `${derivationPathPrefix}/0`; first `createAddress()` reuses `walletRootAddress`). The primary WRW use case is sweeping the root wallet. Receive-address recovery is a secondary scenario requiring manual `index`.

---

### 3. No STRK gas check for non-STRK token sweeps

**Severity:** Critical  
**Status:** Confirmed

**Location:** `recovery.ts:257-268`

**Problem:** Fee reservation only runs when the swept token is STRK. For any other `tokenContractAddress`, the code queries the token balance, builds a full-balance sweep, and never checks whether the account holds enough STRK to pay V3 gas. Starknet fees are always paid in STRK from the account's STRK balance.

A user sweeping an ERC-20 with 0 STRK gets a signed tx that will be rejected by the sequencer at broadcast with no pre-flight error.

**Fix:** After querying token balance, always query STRK balance and validate `strkBalance >= requiredGas` where `requiredGas = isDeployed ? maxFee : maxFee * 2n`.

---

### 4. Silent nonce fallback on RPC failure

**Severity:** High  
**Status:** Confirmed

**Location:** `recovery.ts:200-206`

**Problem:** For deployed accounts, `starknet_getNonce` is called inside a try/catch. On any failure, `sweepNonce` is silently set to `'0x0'`. An account with nonce ≥ 1 gets a tx with nonce 0, which the sequencer rejects. The user receives a seemingly valid signed recovery file that cannot be broadcast.

**Fix:** Remove the try/catch; let `queryStarknetNode` errors propagate.

```typescript
if (isDeployed) {
  const nonceResult = await queryStarknetNode(nodeUrl, 'starknet_getNonce', ['latest', senderAddress]);
  sweepNonce = '0x' + BigInt(nonceResult).toString(16);
} else {
  sweepNonce = '0x1';
}
```

---

### 5. `L2_GAS_MIN_PRICE_PER_UNIT` mismatch with BGMS

**Severity:** Low *(downgraded from High)*  
**Status:** Confirmed, overstated

**Location:** `constants.ts:51` (SDK: `50_000_000_000n`) vs BGMS `starknet.ts:71` (`15_000_000_000n`)

**Problem:** SDK uses a higher L2 price floor than wallet-platform.

**Impact:** When the floor is hit, SDK reserves a higher max fee ceiling (≈2 STRK vs ≈0.6 STRK L2 component). Makes "Insufficient STRK balance" threshold stricter — conservative, not incorrect. Actual gas charged is based on consumption, not the ceiling. Rarely matters when live RPC prices are non-zero.

---

### 6. Deploy + sweep ordering not enforced

**Severity:** Medium *(downgraded from High)*  
**Status:** Confirmed, overstated

**Location:** `recovery.ts:339-350`, `recovery.ts:107`, `recovery.ts:208`

**Problem:** Undeployed recovery returns two txs: `deploy_account` (nonce `0x0`) then `send` (nonce `0x1`). No SDK enforcement that deploy is confirmed before sweep is broadcast.

**Nuance:** Starknet sequencer enforces nonce ordering — sweep at nonce 1 is rejected until nonce 0 is processed. Multi-tx return is standard across BitGo recovery. WRW/OVC iterate transactions in array order. Risk is operational (user broadcasts sweep first), not a correctness bug. Documentation would help.

---

### 7. Misleading error on zero balance

**Severity:** Low *(downgraded from High)*  
**Status:** Confirmed, overstated

**Location:** `recovery.ts:263-266`

**Problem:** When sweeping STRK with zero balance, throws `"Insufficient STRK balance to cover recovery fee of X fri. Balance: 0 fri"`. Arithmetically correct but reads as a fee problem rather than "no funds at this address."

**Fix:** Add explicit zero-balance check before fee math with a clearer message.

---

### 8. No `broadcastTransaction` / `createBroadcastableSweepTransaction`

**Severity:** Medium  
**Status:** Confirmed

**Location:** `starknet.ts` (only `recover()` implemented)

**Problem:** No programmatic broadcast or OVC signature-assembly path. Sui and Near implement `createBroadcastableSweepTransaction`. For signed recovery, `broadcastFormat` is embedded in the return payload (`recovery.ts:334-335`). For unsigned sweep, OVC is expected to handle signing + broadcast. WRW non-BitGo recovery writes a JSON file with no auto-broadcast.

---

### 9. Tests stub signing

**Severity:** Medium  
**Status:** Confirmed

**Location:** `test/unit/transactionBuilder/transactionRecover.ts:78-82`, `106-110`

**Problem:** Tests stub `Starknet.prototype.signRecoveryTransaction` with fake `{r, s, recid}`. Tests verify structure, nonce, deploy+sweep ordering, and fee errors, but never exercise real MPC signing, `formatEthAccountSignature`, or signature-to-address verification.

---

### 10. `isUnsignedSweep` uses OR logic

**Severity:** Medium  
**Status:** Confirmed

**Location:** `recovery.ts:144`

**Problem:**

| Coin | Logic |
|------|-------|
| Starknet | `!passphrase \|\| !userKey \|\| !backupKey` (any missing → unsigned) |
| Sui | `!params.walletPassphrase` |
| Near / ICP | `!userKey && !backupKey && !passphrase` (all missing → unsigned) |

Providing `userKey` + `backupKey` but forgetting `walletPassphrase` silently produces an unsigned sweep instead of a clear error.

**Fix:**

```typescript
const hasPassphrase = !!params.walletPassphrase;
const hasUserKey = !!params.userKey;
const hasBackupKey = !!params.backupKey;

if (hasPassphrase || hasUserKey || hasBackupKey) {
  if (!hasPassphrase) throw new Error('Missing walletPassphrase for signed recovery');
  if (!hasUserKey) throw new Error('Missing userKey for signed recovery');
  if (!hasBackupKey) throw new Error('Missing backupKey for signed recovery');
}

const isUnsignedSweep = !hasPassphrase && !hasUserKey && !hasBackupKey;
```

---

### 11. Gas price source: public RPC vs IMS

**Severity:** N/A  
**Status:** False positive

**Location:** `recovery.ts:47-60` (public RPC) vs BGMS `starknet.ts:467-491` (IMS)

**Verdict:** Correct by design. Recovery runs outside BitGo infrastructure and cannot access IMS. All peer coin recovery implementations use public node endpoints. SDK `buildRecoveryResourceBounds()` mirrors BGMS `buildResourceBounds()` logic. **Remove from issue list.**

---

### 12. `fee` option dead code

**Severity:** Low  
**Status:** Confirmed

**Location:** `starknet.ts:223` (declared), never read in `recovery.ts`

**Problem:** `StarknetRecoveryOptions.fee?: string` is declared but unused. Gas fees are always computed from live block-header prices.

---

### 13. `(coin as any).getBuilderFactory()` cast

**Severity:** Low  
**Status:** Confirmed

**Location:** `recovery.ts:270`

**Problem:** Bypasses TypeScript `private` access on `starknet.ts:186`. Not a runtime bug. Should be refactored to `public` or exposed via a recovery helper on the `Starknet` class.

---

### 14. `coinSpecific.commonKeychain` uses raw `bitgoKey`

**Severity:** Low  
**Status:** Confirmed

**Location:** `recovery.ts:307-309`

**Problem:** `coinSpecific` is always `{ commonKeychain: bitgoKey }` using the raw input param. For signed sweep, `commonKeyChain` is overridden at line 166 with the MPC-derived value from `getMpcV2RecoveryKeyShares`, but `coinSpecific` ignores that. Metadata-only — does not affect the signed transaction.

---

### 15. No zero-amount guard on token transfer

**Severity:** Low  
**Status:** Confirmed

**Location:** `transferBuilder.ts:31-36`, `recovery.ts` (no pre-check)

**Problem:** `TransferBuilder.amount()` accepts `val >= 0n`. If a non-STRK token has zero balance, a zero-amount transfer is built with no error. STRK zero-balance is caught by the fee check (#7).

---

## New Issues (Missed in First Pass)

### M1. No timeout or retry on RPC calls

**Severity:** Low  
**Status:** New

**Location:** `recovery.ts:17-38`

**Problem:** `queryStarknetNode` uses bare `fetch()` with no `AbortController` timeout, no retry, and no connection pooling. Recovery makes 3–4 sequential RPC calls per invocation. Default public RPC URLs can be slow, rate-limited, or unavailable. A hung `fetch` blocks recovery with no user feedback.

---

### M2. `balance_of` response parsing silently returns 0

**Severity:** Medium  
**Status:** New

**Location:** `recovery.ts:224-228`

**Problem:**

```typescript
if (Array.isArray(balanceResult) && balanceResult.length >= 2) {
  const low = BigInt(balanceResult[0]);
  const high = BigInt(balanceResult[1]);
  balance = (high << 128n) | low;
}
```

If the RPC returns a single-element array, empty array, or non-array, `balance` stays `0n` with no error.

- **STRK sweep:** hits fee check → misleading "Insufficient STRK balance"
- **Token sweep:** builds zero-amount transfer silently
- No validation that response matches expected u256 `[low, high]` format

**Fix:** Throw on unexpected response shape rather than defaulting to zero.

---

### M3. Pervasive `(coin as any)` casts

**Severity:** Low  
**Status:** New

**Location:** `recovery.ts` lines 105, 162, 178, 270

| Line | Member | Visibility |
|------|--------|------------|
| 105 | `_staticsCoin` | `protected readonly` |
| 162 | `bitgo` | `protected` on `BaseCoin` |
| 178 | `_staticsCoin.network.type` | `protected readonly` |
| 270 | `getBuilderFactory()` | `private` |

**Problem:** `recoverStarknetWallet` is a free function rather than a `Starknet` class method, forcing access violations. Refactoring to a class method would eliminate all casts.

---

### M4. Unsigned sweep deploy tx lacks `broadcastFormat`

**Severity:** Medium  
**Status:** New

**Location:** `recovery.ts:333-336`

**Problem:** `broadcastFormat` is only populated when `!isUnsignedSweep`. For unsigned sweep (primary WRW flow), both deploy and sweep txs are returned without `broadcastFormat`. OVC must reconstruct broadcastable JSON after applying signatures from internal hex format.

---

### M5. Hardcoded public RPC defaults

**Severity:** Low  
**Status:** New

**Location:** `recovery.ts:175-180`

**Problem:** Defaults to `publicnode.com` URLs. WRW forms expose optional `nodeUrl` override, but SDK has no enterprise RPC configuration hook (Alchemy, Infura, etc.). Public RPCs may rate-limit during recovery.

---

## First-Principles Checklist

| Requirement | Status |
|-------------|--------|
| Derive correct sender from MPC material | OK at `m/0` only |
| Sign with same derived key as sender | **Broken for `index ≠ 0`** |
| Pay gas in STRK | Only validated when sweeping STRK |
| Handle undeployed counterfactual account | Logic OK; sequencing not enforced in SDK |
| Correct nonce | OK when RPC works; **unsafe fallback on failure** |
| Fee bounds match WP | Floor mismatch (conservative, Low impact) |
| Find funds across receive addresses | **No scan loop** (Medium for secondary use case) |
| Return format WRW can broadcast | Signed: partial; unsigned: incomplete pipeline |

---

## Top 5 Actionable Fixes (by WRW impact)

### 1. STRK gas check for all sweeps (#3)

Always query STRK balance and validate against `requiredGas` before building deploy/sweep txs, regardless of swept token.

### 2. Propagate nonce RPC failure (#4)

Remove silent `0x0` fallback; let `queryStarknetNode` errors reach the user.

### 3. Guard signed recovery at `index > 0` (#1)

Short-term throw; long-term pass `derivationPath` into `signRecoveryMpcV2`.

### 4. Partial-credential validation (#10)

Explicit errors when some but not all signing credentials are provided.

### 5. `createBroadcastableSweepTransaction` (#8, M4)

Complete unsigned sweep → OVC sign → broadcast pipeline.

---

## Files Reviewed

| File | Role |
|------|------|
| `modules/sdk-coin-starknet/src/lib/recovery.ts` | Core recovery logic |
| `modules/sdk-coin-starknet/src/starknet.ts` | Coin class, `recover()`, `signRecoveryTransaction` |
| `modules/sdk-coin-starknet/src/lib/constants.ts` | Gas bounds, STRK contract, class hash |
| `modules/sdk-coin-starknet/src/lib/transferBuilder.ts` | INVOKE transfer builder |
| `modules/sdk-coin-starknet/src/lib/walletInitializationBuilder.ts` | DEPLOY_ACCOUNT builder |
| `modules/sdk-coin-starknet/src/lib/transaction.ts` | Serialization, `toBroadcastFormat` |
| `modules/sdk-coin-starknet/test/unit/transactionBuilder/transactionRecover.ts` | Recovery unit tests |
| `modules/sdk-core/.../ecdsaMPCv2.ts` | `signRecoveryMpcV2` (hardcoded `m/0`) |
| `bitgo-microservices/.../starknet/starknet.ts` | WP reference implementation |
| `wallet-recovery-wizard/.../StarknetForm.tsx` | WRW form (both flows) |

---

## References

- BitGoJS commit: `e82f3a3725510141b9e0b5b9f1e84bfef43be6c9`
- Ticket: CECHO-941
- Opus 4.6 independent validation: agent `c730cbfa-1ec1-40e2-922e-53273dc3e6a0`
