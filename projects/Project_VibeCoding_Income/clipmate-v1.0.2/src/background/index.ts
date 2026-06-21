import { handleSaveToNotion } from './handlers/notionHandler'
import { MESSAGE_TYPES } from '../shared/constants/messageTypes'
import type { ClipMateMessage, SaveToNotionPayload } from '../shared/types/message.types'

import { logger } from '../shared/utils/logger'
import { handleLicenseMessage, isLicenseMessageType } from './handlers/licenseHandler'
import { registerLicenseLifecycle } from './licenseLifecycle'

logger.info('background ready')
registerLicenseLifecycle()

chrome.runtime.onMessage.addListener((message: ClipMateMessage, _sender, sendResponse) => {
  if (isLicenseMessageType(message?.type)) {
    handleLicenseMessage(message.type, message.payload)
      .then(sendResponse)
      .catch(() => sendResponse({ success: false, error: 'LICENSE_REQUEST_FAILED', transient: true }))
    return true
  }

  if (message?.type === MESSAGE_TYPES.SAVE_TO_NOTION) {
    handleSaveToNotion(message.payload as SaveToNotionPayload)
      .then(sendResponse)
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err)
        logger.error(`Background save to notion failed: ${msg}`)
        sendResponse({ success: false, error: 'NOTION_SAVE_FAILED' })
      })
    return true
  }

  logger.info(`Background received unhandled message: ${message?.type}`)
  return false
})
