// cbor-extract is a raw-V8-API native addon (an optional accelerator for
// cbor-x). It is intentionally disabled in wallet-recovery-wizard builds:
//
// 1. It is the only non-N-API addon in the dependency tree, so @electron/rebuild
//    must recompile it against Electron's V8 headers on every build. V8 15.6
//    (Electron 45) headers use `class [[deprecated]] __attribute__((visibility))`,
//    which the g++ 11 toolchain of the electronuserland/builder:24-wine image
//    cannot parse, breaking the Linux/Windows CI build and release packaging.
//
// 2. The Windows build cannot rebuild win32 native addons from the Linux build
//    container at all, so the prebuilt binary it ships is ABI-incompatible with
//    Electron and never loads there - the app already runs the cbor-x pure-JS
//    fallback on Windows today.
//
// 3. Nothing in this app executes a cbor-x code path: the only in-tree consumers
//    are @bitgo/sdk-core's keyShareEnvelope and @bitgo/sdk-lib-mpc's DKLS
//    (dkg/dsg) modules, neither of which wallet-recovery-wizard imports.
//
// cbor-x wraps this require in try/catch ("native module is optional") and
// falls back to its pure-JS implementation, so throwing here is the designed
// way to disable the accelerator.
throw new Error(
  'cbor-extract is intentionally disabled in wallet-recovery-wizard builds; cbor-x falls back to its pure-JS implementation'
);
