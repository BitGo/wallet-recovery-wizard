import { FormikErrors } from 'formik'
import _ from 'lodash'
import { getFirstFormikErrorRecurse, getSchemaPathFromDataPath } from './formik-errors'
import { IValidationContext, IValidationError } from './types'
import { defaultValidationContext } from './utils'

export function getValidationContextFromYupSchema(schema: any): IValidationContext {
  // Get formatted error string
  const getLabel = (path: string[]): string => {
    const schemaPath = getSchemaPathFromDataPath(path)
    const property = _.get(schema, schemaPath)
    if (!property) {
      console.error(`json schema does not have property for ${path.join('.')}`)
      return path.join('.')
    }
    return property.label
  }
  const orderedFields = Object.keys(schema.fields)
  const getOrder = (path: string[]): number => {
    const topLevelPath = _.first(path)
    const order = _.indexOf(orderedFields, topLevelPath)
    return order === -1 ? orderedFields.length : order
  }
  return {
    getLabel,
    getOrder,
  }
}

export function getErrorString(
  errors: IValidationError[],
  formikErrors: FormikErrors<any>,
  hasSubmitted: boolean,
  schema: any,
): string | undefined {
  if (!hasSubmitted) {
    return undefined
  }
  if (!_.isEmpty(formikErrors)) {
    const context = schema ? getValidationContextFromYupSchema(schema) : defaultValidationContext
    return getFirstFormikErrorRecurse(context, formikErrors, [])
  }
  if (!_.isEmpty(errors)) {
    const firstError = _.first(errors)
    return firstError!.message
  }
  return undefined
}
