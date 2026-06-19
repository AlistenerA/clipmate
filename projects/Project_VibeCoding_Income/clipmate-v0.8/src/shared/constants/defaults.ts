import type { ClipMateSettings, ClipMateSettingsV2 } from '../types/settings.types'

export const DEFAULT_SETTINGS: ClipMateSettings = {
  notionToken: '',
  notionPageId: '',
  defaultTags: [],
  saveHistoryEnabled: true,
}

export const DEFAULT_SETTINGS_V2: ClipMateSettingsV2 = {
  notionToken: '',
  notionPageId: '',
  defaultTags: [],
  saveHistoryEnabled: true,
  version: 2,
  notionTargets: [],
  historyLimit: 100,
}

export const STORAGE_KEYS = {
  SETTINGS: 'clipmate_settings',
  LAST_CLIP: 'clipmate_last_clip',
  HISTORY: 'clipmate_history',
} as const

export const MAX_MARKDOWN_LENGTH = 50000
export const DEFAULT_HISTORY_LIMIT = 100
export const MIN_HISTORY_LIMIT = 10
export const MAX_HISTORY_LIMIT = 500

export const ERROR_MESSAGES: Record<string, string> = {
  NO_SELECTION: '请先选中页面文字后再提取',
  EXTRACTION_FAILED: '内容提取失败，请尝试全文模式',
  CONTENT_SCRIPT_UNAVAILABLE:
    'ClipMate 未能连接到当前页面。请刷新当前网页后重试；如刚重新加载过扩展，需刷新当前网页以使内容脚本生效。',
  NOTION_TOKEN_MISSING: '请先在设置页填写 Notion Token',
  NOTION_PAGE_ID_MISSING: '请先在设置页添加 Notion 目标页面',
  NOTION_TARGETS_EMPTY: '请先在设置页添加 Notion 目标页面',
  NOTION_TARGET_NOT_FOUND: '所选 Notion 目标不存在，请重新选择',
  NOTION_AUTH_FAILED: 'Notion 授权失败，请检查 Token 是否正确',
  NOTION_PAGE_NOT_FOUND:
    '找不到 Notion 页面，请检查 Page ID，并确认 Integration 已被邀请到该页面',
  NOTION_RATE_LIMITED: '请求过于频繁，请稍后重试',
  NOTION_VALIDATION_ERROR: 'Notion 拒绝了内容格式，请检查错误代码',
  NOTION_CONFLICT: 'Notion 页面正被更新，请稍后重试',
  NOTION_SERVICE_UNAVAILABLE: 'Notion 服务暂时不可用，请稍后重试',
  NETWORK_ERROR: '网络错误，请稍后重试',
  NOTION_SAVE_FAILED: '保存失败，请稍后重试',
  CONTENT_EMPTY: '没有可保存的内容',
}
