import React from 'react'
import { IBaseProps } from '../base-props'
import './_hover-arrow.scss'

export function HoverArrow(props: IBaseProps) {
  return (
    <svg className='b-hoverArrow' width='10' height='10' viewBox='0 0 10 10' aria-hidden='true'>
      <g fillRule='evenodd'>
        <path strokeLinecap='square' className='b-hoverArrow-linePath' d='M0 5h7' />
        <path strokeLinecap='square' className='b-hoverArrow-tipPath' d='M1 1l4 4-4 4' />
      </g>
    </svg>
  )
}
