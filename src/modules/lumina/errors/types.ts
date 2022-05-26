import { FormikErrors } from 'formik'

import { ErrorCode as BackendErrorCode } from '../graphql/client/generated'
import { BitgoBackendErrorCode } from './bitgo-backend-errors'
import { FrontendErrorCode } from './frontend-errors'

export interface IErrors<Value> {
  errors: IValidationError[]
  inputErrors: FormikErrors<Value>
}

export enum ErrorType {
  InternalServerError = 'internal_server_error',
  ProcessingError = 'processing_error',
  ValidationError = 'validation_error',
}

export interface IValidationContext {
  data?: any
  getOrder(path: string[]): number
  getLabel(path: string[]): string
  getParamsValidationErrorMessage?: (ctx, err) => string
}

export interface IValidationError {
  code: FrontendErrorCode | BackendErrorCode | BitgoBackendErrorCode
  path: string[]
  message?: string
  params?: any
}

export type ErrorHandler = (ctx: IValidationContext, err: IValidationError) => string

export interface IValidationChildError {
  code: BackendErrorCode
  message?: string
  path?: string
  params?: Map<string, any>
}

export interface IAPIError {
  code?: BackendErrorCode
  type: ErrorType
  message?: string
  params?: Map<string, any>
  errors: IValidationChildError[]
}
