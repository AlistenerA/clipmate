import { useState, useCallback } from 'react'

export function useCopyMarkdown() {
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resetCopy = useCallback(() => {
    setCopied(false)
    setError(null)
  }, [])

  const copy = useCallback(async (markdown: string) => {
    setError(null)
    setCopied(false)
    try {
      await navigator.clipboard.writeText(markdown)
      setCopied(true)
    } catch {
      try {
        const ta = document.createElement('textarea')
        ta.value = markdown
        ta.style.position = 'fixed'
        ta.style.left = '-9999px'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
        setCopied(true)
      } catch {
        setError('复制失败，请手动复制')
      }
    }
  }, [])

  return { copy, copied, error, resetCopy }
}
