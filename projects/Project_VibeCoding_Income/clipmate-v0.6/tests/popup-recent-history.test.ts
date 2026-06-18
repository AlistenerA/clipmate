import { describe, expect, it } from 'vitest'
import {
  findMostRecentSavedHistoryByUrl,
  formatRecentHistoryHint,
} from '../src/popup/utils/recentHistory'
import type { ClipHistoryItem } from '../src/shared/types/settings.types'

function makeHistoryItem(overrides: Partial<ClipHistoryItem> = {}): ClipHistoryItem {
  return {
    id: overrides.id ?? 'hist-1',
    title: overrides.title ?? 'Saved Page',
    url: overrides.url ?? 'https://example.com/article',
    mode: overrides.mode ?? 'fullpage',
    tags: overrides.tags ?? [],
    notePreview: overrides.notePreview ?? '',
    contentPreview: overrides.contentPreview ?? '',
    markdown: overrides.markdown ?? '# Saved Page',
    markdownTruncated: overrides.markdownTruncated ?? false,
    wordCount: overrides.wordCount ?? 10,
    saveStatus: overrides.saveStatus ?? 'saved',
    savedAt: overrides.savedAt,
    errorCode: overrides.errorCode,
    createdAt: overrides.createdAt ?? '2026-06-17T10:00:00.000Z',
    updatedAt: overrides.updatedAt ?? '2026-06-17T10:00:00.000Z',
    targetId: overrides.targetId,
    targetName: overrides.targetName,
    siteName: overrides.siteName,
    siteIconUrl: overrides.siteIconUrl,
    themeColor: overrides.themeColor,
    descriptionPreview: overrides.descriptionPreview,
    imageCount: overrides.imageCount,
    firstImageUrl: overrides.firstImageUrl,
    skippedImageCount: overrides.skippedImageCount,
  }
}

describe('findMostRecentSavedHistoryByUrl', () => {
  it('returns null for empty url', () => {
    expect(findMostRecentSavedHistoryByUrl([makeHistoryItem()], '')).toBeNull()
  })

  it('returns null when no history URL matches', () => {
    const result = findMostRecentSavedHistoryByUrl([
      makeHistoryItem({ url: 'https://example.com/other' }),
    ], 'https://example.com/article')

    expect(result).toBeNull()
  })

  it('ignores failed history entries', () => {
    const result = findMostRecentSavedHistoryByUrl([
      makeHistoryItem({ saveStatus: 'failed', savedAt: '2026-06-17T10:05:00.000Z' }),
    ], 'https://example.com/article')

    expect(result).toBeNull()
  })

  it('returns the most recent saved match', () => {
    const older = makeHistoryItem({
      id: 'older',
      savedAt: '2026-06-17T10:00:00.000Z',
    })
    const newer = makeHistoryItem({
      id: 'newer',
      savedAt: '2026-06-17T10:30:00.000Z',
    })

    const result = findMostRecentSavedHistoryByUrl([older, newer], 'https://example.com/article')

    expect(result?.id).toBe('newer')
  })
})

describe('formatRecentHistoryHint', () => {
  it('formats just now', () => {
    const item = makeHistoryItem({ savedAt: '2026-06-17T10:00:30.000Z' })
    const hint = formatRecentHistoryHint(item, Date.parse('2026-06-17T10:00:45.000Z'))
    expect(hint).toBe('刚刚已剪藏过该网页')
  })

  it('formats minutes', () => {
    const item = makeHistoryItem({ savedAt: '2026-06-17T10:00:00.000Z' })
    const hint = formatRecentHistoryHint(item, Date.parse('2026-06-17T10:12:00.000Z'))
    expect(hint).toBe('12 分钟前已剪藏过该网页')
  })

  it('formats hours', () => {
    const item = makeHistoryItem({ savedAt: '2026-06-17T08:00:00.000Z' })
    const hint = formatRecentHistoryHint(item, Date.parse('2026-06-17T11:00:00.000Z'))
    expect(hint).toBe('3 小时前已剪藏过该网页')
  })

  it('formats days', () => {
    const item = makeHistoryItem({ savedAt: '2026-06-15T10:00:00.000Z' })
    const hint = formatRecentHistoryHint(item, Date.parse('2026-06-17T10:00:00.000Z'))
    expect(hint).toBe('2 天前已剪藏过该网页')
  })
})
