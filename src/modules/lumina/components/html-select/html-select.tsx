import { HTMLSelect as BlueprintHtmlSelect, IHTMLSelectProps as IBlueprintHtmlSelectProps } from '@blueprintjs/core'
import cn from 'classnames'
import _ from 'lodash'
import React from 'react'

// Note: no need to import the css because the shared.scss imports it
// import './_html-select.scss'

export interface IHtmlSelectProps extends IBlueprintHtmlSelectProps {
  error?: string
  layout?: 'horizontal' | 'vertical'
}

export class HtmlSelect extends React.PureComponent<IHtmlSelectProps, {}> {
  public static defaultProps: Partial<IHtmlSelectProps> = {
    value: '',
    layout: 'vertical',
  }

  public render() {
    const { className, disabled, error, layout, options, placeholder, ...selectProps } = this.props
    let optionsWithPlaceholder = options
    if (placeholder && options) {
      optionsWithPlaceholder = options.slice()
      optionsWithPlaceholder.unshift({
        label: placeholder,
        // TODO(louis): This is a problem with the selects where we set the
        // initial value to be null in the formikProps, however, sometimes
        // the backend doesn't allow that.
        value: null,
        className: 'l-htmlSelect-placeholder',
      })
    }
    return (
      <BlueprintHtmlSelect
        className={cn('l-htmlSelect', className, {
          'l-htmlSelect--horizontal': layout === 'horizontal',
          'l-htmlSelect--vertical': layout === 'vertical',
          'l-htmlSelect--error': !_.isEmpty(error),
          'l-htmlSelect--disabled bg-disabled': disabled,
        })}
        {...selectProps}
        disabled={disabled}
        options={optionsWithPlaceholder}
      />
    )
  }
}
