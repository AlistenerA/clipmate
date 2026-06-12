import { handleSaveToNotion } from './handlers/notionHandler'
import { MESSAGE_TYPES } from '../shared/constants/messageTypes'
import type { ClipMateMessage } from '../shared/types/message.types'
import type { ClipDraft } from '../shared/types/clip.types'

import { logger } from '../shared/utils/logger'

logger.info('background ready')

chrome.runtime.onMessage.addListener((message: ClipMateMessage, _sender, sendResponse) => {
  if (message?.type === MESSAGE_TYPES.SAVE_TO_NOTION) {
    handleSaveToNotion(message.payload as ClipDraft)
      .then(sendResponse)
      .catch(() => {
        logger.error('Background save to notion failed')
        sendResponse({ success: false, error: 'NOTION_SAVE_FAILED' })
      })
    return true
  }

  logger.info(`Background received unhandled message: ${message?.type}`)
  return false
})
