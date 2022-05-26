import cn from 'classnames'
import React from 'react'

import { IBaseProps } from '../base-props'

interface IH6Props {
  mbx?: string
}

export class H6 extends React.PureComponent<IH6Props & IBaseProps, {}> {
  public static defaultProps: Partial<IH6Props> = {
    mbx: 'mb1',
  }

  public render() {
    const { className, children, mbx } = this.props
    return (
      <div
        // ttu
        className={cn('f6 fw6 lh-title black-70', mbx, className)}
      >
        {children}
      </div>
    )
  }
}
