import { Icon, IPopoverProps, Popover, PopoverInteractionKind, Position } from '@blueprintjs/core'
import cn from 'classnames'
import React, { ReactNode } from 'react'
import { IBaseProps } from '../base-props'
import { HelpBlock } from '../help-block/help-block'
import './_information-icon-popover.scss'

interface IInformationIconPopoverProps extends IBaseProps {
  helpBlockText: string | ReactNode
  position?: Position
  popoverProps?: IPopoverProps
}

export function InformationIconPopover(props: IInformationIconPopoverProps) {
  const { className, helpBlockText, popoverProps, position = Position.BOTTOM } = props

  return (
    <span>
      <Popover
        {...popoverProps}
        className='lh-solid'
        interactionKind={PopoverInteractionKind.HOVER}
        position={position}
        content={
          <div className='pa2'>
            <HelpBlock className='measure-narrow'>{helpBlockText}</HelpBlock>
          </div>
        }
        target={
          <Icon
            className={cn('light-silver l-informationIconPopover mb05', className)}
            iconSize={12}
            icon='info-sign'
          />
        }
      />
    </span>
  )
}
