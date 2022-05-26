/// ////////////
// Enums
/// ////////////
export enum PendingApprovalState {
  pending = 'pending',
  awaitingSignature = 'awaitingSignature',
  pendingBitGoAdminApproval = 'pendingBitGoAdminApproval',
  pendingFinalApproval = 'pendingFinalApproval',
  pendingCustodianApproval = 'pendingCustodianApproval',
  pendingVideoApproval = 'pendingVideoApproval',
  pendingIdVerification = 'pendingIdVerification',
  pendingCryptographicApproval = 'pendingCryptographicApproval',
  approved = 'approved',
  processing = 'processing',
  rejected = 'rejected',
}

export enum PendingApprovalScope {
  enterprise = 'enterprise',
  key = 'key',
  wallet = 'wallet',
}

export enum ApprovalType {
  adminApprovals = 'updateApprovalsRequiredRequest',
  policy = 'policyRuleRequest',
  transaction = 'transactionRequest',
  user = 'userChangeRequest',
  updateEnterpriseRequest = 'updateEnterpriseRequest',
}

export enum VideoException {
  bitgoPrimeWithdrawal = 'BitGo Prime Withdrawal',
  bitgoTesting = 'BitGo Testing',
  swissKeyRegistration = 'Swiss Key Registration',
}

/// ///////////////////
// Begin defining Pending Approval structure.
// For ease of use throughout the app, PendingApproval is extended to multiple various implementations
// See api schema for more details: packages/wallet-platform/www/api-schema/PendingApproval.yaml
/// ///////////////////
export interface PendingApproval {
  approvalsRequired: number
  coin: string
  createDate: string
  creator: string
  enterprise: string
  id: string
  info: {
    type: ApprovalType
  }
  resolvers: PendingApprovalResolver[]
  scope: PendingApprovalScope
  state: PendingApprovalState
  userIds: string[]
  wallet: string
  // v1 wallet approvals
  bitcoinAddress?: string
  // The merged route annotates a version that is used by the legacy UI to call the correct update route
  version?: number
  videoId: PendingApprovalVideoId
}

export interface PendingApprovalResolver {
  user: string
  date: string
  resolutionType: PendingApprovalState
  signatures: string[]
  videoLink?: string
  videoException?: string
}

export interface PendingApprovalVideoId {
  user: string
  date: string
  videoLink?: string
  videoApprover?: string
  videoException?: string
}

/// ////////////////////
// Other Pending Approval types
/// ////////////////////

export interface ProRegTx {
  collateralAddress: string
  service: string
  keyIDOwner: string
  pubKeyOperator: string
  keyIDVoting: string
  operatorReward: number
  payoutAddress: string
}
