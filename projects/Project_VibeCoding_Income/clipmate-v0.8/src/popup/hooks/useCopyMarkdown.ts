import { useState, useCallback } from 'react'

export function useCopyMarkdown() {
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resetCopy = useCallback(() => {
    setCopied(false)
    setError(null)
  }, [])

  const copy = useCallback(async (markdown: string): Promise<boolean> => {
    setError(null)
    setCopied(false)
    try {
      await navigator.clipboard.writeText(markdown)
      setCopied(true)
      return true
    } catch {
      try {
        const ta = document.createElement('textarea')
        ta.value = markdown
        ta.style.position = 'fixed'
        ta.style.left = '-9999px'
        document.body.appendChild(ta)
        ta.select()
        const didCopy = document.execCommand('copy')
        document.body.removeChild(ta)
        if (!didCopy) throw new Error('COPY_COMMAND_FAILED')
        setCopied(true)
        return true
      } catch {
        setError('复制失败，请手动复制')
        return false
      }
    }
  }, [])

  return { copy, copied, error, resetCopy }
}
