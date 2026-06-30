# Wallet Recovery Wizard - Recovery Flows

This document explains the two main recovery flows in the Wallet Recovery Wizard.

---

## Overview

The Wallet Recovery Wizard provides two recovery options:
1. **Non-BitGo Recovery** - Creates a fully-signed transaction
2. **Build Unsigned Sweep** - Creates an unsigned transaction

Both flows use the same underlying SDK method (`baseCoin.recover()`) but with different parameters.

---

## Non-BitGo Recovery

### Purpose
Recover funds from a BitGo wallet when you have access to all keys and the wallet passphrase. Produces a **fully-signed transaction** that can be broadcast immediately.

### User Inputs
| Field | Description |
|-------|-------------|
| `userKey` | Encrypted user private key (from keycard Box A) |
| `backupKey` | Encrypted backup private key (from keycard Box B) |
| `bitgoKey` | BitGo public key (from keycard Box C) |
| `walletPassphrase` | Password used to decrypt the keys |
| `recoveryDestination` | Address where recovered funds will be sent |

### Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  1. User fills form with keys + passphrase                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. Frontend calls:                                             │
│     window.commands.recover(coin, {                             │
│       userKey: 'encrypted...',                                  │
│       backupKey: 'encrypted...',                                │
│       bitgoKey: 'public...',                                    │
│       walletPassphrase: 'secret',    ◄── KEY PARAMETER          │
│       recoveryDestination: '0x...',                             │
│     })                                                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. Electron main process (electron/main/index.ts:440)          │
│     - Receives IPC call                                         │
│     - Registers coin SDK via coinFactory                        │
│     - Calls baseCoin.recover(params)                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. BitGo SDK (@bitgo/sdk-coin-xxx)                             │
│     - Decrypts userKey and backupKey using walletPassphrase     │
│     - Builds the recovery transaction                           │
│     - Signs the transaction with decrypted keys                 │
│     - Returns FULLY-SIGNED transaction                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  5. User saves JSON file                                        │
│     - File contains signed transaction ready to broadcast       │
│     - Default path: ~/{coin}-recovery-{timestamp}.json          │
└─────────────────────────────────────────────────────────────────┘
```

### Code Location
- Form components: `src/containers/NonBitGoRecoveryCoin/`
- Handler: `src/containers/NonBitGoRecoveryCoin/NonBitGoRecoveryCoin.tsx`

### Output
A JSON file containing the fully-signed transaction that can be broadcast to the network.

---

## Build Unsigned Sweep

### Purpose
Create a recovery transaction when you **do not** have access to private keys (e.g., cold wallets, custody wallets). Produces an **unsigned transaction** that needs to be signed separately.

### User Inputs
| Field | Description |
|-------|-------------|
| `bitgoKey` | BitGo public key only |
| `recoveryDestination` | Address where recovered funds will be sent |
| `seed` | Recovery seed (for some coins) |

**Note**: No `userKey`, `backupKey`, or `walletPassphrase` required.

### Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  1. User fills form with public key only                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. Frontend calls:                                             │
│     window.commands.recover(coin, {                             │
│       userKey: '',           ◄── EMPTY                          │
│       backupKey: '',         ◄── EMPTY                          │
│       bitgoKey: 'public...',                                    │
│       recoveryDestination: '0x...',                             │
│       seed: '...',                                              │
│       // NO walletPassphrase                                    │
│     })                                                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. Electron main process (electron/main/index.ts:440)          │
│     - Receives IPC call                                         │
│     - Registers coin SDK via coinFactory                        │
│     - Calls baseCoin.recover(params)                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. BitGo SDK (@bitgo/sdk-coin-xxx)                             │
│     - Sees no private keys provided                             │
│     - Builds the recovery transaction                           │
│     - Does NOT sign (no keys to sign with)                      │
│     - Returns UNSIGNED transaction                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  5. User saves JSON file                                        │
│     - File contains unsigned transaction                        │
│     - Needs to be signed offline or by BitGo                    │
│     - Default path: ~/{coin}-unsigned-sweep-{timestamp}.json    │
└─────────────────────────────────────────────────────────────────┘
```

### Code Location
- Form components: `src/containers/BuildUnsignedSweepCoin/`
- Handler: `src/containers/BuildUnsignedSweepCoin/BuildUnsignedSweepCoin.tsx`

### Output
A JSON file containing the unsigned transaction that needs additional signing before broadcast.

---

## Comparison

| Aspect | Non-BitGo Recovery | Build Unsigned Sweep |
|--------|-------------------|---------------------|
| **userKey** | Encrypted private key | Empty string `''` |
| **backupKey** | Encrypted private key | Empty string `''` |
| **walletPassphrase** | Required | Not used |
| **Output** | Fully-signed transaction | Unsigned transaction |
| **Can broadcast immediately?** | Yes | No |
| **Use case** | Hot wallets, self-custody | Cold wallets, custody |

---

## SDK Method

Both flows call the **same** SDK method:

```
electron/main/index.ts (line 440-462)

ipcMain.handle('recover', async (event, coin, parameters) => {
  const baseCoin = sdk.coin(coin);
  const result = await baseCoin.recover(parameters);
  return result;
});
```

The SDK internally determines whether to sign based on the presence of keys:
- Keys provided → decrypt and sign → return signed transaction
- No keys → build only → return unsigned transaction

---

## File Output Locations

When recovery completes, user is prompted to save a JSON file:

| Flow | Default Filename |
|------|------------------|
| Non-BitGo Recovery | `~/{coin}-recovery-{timestamp}.json` |
| Build Unsigned Sweep | `~/{coin}-unsigned-sweep-{timestamp}.json` |

The `~` expands to the user's home directory on macOS/Linux.