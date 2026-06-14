import { logger } from '../utils/logger'
import { ERROR_MESSAGES } from '../constants/defaults'
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

export function isContentScriptUnavailableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  const message = error.message
  return message.includes('Could not establish connection') ||
    message.includes('Receiving end does not exist') ||
    message.includes('Error communicating with the native message host')
}

export function normalizeContentScriptConnectionError(error: unknown): Error {
  if (isContentScriptUnavailableError(error)) {
    return new Error(ERROR_MESSAGES.CONTENT_SCRIPT_UNAVAILABLE)
  }
  if (error instanceof Error) return error
  return new Error('提取失败')
}
