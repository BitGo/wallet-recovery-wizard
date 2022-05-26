import { IInputGroupProps, InputGroup } from '@blueprintjs/core'
import cn from 'classnames'
import _ from 'lodash'
import React from 'react'
import { IBaseProps } from '../base-props'
import './_input.scss'

type HTMLInputProps = React.InputHTMLAttributes<HTMLInputElement>

export interface IInputProps extends IBaseProps, IInputGroupProps {
  error?: string | null
  name?: string
  layout?: 'horizontal' | 'vertical'
  textAlign?: 'left' | 'right'
}

export class Input extends React.PureComponent<IInputProps & HTMLInputProps, {}> {
  public static defaultProps: Partial<IInputProps & HTMLInputProps> = {
    autoComplete: 'off',
    value: '',
    layout: 'vertical',
  }

  public render() {
    const { className, error, name, placeholder, disabled, layout, autoComplete, textAlign, ...inputProps } = this.props
    return (
      <>
        <InputGroup
          {...inputProps}
          className={cn('l-input-group', className, {
            'l-input-group--error': !_.isEmpty(error),
            'l-input-group--horizontal': layout === 'horizontal',
            'l-input-group--tr': textAlign === 'right',
            'bg-disabled': disabled,
          })}
          disabled={disabled}
          name={name}
          placeholder={placeholder}
        />
        {/* {layout === 'vertical' && error &&  <ErrorBlock>{error}</ErrorBlock>} */}
      </>
    )
  }
}
