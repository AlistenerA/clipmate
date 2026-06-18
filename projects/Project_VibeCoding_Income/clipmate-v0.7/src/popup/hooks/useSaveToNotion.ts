import { useState, useCallback } from 'react'
import { sendToRuntime } from '../../shared/messaging/sendMessage'
import { MESSAGE_TYPES } from '../../shared/constants/messageTypes'
import { ERROR_MESSAGES } from '../../shared/constants/defaults'
import type { SaveToNotionPayload, SaveToNotionResponse } from '../../shared/types/message.types'

export function formatSaveError(result: Extract<SaveToNotionResponse, { success: false }>): string {
  const message = ERROR_MESSAGES[result.error] || ERROR_MESSAGES.NOTION_SAVE_FAILED
  const details = [result.error]
  if (result.details?.batch) details.push(`B${result.details.batch}`)
  if (result.details?.httpStatus) details.push(`HTTP ${result.details.httpStatus}`)
  if (result.details?.apiCode) details.push(result.details.apiCode)
  return `${message}（${details.join(' / ')}）`
}

export function useSaveToNotion() {
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const save = useCallback(
    async (payload: SaveToNotionPayload) => {
      setSaving(true)
      setSaveError(null)
      setSaved(false)

      try {
        const result = await sendToRuntime<SaveToNotionResponse>({
          type: MESSAGE_TYPES.SAVE_TO_NOTION,
          payload,
        })

        if (result.success) {
          setSaved(true)
        } else {
          setSaveError(formatSaveError(result))
        }
      } catch (err) {
        const msg =
          err instanceof Error && ERROR_MESSAGES[err.message]
            ? ERROR_MESSAGES[err.message]
            : ERROR_MESSAGES.NETWORK_ERROR
        const code = err instanceof Error ? err.message : 'NETWORK_ERROR'
        setSaveError(`${msg}（${code}）`)
      } finally {
        setSaving(false)
      }
    },
    [],
  )

  const clearResult = useCallback(() => {
    setSaved(false)
    setSaveError(null)
  }, [])

  return { saving, saveError, saved, save, clearResult }
}
