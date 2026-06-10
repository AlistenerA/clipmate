import { useState, useCallback, useRef } from 'react'
import { sendToActiveTab } from '../../shared/messaging/sendMessage'
import { MESSAGE_TYPES } from '../../shared/constants/messageTypes'
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

    try {
      const msgType =
        mode === 'fullpage'
          ? MESSAGE_TYPES.EXTRACT_CURRENT_PAGE
          : MESSAGE_TYPES.GET_SELECTION

      const result = await sendToActiveTab<ExtractResult>({ type: msgType })

      if (abortRef.current) return

      if (result.success) {
        setContent(result.data)
      } else {
        setError(translateError(result.error))
        setContent(null)
      }
    } catch (err) {
      if (abortRef.current) return
      const msg = err instanceof Error ? err.message : '提取失败'
      setError(msg === 'No active tab found' ? '未找到活动标签页' : `提取异常：${msg}`)
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

  return { content, loading, error, extract, clear, setContent }
}

function translateError(code: string): string {
  const map: Record<string, string> = {
    NO_SELECTION: '请先选中页面文字后再提取',
    EXTRACTION_FAILED: '内容提取失败，请尝试全文模式',
  }
  return map[code] || `提取失败（${code}）`
}
