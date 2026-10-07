#!/usr/bin/env python3
"""
Helper script for Solana self-managed cold wallet recovery with the Wallet
Recovery Wizard (WRW).

Consolidates the inline Python snippets from SOL_MAINNET_RECOVERY_GUIDE.md and
SOL_DEVNET_RECOVERY_GUIDE.md into a single runnable tool:

  base58      Convert a solana-keygen secret-key JSON file to base58 (Step 1.5).
  numsig      Print the number of signatures in a serialized transaction (A4).
  verify      Verify an Ed25519 signature (y/R/sigma) against signableHex (B6).
  slots       Show the signature-slot layout and account keys of a tx (B7).
  splice      Splice an Ed25519 signature (R || sigma) into a signature slot (B8).
  broadcast   Broadcast a signed transaction via the Solana JSON-RPC API (A5/B9).

Usage:
  python3 sol_recovery.py base58 <keypair.json>
  python3 sol_recovery.py numsig <serializedTx>
  python3 sol_recovery.py verify <y> <R> <sigma> <signableHex>
  python3 sol_recovery.py slots <serializedTx>
  python3 sol_recovery.py splice <serializedTx> <R> <sigma> [--slot 0]
  python3 sol_recovery.py broadcast <serializedTx> [--network devnet|mainnet] [--dry-run]

Requirements:
  The 'verify' subcommand requires `pip3 install cryptography` (PyNaCl also
  works). Every other subcommand uses the Python standard library only.
"""

import sys
import json
import base64
import binascii
import urllib.request
import urllib.error

BASE58_ALPHABET = b"123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"

RPC_ENDPOINTS = {
    "devnet": "https://api.devnet.solana.com",
    "mainnet": "https://api.mainnet-beta.solana.com",
}

EXPLORER_URLS = {
    "devnet": "https://explorer.solana.com/tx/{}?cluster=devnet",
    "mainnet": "https://explorer.solana.com/tx/{}",
}


def encode_base58(raw: bytes) -> str:
    """Encode bytes as base58, preserving leading zero bytes."""
    n = int.from_bytes(raw, "big")
    result = ""
    while n > 0:
        n, r = divmod(n, 58)
        result = chr(BASE58_ALPHABET[r]) + result
    pad = sum(1 for b in raw if b == 0)
    return BASE58_ALPHABET[:1].decode() * pad + result


def base58_command(args):
    if len(args) != 1:
        print("Usage: python3 sol_recovery.py base58 <keypair.json>")
        sys.exit(1)
    with open(args[0]) as f:
        data = json.load(f)
    print(encode_base58(bytes(data)))


def numsig_command(args):
    if len(args) != 1:
        print("Usage: python3 sol_recovery.py numsig <serializedTx>")
        sys.exit(1)
    raw = base64.b64decode(args[0])
    print("numsig", raw[0])


def verify_command(args):
    if len(args) != 4:
        print("Usage: python3 sol_recovery.py verify <y> <R> <sigma> <signableHex>")
        sys.exit(1)
    y, R, sigma, signable_hex = args

    from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey

    pub_bytes = binascii.unhexlify(y)
    sig_bytes = binascii.unhexlify(R) + binascii.unhexlify(sigma)
    msg_bytes = binascii.unhexlify(signable_hex)

    pubkey = Ed25519PublicKey.from_public_bytes(pub_bytes)
    try:
        pubkey.verify(sig_bytes, msg_bytes)
        print("SIGNATURE VALID")
    except Exception as e:
        print("INVALID:", e)
        sys.exit(1)


def slots_command(args):
    if len(args) != 1:
        print("Usage: python3 sol_recovery.py slots <serializedTx>")
        sys.exit(1)
    raw = base64.b64decode(args[0])
    numsig = raw[0]
    print("numsig:", numsig)
    for i in range(numsig):
        start = 1 + i * 64
        empty = raw[start:start + 64] == b"\x00" * 64
        print(f"slot {i} is empty: {empty}")

    msg = raw[1 + numsig * 64:]
    numkeys = msg[3]
    offset = 4
    for i in range(numkeys):
        print("account key", i, msg[offset:offset + 32].hex())
        offset += 32


def splice_command(args):
    slot = 0
    if "--slot" in args:
        idx = args.index("--slot")
        if idx + 1 >= len(args):
            print("ERROR: --slot requires a value (signature slot index)")
            sys.exit(1)
        slot = int(args[idx + 1])
        args = args[:idx] + args[idx + 2:]

    if len(args) != 3:
        print("Usage: python3 sol_recovery.py splice <serializedTx> <R> <sigma> [--slot 0]")
        sys.exit(1)

    serialized_tx, R, sigma = args
    raw = bytearray(base64.b64decode(serialized_tx))
    sig = binascii.unhexlify(R) + binascii.unhexlify(sigma)

    start = 1 + slot * 64
    end = 1 + (slot + 1) * 64
    raw[start:end] = sig

    print(base64.b64encode(bytes(raw)).decode())


def broadcast_command(args):
    network = "devnet"
    dry_run = "--dry-run" in args

    if "--network" in args:
        idx = args.index("--network")
        if idx + 1 >= len(args):
            print("ERROR: --network requires a value (devnet or mainnet)")
            sys.exit(1)
        network = args[idx + 1]
        args = args[:idx] + args[idx + 2:]

    if network not in RPC_ENDPOINTS:
        print(f"ERROR: --network must be 'devnet' or 'mainnet', got '{network}'")
        sys.exit(1)

    positional = [a for a in args if a != "--dry-run"]

    if len(positional) != 1:
        print("Usage: python3 sol_recovery.py broadcast <serializedTx> [--network devnet|mainnet] [--dry-run]")
        sys.exit(1)

    serialized_tx = positional[0]

    if dry_run:
        print(f"[dry-run] Would broadcast to {network}: {serialized_tx[:60]}...")
        return

    url = RPC_ENDPOINTS[network]
    payload = json.dumps({
        "id": 2,
        "jsonrpc": "2.0",
        "method": "sendTransaction",
        "params": [serialized_tx, {"encoding": "base64"}],
    }).encode()

    req = urllib.request.Request(
        url,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        print(f"HTTP {e.code}: {e.read().decode()}")
        sys.exit(1)

    result = body.get("result")
    if result:
        print("Success! Tx signature:", result)
        print("Explorer:", EXPLORER_URLS[network].format(result))
    else:
        print("Broadcast response:", body)


COMMANDS = {
    "base58": base58_command,
    "numsig": numsig_command,
    "verify": verify_command,
    "slots": slots_command,
    "splice": splice_command,
    "broadcast": broadcast_command,
}


def main():
    if len(sys.argv) < 2 or sys.argv[1] not in COMMANDS:
        print(__doc__)
        sys.exit(1)

    COMMANDS[sys.argv[1]](sys.argv[2:])


if __name__ == "__main__":
    main()
