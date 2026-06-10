import type { ClipMateSettings } from '../types/settings.types'

export const DEFAULT_SETTINGS: ClipMateSettings = {
  notionToken: '',
  notionPageId: '',
  defaultTags: [],
  saveHistoryEnabled: true,
}

export const STORAGE_KEYS = {
  SETTINGS: 'clipmate_settings',
  LAST_CLIP: 'clipmate_last_clip',
} as const

export const ERROR_MESSAGES: Record<string, string> = {
  NO_SELECTION: '请先选中页面文字后再提取',
  EXTRACTION_FAILED: '内容提取失败，请尝试全文模式',
}
