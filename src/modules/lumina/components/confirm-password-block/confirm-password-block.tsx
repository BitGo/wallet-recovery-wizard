/** @jsx jsx */
import { Checkbox, Collapse, HTMLInputProps, Icon, Intent } from '@blueprintjs/core'
import cn from 'classnames'
import React, { FormEvent } from 'react'
import { jsx } from 'theme-ui'
import zxcvbn from 'zxcvbn'
import { IBaseProps } from '../base-props'
import { GridColumn } from '../grid-column/grid-column'
import { GridRow } from '../grid-row/grid-row'
import { InputField } from '../input-field/input-field'
import { IInputProps } from '../input/input'
import { ILabelProps } from '../label/label'
import Spinner from '../spinner/spinner'
import './_confirm-password-block.scss'

const PASSWORD_MIN_SCORE_STRENGTH = 4

interface IConfirmPasswordBlockProps {
  passwordLabelProps: ILabelProps
  passwordInputProps: IInputProps & HTMLInputProps
  confirmPasswordLabelProps: ILabelProps
  confirmPasswordInputProps: IInputProps & HTMLInputProps
  onPasswordChange: (password: string, isPasswordValid: boolean) => void
  onConfirmPasswordChange: (confirmPassword: string) => void
  isSingleColumn?: boolean
}

interface IConfirmPasswordBlockState {
  password: string
  confirmPassword: string
  passwordStrength: zxcvbn.ZXCVBNResult
  type: 'password' | 'text'
}

class ConfirmPasswordBlock extends React.Component<
  IConfirmPasswordBlockProps & IBaseProps,
  IConfirmPasswordBlockState
