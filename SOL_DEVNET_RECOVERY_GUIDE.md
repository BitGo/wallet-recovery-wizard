# SOL (Devnet) Recovery — Practice Guide

Step-by-step instructions for recovering Solana on **Devnet** (the app's "Testnet" environment, coin `tsol`) using the Wallet Recovery Wizard (WRW).

> **Zero-risk practice guide:** this is the companion to `SOL_MAINNET_RECOVERY_GUIDE.md`. Run this flow end-to-end at least once before attempting a Mainnet recovery — the steps are identical, but Devnet SOL is worthless and mistakes cost nothing.
>
> **Note on networks:** WRW's "Testnet" environment for SOL broadcasts against Solana **devnet** endpoints (`https://api.devnet.solana.com`). All commands below use devnet accordingly. All addresses, keys, and hashes shown are placeholders.

---

## Which path do I take?

| Your situation                                                                                                        | Path       | Tool flow                                                                      |
| --------------------------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------ |
| **Hot wallet** — you have the KeyCard's encrypted user key (Box A) + encrypted backup key (Box B) + wallet passphrase | **Path A** | Non-BitGo Recovery → broadcast                                                 |
| **Cold wallet** — user key never touches an online machine (hardware signer, air-gapped, TSS key shards)              | **Path B** | Build Unsigned Sweep → OVC "Sign TSS Recoveries" → verify → splice → broadcast |

Both paths share **Step 0 (prerequisites)** and **Step 1 (durable nonce setup)** — do those first.

---

## Step 0 — Prerequisites (both paths)

**0.1 — Start the app**

```bash
cd wallet-recovery-wizard
npm install
npm run dev        # starts Vite dev server + Electron app
```

**0.2 — Configure the app**

- Set the **Environment** dropdown (top left) to **Testnet**.
- Note: the built-in **Broadcast Transaction** screen does **not** support Solana — SOL must be broadcast manually via RPC (commands provided below).

**0.3 — Gather your KeyCard materials**

You will need (depending on path):

- Box A Value — encrypted user key
- Box B Value — encrypted backup key (JSON blob, Argon2id-encrypted)
- Box C Value — BitGo public key
- Wallet passphrase
- BitGo public key (for Path B)
- Destination address — where funds will be swept

**0.4 — Install the Solana CLI** (needed for durable nonce setup in Step 1)

```bash
brew install solana
solana --version
```

**0.5 — Locate the helper script**

The Python commands below are consolidated in `sol_recovery.py`, which ships in the wallet-recovery-wizard repo root. If you run a command from outside that directory, invoke the script by its full path (e.g. `python3 /path/to/wallet-recovery-wizard/sol_recovery.py …`).

---

## Step 1 — Set up a durable nonce account (both paths, one-time)

> **Why this is mandatory:** Solana blockhashes expire after ~60–90 seconds, but the wizard's build time (Argon2id key decryption + signing — 64MB memory, 3 iterations, parallelism 4) takes longer than that. Without a durable nonce, every broadcast fails with `BlockhashNotFound` even within seconds of generating the tx. A durable nonce account replaces the expiring blockhash with a persistent value, so the tx never goes stale.

**1.1 — Generate two keypairs** (nonce authority + nonce account)

```bash
cd /tmp
solana-keygen new -o nonce-authority.json --no-bip39-passphrase --force
solana-keygen new -o nonce-account.json --no-bip39-passphrase --force
```

Note down both pubkeys from the output:

- `nonce-authority.json` pubkey → the **authority** (pays tx fees)
- `nonce-account.json` pubkey → the **nonce account**

**1.2 — Fund the authority on devnet** (needs ~1 SOL for fees; each tx costs ~0.000005 SOL)

```bash
solana airdrop 1 <AUTHORITY_PUBKEY> --url devnet
```

If the CLI faucet is rate-limited, request devnet SOL manually at https://faucet.solana.com to the authority pubkey, then verify:

```bash
solana balance <AUTHORITY_PUBKEY> --url devnet
# => 1 SOL
```

**1.3 — Create the nonce account**

```bash
solana create-nonce-account nonce-account.json 0.01 \
  --nonce-authority nonce-authority.json \
  --url devnet \
  --keypair nonce-authority.json
```

(The 0.01 SOL is a rent-exempt reserve — it is not spent on fees.)

**1.4 — Verify the nonce account**

```bash
solana nonce-account <NONCE_ACCOUNT_PUBKEY> --url devnet
```

Expected output shape (values illustrative — yours will differ):

```
Balance: 0.01 SOL
Minimum Balance Required: <small rent-exempt amount>
Nonce blockhash: <NONCE_BLOCKHASH>
Fee: 5000 lamports per signature
Authority: <AUTHORITY_PUBKEY>
```

**1.5 — Convert the authority's secret key to base58**

> **Why base58:** the form does not mention or validate the format (its helper text just says "The secret key for your nonce account"), but the wizard passes the string to the BitGo SDK's Solana key handler, which accepts **base58 only**. Pasting the raw `solana-keygen` JSON byte-array format will fail.

```bash
python3 sol_recovery.py base58 /tmp/nonce-authority.json
```

**1.6 — Record these two values for the wizard form**

| Form field                | Value                                                   |
| ------------------------- | ------------------------------------------------------- |
| Durable Nonce: Public Key | the **nonce account's** pubkey                          |
| Durable Nonce: Secret Key | the **authority's** secret key in **base58** (from 1.5) |

> **Reusability:** nonce accounts are not consumed by use — each tx that references one just advances its stored blockhash. The same nonce account + authority can be reused indefinitely across recoveries.
>
> **Re-funding:** the nonce account's 0.01 SOL is a rent-exempt reserve and is never spent — no re-funding needed. The **authority** is the fee payer (5000 lamports ≈ 0.000005 SOL per signature), so it depletes slowly; the 1 SOL from step 1.2 covers ~200k signatures. If it ever runs low, top it up the same way — `solana airdrop 1 <AUTHORITY_PUBKEY> --url devnet` or https://faucet.solana.com — funding the **authority** pubkey, not the nonce account.

---

## Path A — Hot wallet recovery (Non-BitGo Recovery)

### A1 — Open the form

In the app (Environment = Testnet): choose **Non-BitGo Recovery** under "Available Offline", coin `tsol`.

### A2 — Fill in the form

| Field                     | Value                                        |
| ------------------------- | -------------------------------------------- |
| Key Recovery Service      | `None` (KRS providers don't support SOL)     |
| Box A Value               | encrypted user key (from KeyCard)            |
| Box B Value               | encrypted backup key (from KeyCard)          |
| Box C Value               | BitGo public key (from KeyCard)              |
| Wallet Passphrase         | wallet's creation passphrase                 |
| Destination Address       | address the funds are swept to               |
| Durable Nonce: Public Key | nonce account pubkey (from Step 1.6)         |
| Durable Nonce: Secret Key | authority secret key, base58 (from Step 1.6) |
| API Key (optional)        | leave blank (Alchemy node override only)     |

Note: there is **no** Address Scanning Factor / Starting Scan Index for SOL.

### A3 — Submit and copy the generated JSON

The output looks like:

```json
{
  "serializedTx": "<base64 string>",
  "scanIndex": 0
}
```

### A4 — Sanity check: 2 signatures present (wallet key + nonce authority)

```bash
python3 sol_recovery.py numsig '<serializedTx>'   # must print: numsig 2
```

### A5 — Broadcast

```bash
python3 sol_recovery.py broadcast '<serializedTx>' --network devnet
```

The script prints the transaction signature (`<TX_SIGNATURE>`) and an Explorer link.

### A6 — Confirm on Explorer

```
https://explorer.solana.com/tx/<TX_SIGNATURE>?cluster=devnet
```

Open the link and check the tx shows a successful status (no error) at **Finalized** confirmation. Don't stop at the `sendTransaction` response — acceptance only means the tx was received, not that it executed.

✅ Path A complete.

---

## Path B — Cold wallet recovery (Build Unsigned Sweep + TSS signing)

### B1 — Check your nonce account and authority are still healthy

```bash
solana nonce-account <NONCE_ACCOUNT_PUBKEY> --url devnet    # balance + current stored blockhash
solana balance <AUTHORITY_PUBKEY> --url devnet              # the fee payer — must hold a little SOL
```

- The `Nonce blockhash` value changing between checks is proof the account is alive and being advanced by use.
- The nonce account needs no re-funding (its 0.01 SOL is a rent reserve, never spent). Only the **authority** pays fees (~0.000005 SOL/signature) — if its balance is low, top it up before proceeding:

```bash
solana airdrop 1 <AUTHORITY_PUBKEY> --url devnet
# if rate-limited: request devnet SOL manually at https://faucet.solana.com to the AUTHORITY pubkey
```

### B2 — Open the form and fill it in

In the app: choose **Build Unsigned Sweep** under "Available Offline", coin `tsol`.

| Field                     | Value                                                              |
| ------------------------- | ------------------------------------------------------------------ |
| Bitgo Public Key          | from your recovery KeyCard — the only key material this form needs |
| Seed (optional)           | user seed / Key ID if your KeyCard has one (most don't)            |
| Destination Address       | where swept funds go                                               |
| Durable Nonce: Public Key | same values as Step 1.6 (reusable)                                 |
| Durable Nonce: Secret Key | same values as Step 1.6                                            |
| API Key (optional)        | leave blank                                                        |

Notice what's **missing** vs Path A: no Box A/B/C, no Wallet Passphrase — the wizard genuinely never touches your cold user key here.

### B3 — Submit and copy the unsigned output JSON

You get a `txRequests[0].transactions[0].unsignedTx` object. The fields that matter:

| Field                 | What it is                                                                                                                                    |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `serializedTx`        | The full Solana tx wire format with not-yet-signed signature slots zero-filled. This is what you eventually broadcast.                        |
| `signableHex`         | The raw message bytes every signer signs. Exact input to the verification step — if this doesn't match what you signed, nothing else matters. |
| `derivationPath`      | e.g. `m/0` — which child key under the wallet's HD tree owns the input address.                                                               |
| `parsedTx`            | Human-readable summary (input address, amount, destination).                                                                                  |
| `feeInfo`             | Fee (e.g. 10000 lamports).                                                                                                                    |
| `signatureShares: []` | Empty — the tell that this is a **TSS/MPC wallet** needing a multi-party signing ceremony.                                                    |

### B4 — Sanity-check `parsedTx` before signing anything

Open `parsedTx` and verify the **destination address** and **spend amount** match what you intend to recover. This is your last cheap chance to catch a wrong destination before a signature makes the transaction real.

### B5 — Sign via OVC "Sign TSS Recoveries"

> **Do NOT use the OVC screen that says "Return from BitGo platform with part 2-of-6..."** — that's the _live co-signing ceremony_ for everyday transactions, which assumes BitGo's servers are online and cooperating. A self-managed recovery deliberately excludes BitGo. Use the **Sign TSS Recoveries** flow, which combines only the **user** and **backup** shares (a 2-of-3 threshold without BitGo).

The ceremony:

1. **Step 1** — load the **user** shard file, enter its password → produces the user's contribution.
2. **Step 2** — load the **backup** shard, enter its password → produces the backup's contribution, continuing from where the user's left off.
3. Steps continue through the full 6-round sequence ("1-of-6" … "6-of-6" are round labels of the threshold EdDSA protocol, not key-holder counts) until OVC outputs the combined result.

Each shard is decrypted **locally** in the OVC session — the raw key material never leaves it, and no complete private key is ever reconstructed anywhere.

### B6 — Verify the signature offline, before broadcasting

> **Don't skip this.** If the ceremony produced a malformed/mismatched signature (wrong session, stale message, a bug), you'd only find out after broadcasting — and by then you've burned the nonce account's current blockhash and must redo the whole ceremony. A 5-second local check avoids that.

From the OVC output, take `eddsaSignature`'s three fields:

- `y` — the wallet's Ed25519 **public key** (32 bytes); should match account key #0 in the tx
- `R` — first half of the signature
- `sigma` — second half (a full Ed25519 signature is simply `R || sigma`, 64 bytes)

```bash
python3 sol_recovery.py verify '<y from eddsaSignature>' '<R from eddsaSignature>' '<sigma from eddsaSignature>' '<signableHex from unsignedTx>'
```

Must print `SIGNATURE VALID` before proceeding. (Requires `pip3 install cryptography`; PyNaCl works equally well.)

### B7 — Find which signature slot is yours

A Solana `serializedTx` is laid out as:

```
[1 byte: number of signatures]
[64 bytes: signature #0]
[64 bytes: signature #1]
...
[message: header + account keys + blockhash/nonce + instructions]
```

The first `numRequiredSignatures` account keys are the signers, in the same order as the signature slots — so you must parse the message to confirm which slot is yours:

```bash
python3 sol_recovery.py slots '<serializedTx>'
```

Expected (typical Build Unsigned Sweep output):

- **Slot 0 empty** → yours (the cold user key); account key #0 should equal `y` from B6
- **Slot 1 already filled** → the nonce authority's signature (WRW filled it itself, since it holds the authority secret key you gave the form)

### B8 — Splice your signature into the empty slot

```bash
python3 sol_recovery.py splice '<original unsigned serializedTx>' '<R from eddsaSignature>' '<sigma from eddsaSignature>'
```

(If B7 showed your slot is a different index, pass `--slot N`.)

### B9 — Broadcast the B8 output

> **Broadcast the string B8 printed — the spliced, fully-signed transaction — not the original unsigned `serializedTx` from B3.** The unsigned one still has slot 0 zero-filled, and the network will reject it.

```bash
python3 sol_recovery.py broadcast '<fully-signed serializedTx from B8>' --network devnet
```

The script prints the transaction signature (`<TX_SIGNATURE>`) and an Explorer link.

### B10 — Confirm on Explorer

```
https://explorer.solana.com/tx/<TX_SIGNATURE>?cluster=devnet
```

Open the link and check the tx shows a successful status (no error) at **Finalized** confirmation. Don't stop at the `sendTransaction` response — acceptance only means the tx was received, not that it executed.

✅ Path B complete.

---

## Troubleshooting

| Symptom                                                             | Root cause                                                                                             | Fix                                                                                                |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `BlockhashNotFound` on every attempt, even broadcast within seconds | Solana blockhash TTL (~60–90s) is shorter than the wizard's build time (Argon2id decryption + signing) | Use a durable nonce account (Step 1) and fill both Durable Nonce form fields                       |
| Unsigned tx has empty signature slots                               | Cold/TSS wallet — the wizard can't sign for your cold user key                                         | Follow Path B (OVC Sign TSS Recoveries → verify → splice → broadcast)                              |
| OVC screen wants you to round-trip to the live BitGo platform       | You opened the live co-signing ceremony, meant for everyday transactions                               | Use OVC's **Sign TSS Recoveries** flow instead (user + backup shards only, no BitGo)               |
| Signature verification (B6) fails                                   | Wrong ceremony session, stale `signableHex`, or a bug                                                  | Redo the ceremony; confirm you pasted the exact `signableHex` from the current unsigned output     |
| Broadcast rejected after a failed prior attempt                     | The nonce account's blockhash was advanced/consumed                                                    | Regenerate a fresh JSON from the wizard and re-sign; check `solana nonce-account ... --url devnet` |

---

## Quick reference — reusable commands

**Broadcast SOL (durable-nonce tx):**

```bash
python3 sol_recovery.py broadcast '<serializedTx>' --network devnet
```

**Confirm finalization (Explorer — preferred over RPC polling):**

`https://explorer.solana.com/tx/<TX_SIGNATURE>?cluster=devnet` — check the tx shows a successful status (no error) at **Finalized** confirmation.

> Why not `getSignatureStatuses`: public devnet nodes can return `null` for older transactions (status-cache misses) even when the tx is finalized and fully queryable — the Explorer (or `getTransaction`) is the more reliable check.

---

## Mental model (end to end)

1. **Build (WRW)** — Non-BitGo Recovery fully signs a hot wallet's tx (Path A), or Build Unsigned Sweep produces a skeleton signed only where WRW _can_ sign (the nonce authority) with your cold key's slot left empty (Path B).
2. **Sign (Path B only — OVC)** — a multi-round MPC ceremony between your **user** and **backup** shards jointly computes one Ed25519 signature (`y`/`R`/`sigma`) without ever reconstructing a complete private key.
3. **Verify (offline, before broadcasting)** — check `R || sigma` against `signableHex` and `y`. Catching a bad signature here is free; after broadcast it costs a redo of the ceremony and a nonce cycle.
4. **Assemble** — parse the message header, find your signature slot, splice `R || sigma` into it.
5. **Broadcast & confirm** — send the spliced, fully-signed tx via RPC, then confirm on Explorer (`https://explorer.solana.com/tx/<TX_SIGNATURE>?cluster=devnet`) that it shows Finalized with no error.
