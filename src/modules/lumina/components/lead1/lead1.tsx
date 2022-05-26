import cn from 'classnames'
import React from 'react'
import { IBaseProps } from '../base-props'

interface ILeadProps {
  mbx?: string
}

class Lead1 extends React.PureComponent<ILeadProps & IBaseProps, {}> {
  public static defaultProps: Partial<ILeadProps> = {
    mbx: 'mb3',
  }

  public render() {
    const { className, children, mbx } = this.props
    return <div className={cn('f5 f5-m f4-l lh-copy', mbx, className)}>{children}</div>
  }
}

export default Lead1
