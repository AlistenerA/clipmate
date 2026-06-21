import { useState, useEffect } from 'react'

export interface CurrentTab {
  id?: number
  title: string
  url: string
  hostname: string
}

export function useCurrentTab() {
  const [tab, setTab] = useState<CurrentTab | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    chrome.tabs.query({ active: true, currentWindow: true }).then(([t]) => {
      if (cancelled) return
      if (t && t.url) {
        let hostname = ''
        try {
          hostname = new URL(t.url).hostname
        } catch {
          hostname = ''
        }
        setTab({
          id: t.id,
          title: t.title || '无标题',
          url: t.url,
          hostname,
        })
      }
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return { tab, loading }
}
