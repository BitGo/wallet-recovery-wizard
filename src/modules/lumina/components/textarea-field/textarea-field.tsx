import React from 'react';

import { IBaseProps } from '../base-props';
import { FormContentEditable, IFormContentEditableProps } from '../form-content-editable/form-content-editable';
import { FormContent, IFormContentProps } from '../form-content/form-content';
import { ILabelProps, Label } from '../label/label';
import { ITextareaProps, Textarea } from '../textarea/textarea';

interface ITextareaFieldProps {
  layout?: 'horizontal' | 'vertical';
  labelProps?: ILabelProps;
  textareaProps: ITextareaProps;
  formContentProps?: IFormContentProps;
  formContentEditableProps?: IFormContentEditableProps;
}

interface ITextareaFieldState {
  isFocused: boolean;
}

export class TextareaField extends React.PureComponent<ITextareaFieldProps & IBaseProps, ITextareaFieldState> {
  public static defaultProps: Partial<ILabelProps> = {
    mbx: 'mb1',
    layout: 'horizontal',
  };

  constructor(props) {
    super(props);
    this.state = {
      isFocused: false,
    };
  }

  public render() {
    const { children, textareaProps, labelProps, layout, formContentProps, formContentEditableProps } = this.props;
    const { isFocused } = this.state;
    return (
      <FormContent layout={layout} isFocused={isFocused} {...formContentProps}>
        <Label {...labelProps} error={textareaProps.error} isFocused={isFocused} layout={layout} />
        <FormContentEditable
          {...formContentEditableProps}
          error={textareaProps.error}
          isFocused={isFocused}
          layout={layout}
        >
          <Textarea {...textareaProps} layout={layout} onFocus={this.handleOnFocus} onBlur={this.handleOnBlur} />
          {children}
        </FormContentEditable>
      </FormContent>
    );
  }

  private handleOnBlur = (event) => {
    const { textareaProps } = this.props;
    this.setState({ isFocused: false });
    // Propagate up
    if (textareaProps.onBlur) {
      textareaProps.onBlur(event);
    }
  };

  private handleOnFocus = (event) => {
    const { textareaProps } = this.props;
    this.setState({ isFocused: true });
    // Propagate up
    if (textareaProps.onFocus) {
      textareaProps.onFocus(event);
    }
  };
}
