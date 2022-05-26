import cn from 'classnames'
import React from 'react'

import { IBaseProps } from '../base-props'

interface IErrorBlockProps {
  errorText?: string
  ptx?: string
}

export class ErrorBlock extends React.PureComponent<IErrorBlockProps & IBaseProps, {}> {
  public static defaultProps: Partial<IErrorBlockProps> = {
    ptx: 'pt1',
  }

  public render() {
    const { children, className, errorText, ptx } = this.props
    return <div className={cn('red lh-copy', ptx, className)}>{children || errorText}</div>
  }
}
