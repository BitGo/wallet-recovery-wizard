import { ISpinnerProps as IBlueprintSpinnerProps, Spinner as BlueprintSpinner } from '@blueprintjs/core'
import React from 'react'

export const SPINNER_SIZE_TINY = 13
export const SPINNER_SIZE_MINI = 16
export const SPINNER_SIZE_SMALL = 20

class Spinner extends React.PureComponent<IBlueprintSpinnerProps, {}> {
  public render() {
    const { className } = this.props
    return <BlueprintSpinner {...this.props} className={className} />
  }
}

export default Spinner