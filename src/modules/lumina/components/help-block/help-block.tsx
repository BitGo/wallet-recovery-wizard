import cn from 'classnames'
import React from 'react'

import { IBaseProps } from '../base-props'

export class HelpBlock extends React.PureComponent<IBaseProps, {}> {
  public render() {
    const { children, className } = this.props
    return <div className={cn('silver lh-copy', className)}>{children}</div>
  }
}
