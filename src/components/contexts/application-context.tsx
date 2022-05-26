import { NetworkType } from '@bitgo/statics'
import React, { useContext } from 'react'
import { BitgoSDKOfflineWrapper } from '../../pkg/bitgo/bitgo-sdk-offline-wrapper'

// TODO(louis): cannot find response type for https://app.bitgo-test.com/api/auth/v1/session in Bitgo SDK, but in common - "@bitgo/common-interface/dist/src/client-models/login-response/login-response.model.d.ts"
export interface BitgoSession {
  client: string
  created: string
  expires: string
  id: string
  ip: string
  ipRestrict: string[]
  isExtensible: false
  label: string
  origin: string
  scope: string[]
  user: string
}

export interface BitgoUser {
  agreements: unknown
  allowedCoins: string[]
  country: string
  currency: unknown
  disableReset2FA: boolean
  ecdhKeychain: string
  email: unknown
  enterprises: unknown
  featureFlags: string[]
  forceResetPassword: boolean
  id: string
  identity: unknown
  isActive: boolean
  lastLogin: string
  name: unknown
  otpDevices:unknown
  phone: unknown
  portfolioTaxOrgPermissions: unknown
  rateLimits: unknown
  referrer: unknown
  signupDomain: string
  timezone: string
  username: string
}

export interface IApplicationContextProps {
  bitgoSDKOfflineWrapper: BitgoSDKOfflineWrapper
  setBitgoSDKOfflineWrapper: (bitgoInstance: BitgoSDKOfflineWrapper) => void
  locale: string
  setLocale: (string: string) => void
  network: string
  setNetwork: (network: NetworkType) => void
  session: BitgoSession
  setSession: (session: BitgoSession) => void
  user: BitgoUser
  setUser: (user: BitgoUser) => void
}

// NOTE: I have to set the value to null so that we can initialize UserContext
// without type errors. This is just a weirdness with React context.
export const ApplicationContext = React.createContext<IApplicationContextProps>({} as any)

export function useApplicationContext(): IApplicationContextProps {
  return useContext<IApplicationContextProps>(ApplicationContext)
}
