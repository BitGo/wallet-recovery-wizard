import cn from 'classnames'
import React, { SyntheticEvent } from 'react'
import { Motion, spring } from 'react-motion'
import { IBaseProps } from '../base-props'
import { Button } from '../button/button'
import { ErrorBlock } from '../error-block/error-block'
import './_footer.scss'

type OnClickType = ((event: SyntheticEvent<HTMLElement, Event>) => void) | (() => void) | (() => Promise<any>)

interface IFooterProps {
  errorText?: string
  errorBlockChildren?: React.ReactElement<any>
  isVisible?: boolean
  isFlush?: boolean
  enableHotkeys?: boolean

  isCancelButtonDisabled?: boolean
  isCancelButtonLoading?: boolean
  cancelButtonText?: string
  cancelButtonGroupElement?: React.ReactElement<any>
  onCancelButtonClick?: OnClickType

  isDeleteButtonDisabled?: boolean
  isDeleteButtonLoading?: boolean
  deleteButtonText?: string
  onDeleteButtonClick?: OnClickType

  // TODO(louis): this is rather messay, should just have grouped props
  isPrimaryButtonDisabled?: boolean
  isPrimaryButtonLoading?: boolean
  primaryButtonText?: string
  primaryButtonClassName?: string
  primaryButtonGroupElement?: React.ReactElement<any>
  primaryButtonTabIndex?: number
  onPrimaryButtonClick?: OnClickType

  // tslint:disable-next-line:member-ordering
  size?: string
}

const FOOTER_HEIGHT = 60

export class Footer extends React.Component<IFooterProps & IBaseProps, any, never> {
  public static defaultProps: Partial<IFooterProps> = {
    cancelButtonText: 'Cancel',
    deleteButtonText: 'Delete',
    enableHotkeys: true,
    isVisible: true,
    primaryButtonText: 'Save',
  }

  constructor(props) {
    super(props)
    const { isVisible } = this.props
    const initialMarginBottom = isVisible ? 0 : -FOOTER_HEIGHT
    this.state = {
      animation: {
        from: {
          height: FOOTER_HEIGHT,
          marginBottom: initialMarginBottom,
        },
        to: {
          height: FOOTER_HEIGHT,
          marginBottom: initialMarginBottom,
        },
      },
    }
  }

  public componentWillReceiveProps(nextProps) {
    if (this.props.isVisible !== nextProps.isVisible) {
      const { animation } = this.state
      const nextAnimation = {
        from: animation.from,
        to: {
          height: FOOTER_HEIGHT,
          marginBottom: spring(nextProps.isVisible ? 0 : -FOOTER_HEIGHT),
        },
      }
      this.setState({ animation: nextAnimation })
    }
  }

  public render() {
    const { animation } = this.state
    return (
      <Motion defaultStyle={animation.from} style={animation.to}>
        {(style) => this.renderContent(style)}
      </Motion>
    )
  }

  public renderContent(style) {
    const { className, children, size } = this.props
    const sizeClassName = size ? `l-footer--${size}` : ''
    let content
    if (children) {
      content = children
    } else {
      content = (
        <>
          {this.renderCancelButtonGroup()}
          {this.renderPrimaryButtonGroup()}
        </>
      )
    }

    return (
      <div className={cn('l-footer bt b--border bg-white u-noPrint', sizeClassName, className)} style={style}>
        {content}
      </div>
    )
  }

  private renderCancelButtonGroup() {
    const { cancelButtonGroupElement, isFlush } = this.props
    return (
      <div
        className={cn('l-footer-group', {
          'l-footer-group--flush': isFlush,
        })}
      >
        {this.renderCancelButton()}
        {this.renderDeleteButton()}
        {cancelButtonGroupElement}
      </div>
    )
  }

  private renderCancelButton() {
    const {
      cancelButtonText,
      onCancelButtonClick,
      isCancelButtonLoading,
      isCancelButtonDisabled,
      isDeleteButtonLoading,
      isPrimaryButtonLoading,
      // isVisible,
      // size,
    } = this.props
    if (onCancelButtonClick) {
      // const tabIndex = isVisible ? 0 : -1
      return (
        <div className='l-footer-item'>
          <Button
            data-testid='footer-cancel-button'
            loading={isCancelButtonLoading}
            disabled={isCancelButtonDisabled || isPrimaryButtonLoading || isDeleteButtonLoading}
            onClick={onCancelButtonClick}
            // tabIndex={tabIndex}
            // size={size}
          >
            {cancelButtonText}
          </Button>
        </div>
      )
    }
    return null
  }

  private renderDeleteButton() {
    const {
      deleteButtonText,
      onDeleteButtonClick,
      isCancelButtonLoading,
      isDeleteButtonLoading,
      isDeleteButtonDisabled,
      isPrimaryButtonLoading,
      // isVisible,
      // size,
    } = this.props
    if (onDeleteButtonClick) {
      // const tabIndex = isVisible ? 0 : -1
      return (
        <div className='l-footer-item'>
          <Button
            className='bp3-intent-danger'
            loading={isDeleteButtonLoading}
            disabled={isDeleteButtonDisabled || isPrimaryButtonLoading || isCancelButtonLoading}
            onClick={onDeleteButtonClick}
            // tabIndex={tabIndex}
            // size={size}
          >
            {deleteButtonText}
          </Button>
        </div>
      )
    }
    return null
  }

  private renderPrimaryButtonGroup() {
    const { primaryButtonGroupElement, isFlush } = this.props
    return (
      <div
        className={cn('l-footer-group', {
          'l-footer-group--flush': isFlush,
        })}
      >
        {this.renderErrorBlock()}
        {primaryButtonGroupElement}
        {this.renderPrimaryButton()}
      </div>
    )
  }

  private renderErrorBlock() {
    const { errorText, errorBlockChildren } = this.props
    if (errorBlockChildren) {
      return errorBlockChildren
    }
    return <ErrorBlock errorText={errorText} />
  }

  private renderPrimaryButton() {
    const {
      isPrimaryButtonDisabled,
      isPrimaryButtonLoading,
      onPrimaryButtonClick,
      primaryButtonText,
      primaryButtonClassName,
      primaryButtonTabIndex,
      // isVisible,
      // size,
    } = this.props
    if (onPrimaryButtonClick) {
      // const tabIndex = isVisible ? 0 : -1
      return (
        <div className='l-footer-item'>
          <Button
            data-testid='footer-submit-button'
            className={cn('bp3-intent-primary truncate', primaryButtonClassName)}
            disabled={isPrimaryButtonDisabled}
            loading={isPrimaryButtonLoading}
            onClick={onPrimaryButtonClick}
            tabIndex={primaryButtonTabIndex}
            // tabIndex={tabIndex}
            // size={size}
          >
            {primaryButtonText}
          </Button>
        </div>
      )
    }
    return null
  }
}
