import { BaseCoin } from '@bitgo/sdk-core'
import {
  BaseCoin as BitgoStaticBaseCoin,
  BaseNetwork,
  CoinFamily,
  CoinFeature,
  CoinKind,
  coins,
  KeyCurve,
  NetworkType,
  UnderlyingAsset
} from '@bitgo/statics'

const isInBitgoProduction =
  location.origin === 'https://app.bitgo.com' ||
  location.origin === 'https://internal.bitgo-prod.com' ||
  process.env.PROXY_URL === 'https://app.bitgo.com'

// BitGo has a separate currency to denote offchain, we want to hide that
// from the user though
const stripOfcAndFormat = (instrumentSymbol: string, skipUpperCase?: boolean): string => {
  const formattedInstrumentSymbol = instrumentSymbol?.replace('ofc', '').replace('OFC', '') || ''
  if (skipUpperCase) return formattedInstrumentSymbol.toLowerCase()
  return formattedInstrumentSymbol.toUpperCase()
}

export class BitgoInstrument {
  public bitgoStaticBaseCoin: Readonly<BitgoStaticBaseCoin>
  public bitgoBaseCoin: BaseCoin

  constructor(symbol: string, baseCoin: BaseCoin) {
    this.bitgoBaseCoin = baseCoin
    if (symbol !== 'ofc') {
      this.bitgoStaticBaseCoin = coins.get(symbol)
    } else {
      this.bitgoStaticBaseCoin = {
        primaryKeyCurve: KeyCurve.Secp256k1,
        fullName: 'Offchain',
        name: 'ofc',
        prefix: '$',
        suffix: '',
        kind: CoinKind.FIAT,
        family: CoinFamily.OFC,
        isToken: false,
        features: [],
        decimalPlaces: 2,
        asset: UnderlyingAsset.USD,
        network: {
          name: isInBitgoProduction ? 'Ofc' : 'OfcTestnet',
          type: isInBitgoProduction ? NetworkType.MAINNET : NetworkType.TESTNET,
          family: CoinFamily.OFC,
          explorerUrl: undefined,
        },
      }
    }
  }

  public getDecimalPlaces(): number {
    return this.bitgoStaticBaseCoin.decimalPlaces
  }

  public getFullName(): string {
    return this.bitgoStaticBaseCoin.fullName
  }

  public getSymbol(makeLowerCase?: boolean, cutOFC?: boolean): string {
    const symbol = this.bitgoStaticBaseCoin.name
    const trimmedSymbol = cutOFC ? symbol.replace('ofc', '') : symbol
    return makeLowerCase ? trimmedSymbol.toLowerCase() : trimmedSymbol.toUpperCase()
  }

  public getKind(): CoinKind {
    return this.bitgoStaticBaseCoin.kind
  }

  public getFamily(): CoinFamily {
    return this.bitgoStaticBaseCoin.family
  }

  public getFeatures(): CoinFeature[] {
    return this.bitgoStaticBaseCoin.features
  }

  public getNetwork(): BaseNetwork {
    return this.bitgoStaticBaseCoin.network
  }

  public getCurve(): KeyCurve {
    return this.bitgoStaticBaseCoin.primaryKeyCurve
  }

  public isOFC(): boolean {
    return this.bitgoStaticBaseCoin.family == CoinFamily.OFC
  }

  public isToken(): boolean {
    return this.bitgoStaticBaseCoin.isToken
  }

  public baseUnitsToBigUnits(baseUnits: string | number): string {
    if (baseUnits === 0 || baseUnits === '0' || baseUnits === null) {
      return '0'
    }
    return this.bitgoBaseCoin.baseUnitsToBigUnits(baseUnits)
  }

  public bigUnitsToBaseUnits(bigUnits: string | number): string {
    if (bigUnits === 0 || bigUnits === '0' || bigUnits === null) {
      return '0'
    }
    return this.bitgoBaseCoin.bigUnitsToBaseUnits(bigUnits)
  }

  // BitGo has a separate currency to denote offchain, we want to hide that
  // from the user though
  public getStandardSymbol(makeLowerCase?: boolean): string {
    return stripOfcAndFormat(this.bitgoStaticBaseCoin.name, makeLowerCase)
  }
}
