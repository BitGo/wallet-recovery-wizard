# SOL (Solana Mainnet) Recovery — Client Guide

Step-by-step instructions for recovering Solana (**SOL, Mainnet**) from a self-managed BitGo wallet using the Wallet Recovery Wizard (WRW).

> **⚠️ Real funds warning:** This is the **Mainnet** guide. Every transaction moves **real, irreversible money**. Before following it, do at least one full dry run on Devnet using the companion guide (`SOL_DEVNET_RECOVERY_GUIDE.md`) — same steps, zero risk.
>
> **All addresses, keys, hashes, and transaction strings shown below are placeholders.** Nothing in this document is a real key or a value you can copy; every `<ANGLE_BRACKET>` is something you supply from your own recovery materials.

---

## Read this first

- **Irreversible:** once broadcast and finalized, a recovery cannot be undone. Check every address twice before signing or broadcasting.
- **Secrets stay secret:** never share your KeyCard values, wallet passphrase, key shard files, or shard passwords with anyone. BitGo staff will never ask for them.
- **Verify destinations:** before signing, confirm the destination address character-by-character (first and last several characters). Clipboard-malware that silently swaps addresses is a common theft vector.
- **Work offline where possible:** the signing ceremony runs entirely on your machine. Keep shard files on the offline/air-gapped machine they live on.
- **The nonce authority key is low-risk but still secret:** the keypair you create in Step 1 can only advance your nonce account and pay small transaction fees — it can never move wallet funds. Still, back it up and don't share it.

---

## Which path do I take?

| Your situation                                                                                                        | Path       | Tool flow                                                                      |
| --------------------------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------ |
| **Hot wallet** — you have the KeyCard's encrypted user key (Box A) + encrypted backup key (Box B) + wallet passphrase | **Path A** | Non-BitGo Recovery → broadcast                                                 |
| **Cold wallet** — user key never touches an online machine (hardware signer, air-gapped device, TSS key shards)       | **Path B** | Build Unsigned Sweep → OVC "Sign TSS Recoveries" → verify → splice → broadcast |

Both paths share **Step 0 (prerequisites)** and **Step 1 (durable nonce setup)** — do those first.

---

## Step 0 — Prerequisites (both paths)

**0.1 — Start the app**

If you received WRW as a packaged app, launch it. If you are running it from source:

```bash
cd wallet-recovery-wizard
npm install
npm run dev        # starts the app
```

**0.2 — Configure the app**

- Set the **Environment** dropdown (top left) to **Mainnet**.
- Note: the built-in **Broadcast Transaction** screen does **not** support Solana — SOL must be broadcast manually via RPC (commands provided below).

**0.3 — Gather your KeyCard materials**

You will need (depending on path):

- Box A Value — encrypted user key
- Box B Value — encrypted backup key (JSON blob, Argon2id-encrypted)
- Box C Value — BitGo public key
- Wallet passphrase
- BitGo public key (for Path B)
- Destination address — where funds will be swept. **Triple-check this.**

**0.4 — Install the Solana CLI** (needed for durable nonce setup in Step 1)

```bash
brew install solana
solana --version
```

