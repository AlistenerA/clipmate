// Version: v1.0.1
import { useEffect, useState, type ReactNode } from 'react'
import { PURCHASE_URL } from '../config'
import { hasFeature } from '../proAuth'

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
  return (
    <button
      type="button"
      className="rounded bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100"
      onClick={() => void chrome.tabs.create({ url: PURCHASE_URL })}
    >
      升级 Pro 以使用此功能
    </button>
  )
}
