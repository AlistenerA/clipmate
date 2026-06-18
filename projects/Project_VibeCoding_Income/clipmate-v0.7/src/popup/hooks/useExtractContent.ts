import { useState, useCallback, useRef } from 'react'
import { sendToActiveTab, normalizeContentScriptConnectionError, isContentScriptUnavailableError } from '../../shared/messaging/sendMessage'
import { MESSAGE_TYPES } from '../../shared/constants/messageTypes'
import { ERROR_MESSAGES } from '../../shared/constants/defaults'
import type { ExtractedContent, ClipMode } from '../../shared/types/clip.types'
import type { ExtractPageResponse, SelectionResponse } from '../../shared/types/message.types'

type ExtractResult = ExtractPageResponse | SelectionResponse

export function useExtractContent() {
  const [content, setContent] = useState<ExtractedContent | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef(false)

  const extract = useCallback(async (mode: ClipMode) => {
    abortRef.current = false
    setLoading(true)
    setError(null)
    setContent(null)

    try {
      const msgType = mode === 'selection'
        ? MESSAGE_TYPES.GET_SELECTION
        : mode === 'tutorial'
          ? MESSAGE_TYPES.EXTRACT_TUTORIAL
          : MESSAGE_TYPES.EXTRACT_CURRENT_PAGE

      const result = await sendToActiveTab<ExtractResult>({ type: msgType })

      if (abortRef.current) return

      if (result.success) {
        setContent(result.data)
      } else {
        setError(ERROR_MESSAGES[result.error] || `提取失败（${result.error}）`)
        setContent(null)
      }
    } catch (err) {
      if (abortRef.current) return
      const normalized = normalizeContentScriptConnectionError(err)
      setError(normalized.message)
      setContent(null)
    } finally {
      if (!abortRef.current) {
        setLoading(false)
      }
    }
  }, [])

  const clear = useCallback(() => {
    abortRef.current = true
    setContent(null)
    setError(null)
    setLoading(false)
  }, [])

  const tryExtractPrioritizeSelection = useCallback(async (): Promise<{ content: ExtractedContent | null; mode: ClipMode } | null> => {
    abortRef.current = false
    setLoading(true)
    setError(null)

    try {
      const selResult = await sendToActiveTab<ExtractResult>({
        type: MESSAGE_TYPES.GET_SELECTION,
      })

      if (abortRef.current) return null

      if (selResult.success && (selResult.data.contentText || selResult.data.markdown)) {
        setContent(selResult.data)
        return { content: selResult.data, mode: 'selection' }
      }

      return { content: null, mode: 'fullpage' }
    } catch (err) {
      if (abortRef.current) return null
      if (isContentScriptUnavailableError(err)) {
        const normalized = normalizeContentScriptConnectionError(err)
        setError(normalized.message)
      }
      return { content: null, mode: 'fullpage' }
    } finally {
      if (!abortRef.current) {
        setLoading(false)
      }
    }
  }, [])

  return { content, loading, error, extract, tryExtractPrioritizeSelection, clear, setContent }
}
