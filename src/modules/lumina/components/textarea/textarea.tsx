import cn from 'classnames';
import _ from 'lodash';
import React, { FocusEvent } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { IBaseProps } from '../base-props';
import './_textarea.scss';

export interface ITextareaProps extends IBaseProps, React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  // We copied over the types from TextareaAutosizeProps because they do not
  // property extend them. They use React.HTMLProps<HTMLTextAreaElement>
  // instead of the above React.TextareaHTMLAttributes<HTMLTextAreaElement>

  //// TextareaAutosizeProps Start

  /**
   * Current textarea value
   */
  value?: string;
  /**
   * Callback on value change
   * @param event
   */
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  /**
   * Callback on height change
   * @param height
   */
  onHeightChange?: (height: number) => void;
  /**
   * Try to cache DOM measurements performed by component so that we don't
   * touch DOM when it's not needed.
   *
   * This optimization doesn't work if we dynamically style <textarea />
   * component.
   * @default false
   */
  useCacheForDOMMeasurements?: boolean;
  /**
   * Minimal number of rows to show.
   */
  rows?: number;
  /**
   * Alias for `rows`.
   */
  minRows?: number;
  /**
   * Maximum number of rows to show.
   */
  maxRows?: number;
  /**
   * Allows an owner to retrieve the DOM node.
   */
  inputRef?: (node: HTMLTextAreaElement) => void;

  //// TextareaAutosizeProps End

  error?: string | null;
  onBlur?: (event: FocusEvent<HTMLTextAreaElement>) => void;
  name?: string;
  layout?: 'horizontal' | 'vertical';
  large?: boolean;
  onFocus?: (event: FocusEvent<HTMLTextAreaElement>) => void;
}

export class Textarea extends React.PureComponent<ITextareaProps> {
  public static defaultProps: Partial<ITextareaProps> = {
    rows: 2,
    minRows: 2,
    maxRows: 2,
  };

  public render() {
    const { className, error, name, onBlur, placeholder, disabled, layout, large, ...inputProps } = this.props;
    return (
      <div
        className={cn('l-input-group', className, {
          'l-input-group--error': !_.isEmpty(error),
          'l-input-group--horizontal': layout === 'horizontal',
          'bg-disabled': disabled,
          'bp3-large': large,
        })}
      >
        <TextareaAutosize
          data-testid="textarea"
          {...inputProps}
          className="bp3-input"
          disabled={disabled}
          onFocus={this.handleOnFocus}
          onBlur={onBlur}
          name={name}
          placeholder={placeholder}
        />
      </div>
    );
  }

  private handleOnFocus = (event) => {
    const { onFocus } = this.props;
    if (onFocus) {
      onFocus(event);
    }
  };
}
