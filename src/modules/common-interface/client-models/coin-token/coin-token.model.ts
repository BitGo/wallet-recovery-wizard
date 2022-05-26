import {
  AccountNetwork,
  BaseCoinConstructorOptions,
  CoinFamily,
  CoinFeature,
  CoinKind,
  KeyCurve,
  UnderlyingAsset,
} from '@bitgo/statics'
import { Tick } from '../../interface/market-data'

export interface CoinUrls {
  txUrl?: string
  address?: string
  image?: string
}

export class CoinToken implements BaseCoinConstructorOptions {
  public static isCoinToken(instance: CoinToken): boolean {
    return instance?.isCoinToken
  }

  public readonly fullName: string
  public readonly name: string
  public readonly prefix?: string
  public readonly suffix?: string
  public readonly addressCoin?: string
  // TODO after BG-12674: make readonly again once we don't have to override it for susd anymore
  public kind: CoinKind
  public readonly family: CoinFamily
  public readonly isToken: boolean
  public readonly hasTokens: boolean
  public readonly features: CoinFeature[]
  public readonly decimalPlaces: number
  public readonly asset: UnderlyingAsset
  public readonly network: AccountNetwork
  public readonly primaryKeyCurve: KeyCurve
  public assetStr = ''
  public urls: CoinUrls

  /**
   * getMarketData is a handler set by CoinService to resolve
   * current MarketData for this coin. Coins not created by
   * CoinService will not have this.
   */
  public getMarketData: (coinToken: CoinToken) => Tick
  private isCoinToken = true

  constructor(coin?: any) {
    if (coin) {
      this.fullName = coin.fullName
      this.name = coin.name
      this.prefix = coin.prefix
      this.addressCoin = coin.addressCoin
      // make sure the suffix is uppercase
      if (coin.hasOwnProperty('suffix') && coin.suffix) {
        this.suffix = coin.suffix.toUpperCase()
      }
      this.kind = coin.kind
      this.family = coin.family
      this.isToken = coin.isToken
      this.features = coin.features
      this.decimalPlaces = coin.decimalPlaces
      this.asset = coin.asset
      this.network = coin.network
      this.primaryKeyCurve = coin.primaryKeyCurve
      this.urls = {}
      this.getMarketData = coin.getMarketData
      // store an uppercase string version of the asset
      if (this.asset) {
        this.assetStr = coin.asset.toString().toUpperCase()
      }
      this.hasTokens = this.features && this.features.includes(CoinFeature.SUPPORTS_TOKENS)
    }
  }
}
