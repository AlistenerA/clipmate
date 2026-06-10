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
