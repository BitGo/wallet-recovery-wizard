import cn from 'classnames'
import React from 'react'
import { IBaseProps } from '../base-props'
import { InformationIconPopover } from '../information-icon-popover/information-icon-popover'
import { ILabelProps, Label } from '../label/label'

interface IDefinitionListItemProps extends IBaseProps {
  value: number | string | React.ReactElement<any>
  label: number | string | React.ReactElement<any>
  layout?: 'horizontal' | 'vertical'
  labelProps?: ILabelProps
  helpBlockText?: string
  pbx?: string
  valueContainerClassName?: string
}

export function DefinitionListItem(props: IDefinitionListItemProps) {
  const {
    value,
    label,
    className,
    labelProps = {},
    layout = 'horizontal',
    pbx = 'pb2',
    helpBlockText,
    valueContainerClassName,
  } = props

  return (
    <div
      className={cn('flex-ns flex-print', pbx, className, {
        'flex-column': layout === 'vertical',
      })}
    >
      {(typeof label === 'string' || typeof label === 'number') && (
        <Label mbx='' {...labelProps} className={cn('l-labelHelperWidth flex-shrink-0', labelProps?.className)}>
          {label} {helpBlockText && <InformationIconPopover helpBlockText={helpBlockText} />}
        </Label>
      )}
      {typeof label !== 'string' && typeof label !== 'number' && <>{label}</>}
      <div className={cn('lh-copy', valueContainerClassName)}>{value}</div>
    </div>
  )
}
