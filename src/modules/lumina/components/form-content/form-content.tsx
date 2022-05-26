import cn from 'classnames'
import React from 'react'

import { IBaseProps } from '../base-props'
import './_form-content.scss'

// Special because we use the interface in other components
export interface IFormContentProps extends IBaseProps {
  layout?: 'horizontal' | 'vertical'
  isFocused?: boolean
}

export class FormContent extends React.PureComponent<IFormContentProps, {}> {
  public static defaultProps: Partial<IFormContentProps> = {
    layout: 'horizontal',
  }

  public render() {
    const { children, className, layout, isFocused } = this.props

    return (
      <div
        className={cn('l-formContent', className, {
          'l-formContent--horizontal': layout === 'horizontal',
          'l-formContent--focused': isFocused,
        })}
      >
        {children}
      </div>
    )
  }
}
