import { useState, useCallback } from 'react'
import { sendToRuntime } from '../../shared/messaging/sendMessage'
import { MESSAGE_TYPES } from '../../shared/constants/messageTypes'
import { ERROR_MESSAGES } from '../../shared/constants/defaults'
import type { SaveToNotionPayload, SaveToNotionResponse } from '../../shared/types/message.types'

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
          const msg =
            ERROR_MESSAGES[result.error] ||
            ERROR_MESSAGES.NOTION_SAVE_FAILED
          setSaveError(msg)
        }
      } catch (err) {
        const msg =
          err instanceof Error && ERROR_MESSAGES[err.message]
            ? ERROR_MESSAGES[err.message]
            : ERROR_MESSAGES.NETWORK_ERROR
        setSaveError(msg)
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
