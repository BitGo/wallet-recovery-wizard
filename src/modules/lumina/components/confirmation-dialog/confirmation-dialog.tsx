import { Dialog, IDialogProps } from '@blueprintjs/core'
import cn from 'classnames'
import _ from 'lodash'
import React from 'react'
import { Button } from '../button/button'
import { Footer } from '../footer/footer'
import { IValidationBannerProps, ValidationBanner } from '../validation-banner/validation-banner'

interface IConfirmationDialogProps extends IDialogProps {
  cancelButtonText?: string
  confirmationText: string | React.ReactNode
  confirmationTitle: string | React.ReactNode
  onClose?: (event?: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => void
  onPrimaryClicked: () => void
  onSecondaryClicked?: () => void
  primaryButtonText?: string
  primaryButtonClassName?: string
  isPrimaryButtonLoading?: boolean
  secondaryButtonText?: string
  dialogWidth?: string
  dialogBodyClassName?: string
  footerClassName?: string
  validationBannerProps: IValidationBannerProps
}

class ConfirmationDialog extends React.Component<IConfirmationDialogProps, {}> {
  public static defaultProps: Partial<IConfirmationDialogProps> = {
    cancelButtonText: 'Cancel',
    primaryButtonText: 'Confirm',
    secondaryButtonText: 'Maybe',
    dialogWidth: 'bp3-dialog--w0',
    dialogBodyClassName: 'ph4 pv3 lh-copy',
  }

  public render() {
    const {
      confirmationTitle,
      confirmationText,
      primaryButtonText,
      onClose,
      dialogWidth,
      primaryButtonClassName,
      isPrimaryButtonLoading,
      footerClassName,
      dialogBodyClassName,
      validationBannerProps,
    } = this.props
    return (
      <Dialog
        title={
          <>
            <ValidationBanner
              {...validationBannerProps}
              size='m'
              className={cn('l-validationBanner--dialogHeader', validationBannerProps?.className)}
            />
            {confirmationTitle}
          </>
        }
        className={cn(dialogWidth)}
        canEscapeKeyClose={false}
        canOutsideClickClose={false}
        {...this.props}
      >
        <div className={dialogBodyClassName}>{confirmationText}</div>
        <Footer
          className={footerClassName}
          isVisible
          primaryButtonText={primaryButtonText}
          onCancelButtonClick={onClose}
          onPrimaryButtonClick={this.handleOnPrimaryClicked}
          primaryButtonClassName={primaryButtonClassName}
          isPrimaryButtonLoading={isPrimaryButtonLoading}
          primaryButtonGroupElement={this.renderPrimaryButtonGroup()}
        />
      </Dialog>
    )
  }

  private handleOnPrimaryClicked = () => {
    const { onClose, onPrimaryClicked, validationBannerProps } = this.props
    const result: any = onPrimaryClicked()
    let onComplete = _.noop
    if (onClose && (!validationBannerProps || !validationBannerProps.formikErrors)) {
      // Do not handle close logic when formik errors are used since we cannot differenciate between
      // validation failure and submit success without manual flags
      onComplete = onClose
    }
    return result && result.then ? result.then(onComplete).catch(_.noop) : onComplete()
  }

  private handleOnSecondaryClicked = () => {
    const { onClose, onSecondaryClicked } = this.props
    if (onSecondaryClicked) {
      const result: any = onSecondaryClicked()
      if (onClose) {
        return result && result.then ? result.then(onClose).catch(_.noop) : onClose()
      }
    }
  }

  private renderPrimaryButtonGroup() {
    const { onSecondaryClicked, secondaryButtonText } = this.props
    if (onSecondaryClicked) {
      return (
        <div className='l-footer-item'>
          <Button className='truncate' onClick={this.handleOnSecondaryClicked}>
            {secondaryButtonText}
          </Button>
        </div>
      )
    }

    return undefined
  }
}

export default ConfirmationDialog