> {
  constructor(props) {
    super(props)
    this.state = {
      password: '',
      confirmPassword: '',
      passwordStrength: null,
      type: 'password',
    }
  }

  public render() {
    const { className, isSingleColumn } = this.props
    if (isSingleColumn) {
      return (
        <div className={className}>
          {this.renderPasswordField()}
          <div className='mb3'>{this.renderHint()}</div>
          {this.renderConfirmPasswordField()}
        </div>
      )
    } 
      return (
        <GridRow className={className}>
          <GridColumn className='w-50-l w-50-xl'>{this.renderPasswordField()}</GridColumn>
          <GridColumn className='dn-l mb3 mb0-l'>{this.renderHint()}</GridColumn>
          <GridColumn className='w-50-l w-50-xl'>{this.renderConfirmPasswordField()}</GridColumn>
          <GridColumn className='dn db-l'>{this.renderHint()}</GridColumn>
        </GridRow>
      )
    
  }

  private renderPasswordField = () => {
    const { passwordLabelProps, passwordInputProps } = this.props
    const { password, passwordStrength, type } = this.state
    return (
      <InputField
        layout='vertical'
        // labelProps={passwordLabelProps}
        labelProps={{
          ...passwordLabelProps,
          labelText: (
            <div className='flex justify-between'>
              <span>Password</span>
              <Checkbox
                labelElement={<span className='fw4 silver'>Show Password</span>}
                onChange={(event) => {
                  const target = event.target as any
                  this.setState({ type: target.checked ? 'text' : 'password' })
                }}
                checked={type === 'text'}
              />
            </div>
          ),
          htmlFor: 'new-pw-input',
        }}
        inputProps={{
          ...passwordInputProps,
          className: cn(passwordInputProps?.className, {
            'b-confirmPasswordBlock--bottomFlat': password.length > 0,
          }),
          layout: 'vertical',
          onChange: this.handlePasswordChange,
          type,
          value: password,
          leftElement: (
            <div className='relative ml2'>
              <Spinner
                className='mr2'
                intent='success'
                value={password.length > 0 ? passwordStrength?.score / (PASSWORD_MIN_SCORE_STRENGTH + 1) + 0.2 : 0}
                size={22}
                sx={{
                  paddingTop: passwordInputProps.large ? '9px' : '5px',
                }}
              />
              {passwordStrength?.score >= PASSWORD_MIN_SCORE_STRENGTH && (
                <Icon
                  className='absolute'
                  sx={{
                    top: passwordInputProps.large ? '12px' : '8px',
                    left: '3px',
                  }}
                  intent='success'
                  icon='small-tick'
                />
              )}
            </div>
          ),
          id: 'new-pw-input',
        }}
      />
    )
  }

  private renderHint() {
    const { isSingleColumn } = this.props
    const { password, passwordStrength } = this.state
    return (
      <Collapse isOpen={password.length > 0}>
        <div
          className={cn({
            pt2: !isSingleColumn,
          })}
        >
          <div
            className={cn('pa3 bl br bb b--border br2 lh-copy bg-almost-white', {
              'br--bottom': isSingleColumn,
              bt: !isSingleColumn,
            })}
          >
            <ul className='ml3'>
              <li>
                It would take {passwordStrength?.score < PASSWORD_MIN_SCORE_STRENGTH ? 'about' : ''}{' '}
                {passwordStrength?.crack_times_display.online_no_throttling_10_per_second} to crack this password.
              </li>
              {passwordStrength?.feedback?.suggestions?.map((suggestion, index) => {
                return <li key={index}>{suggestion}.</li>
              })}
              {passwordStrength?.feedback.warning && <li>{passwordStrength?.feedback.warning}.</li>}
            </ul>
          </div>
        </div>
      </Collapse>
    )
  }

  private renderConfirmPasswordField() {
    const { confirmPasswordLabelProps, confirmPasswordInputProps } = this.props
    const { type } = this.state
    return (
      <InputField
        layout='vertical'
        labelProps={{ ...confirmPasswordLabelProps, htmlFor: 'confirm-pw-input' }}
        inputProps={{
          ...confirmPasswordInputProps,
          type,
          onChange: this.handleConfirmPasswordOnChange,
          leftElement: this.renderConfirmMatchCheckmark(),
          id: 'confirm-pw-input',
        }}
      />
    )
  }

  private renderConfirmMatchCheckmark() {
    const { passwordInputProps } = this.props
    const { password, confirmPassword } = this.state

    let intent: Intent = 'none'
    if (confirmPassword.length > 0) {
      if (password === confirmPassword) {
        intent = 'success'
      } else if (password.startsWith(confirmPassword)) {
          intent = 'primary'
        } else {
          intent = 'danger'
        }
    }
    return (
      <div className='relative ml2'>
        <Spinner
          className='mr2'
          value={password.length > 0 ? confirmPassword.length / password.length : 0}
          intent={intent}
          size={22}
          sx={{
            paddingTop: passwordInputProps.large ? '9px' : '5px',
          }}
        />
        {intent === 'success' && (
          <Icon
            className='absolute'
            sx={{
              top: passwordInputProps.large ? '12px' : '8px',
              left: '3px',
            }}
            intent={intent}
            icon='small-tick'
          />
        )}
        {intent === 'danger' && (
          <Icon
            className='absolute'
            sx={{
              top: passwordInputProps.large ? '12px' : '8px',
              left: '3px',
            }}
            intent={intent}
            icon='small-cross'
          />
        )}
      </div>
    )
  }

  private handlePasswordChange = (event: FormEvent<HTMLInputElement>) => {
    const { onPasswordChange } = this.props
    const password = event.currentTarget.value
    const passwordStrength = zxcvbn(password)
    this.setState({
      password,
      passwordStrength,
    })
    onPasswordChange(password, passwordStrength?.score >= PASSWORD_MIN_SCORE_STRENGTH)
  }

  private handleConfirmPasswordOnChange = (event: FormEvent<HTMLInputElement>) => {
    const { onConfirmPasswordChange } = this.props
    const confirmPassword = event.currentTarget.value
    this.setState({ confirmPassword })
    onConfirmPasswordChange(confirmPassword)
  }
}

export default ConfirmPasswordBlock
