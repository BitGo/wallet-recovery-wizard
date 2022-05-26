import cn from 'classnames'
import React from 'react'

import { IBaseProps } from '../base-props'

interface IH5Props {
  mbx?: string
}

export class H5 extends React.PureComponent<IH5Props & IBaseProps, {}> {
  public static defaultProps: Partial<IH5Props> = {
    mbx: 'mb2',
  }

  public render() {
    const { className, children, mbx } = this.props
    return <div className={cn('f6 f5-m f5-l fw6 lh-title', mbx, className)}>{children}</div>
  }
}
