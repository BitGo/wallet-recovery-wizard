import * as d3Format from 'd3-format'
import { format, formatDistance } from 'date-fns'
import _ from 'lodash'
import filesize from 'filesize'

// Settings.defaultZoneName = 'utc'

class FormatterImpl {
  /// //////////////////////////////////////////////////////////////////////////
  // General Number Formatting
  /// //////////////////////////////////////////////////////////////////////////

  public formatToDecimalNotation = (value?: number, emptyValue = '') => {
    if (_.isNil(value)) {
      return emptyValue
    }
    // ~ cuts the trailing zeros off
    // r decimal rounding
    const stripZerosFormatter = d3Format.format(',~')
    const decimalNotationFormatter = d3Format.format(',~r')
    if (value.toString().includes('e')) {
      return decimalNotationFormatter(value)
    }
    return stripZerosFormatter(value)
  }

  public formatToPreciseDecimalNotation = (value?: number, emptyValue = '') => {
    if (_.isNil(value)) {
      return emptyValue
    }
    // c - converts the integer to the corresponding unicode character before printing.
    const preciseNumberNotationFormatter = d3Format.format(',c')
    return preciseNumberNotationFormatter(value)
  }

  public formatToInteger = (value?: number, emptyValue = '') => {
    if (_.isNil(value)) {
      return emptyValue
    }
    // , for thousand separator
    // d is for integer
    const integerNotationFormatter = d3Format.format(',.0d')
    return integerNotationFormatter(value)
  }

  public formatAverage = (value, matissa = 3) => {
    const d3FormatAverage = d3Format.format(`.${matissa}s`)
    return d3FormatAverage(value)
  }

  /// //////////////////////////////////////////////////////////////////////////
  // Percent Formatting
  /// //////////////////////////////////////////////////////////////////////////

  public formatPercent = (value) => {
    const percentFormatter = d3Format.format(',.2%')
    return percentFormatter(value)
  }

  public formatPercentReturn = (currentValue, initialValue, defaultValue = '0', forceSign = true) => {
    const totalReturn = currentValue - initialValue
    const percentReturn = totalReturn / initialValue
    if (_.isFinite(percentReturn)) {
      const percentFormatter = d3Format.format(',.2%')
      const returnValue = percentFormatter(percentReturn)
      if (forceSign) {
        // Show '+' or '−' in the front
        return returnValue.charAt(0) === '−' ? returnValue : `+${  returnValue}`
      } 
        // Do not show '+' or '−' in the front
        return returnValue.charAt(0) === '−' || returnValue.charAt(0) === '+' ? returnValue.substring(1) : returnValue
      
    }
    return defaultValue
  }

  /// //////////////////////////////////////////////////////////////////////////
  // Date Formatting
  /// //////////////////////////////////////////////////////////////////////////
  // https://date-fns.org/v2.6.0/docs/format

  public formatDate(value: Date, formatString = 'MMM d, yyyy') {
    if (this.isValidDate(value)) {
      return format(value, formatString)
    }
    return ''
  }

  public formatDateTime(value: Date, formatString = 'MMM d, yyyy h:mm a z') {
    if (this.isValidDate(value)) {
      return format(value, formatString)
    }
    return ''
  }

  public formatDateTimeToUTC(value: Date, formatString = 'MMM d, yyyy h:mm a z') {
    if (this.isValidDate(value)) {
      return format(value, formatString)
    }
    return ''
  }

  public formatDateTimeSeconds(value: Date, formatString = 'MMM d yyyy h:mm:ss a z') {
    if (this.isValidDate(value)) {
      return format(value, formatString)
    }
    return ''
  }

  public formatDateTimeMilliSeconds(value: Date, formatString = 'MMM d yyyy h:mm:ss.SSS a z') {
    if (this.isValidDate(value)) {
      return format(value, formatString)
    }
    return ''
  }

  public formatDateTimeCondensed(value: Date, formatString = 'M/d/yyyy h:mm a z') {
    if (this.isValidDate(value)) {
      return format(value, formatString)
    }
    return ''
  }

  public formatDateTimeSecondsCondensed(value: Date, formatString = 'M/d/yyyy h:mm:ss a z') {
    if (this.isValidDate(value)) {
      return format(value, formatString)
    }
    return ''
  }

