import { Player } from '@lottiefiles/react-lottie-player'
import React from 'react'
import { IBaseProps } from '../../modules/lumina/components/base-props'
import successAnimationJson from './ovc-celebration-check-nobg.json'

export function SuccessAnimation(props: IBaseProps) {
  const { className } = props

  return (
    <div className={className}>
      <Player autoplay keepLastFrame src={successAnimationJson} style={{ height: '100px', width: '100px' }} />
    </div>
  )
}
