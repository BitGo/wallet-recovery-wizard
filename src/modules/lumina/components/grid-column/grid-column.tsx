import cn from 'classnames'
import React from 'react'

import { IBaseProps } from '../base-props'

interface IGridColumnProps {
  phx?: string
  wx?: string
}

export class GridColumn extends React.PureComponent<IGridColumnProps & IBaseProps, {}> {
  public static defaultProps: Partial<IGridColumnProps> = {
    wx: 'w-100',
    phx: 'ph2',
  }

  public render() {
    const { children, className, wx, phx } = this.props
    // ph2 must be synced with the GridColumn component
    return <div className={cn(`fl`, phx, wx, className)}>{children}</div>
  }
}
