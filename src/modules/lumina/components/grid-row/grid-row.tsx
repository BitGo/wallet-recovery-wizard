import cn from 'classnames'
import React from 'react'

import { IBaseProps } from '../base-props'

interface IGridRowProps {
  nmhx?: string
}

export class GridRow extends React.PureComponent<IGridRowProps & IBaseProps, {}> {
  public static defaultProps: Partial<IGridRowProps> = {
    nmhx: 'nmh2',
  }

  public render() {
    const { children, className, nmhx } = this.props
    // ph2 must be synced with the column component
    return <div className={cn(`cf`, nmhx, className)}>{children}</div>
  }
}
