import cn from 'classnames'
import React from 'react'

import { IBaseProps } from '../base-props'
// import { IBaseProps } from 'components/base-props'

interface IH1Props {
  mbx?: string
}

export class H1 extends React.PureComponent<IH1Props & IBaseProps, {}> {
  public static defaultProps: Partial<IH1Props> = {
    mbx: 'mb3',
  }

  public render() {
    const { className, children, mbx, style } = this.props
    return (
      <div className={cn('f1 fw7 lh-title tracked-condensed', mbx, className)} style={style}>
        {children}
      </div>
    )
  }
}
