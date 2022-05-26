import cn from 'classnames'
import _ from 'lodash'
import React from 'react'
import { InformationIconPopover } from '../information-icon-popover/information-icon-popover'
import { IBaseProps } from '../base-props'
import './_label.scss'

export interface ILabelProps extends IBaseProps {
  error?: string | null
  mbx?: string
  labelText?: string | JSX.Element
  isRequired?: boolean
  isFocused?: boolean
  size?: 'm' | 's' | 'xs'
  layout?: 'horizontal' | 'vertical'
  helpBlockText?: string
  htmlFor?: string
}

export class Label extends React.PureComponent<ILabelProps, {}> {
  public static defaultProps: Partial<ILabelProps> = {
    mbx: 'mb1',
    layout: 'vertical',
  }

  public render() {
    const {
      error,
      children,
      className,
      isRequired,
      isFocused,
      size,
      helpBlockText,
      labelText,
      layout,
      mbx,
      style,
      htmlFor,
    } = this.props
    if (_.isEmpty(children) && _.isEmpty(labelText)) {
      return false
    }
    const marginBottom = layout === 'horizontal' ? '' : mbx
    return (
      <label
        className={cn('l-label', marginBottom, className, {
          'l-label--s': size === 's',
          'l-label--xs': size === 'xs',
          'l-label--error': !_.isEmpty(error),
          'l-label--horizontal': layout === 'horizontal',
          'l-label--focused': isFocused,
        })}
        style={style}
        htmlFor={htmlFor}
      >
        {children || labelText} {isRequired ? '*' : ''}
        {helpBlockText && <InformationIconPopover helpBlockText={helpBlockText} />}
      </label>
    )
  }
}
