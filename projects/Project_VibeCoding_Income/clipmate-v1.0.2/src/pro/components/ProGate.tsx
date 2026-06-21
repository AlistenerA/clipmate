// Version: v1.0.1
import { useEffect, useState, type ReactNode } from 'react'
import { hasFeature } from '../proAuth'
import LicensePurchasePrompt from './LicensePurchasePrompt'

interface ProGateProps {
  feature: string
  children: ReactNode
}

export default function ProGate({ feature, children }: ProGateProps) {
  const [allowed, setAllowed] = useState<boolean | null>(null)

  useEffect(() => {
    void hasFeature(feature).then(setAllowed)
  }, [feature])

  if (allowed === null) return null
  if (allowed) return <>{children}</>
  return <LicensePurchasePrompt buttonLabel="升级 Pro 以使用此功能" />
}
