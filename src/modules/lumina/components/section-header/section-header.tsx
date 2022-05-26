import cn from 'classnames'
import _ from 'lodash'
import React from 'react'
import { IBaseProps } from '../base-props'
import { Button } from '../button/button'
import { H5 } from '../H5/h5'
import { H6 } from '../H6/h6'
import { H7 } from '../H7/h7'
import './_section-header.scss'

export interface ISectionHeaderProps {
  isCollapsable?: boolean
  isCollapsed?: boolean
  onIsCollapsedChange?: (value: boolean) => void
  hideHeaderBorder?: boolean
  titleH5?: string | React.ReactElement<any>
  titleH6?: string | React.ReactElement<any>
  titleH7?: string | React.ReactElement<any>
  titleCustom?: React.ReactElement<any>
  headerControls?: React.ReactElement<any>
}

export class SectionHeader extends React.PureComponent<ISectionHeaderProps & IBaseProps, {}> {
  public static defaultProps: ISectionHeaderProps = {
    hideHeaderBorder: true,
  }

  public render() {
    const { className, hideHeaderBorder, isCollapsed, titleH5, titleH6, titleH7, titleCustom } = this.props
    if (_.isEmpty(titleCustom) && _.isEmpty(titleH5) && _.isEmpty(titleH6) && _.isEmpty(titleH7)) {
      return null
    }
    return (
      <div
        className={cn('l-sectionHeader', className, {
          'l-sectionHeader--noBorderBottom': hideHeaderBorder && !isCollapsed,
        })}
      >
        {this.renderTitle()}
        {this.renderHeaderControls()}
      </div>
    )
  }

  private renderTitle = () => {
    const { titleH5, titleH6, titleH7, titleCustom } = this.props
    if (!_.isEmpty(titleCustom)) {
      return titleCustom
    }
    if (!_.isEmpty(titleH7)) {
      return (
        <div className='l-sectionHeaderGroup'>
          <H7 mbx='mb1'>{titleH7}</H7>
        </div>
      )
    }

    if (!_.isEmpty(titleH6)) {
      return (
        <div className='l-sectionHeaderGroup'>
          <H6>{titleH6}</H6>
        </div>
      )
    }
    return (
      <div className='l-sectionHeaderGroup'>
        <H5>{titleH5}</H5>
      </div>
    )
  }

  private renderHeaderControls = () => {
    const { headerControls } = this.props
    return (
      <div className='l-sectionHeaderGroup'>
        {headerControls}
        {this.renderCollapseControls()}
      </div>
    )
  }

  private renderCollapseControls = () => {
    const { isCollapsable, isCollapsed } = this.props
    if (isCollapsable) {
      const buttonText = isCollapsed ? 'Show More' : 'Show Less'
      return (
        <Button className='bp3-minimal bp3-small ml2 mb1' onClick={this.handleIsCollapsedChange}>
          {buttonText}
        </Button>
      )
    }
    return null
  }

  private handleIsCollapsedChange = () => {
    const { onIsCollapsedChange, isCollapsed } = this.props
    if (onIsCollapsedChange) {
      onIsCollapsedChange(!isCollapsed)
    }
  }
}
