export interface OfcCoin {
  type: string
  coin: string
  decimalPlaces: bigint
  name: string
  backingCoin: string
  isFiat?: boolean
  minimumDenomination: bigint
}

export class Pair {
  static fromString(pair: string): Pair {
    // possible delimiters of a pair's base and quote, like BTC/USD or BTC-USD
    const delimiters = ['/', '-']
    let delimiterPos = -1

    // finds a delimiter if it exists and notes its position
    for (const del of delimiters) {
      if (pair.indexOf(del) !== -1) {
        delimiterPos = pair.indexOf(del)
      }
    }

    // if no delimiter (like BTCUSD), assume the last 3 chars are the quote
    // WARNING this can break crypto->crypto pairs for coins that are abbreviated with 4+ chars (like USDT)
    // for this reason, our internal systems should always include the delimiter, this branch should be a last resort
    if (delimiterPos === -1) {
      const splitPos = pair.length - 3
      const base = pair.slice(0, splitPos)
      const quote = pair.slice(splitPos)

      return new Pair(base, quote)
    }

    const base = pair.slice(0, delimiterPos)
    const quote = pair.slice(delimiterPos + 1)

    return new Pair(base, quote)
  }

  //
  // this type of response: ['BTC', 'USD'] is used by Bitstamp, and possibly other exchanges
  static fromArray(pair: [string, string]): Pair {
    return new Pair(pair[0], pair[1])
  }

  static allCombinations(bases: string[], quotes: string[]): Pair[] {
    const pairs: Pair[] = []

    for (const base of bases) {
      for (const quote of quotes) {
        pairs.push(new Pair(base, quote))
      }
    }

    return pairs
  }

  constructor(public base: string, public quote: string) {}

  toString(delimiter: string = '/', reverse: boolean = false): string {
    if (reverse) {
      return this.quote + delimiter + this.base
    }

    return this.base + delimiter + this.quote
  }

  toArray(): [string, string] {
    return [this.base, this.quote]
  }
}
