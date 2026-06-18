import type { ClipMateSettingsV2, NotionTarget, ClipHistoryItem } from '../types/settings.types'
import type { ClipDraft, ClipMode, SaveStatus } from '../types/clip.types'
import { STORAGE_KEYS, DEFAULT_SETTINGS_V2, MIN_HISTORY_LIMIT, MAX_HISTORY_LIMIT, MAX_MARKDOWN_LENGTH } from '../constants/defaults'
import { generateId } from '../utils/id'
import { migrateSettings } from '../utils/migration'
import type { OldSettingsRecord } from '../utils/migration'
import { logger } from '../utils/logger'

export async function migrateSettingsIfNeeded(): Promise<ClipMateSettingsV2> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS)
    const stored = result[STORAGE_KEYS.SETTINGS] as OldSettingsRecord | undefined

    if (!stored || stored.version !== 2) {
      const v2Settings = migrateSettings(stored ?? {})
      await chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: v2Settings })
      return v2Settings
    }

    return { ...DEFAULT_SETTINGS_V2, ...stored } as ClipMateSettingsV2
  } catch (err) {
    logger.error('Settings migration failed')
    throw err
  }
}

export async function getSettings(): Promise<ClipMateSettingsV2> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS)
    const stored = result[STORAGE_KEYS.SETTINGS] as OldSettingsRecord | undefined

    if (!stored || stored.version !== 2) {
      return await migrateSettingsIfNeeded()
    }

    return { ...DEFAULT_SETTINGS_V2, ...stored } as ClipMateSettingsV2
  } catch (err) {
    logger.error('Failed to read settings')
    return { ...DEFAULT_SETTINGS_V2 }
  }
}

export async function saveSettings(
  partial: Partial<ClipMateSettingsV2>,
): Promise<void> {
  try {
    const current = await getSettings()
    const merged = { ...current, ...partial }

    if (merged.historyLimit !== undefined) {
      merged.historyLimit = Math.min(
        Math.max(merged.historyLimit, MIN_HISTORY_LIMIT),
        MAX_HISTORY_LIMIT,
      )
    }

    await chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: merged })
  } catch (err) {
    logger.error('Failed to save settings')
    throw err
  }
}

export async function getLastClipDraft(): Promise<ClipDraft | null> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.LAST_CLIP)
    return (result[STORAGE_KEYS.LAST_CLIP] as ClipDraft | undefined) ?? null
  } catch (err) {
    logger.error('Failed to read last clip')
    return null
  }
}

export async function saveLastClipDraft(draft: ClipDraft): Promise<void> {
  try {
    await chrome.storage.local.set({ [STORAGE_KEYS.LAST_CLIP]: draft })
  } catch (err) {
    logger.error('Failed to save last clip')
    throw err
  }
}

export async function clearLastClipDraft(): Promise<void> {
  try {
    await chrome.storage.local.remove(STORAGE_KEYS.LAST_CLIP)
  } catch (err) {
    logger.error('Failed to clear last clip')
    throw err
  }
}

export async function getNotionTargets(): Promise<NotionTarget[]> {
  try {
    const settings = await getSettings()
    return settings.notionTargets
  } catch (err) {
    logger.error('Failed to get notion targets')
    return []
  }
}

export async function saveNotionTargets(targets: NotionTarget[]): Promise<void> {
  try {
    await saveSettings({ notionTargets: targets })
  } catch (err) {
    logger.error('Failed to save notion targets')
    throw err
  }
}

export async function getDefaultNotionTarget(): Promise<NotionTarget | undefined> {
  try {
    const targets = await getNotionTargets()
    return targets.find((t) => t.isDefault) ?? targets[0]
  } catch (err) {
    logger.error('Failed to get default notion target')
    return undefined
  }
}

export interface CreateHistoryItemInput {
  title: string
  url: string
  mode: ClipMode
  tags: string[]
  notePreview: string
  contentPreview: string
  markdown: string
  wordCount: number
  targetId?: string
  targetName?: string
  saveStatus: SaveStatus
  savedAt?: string
  errorCode?: string
  siteName?: string
  siteIconUrl?: string
  themeColor?: string
  descriptionPreview?: string
  imageCount?: number
  firstImageUrl?: string
  skippedImageCount?: number
}

