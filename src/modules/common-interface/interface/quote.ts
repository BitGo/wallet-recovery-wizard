export enum Side {
  buy = 'buy',
  sell = 'sell',
}

export interface QuoteRequest {
  side: Side
  quantity: string
  baseCurrency: string
  quoteCurrency: string
}

export interface QuoteResponse {
  id: string
  side: Side
  quantity: string
  baseCurrency: string
  quoteCurrency: string
  price: string
  rate: string
}

export interface AcceptQuoteRequest {
  id: string
  side: Side
  quantity: string
  baseCurrency: string
  quoteCurrency: string
  price: string
  rate: string
  signature: string
  payload?: string
  partnerAccountId?: string
}
