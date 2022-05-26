import { Button as BlueprintButton, IButtonProps as IBlueprintButtonProps } from '@blueprintjs/core'
import cn from 'classnames'
import React from 'react'

import { IBaseProps } from '../base-props'

// Note: no need to import the css because the shared.scss imports it
// import './_button.scss'

export interface IButtonProps extends IBaseProps, IBlueprintButtonProps {
  // TODO(louis): odd that this isn't on the Blueprint button
  // https://github.com/palantir/blueprint/pull/2672/files
  tabIndex?: number
}

export class Button extends React.PureComponent<IButtonProps, {}> {
  public render() {
    const { children, className } = this.props
    return (
      <BlueprintButton {...this.props} className={cn(className)}>
        {children}
      </BlueprintButton>
    )
  }
}