export async function addHistoryItem(input: CreateHistoryItemInput): Promise<ClipHistoryItem> {
  try {
    const now = new Date().toISOString()

    let markdown = input.markdown
    let markdownTruncated = false
    if (markdown.length > MAX_MARKDOWN_LENGTH) {
      markdown = markdown.slice(0, MAX_MARKDOWN_LENGTH)
      markdownTruncated = true
    }

    const item: ClipHistoryItem = {
      id: generateId(),
      title: input.title,
      url: input.url,
      mode: input.mode,
      tags: input.tags,
      notePreview: input.notePreview,
      contentPreview: input.contentPreview,
      markdown,
      markdownTruncated,
      wordCount: input.wordCount,
      targetId: input.targetId,
      targetName: input.targetName,
      saveStatus: input.saveStatus,
      savedAt: input.savedAt,
      errorCode: input.errorCode,
      createdAt: now,
      updatedAt: now,
      siteName: input.siteName,
      siteIconUrl: input.siteIconUrl,
      themeColor: input.themeColor,
      descriptionPreview: input.descriptionPreview,
      imageCount: input.imageCount,
      firstImageUrl: input.firstImageUrl,
      skippedImageCount: input.skippedImageCount,
    }

    const history = await getHistoryRaw()
    history.unshift(item)

    const settings = await getSettings()
    const limit = Math.min(Math.max(settings.historyLimit, MIN_HISTORY_LIMIT), MAX_HISTORY_LIMIT)
    const trimmed = history.slice(0, limit)

    await chrome.storage.local.set({ [STORAGE_KEYS.HISTORY]: trimmed })
    return item
  } catch (err) {
    logger.error('Failed to add history item')
    throw err
  }
}

export async function updateHistoryItem(
  id: string,
  updates: Partial<ClipHistoryItem>,
): Promise<ClipHistoryItem | null> {
  try {
    const history = await getHistoryRaw()
    const idx = history.findIndex((item) => item.id === id)
    if (idx === -1) return null

    history[idx] = {
      ...history[idx],
      ...updates,
      id: history[idx].id,
      updatedAt: new Date().toISOString(),
    }

    const settings = await getSettings()
    const limit = Math.min(Math.max(settings.historyLimit, MIN_HISTORY_LIMIT), MAX_HISTORY_LIMIT)
    const trimmed = history.slice(0, limit)

    await chrome.storage.local.set({ [STORAGE_KEYS.HISTORY]: trimmed })
    return history[idx]
  } catch (err) {
    logger.error('Failed to update history item')
    throw err
  }
}

export async function deleteHistoryItem(id: string): Promise<boolean> {
  try {
    const history = await getHistoryRaw()
    const filtered = history.filter((item) => item.id !== id)
    if (filtered.length === history.length) return false

    await chrome.storage.local.set({ [STORAGE_KEYS.HISTORY]: filtered })
    return true
  } catch (err) {
    logger.error('Failed to delete history item')
    throw err
  }
}

export async function clearHistory(): Promise<void> {
  try {
    await chrome.storage.local.remove(STORAGE_KEYS.HISTORY)
  } catch (err) {
    logger.error('Failed to clear history')
    throw err
  }
}

export async function getHistory(): Promise<ClipHistoryItem[]> {
  try {
    return await getHistoryRaw()
  } catch (err) {
    logger.error('Failed to get history')
    return []
  }
}

export async function searchHistory(query: string): Promise<ClipHistoryItem[]> {
  try {
    if (!query.trim()) return await getHistory()

    const lowerQuery = query.toLowerCase()
    const history = await getHistoryRaw()

    return history.filter((item) => {
      if (item.title.toLowerCase().includes(lowerQuery)) return true
      if (item.url.toLowerCase().includes(lowerQuery)) return true
      if (item.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))) return true
      return false
    })
  } catch (err) {
    logger.error('Failed to search history')
    return []
  }
}

async function getHistoryRaw(): Promise<ClipHistoryItem[]> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.HISTORY)
  return (result[STORAGE_KEYS.HISTORY] as ClipHistoryItem[] | undefined) ?? []
}
