import type { ClipMateSettings } from '../types/settings.types'
import type { ClipMateSettingsV2, NotionTarget } from '../types/settings.types'
import { DEFAULT_SETTINGS_V2 } from '../constants/defaults'
import { generateId } from './id'

export interface OldSettingsRecord {
  notionToken?: string
  notionPageId?: string
  defaultTags?: string[]
  saveHistoryEnabled?: boolean
  version?: number
}

export function migrateSettings(
  oldSettings: ClipMateSettings | OldSettingsRecord | undefined | null,
): ClipMateSettingsV2 {
  const now = new Date().toISOString()

  const notionTargets: NotionTarget[] = []

  if (oldSettings && oldSettings.notionPageId && oldSettings.notionPageId.trim()) {
    notionTargets.push({
      id: generateId(),
      name: '默认 Notion 页面',
      pageId: oldSettings.notionPageId.trim(),
      isDefault: true,
      createdAt: now,
      updatedAt: now,
      lastUsedAt: now,
    })
  }

  return {
    notionToken: oldSettings?.notionToken ?? '',
    notionPageId: oldSettings?.notionPageId ?? '',
    defaultTags: oldSettings?.defaultTags ?? [],
    saveHistoryEnabled: oldSettings?.saveHistoryEnabled ?? true,
    version: 2,
    notionTargets,
    historyLimit: DEFAULT_SETTINGS_V2.historyLimit,
  }
}