(Windows/Linux: see https://solana.com/docs/intro/install)

**0.5 — Locate the helper script**

The Python commands below are consolidated in `sol_recovery.py`, which ships in the wallet-recovery-wizard repo root. If you run a command from outside that directory, invoke the script by its full path (e.g. `python3 /path/to/wallet-recovery-wizard/sol_recovery.py …`).

---

## Step 1 — Set up a durable nonce account (both paths, one-time)

> **Why this is mandatory:** Solana blockhashes expire after ~60–90 seconds, but the wizard's build time (Argon2id key decryption + signing) takes longer than that. Without a durable nonce, every broadcast fails with `BlockhashNotFound` even within seconds of generating the tx. A durable nonce account replaces the expiring blockhash with a persistent value, so the tx never goes stale.

**1.1 — Generate two keypairs** (nonce authority + nonce account)

> **Store these files securely and back them up** (encrypted drive, password manager, etc.) — they contain the authority's secret key. They are reused for every future recovery.

```bash
mkdir ~/sol-recovery-keys && cd ~/sol-recovery-keys
solana-keygen new -o nonce-authority.json --no-bip39-passphrase --force
solana-keygen new -o nonce-account.json --no-bip39-passphrase --force
```

Note down both pubkeys from the output:

- `nonce-authority.json` pubkey → the **authority** (pays tx fees)
- `nonce-account.json` pubkey → the **nonce account**

**1.2 — Fund the authority with real SOL**

There is **no faucet on Mainnet** — you must send real SOL from an exchange or another wallet you control.

- Recommended: **0.05 SOL** (covers the nonce rent below plus thousands of transaction fees).
- Send it to the **authority** pubkey — not the nonce account, not the wallet.
- Guard against clipboard-malware: after pasting, re-verify the first and last ~5 characters of the address match the `solana-keygen` output.

Confirm it arrived:

```bash
solana balance <AUTHORITY_PUBKEY> --url mainnet-beta
# => 0.05 SOL
```

**1.3 — Create the nonce account**

```bash
solana create-nonce-account nonce-account.json 0.01 \
  --nonce-authority nonce-authority.json \
  --url mainnet-beta \
  --keypair nonce-authority.json
```

(The 0.01 SOL is transferred from the authority and becomes a rent-exempt reserve — it is not spent on fees.)

**1.4 — Verify the nonce account**

```bash
solana nonce-account <NONCE_ACCOUNT_PUBKEY> --url mainnet-beta
```

Expected output shape:

```
Balance: 0.01 SOL
Minimum Balance Required: <rent-exempt minimum — a small fraction of a SOL>
Nonce blockhash: <NONCE_BLOCKHASH>
Fee: 5000 lamports per signature
Authority: <AUTHORITY_PUBKEY>
```

**1.5 — Convert the authority's secret key to base58**

> **Why base58:** the form does not mention or validate the format (its helper text just says "The secret key for your nonce account"), but the wizard passes the string to the BitGo SDK's Solana key handler, which accepts **base58 only**. Pasting the raw `solana-keygen` JSON byte-array format will fail.

```bash
python3 sol_recovery.py base58 '<path-to>/nonce-authority.json'
```

**1.6 — Record these two values for the wizard form**

| Form field                | Value                                                   |
| ------------------------- | ------------------------------------------------------- |
| Durable Nonce: Public Key | the **nonce account's** pubkey                          |
| Durable Nonce: Secret Key | the **authority's** secret key in **base58** (from 1.5) |

> **Reusability:** nonce accounts are not consumed by use — each tx that references one just advances its stored blockhash. The same nonce account + authority can be reused indefinitely across recoveries.
>
> **Re-funding:** the nonce account's 0.01 SOL is a rent-exempt reserve and is never spent — no re-funding needed. The **authority** is the fee payer (5000 lamports ≈ 0.000005 SOL per signature), so it depletes slowly; the 0.05 SOL from step 1.2 covers ~10,000 signatures. If it ever runs low, top it up the same way — send real SOL to the **authority** pubkey, never the nonce account.

---

## Path A — Hot wallet recovery (Non-BitGo Recovery)

### A1 — Open the form

In the app (Environment = Mainnet): choose **Non-BitGo Recovery** under "Available Offline", coin `sol`.

### A2 — Fill in the form

| Field                     | Value                                                              |
| ------------------------- | ------------------------------------------------------------------ |
| Key Recovery Service      | `None` (KRS providers don't support SOL)                           |
| Box A Value               | encrypted user key (from KeyCard)                                  |
| Box B Value               | encrypted backup key (from KeyCard)                                |
| Box C Value               | BitGo public key (from KeyCard)                                    |
| Wallet Passphrase         | wallet's creation passphrase                                       |
| Destination Address       | address the funds are swept to — **verify character-by-character** |
| Durable Nonce: Public Key | nonce account pubkey (from Step 1.6)                               |
| Durable Nonce: Secret Key | authority secret key, base58 (from Step 1.6)                       |
| API Key (optional)        | leave blank (only needed if you use an Alchemy-hosted SOL node)    |

Note: there is **no** Address Scanning Factor / Starting Scan Index for SOL.

### A3 — Submit and copy the generated JSON

The output looks like:

```json
{
  "serializedTx": "<BASE64_ENCODED_SIGNED_TX>",
  "scanIndex": 0
}
```

### A4 — Sanity check: 2 signatures present (wallet key + nonce authority)

```bash
python3 sol_recovery.py numsig '<serializedTx>'   # must print: numsig 2
```

### A5 — Broadcast

```bash
python3 sol_recovery.py broadcast '<serializedTx>' --network mainnet
```

The script prints the transaction signature (`<TX_SIGNATURE>`) and an Explorer link.

(Public mainnet RPCs rate-limit heavily. If you get timeouts or 429 errors, retry after a moment. To use a commercial RPC provider, edit the `RPC_ENDPOINTS` map in `sol_recovery.py` to your provider's URL.)

### A6 — Confirm on Explorer

```
https://explorer.solana.com/tx/<TX_SIGNATURE>
```

Open the link and check the tx shows a successful status (no error) at **Finalized** confirmation. Don't stop at the `sendTransaction` response — acceptance only means the tx was received, not that it executed.

✅ Path A complete.

---

## Path B — Cold wallet recovery (Build Unsigned Sweep + TSS signing)

### B1 — Check your nonce account and authority are still healthy

```bash
solana nonce-account <NONCE_ACCOUNT_PUBKEY> --url mainnet-beta    # balance + current stored blockhash
solana balance <AUTHORITY_PUBKEY> --url mainnet-beta             # the fee payer — must hold a little SOL
```

- The `Nonce blockhash` value changing between checks is proof the account is alive and being advanced by use.
- The nonce account needs no re-funding (its 0.01 SOL is a rent reserve, never spent). Only the **authority** pays fees (~0.000005 SOL/signature) — if its balance is low, top it up with real SOL before proceeding (sent to the **authority** pubkey, never the nonce account).

### B2 — Open the form and fill it in

In the app: choose **Build Unsigned Sweep** under "Available Offline", coin `sol`.

| Field                     | Value                                                              |
| ------------------------- | ------------------------------------------------------------------ |
| Bitgo Public Key          | from your recovery KeyCard — the only key material this form needs |
| Seed (optional)           | user seed / Key ID, if your KeyCard has one (most don't)           |
| Destination Address       | where swept funds go — **verify character-by-character**           |
| Durable Nonce: Public Key | same values as Step 1.6 (reusable)                                 |
| Durable Nonce: Secret Key | same values as Step 1.6                                            |
| API Key (optional)        | leave blank                                                        |

Notice what's **missing** vs Path A: no Box A/B/C, no Wallet Passphrase — the wizard genuinely never touches your cold user key here.

### B3 — Submit and copy the unsigned output JSON

You get a `txRequests[0].transactions[0].unsignedTx` object. The fields that matter:

| Field                 | What it is                                                                                                                                                                                      |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `serializedTx`        | The full Solana tx wire format with not-yet-signed signature slots zero-filled. This is what you eventually broadcast.                                                                          |
| `signableHex`         | The raw message bytes every signer signs. Exact input to the verification step — if this doesn't match what you signed, nothing else matters.                                                   |
| `derivationPath`      | e.g. `m/0` — which child key under the wallet's HD tree owns the input address.                                                                                                                 |
| `parsedTx`            | Human-readable summary (input address, amount, destination).                                                                                                                                    |
| `feeInfo`             | Fee (a small amount of SOL).                                                                                                                                                                    |
| `signatureShares: []` | Empty — the tell that this is a **TSS/MPC wallet** (threshold signature scheme / multi-party computation: no single party holds a complete private key) needing a multi-party signing ceremony. |

### B4 — Sanity-check `parsedTx` before signing anything

Open `parsedTx` and verify the **destination address** and **spend amount** match what you intend to recover — character-by-character on the address. This is your last cheap chance to catch a wrong destination before a signature makes the transaction real.

### B5 — Sign via OVC "Sign TSS Recoveries"

> **Do NOT use the OVC screen that says "Return from BitGo platform with part 2-of-6..."** — that's the _live co-signing ceremony_ for everyday transactions, which assumes BitGo's servers are online and cooperating. A self-managed recovery deliberately excludes BitGo. Use the **Sign TSS Recoveries** flow, which combines only the **user** and **backup** shares (a 2-of-3 threshold without BitGo).

The ceremony:

1. **Step 1** — load the **user** shard file, enter its password → produces the user's contribution.
2. **Step 2** — load the **backup** shard, enter its password → produces the backup's contribution, continuing from where the user's left off.
3. Steps continue through the full 6-round sequence ("1-of-6" … "6-of-6" are round labels of the threshold signing protocol, not key-holder counts) until OVC outputs the combined result.

Each shard is decrypted **locally** in the OVC session — the raw key material never leaves it, and no complete private key is ever reconstructed anywhere.

### B6 — Verify the signature offline, before broadcasting

> **Don't skip this.** If the ceremony produced a malformed/mismatched signature (wrong session, stale message, a bug), you'd only find out after broadcasting — and by then you must redo the whole ceremony. A 5-second local check avoids that.

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

> **Broadcast the string B8 printed — the spliced, fully-signed transaction — not the original unsigned `serializedTx` from B3.** The unsigned one still has slot 0 zero-filled, and the network will reject it. **On Mainnet there is no undo: confirm one last time that B4's destination check passed before running this.**

```bash
python3 sol_recovery.py broadcast '<fully-signed serializedTx from B8>' --network mainnet
```

The script prints the transaction signature (`<TX_SIGNATURE>`) and an Explorer link.

### B10 — Confirm on Explorer

```
https://explorer.solana.com/tx/<TX_SIGNATURE>
```

Open the link and check the tx shows a successful status (no error) at **Finalized** confirmation. Don't stop at the `sendTransaction` response — acceptance only means the tx was received, not that it executed.

✅ Path B complete.

---

## Troubleshooting

| Symptom                                                             | Root cause                                                                                             | Fix                                                                                                                         |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `BlockhashNotFound` on every attempt, even broadcast within seconds | Solana blockhash TTL (~60–90s) is shorter than the wizard's build time (Argon2id decryption + signing) | Use a durable nonce account (Step 1) and fill both Durable Nonce form fields                                                |
| Unsigned tx has empty signature slots                               | Cold/TSS wallet — the wizard can't sign for your cold user key                                         | Follow Path B (OVC Sign TSS Recoveries → verify → splice → broadcast)                                                       |
| OVC screen wants you to round-trip to the live BitGo platform       | You opened the live co-signing ceremony, meant for everyday transactions                               | Use OVC's **Sign TSS Recoveries** flow instead (user + backup shards only, no BitGo)                                        |
| Signature verification (B6) fails                                   | Wrong ceremony session, stale `signableHex`, or a bug                                                  | Redo the ceremony; confirm you pasted the exact `signableHex` from the current unsigned output                              |
| Broadcast rejected after a failed prior attempt                     | The nonce account's blockhash was advanced/consumed                                                    | Regenerate a fresh JSON from the wizard and re-sign; check `solana nonce-account <NONCE_ACCOUNT_PUBKEY> --url mainnet-beta` |
| RPC timeouts or HTTP 429                                            | Public mainnet RPCs rate-limit heavily                                                                 | Retry after a moment, or edit the `RPC_ENDPOINTS` map in `sol_recovery.py` to use a commercial RPC provider's URL           |
| Authority has no SOL                                                | The authority is the fee payer; without SOL nothing can be broadcast                                   | Fund the **authority** pubkey with a small amount of real SOL (Step 1.2 / B1)                                               |

---

## Quick reference — reusable commands

**Broadcast SOL (durable-nonce tx):**

```bash
python3 sol_recovery.py broadcast '<serializedTx>' --network mainnet
```

**Confirm finalization (Explorer):**

`https://explorer.solana.com/tx/<TX_SIGNATURE>` — check the tx shows a successful status (no error) at **Finalized** confirmation.

---

## Mental model (end to end)

1. **Build (WRW)** — Non-BitGo Recovery fully signs a hot wallet's tx (Path A), or Build Unsigned Sweep produces a skeleton signed only where WRW _can_ sign (the nonce authority) with your cold key's slot left empty (Path B).
2. **Sign (Path B only — OVC)** — a multi-round MPC ceremony between your **user** and **backup** shards jointly computes one Ed25519 signature (`y`/`R`/`sigma`) without ever reconstructing a complete private key.
3. **Verify (offline, before broadcasting)** — check `R || sigma` against `signableHex` and `y`. Catching a bad signature here is free; after broadcast it costs a redo of the ceremony.
4. **Assemble** — parse the message header, find your signature slot, splice `R || sigma` into it.
5. **Broadcast & confirm** — send the spliced, fully-signed tx via RPC, then confirm on Explorer (`https://explorer.solana.com/tx/<TX_SIGNATURE>`) that it shows Finalized with no error.
