import { logger } from '../utils/logger'
import type { ClipMateMessage } from '../types/message.types'

export async function sendToActiveTab<TResponse = unknown>(
  message: ClipMateMessage,
): Promise<TResponse> {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
  const tabId = tabs[0]?.id
  if (tabId == null) {
    logger.error('No active tab found')
    throw new Error('No active tab found')
  }
  return chrome.tabs.sendMessage(tabId, message) as Promise<TResponse>
}

export async function sendToRuntime<TResponse = unknown>(
  message: ClipMateMessage,
): Promise<TResponse> {
  return chrome.runtime.sendMessage(message) as Promise<TResponse>
}
