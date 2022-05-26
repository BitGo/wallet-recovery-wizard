import React from 'react'
import { IBaseProps } from '../base-props'
import BitGoLogoBlue from './bitgo-logo.svg'

interface ILogoProps extends IBaseProps {
  src?: string
  colorMode?: 'default' | 'dark'
}

export default function Logo(props: ILogoProps) {
  const { className } = props
  return (
    <img
      style={{
        width: 170,
        height: 50,
      }}
      className={className}
      src={BitGoLogoBlue}
    />
  )
}
