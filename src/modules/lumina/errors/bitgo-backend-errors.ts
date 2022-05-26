export enum BitgoBackendErrorCode {
  INVALID_ARGUMENT = 'bitgo:backend:invalidArgument',
}

export enum BitgoTransactionResultError {
  pendingVerification = 'address(es) on advanced whitelist are missing verification',
  triggeredAllTxPolicy = 'triggered all transactions policy',
}
