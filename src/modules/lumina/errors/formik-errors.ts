import _ from 'lodash'
import { IValidationContext } from './types'

export function getFirstFormikErrorRecurse(context: IValidationContext, errors: any, path: any[]): string | undefined {
  if (_.isNil(errors)) {
    return undefined
  }
  if (_.isArray(errors)) {
    const index = _.findIndex(errors, (err) => !_.isNil(err))
    const nextPath = path.concat([index.toString()])
    return getFirstFormikErrorRecurse(context, errors[index], nextPath)
  }
  const fields = _.keys(errors)
  const orderdFields = getOrderdFields(fields, context, path)
  const firstField = _.get(orderdFields, '[0].field')
  const result = errors[firstField]
  if (_.isString(result)) {
    return result
  }
  return getFirstFormikErrorRecurse(context, result, path.concat([firstField]))
}

function getOrderdFields(fields: string[], context: IValidationContext, path: any[]) {
  const fieldsByOrder =
    _.map(fields, (field: string) => ({
      field,
      order: context.getOrder(path.concat([field])),
    })) || []
  return _.sortBy(fieldsByOrder, 'order')
}

export function getSchemaPathFromDataPath(dataPath: string[]): string[] {
  const schemaPath: string[] = []
  dataPath.forEach((fragment) => {
    if (!_.isNaN(parseFloat(fragment))) {
      schemaPath.push('items')
    } else {
      schemaPath.push('properties')
      schemaPath.push(fragment)
    }
  })
  return schemaPath
}
