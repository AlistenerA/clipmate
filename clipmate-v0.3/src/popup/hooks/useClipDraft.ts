import { useState, useCallback, useEffect } from 'react'
import { getSettings } from '../../shared/storage/storage'

export function useClipDraft() {
  const [tags, setTags] = useState<string[]>([])
  const [note, setNote] = useState('')

  useEffect(() => {
    getSettings().then((s) => {
      if (s.defaultTags.length > 0) {
        setTags((prev) => {
          const existing = new Set(prev.map((t) => t.trim().toLowerCase()))
          const added = s.defaultTags.filter(
            (t) => !existing.has(t.trim().toLowerCase()),
          )
          return [...prev, ...added]
        })
      }
    })
  }, [])

  const addTag = useCallback((raw: string) => {
    const tag = raw.trim()
    if (!tag) return
    setTags((prev) => {
      if (prev.some((t) => t.toLowerCase() === tag.toLowerCase())) return prev
      return [...prev, tag]
    })
  }, [])

  const removeTag = useCallback((index: number) => {
    setTags((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const resetDraft = useCallback(() => {
    setTags([])
    setNote('')
  }, [])

  return { tags, setTags, addTag, removeTag, note, setNote, resetDraft }
}
