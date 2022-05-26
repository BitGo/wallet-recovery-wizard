import { Pair } from './coins'
import { Vendor } from './liquidity-vendors'
import { Side } from './quote'

export enum LiquidityType {
  otc = 'otc',
  exchange = 'exchange',
}

export interface Orderbook {
  coin: string
  fiat: string
  vendor: Vendor
  timestamp: number
  bids: {
    price: string
    amount: string
    vendor?: Vendor
  }[]
  asks: {
    price: string
    amount: string
    vendor?: Vendor
  }[]
}

export interface Quote {
  type: 'direct' | 'rfq'
  amount?: string
  minAmount?: string
  maxAmount?: string
  counterparty: string
  datetime?: Date
  expiryTime?: number // Unix timestamp in milliseconds
  pair: Pair
  price?: string
  side: Side
  vendor: Vendor
  // TODO: Refactor these to use an Enum (once we start persisting quotes)
  status: 'new' | 'pending' | 'active' | 'expired' | 'cancelled' | 'executed' | 'inactive'
  timestamp: number // Unix timestamp in milliseconds
  id: string
}

export interface Tick {
  vendor: Vendor
  timestamp: number

  coin: string
  fiat: string

  last: string
  ask?: string
  bid?: string

  high?: string
  low?: string

  high_1h?: string
  low_1h?: string

  high_24h?: string
  low_24h?: string

  high_1month?: string
  low_1month?: string

  change_24h?: string
  average_24h?: string
  volume_24h?: string
}

export interface TickResponse {
  ticks: Tick[]
  timestamp: number
  date: string
}
