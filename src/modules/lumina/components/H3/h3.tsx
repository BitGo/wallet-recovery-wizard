import cn from 'classnames'
import React from 'react'

import { IBaseProps } from '../base-props'

interface IH3Props {
  mbx?: string
}

export class H3 extends React.PureComponent<IH3Props & IBaseProps, {}> {
  public static defaultProps: Partial<IH3Props> = {
    mbx: 'mb3',
  }

  public render() {
    const { className, children, mbx } = this.props
    return <div className={cn('f4 f3-m f3-l fw7 lh-title tracked-condensed', mbx, className)}>{children}</div>
  }
}
