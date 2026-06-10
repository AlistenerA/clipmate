import { handleSaveToNotion } from './handlers/notionHandler'
import { MESSAGE_TYPES } from '../shared/constants/messageTypes'
import type { ClipMateMessage } from '../shared/types/message.types'
import type { ClipDraft } from '../shared/types/clip.types'

console.log('[ClipMate] background ready')

chrome.runtime.onMessage.addListener((message: ClipMateMessage, _sender, sendResponse) => {
  if (message?.type === MESSAGE_TYPES.SAVE_TO_NOTION) {
    handleSaveToNotion(message.payload as ClipDraft)
      .then(sendResponse)
      .catch((err) => {
        console.error('[ClipMate] save to notion error:', err)
        sendResponse({ success: false, error: 'NOTION_SAVE_FAILED' })
      })
    return true
  }

  console.log('[ClipMate] background received unhandled message:', message?.type)
  return false
})
