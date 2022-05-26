import _ from 'lodash'

import { ErrorHandler, IValidationContext, IValidationError } from './types'

export const PASSWORD_MIN_LENGTH = 8
export const UnknownError =
  'Something went wrong. Please help us improve your experience by contacting us at support@bitgo.com.'

export const defaultValidationContext = {
  getLabel: () => '',
  getOrder: () => 0,
}

const errorsMapping = {}
export const registerError = (error: string, handler: ErrorHandler) => {
  errorsMapping[error] = handler
}

export function getErrorMessage(ctx: IValidationContext, err: IValidationError) {
  _.set(ctx, 'getParamsValidationErrorMessage', getErrorMessage)
  const handler = errorsMapping[err.code]
  if (handler) {
    return handler(ctx, err)
  }
  console.error(`cannot find error handler for code=${err.code}`)
  return UnknownError
}
