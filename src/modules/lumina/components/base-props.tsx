import React from 'react'

// see https://reactjs.org/docs/testing-recipes.html for more info about data-testid
export interface IBaseProps {
  'data-testid'?: string
  children?: React.ReactNode
  className?: string
  style?: React.CSSProperties
  theme?: any
  id?: string
}
