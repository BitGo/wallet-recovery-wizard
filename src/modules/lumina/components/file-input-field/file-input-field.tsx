import React from 'react'

import { IBaseProps } from '../base-props'
import { FileInput, IFileInputProps } from '../file-input/file-input'
import { FormContentEditable, IFormContentEditableProps } from '../form-content-editable/form-content-editable'
import { FormContent, IFormContentProps } from '../form-content/form-content'
import { ILabelProps, Label } from '../label/label'

interface IFileInputFieldProps {
  layout?: 'horizontal' | 'vertical'
  labelProps?: ILabelProps
  fileInputProps: IFileInputProps & IBaseProps
  formContentProps?: IFormContentProps
  formContentEditableProps?: IFormContentEditableProps
}

interface IFileInputFieldState {
  isFocused: boolean
}

export class FileInputField extends React.PureComponent<IFileInputFieldProps & IBaseProps, IFileInputFieldState> {
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
    const { children, fileInputProps, labelProps, layout, formContentProps, formContentEditableProps } = this.props
    const { isFocused } = this.state
    return (
      <FormContent layout={layout} isFocused={isFocused} {...formContentProps}>
        <Label
          {...labelProps}
          isFocused={isFocused}
          layout={layout}
          // error={fileInputProps.error}
        />
        <FormContentEditable
          {...formContentEditableProps}
          // TODO(louis)
          // error={fileInputProps.error}
          isFocused={isFocused}
          layout={layout}
        >
          <FileInput {...fileInputProps} layout={layout} />
          {children}
        </FormContentEditable>
      </FormContent>
    )
  }
}
