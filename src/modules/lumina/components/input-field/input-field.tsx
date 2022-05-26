import { HTMLInputProps } from '@blueprintjs/core'
import * as _ from 'lodash'
import React from 'react'
import { IBaseProps } from '../base-props'
import { FormContentEditable, IFormContentEditableProps } from '../form-content-editable/form-content-editable'
import { FormContent, IFormContentProps } from '../form-content/form-content'
import { IInputProps, Input } from '../input/input'
import { ILabelProps, Label } from '../label/label'

interface IInputFieldProps {
  // TODO(arnold/louis): Decide whether we want to have one error prop and apply to label, input and formContent
  // If we end up changing this, we should change other  fields to follow the same pattern
  // error?: string | null
  layout?: 'horizontal' | 'vertical'
  labelProps?: ILabelProps
  inputProps: IInputProps & HTMLInputProps
  formContentProps?: IFormContentProps
  formContentEditableProps?: IFormContentEditableProps
}

interface IInputFieldState {
  isFocused: boolean
}

export class InputField extends React.PureComponent<IInputFieldProps & IBaseProps, IInputFieldState> {
  public static defaultProps: Partial<ILabelProps> = {
    mbx: 'mb1',
    layout: 'horizontal',
  }

  constructor(props) {
    super(props)
    this.state = {
      isFocused: false,
    }
  }

  public render() {
    const {
      children,
      // error,
      inputProps,
      labelProps,
      layout,
      formContentProps,
      formContentEditableProps,
    } = this.props
    inputProps['data-testid'] = inputProps['data-testid'] || 'input-field'
    const { isFocused } = this.state
    return (
      <FormContent {...formContentProps} isFocused={isFocused} layout={layout}>
        <Label {...labelProps} error={inputProps.error} isFocused={isFocused} layout={layout} />
        <FormContentEditable
          {...formContentEditableProps}
          error={inputProps.error}
          isFocused={isFocused}
          layout={layout}
        >
          <Input
            data-testid={_.get(this.props, 'data-testid', 'input-field')}
            {...inputProps}
            layout={layout}
            onFocus={this.handleOnFocus}
            onBlur={this.handleOnBlur}
          />
          {children}
        </FormContentEditable>
      </FormContent>
    )
  }

  private handleOnBlur = (event) => {
    const { inputProps } = this.props
    this.setState({ isFocused: false })
    // Propagate up
    if (inputProps.onBlur) {
      inputProps.onBlur(event)
    }
  }

  private handleOnFocus = (event) => {
    const { inputProps } = this.props
    this.setState({ isFocused: true })
    // Propagate up
    if (inputProps.onFocus) {
      inputProps.onFocus(event)
    }
  }
}
