import { Icon } from '@blueprintjs/core'
import cn from 'classnames'
import React from 'react'
import { IValidationContext, IValidationError } from '../../errors/types'
import { getErrorString } from '../../errors/yup-schema-validator'
import { IBaseProps } from '../base-props'
import './_validation-banner.scss'

export interface IValidationBannerProps extends IBaseProps {
  context?: IValidationContext
  errors: IValidationError[]
  // typescript doesn't like FormikErrors<any>
  formikErrors: any
  hasSubmitted: boolean
  size?: 's' | 'm' | 'l'
  isAbsolute?: boolean
  schema?: any
  childrenClassName?: string
  validationMessageClassName?: string
}

export class ValidationBanner extends React.PureComponent<IValidationBannerProps, {}> {
  public render() {
    const {
      className,
      children,
      childrenClassName,
      size,
      isAbsolute,
      errors,
      formikErrors,
      hasSubmitted,
      schema,
      validationMessageClassName,
    } = this.props
    const errorText = getErrorString(errors, formikErrors, hasSubmitted, schema)
    const isOpen = !!errorText
    return (
      <div
        className={cn('flex flex-column flex-grow-1 relative l-validationBanner', className, {
          'l-validationBanner--open': isOpen,
        })}
      >
        {isOpen && (
          <div
            className={cn(
              'l-validationBanner-message relative flex items-start justify-center bg-red ph4 pv2 white fw5 flex-grow-0 flex-shrink-0',
              validationMessageClassName,
              {
                'l-validationBanner-message--large': size === 'l',
                'l-validationBanner-message--medium': size === 'm',
                'l-validationBanner-message--absolute': isAbsolute,
              },
            )}
          >
            <Icon className='mr2 mt05 l-validationBanner-icon' icon='warning-sign' />
            {/* TODO(louis): how to handle multiline error messages? */}
            <div className='lh-copy fw6 f7 truncate'>{errorText}</div>
          </div>
        )}
        <div className={cn('flex flex-column flex-grow-1 flex-shrink-1', childrenClassName)}>{children}</div>
      </div>
    )
  }
}
