/** @jsx jsx */
import React, { useEffect, useState } from 'react'
import { jsx } from 'theme-ui'
import cn from 'classnames'

interface IInstrumentIconProps extends React.SVGProps<SVGSVGElement> {
  instrumentSymbol: string
  size?: 's' | 'm' | 'l'
}

const InstrumentIcon: React.FC<IInstrumentIconProps> = ({
  instrumentSymbol,
  size = 'm',
  className,
  ...rest
}): JSX.Element | null => {
  const ImportedIconRef = React.useRef<React.FC<React.SVGProps<SVGSVGElement>>>()
  const [loading, setLoading] = useState(false)
  const [showSymbolCharacters, setShowSymbolCharacters] = useState(false)

  // instrument icon library is all in lower case
  instrumentSymbol = instrumentSymbol?.toLowerCase()

  useEffect((): void => {
    setLoading(true)
    const importIcon = async (): Promise<void> => {
      if (instrumentSymbol === 'ofc') {
        try {
          ImportedIconRef.current = (await import(`./bitgo-trade-icon.svg`)).ReactComponent
        } catch (error) {
          ImportedIconRef.current = (await import(`./bitgo-generic.svg`)).ReactComponent
        } finally {
          setLoading(false)
        }
      } else {
        // Try to get the token
        try {
          ImportedIconRef.current = (
            await import(`cryptocurrency-icons/svg/color/${instrumentSymbol}.svg`)
          ).ReactComponent
        } catch (error) {
          // Otherwise try stripping the "t" from the symbol to get the non
          // test version. Eg: tbtc => btc
          try {
            ImportedIconRef.current = (
              await import(`cryptocurrency-icons/svg/color/${instrumentSymbol.substring(1)}.svg`)
            ).ReactComponent
          } catch (error) {
            ImportedIconRef.current = null
            setShowSymbolCharacters(true)
            // ImportedIconRef.current = (await import(`./bitgo-generic.svg`)).ReactComponent
          }
        } finally {
          setLoading(false)
        }
      }
    }
    importIcon()
  }, [instrumentSymbol])

  let iconSize: number
  let textSize: number
  switch (size) {
    case 's':
      iconSize = 22
      textSize = 5
      break
    case 'm':
      iconSize = 32
      textSize = 8
      break
    case 'l':
      iconSize = 48
      textSize = 9
      break

    default:
      iconSize = 32
      textSize = 8
      break
  }

  if (!loading && ImportedIconRef.current) {
    const { current: ImportedIcon } = ImportedIconRef
    return (
      <ImportedIcon
        viewBox='0 0 32 32'
        height={`${iconSize}`}
        width={`${iconSize}`}
        className={cn('flex-shrink-0 br-100', className)}
        {...rest}
      />
    )
  }

  if (showSymbolCharacters) {
    return (
      <div
        className={cn('flex-shrink-0 br-100 bg-blue tc white ttu fw7 overflow-hidden', className)}
        sx={{
          height: iconSize,
          width: iconSize,
          fontSize: `${textSize}px`,
          lineHeight: `${iconSize}px`,
        }}
      >
        {instrumentSymbol}
      </div>
    )
  }

  return null
}

export default InstrumentIcon
