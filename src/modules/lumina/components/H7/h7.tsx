import cn from 'classnames'
import React from 'react'

import { IBaseProps } from '../base-props'

interface IH7Props {
  mbx?: string
  divProps?: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
}

export class H7 extends React.PureComponent<IH7Props & IBaseProps, {}> {
  public static defaultProps: Partial<IH7Props> = {
    mbx: 'mb2',
  }

  public render() {
    const { className, children, divProps, mbx } = this.props
    return (
      <div
        {...divProps}
        // ttu
        className={cn('f7 gray fw6', mbx, className)}
      >
        {children}
      </div>
    )
  }
}
