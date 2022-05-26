import cn from 'classnames'
import _ from 'lodash'
import React from 'react'

import { IBaseProps } from '../base-props'
import './_form-content-editable.scss'

export interface IFormContentEditableProps {
  error?: string | null
  layout?: 'horizontal' | 'vertical'
  isFocused?: boolean
}

export class FormContentEditable extends React.PureComponent<IFormContentEditableProps & IBaseProps, {}> {
  public static defaultProps: Partial<IFormContentEditableProps> = {
    layout: 'vertical',
  }

  public render() {
    const { children, className, error, isFocused, layout } = this.props
    return (
      <div
        className={cn('l-formContentEditable', className, {
          'l-formContentEditable--horizontal': layout === 'horizontal',
          'l-formContentEditable--focused': isFocused,
          'l-formContentEditable--error': !_.isEmpty(error),
        })}
      >
        {children}
      </div>
    )
  }
}
