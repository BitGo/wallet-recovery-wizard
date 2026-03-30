#!/usr/bin/env python3
"""
Assemble a fully-signed Cardano transaction from OVC output and broadcast
via the Koios API.

Supports both mainnet (ADA) and Preprod testnet (TADA).

Usage:
  python3 broadcast_ada.py <FullySigned.json> [--dry-run] [--network mainnet|preprod]

Options:
  --dry-run              Assemble and print signed CBOR without broadcasting.
  --network mainnet      Broadcast to Cardano mainnet via Koios.
  --network preprod      Broadcast to Cardano Preprod testnet via Koios (default).

Requirements:
  pip install cbor2

The signed JSON file is the output of the OVC "Sign TSS Recoveries" flow.
For consolidation runs with multiple funded addresses, one signatureShares
entry is produced per address. This script broadcasts all of them in order.
"""

import sys
import json
import cbor2
import urllib.request
import urllib.error

KOIOS_PREPROD = "https://preprod.koios.rest/api/v1/submittx"
KOIOS_MAINNET  = "https://api.koios.rest/api/v1/submittx"

def assemble_signed_tx(unsigned_cbor_hex: str, vkey_hex: str, r_hex: str, sigma_hex: str) -> str:
    """
    Replace the empty witness set in the unsigned transaction CBOR with a
    single Ed25519 vkey-witness built from the OVC EdDSA signature components.

    Cardano tx structure (array of 4):
      [transaction_body, transaction_witness_set, bool (validity), aux_data]

    vkeywitness = [vkey (32 bytes), signature (64 bytes)]
    signature   = R (32 bytes) || sigma (32 bytes)
    """
    raw = bytes.fromhex(unsigned_cbor_hex)
    tx  = cbor2.loads(raw)

    assert isinstance(tx, list) and len(tx) == 4, \
        f"Expected Cardano tx array(4), got: {type(tx)} len={len(tx)}"

    tx_body, _witness_set, valid_flag, aux_data = tx

    vkey      = bytes.fromhex(vkey_hex)       # 32 bytes – public key
    signature = bytes.fromhex(r_hex + sigma_hex)  # 64 bytes – R || sigma

    assert len(vkey) == 32,      f"vkey must be 32 bytes, got {len(vkey)}"
    assert len(signature) == 64, f"signature must be 64 bytes, got {len(signature)}"

    # Cardano vkeywitness set: { 0: [[vkey, sig]] }
    witness_set = {0: [[vkey, signature]]}

    signed_tx = [tx_body, witness_set, valid_flag, aux_data]
    return cbor2.dumps(signed_tx).hex()


def broadcast(signed_cbor_hex: str, network: str = "preprod") -> dict:
    url     = KOIOS_PREPROD if network == "preprod" else KOIOS_MAINNET
    payload = bytes.fromhex(signed_cbor_hex)

    req = urllib.request.Request(
        url,
        data=payload,
        headers={"Content-Type": "application/cbor"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = resp.read().decode()
            return {"status": resp.status, "txHash": body.strip().strip('"')}
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        return {"status": e.code, "error": body}


def main():
    args     = sys.argv[1:]
    dry_run  = "--dry-run" in args

    network = "preprod"
    if "--network" in args:
        idx = args.index("--network")
        if idx + 1 < len(args):
            network = args[idx + 1]
            if network not in ("mainnet", "preprod"):
                print(f"ERROR: --network must be 'mainnet' or 'preprod', got '{network}'")
                sys.exit(1)
        else:
            print("ERROR: --network requires a value (mainnet or preprod)")
            sys.exit(1)

    json_args = [a for a in args if not a.startswith("--") and a not in ("mainnet", "preprod")]

    if not json_args:
        print("Usage: python3 broadcast_ada.py <FullySigned.json> [--dry-run] [--network mainnet|preprod]")
        sys.exit(1)

    with open(json_args[0]) as f:
        data = json.load(f)

    # FullySigned.json produced by OVC has structure:
    #   { signatureShares: [ { txRequest: { transactions: [...] }, ovc: [...] } ] }
    # When consolidating multiple addresses, there is one signatureShare per address.
    sig_shares = data["signatureShares"]
    if not sig_shares:
        print("ERROR: No signature shares found in file.")
        sys.exit(1)

    for idx, sig_share in enumerate(sig_shares):
        tx_entry  = sig_share["txRequest"]["transactions"][0]
        ovc_sig   = sig_share["ovc"][0]["eddsaSignature"]

        unsigned_cbor = tx_entry["unsignedTx"]["serializedTx"]
        vkey_hex      = ovc_sig["y"]    # public key (32 bytes)
        r_hex         = ovc_sig["R"]    # nonce commitment (32 bytes)
        sigma_hex     = ovc_sig["sigma"]  # signature scalar (32 bytes)

        scan_idx = tx_entry.get("unsignedTx", {}).get("scanIndex", idx + 1)
        print(f"\n--- Transaction {idx + 1}/{len(sig_shares)} (scanIndex={scan_idx}) ---")
        print(f"Unsigned CBOR : {unsigned_cbor[:60]}...")
        print(f"Public key (y): {vkey_hex}")
        print(f"R              : {r_hex}")
        print(f"sigma          : {sigma_hex}")

        signed_cbor = assemble_signed_tx(unsigned_cbor, vkey_hex, r_hex, sigma_hex)
        print(f"Signed CBOR length: {len(signed_cbor) // 2} bytes")

        if dry_run:
            print(f"\n[dry-run] Would broadcast transaction {idx + 1}. Skipping.")
            if idx == 0:
                print(f"Full signed CBOR hex:\n{signed_cbor}")
            continue

        network_label = "mainnet" if network == "mainnet" else "Preprod testnet"
        print(f"\nBroadcasting transaction {idx + 1}/{len(sig_shares)} to Cardano {network_label} via Koios…")
        result = broadcast(signed_cbor, network=network)

        if "txHash" in result and result.get("status") == 202:
            print(f"Success! Tx Hash : {result['txHash']}")
            explorer_base = "https://cardanoscan.io" if network == "mainnet" else "https://preprod.cardanoscan.io"
            print(f"Explorer: {explorer_base}/transaction/{result['txHash']}")
        else:
            print(f"Broadcast response: {result}")

    if dry_run and len(sig_shares) > 1:
        print(f"\n[dry-run] Total: {len(sig_shares)} transaction(s) would be broadcast.")


if __name__ == "__main__":
    main()
