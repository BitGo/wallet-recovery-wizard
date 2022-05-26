import cn from 'classnames'
import React from 'react'

import { IBaseProps } from '../base-props'

interface IDefinitionListProps {
  ptx?: string
}

export class DefinitionList extends React.PureComponent<IDefinitionListProps & IBaseProps, {}> {
  public static defaultProps: Partial<IDefinitionListProps> = {
    ptx: 'pt2',
  }

  public render() {
    const { children, className, ptx } = this.props
    return <div className={cn(className, ptx)}>{children}</div>
  }
}
