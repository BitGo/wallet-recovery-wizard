import cn from 'classnames'
import React from 'react'
import { IBaseProps } from '../base-props'
import './_form-content-block.scss'

export interface IFormContentBlockProps {
  mbx?: string
}

export class FormContentBlock extends React.PureComponent<IFormContentBlockProps & IBaseProps, {}> {
  public static defaultProps: Partial<IFormContentBlockProps> = {
    mbx: 'mb3',
  }

  public render() {
    const { children, className, mbx } = this.props
    return <div className={cn('l-formContentBlock w-100', mbx, className)}>{children}</div>
  }
}
