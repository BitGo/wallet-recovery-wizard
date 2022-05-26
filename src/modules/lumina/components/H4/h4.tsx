import cn from 'classnames'
import React from 'react'

import { IBaseProps } from '../base-props'

interface IH4Props {
  mbx?: string
}

export class H4 extends React.PureComponent<IH4Props & IBaseProps, {}> {
  public static defaultProps: Partial<IH4Props> = {
    mbx: 'mb3-l mb2',
  }

  public render() {
    const { className, children, mbx } = this.props
    return <div className={cn('f4-ns f5 fw6 lh-title tracked-condensed', mbx, className)}>{children}</div>
  }
}
