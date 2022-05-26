import cn from 'classnames'
import React from 'react'

import { IBaseProps } from '../base-props'

interface ILeadProps {
  mbx?: string
}

class Lead2 extends React.PureComponent<ILeadProps & IBaseProps, {}> {
  public static defaultProps: Partial<ILeadProps> = {
    mbx: 'mb2',
  }

  public render() {
    const { className, children, mbx } = this.props
    return <div className={cn('f7 f6-m f6-l lh-copy black-70', mbx, className)}>{children}</div>
  }
}

export default Lead2
