import cn from 'classnames'
import React from 'react'
import { IBaseProps } from '../base-props'
import { ISectionHeaderProps, SectionHeader } from '../section-header/section-header'
import './_section.scss'

interface ISectionProps {
  sectionHeaderProps?: ISectionHeaderProps & IBaseProps
  isCollapsed?: boolean
  bodyClassName?: string
}

interface ISectionStates {
  isCollapsed: boolean
}

export class Section extends React.Component<ISectionProps & IBaseProps, ISectionStates> {
  public static defaultProps: Partial<ISectionProps> = {
    bodyClassName: 'mb4',
    isCollapsed: false,
  }

  constructor(props: ISectionProps) {
    super(props)
    const { isCollapsed } = props
    this.state = {
      isCollapsed: isCollapsed || false,
    }
  }

  public render() {
    const { className, bodyClassName, children, sectionHeaderProps } = this.props
    const { isCollapsed } = this.state

    return (
      <div className={cn('l-section', className)}>
        <SectionHeader
          {...sectionHeaderProps}
          isCollapsed={isCollapsed}
          onIsCollapsedChange={this.handleIsCollapsedChange}
        />
        <div
          className={cn('l-sectionBody', bodyClassName, {
            'is-collapsed': isCollapsed,
          })}
        >
          {children}
        </div>
      </div>
    )
  }

  private handleIsCollapsedChange = (isCollapsed: boolean) => {
    this.setState({ isCollapsed })
  }
}
