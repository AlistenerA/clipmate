import type { ClipMateSettings } from '../types/settings.types'
import type { ClipDraft } from '../types/clip.types'
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '../constants/defaults'
import { logger } from '../utils/logger'

export async function getSettings(): Promise<ClipMateSettings> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS)
    const stored = result[STORAGE_KEYS.SETTINGS] as ClipMateSettings | undefined
    return stored ? { ...DEFAULT_SETTINGS, ...stored } : { ...DEFAULT_SETTINGS }
  } catch {
    logger.error('Failed to read settings')
    return { ...DEFAULT_SETTINGS }
  }
}

export async function saveSettings(
  partial: Partial<ClipMateSettings>,
): Promise<void> {
  try {
    const current = await getSettings()
    const merged = { ...current, ...partial }
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
