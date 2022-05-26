import BigNumber from 'bignumber.js'

import { CoinToken } from '../coin-token/coin-token.model'
import { PendingApproval } from '../pending-approval/pending-approval.model'

interface XpubInfo {
  xpub: string
  derivedFromParentWithSeed?: string
}

interface XpubsWithDerivationPath {
  user: XpubInfo
  backup: XpubInfo
  bitgo: XpubInfo
}

export interface Transaction {
  id: string
  coin: string
  wallet: string // Id
  enterprise: string // Id
  txid?: string
  blockchainUrl?: string
  height?: number
  heightId?: string
  date: string
  confirmations?: number
  type: string
  value: number | BigNumber
  valueString: string
  baseValue: number | BigNumber
  baseValueString: string
  feeString?: string
  payGoFee: number
  payGoFeeString: string
  usd?: number
  usdRate?: number
  state: string
  instant: boolean
  isReward?: boolean
  isFee?: boolean
  tags: string[]
  history: HistoryItem[]
  coinSpecific?: {
    settlementFeeString?: string
    hopTxId?: string
    gas?: number // gasLimit
    gasPrice?: number
    gasUsed?: number
    maxFeePerGas?: number
    maxPriorityFeePerGas?: number
  }
  comment?: string
  vSize?: number
  nSegwitInputs?: number
  entries: any[]
  confirmedTime?: string
  unconfirmedTime?: string
  approvedTime?: string
  signedTime?: string
  createdTime: string
  commentedTime?: string
  sendAccounting?: any[]
  label?: string
  outputs?: any[]
  inputs?: any[]
  normalizedTxHash?: string
  // Decorated onto the tx by consuming service
  coinToken?: CoinToken
  bank$?: any
  settlementPair?: Transaction
  isSettlementPartial?: boolean
  isPrimeTransaction?: boolean
  // Pending Approval ID
  pendingApproval?: string
  // Gets annotated by TransactionService
  pendingApprovalObject?: PendingApproval
  eip1559?: {
    maxPriorityFeePerGas: number
    maxFeePerGas: number
  }
  replayProtectionOptions?: {
    chain: string | number
    hardfork: string
  }
  xpubsWithDerivationPath?: XpubsWithDerivationPath
}

export interface HistoryItem {
  action: string
  date: string
  comment?: string
  user?: string
}

export interface Recipient {
  address: string // bank idHash
  amount: string // amount in cents
  data?: string
}

// https://app.bitgo-dev.com/api/v2/internal/#operation/v2.approval.listawaitingsignature
export interface TransactionAwaitingSignature {
  address: string
  amount: string
  coin: string
  coinToken?: CoinToken // added by the UI
  comment: string
  createDate: string
  creatorEmail: string
  creatorId: string
  enterpriseId: string
  enterpriseName: string
  feeInfo: string
  pendingApprovalId: string
  token?: string
  txBase64: string
  txInfo: string
  videoId: {
    approver: string
    link: string
    waived: boolean
  }
  walletId: string
  walletLabel: string
}

export interface OfflineUnsignedTransaction extends TransactionAwaitingSignature {
  debug: any
  formatVersion: number
  keyDerivationPath: string
  txHex: string
}

export interface OfflineHalfSignedTransaction extends OfflineUnsignedTransaction {
  halfSigned: {
    txHex: string
  }
  xpubsWithDerivationPath?: XpubsWithDerivationPath
  isHalfSigned: boolean
}

export interface DownloadedHalfSignedTransactions {
  signedTransactions: OfflineHalfSignedTransaction[]
}