  public formatDateTimeMilliSecondsCondensed(value: Date, formatString = 'M/d/yyyy h:mm:ss.SSS a z') {
    if (this.isValidDate(value)) {
      return format(value, formatString)
    }
    return ''
  }

  public formatTime(value: Date, formatString = 'h:mm:ss a z') {
    if (this.isValidDate(value)) {
      return format(value, formatString)
    }
    return ''
  }

  public formatTimeMilliSeconds(value: Date, formatString = 'h:mm:ss.SSS a z') {
    if (this.isValidDate(value)) {
      return format(value, formatString)
    }
    return ''
  }

  public formatDateAgo(value: Date, showAgo = false) {
    if (this.isValidDate(value)) {
      return formatDistance(value, new Date(), { addSuffix: showAgo })
    }
    return ''
  }

  // duration in seconds
  public formatDuration(startTime: Date, endTime: Date) {
    if (this.isValidDate(startTime) && this.isValidDate(endTime)) {
      return formatDistance(startTime, endTime, { includeSeconds: true })
    }
    return ''
  }

  /// //////////////////////////////////////////////////////////////////////////
  // Fiat Currency
  /// //////////////////////////////////////////////////////////////////////////

  public formatFiatCurrency = (value: number, mantissa?: number) => {
    if (_.isNil(value)) {
      return '-'
    }
    if (mantissa === undefined) {
      // Default currency decimal places is 2
      // For really small values (like DOGE $0.0021), decimal places is 4
      mantissa = value < 0.01 && value >= 0.00005 ? 4 : 2
    }
    const d3FormatFiatCurrency = d3Format.format(`,.${mantissa}f`)
    return d3FormatFiatCurrency(value)
  }

  public formatFiatCurrencyShort = (value?: number, emptyValue = '') => {
    if (_.isNil(value)) {
      return emptyValue
    }

    // For small values, we should NOT use SI prefix (like $5.16m for $0.00516)
    if (value < 1) {
      return this.formatFiatCurrency(value)
    }

    const d3FormatFiatCurrencyShort = d3Format.format('$.3s')
    // Replace 'G' with 'B'
    // https://stackoverflow.com/questions/40774677/d3-formatting-tick-value-to-show-b-billion-instead-of-g-giga
    return d3FormatFiatCurrencyShort(value).replace(/G/, 'B')
  }

  public formatReturn = (currentValue: number, initialValue: number, forceSign = true) => {
    const totalReturn = currentValue - initialValue
    const returnValue = this.formatFiatCurrency(totalReturn)
    if (forceSign) {
      // Show '+' or '-' in the front
      return returnValue.charAt(0) === '-' ? returnValue : `+${  returnValue}`
    } 
      // Do not show '+' or '-' in the front
      return returnValue.charAt(0) === '-' || returnValue.charAt(0) === '+' ? returnValue.substring(1) : returnValue
    
  }

  /// //////////////////////////////////////////////////////////////////////////
  // Misc
  /// //////////////////////////////////////////////////////////////////////////

  public formatAddressOrKey = (value: string, showDash?: boolean) => {
    return this.formatHash(value, showDash)
  }

  public formatId = (value: string, showDash?: boolean) => {
    return this.formatHash(value, showDash)
  }

  private formatHash = (value: string, showDash?: boolean) => {
    if (!_.isEmpty(value)) {
      return value.length > 10 ? `${value.substring(0, 5)  }…${  value.substring(value.length - 5, value.length)}` : value
    }

    return showDash ? '-' : null
  }

  public formatWebsite = (value: string) => {
    if (_.isNil(value)) {
      return '-'
    }
    // Just for the label
    // Remove `https://`
    // Remove `http://`
    // Remove `www.`
    // Remove trailing `/`
    return value
      .replace(/https:\/\//g, '')
      .replace(/http:\/\//g, '')
      .replace(/www./g, '')
      .replace(/\/$/, '')
  }

  public formatFileSize = (value: number) => {
    return filesize(value)
  }

  private isValidDate = (date) => {
    return date instanceof Date && !isNaN(date.getTime())
  }
}

export const Formatter = new FormatterImpl()
