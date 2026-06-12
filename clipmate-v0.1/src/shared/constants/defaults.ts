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
  NOTION_TOKEN_MISSING: '请先在设置页填写 Notion Token',
  NOTION_PAGE_ID_MISSING: '请先在设置页填写 Notion Page ID',
  NOTION_AUTH_FAILED: 'Notion 授权失败，请检查 Token 是否正确',
  NOTION_PAGE_NOT_FOUND:
    '找不到 Notion 页面，请检查 Page ID，并确认 Integration 已被邀请到该页面',
  NOTION_RATE_LIMITED: '请求过于频繁，请稍后重试',
  NETWORK_ERROR: '网络错误，请稍后重试',
  NOTION_SAVE_FAILED: '保存失败，请稍后重试',
  CONTENT_EMPTY: '没有可保存的内容',
}
