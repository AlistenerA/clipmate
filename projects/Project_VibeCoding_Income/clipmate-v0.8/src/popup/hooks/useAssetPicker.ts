import { useCallback, useEffect, useState } from 'react'
import { ASSET_PICKER_MAX_SELECTION } from '../../features/assets'
import { MESSAGE_TYPES } from '../../shared/constants/messageTypes'
import { sendToActiveTab } from '../../shared/messaging/sendMessage'
import type { SelectedImageAsset } from '../../shared/types/clip.types'
import type { AssetPickerResponse, AssetPickerSessionState } from '../../shared/types/message.types'
import { generateId } from '../../shared/utils/id'

function pickerErrorMessage(code: string): string {
  if (code === 'NO_PICKABLE_IMAGES') return '当前页面没有可点选的正文图片'
  if (code === 'ASSET_PICKER_SESSION_NOT_FOUND') return '图片选择会话已结束，请重新开始'
  return `图片选择失败（${code}）`
}

export function useAssetPicker() {
  const [state, setState] = useState<AssetPickerSessionState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [starting, setStarting] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const response = await sendToActiveTab<AssetPickerResponse>({
        type: MESSAGE_TYPES.GET_ASSET_PICKER_STATE
      })
      if (response.success) setState(response.data)
    } catch {
      // Restricted pages do not expose a content script; extraction owns that error state.
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const start = useCallback(async (selectedImages: SelectedImageAsset[]) => {
    setStarting(true)
    setError(null)
    try {
      const response = await sendToActiveTab<AssetPickerResponse>({
        type: MESSAGE_TYPES.START_ASSET_PICKER,
        payload: {
          sessionId: generateId(),
          maxSelection: ASSET_PICKER_MAX_SELECTION,
          selectedImages
        }
      })
      if (response.success) {
        setState(response.data)
      } else {
        setError(pickerErrorMessage(response.error))
      }
    } catch {
      setError('无法在当前页面启动图片选择，请刷新页面后重试')
    } finally {
      setStarting(false)
    }
  }, [])

  const cancel = useCallback(async () => {
    if (!state) return
    const response = await sendToActiveTab<AssetPickerResponse>({
      type: MESSAGE_TYPES.CANCEL_ASSET_PICKER,
      payload: { sessionId: state.sessionId }
    })
    if (response.success) setState(response.data)
  }, [state])

  const consume = useCallback(async (sessionId: string) => {
    try {
      const response = await sendToActiveTab<AssetPickerResponse>({
        type: MESSAGE_TYPES.CONSUME_ASSET_PICKER_RESULT,
        payload: { sessionId }
      })
      if (response.success) setState(null)
    } catch {
      setState(null)
    }
  }, [])

  return {
    state,
    error,
    starting,
    start,
    cancel,
    consume,
    refresh
  }
}
