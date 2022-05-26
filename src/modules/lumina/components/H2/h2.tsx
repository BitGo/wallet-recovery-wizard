import cn from 'classnames'
import React from 'react'

import { IBaseProps } from '../base-props'

interface IH2Props {
  mbx?: string
}

export class H2 extends React.PureComponent<IH2Props & IBaseProps, {}> {
  public static defaultProps: Partial<IH2Props> = {
    mbx: 'mb3',
  }

  public render() {
    const { className, children, mbx } = this.props
    return <div className={cn('f2-l f3 fw7 lh-title tracked-condensed', mbx, className)}>{children}</div>
  }
}
