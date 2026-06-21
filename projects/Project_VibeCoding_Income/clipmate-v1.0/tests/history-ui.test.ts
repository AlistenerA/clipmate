import { describe, it, expect } from 'vitest'
import {
  extractBodyMarkdown,
  getHistoryStatusLabel,
  getHistoryStatusTone,
  formatHistoryTime,
  getHostname,
  resolveRetryTarget,
  filterHistoryLocally,
  getModeLabel,
} from '../src/options/utils/historyView'
import type { ClipHistoryItem, NotionTarget } from '../src/shared/types/settings.types'

function makeTarget(overrides: Partial<NotionTarget> = {}): NotionTarget {
  return {
    id: overrides.id ?? 'target-1',
    name: overrides.name ?? 'Test Target',
    pageId: overrides.pageId ?? 'abc123def4567890abc123def4567890',
    isDefault: overrides.isDefault ?? false,
    createdAt: overrides.createdAt ?? '2026-01-01T00:00:00.000Z',
    updatedAt: overrides.updatedAt ?? '2026-01-01T00:00:00.000Z',
    lastUsedAt: overrides.lastUsedAt,
  }
}

function makeHistoryItem(overrides: Partial<ClipHistoryItem> = {}): ClipHistoryItem {
  return {
    id: overrides.id ?? 'hist-1',
    title: overrides.title ?? 'Test Page',
    url: overrides.url ?? 'https://example.com/article',
    mode: overrides.mode ?? 'fullpage',
    tags: overrides.tags ?? ['tag1', 'tag2'],
    notePreview: overrides.notePreview ?? 'A note about this clip',
    contentPreview: overrides.contentPreview ?? 'This is the main content',
    markdown: overrides.markdown ?? '# Test Page\n\n来源：https://example.com\n\n标签：#tag1 #tag2\n\n> A note about this clip\n\n---\n\nThis is the main content.',
    markdownTruncated: overrides.markdownTruncated ?? false,
    wordCount: overrides.wordCount ?? 5,
    targetId: overrides.targetId,
    targetName: overrides.targetName,
    saveStatus: overrides.saveStatus ?? 'saved',
    savedAt: overrides.savedAt ?? '2026-06-11T10:00:00.000Z',
    errorCode: overrides.errorCode,
    createdAt: overrides.createdAt ?? '2026-06-11T10:00:00.000Z',
    updatedAt: overrides.updatedAt ?? '2026-06-11T10:00:00.000Z',
  }
}

describe('extractBodyMarkdown', () => {
  it('extracts body after --- separator with double newline', () => {
    const md = 'header\n\n---\n\nactual body'
    expect(extractBodyMarkdown(md)).toBe('actual body')
  })

  it('extracts body after --- separator with single newline', () => {
    const md = 'header\n---\nactual body'
    expect(extractBodyMarkdown(md)).toBe('actual body')
  })

  it('returns full text when no separator found', () => {
    const md = 'just some markdown'
    expect(extractBodyMarkdown(md)).toBe('just some markdown')
  })

  it('preserves multiple --- in body', () => {
    const md = '# Title\n\n来源：url\n\n---\n\nbody\n---\nmore body'
    const result = extractBodyMarkdown(md)
    expect(result).toBe('body\n---\nmore body')
  })
})

describe('getHistoryStatusLabel', () => {
  it('returns correct Chinese labels', () => {
    expect(getHistoryStatusLabel('saved')).toBe('已保存')
    expect(getHistoryStatusLabel('failed')).toBe('保存失败')
    expect(getHistoryStatusLabel('unsaved')).toBe('未保存')
  })
})

describe('getHistoryStatusTone', () => {
  it('returns green for saved', () => {
    expect(getHistoryStatusTone('saved')).toBe('green')
  })

  it('returns red for failed', () => {
    expect(getHistoryStatusTone('failed')).toBe('red')
  })

  it('returns gray for unsaved', () => {
    expect(getHistoryStatusTone('unsaved')).toBe('gray')
  })
})

describe('formatHistoryTime', () => {
  it('formats valid ISO string', () => {
    const result = formatHistoryTime('2026-06-11T10:30:00.000Z')
    expect(result).toContain('2026-06-11')
    expect(result).toMatch(/\d{2}:\d{2}/)
  })

  it('returns original for invalid input', () => {
    expect(formatHistoryTime('not-a-date')).toBe('not-a-date')
  })
})

describe('getHostname', () => {
  it('extracts hostname from valid URL', () => {
    expect(getHostname('https://example.com/path?q=1')).toBe('example.com')
  })

  it('returns original for invalid URL', () => {
    expect(getHostname('not-a-url')).toBe('not-a-url')
  })
})

describe('resolveRetryTarget', () => {
  it('returns null when targets is empty', () => {
    expect(resolveRetryTarget([], makeHistoryItem({ targetId: 't1' }))).toBeNull()
  })

  it('returns matching target by history targetId', () => {
    const targets = [makeTarget({ id: 't1', name: 'A' }), makeTarget({ id: 't2', name: 'B' })]
    const result = resolveRetryTarget(targets, makeHistoryItem({ targetId: 't2' }))
    expect(result).toEqual(targets[1])
  })

  it('falls back to defaultTarget when history targetId not found', () => {
    const targets = [
      makeTarget({ id: 't1', name: 'A' }),
      makeTarget({ id: 't2', name: 'B', isDefault: true }),
    ]
    const result = resolveRetryTarget(targets, makeHistoryItem({ targetId: 'deleted-id' }))
    expect(result).toEqual(targets[1])
  })

  it('falls back to first target when no default and no match', () => {
    const targets = [makeTarget({ id: 't1', name: 'A' })]
    const result = resolveRetryTarget(targets, makeHistoryItem({ targetId: 'deleted-id' }))
    expect(result).toEqual(targets[0])
  })

  it('uses defaultTargetId when history has no targetId', () => {
    const targets = [
      makeTarget({ id: 't1', name: 'A' }),
      makeTarget({ id: 't2', name: 'B', isDefault: true }),
    ]
    const result = resolveRetryTarget(
      targets,
      makeHistoryItem({ targetId: undefined }),
    )
    expect(result).toEqual(targets[1])
  })

  it('returns first target when no targetId and no default', () => {
    const targets = [makeTarget({ id: 't1', name: 'A' })]
    const result = resolveRetryTarget(
      targets,
      makeHistoryItem({ targetId: undefined }),
    )
    expect(result).toEqual(targets[0])
  })
})

describe('filterHistoryLocally', () => {
  const items = [
    makeHistoryItem({
      id: '1',
      title: 'JavaScript Guide',
      url: 'https://developer.mozilla.org/js',
      tags: ['javascript', 'guide'],
      targetName: 'Dev Notes',
      notePreview: 'Important reference',
      contentPreview: 'Comprehensive JS tutorial',
    }),
    makeHistoryItem({
      id: '2',
      title: 'Python Intro',
      url: 'https://python.org',
      tags: ['python'],
      targetName: 'Work',
      notePreview: 'Python basics',
      contentPreview: 'Learn Python from scratch',
    }),
    makeHistoryItem({
      id: '3',
      title: 'CSS Tips',
      url: 'https://css-tricks.com',
      tags: ['css', 'design'],
      targetName: 'Dev Notes',
      notePreview: '',
      contentPreview: 'CSS tricks for modern layouts',
    }),
  ]

  it('returns all items for empty query', () => {
    expect(filterHistoryLocally(items, '')).toHaveLength(3)
  })

  it('returns all items for whitespace query', () => {
    expect(filterHistoryLocally(items, '   ')).toHaveLength(3)
  })

  it('filters by title case-insensitively', () => {
    const result = filterHistoryLocally(items, 'javascript')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('1')
  })

  it('filters by title with different case', () => {
    const result = filterHistoryLocally(items, 'PYTHON')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('2')
  })

  it('filters by URL', () => {
    const result = filterHistoryLocally(items, 'css-tricks')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('3')
  })

  it('filters by tag', () => {
    const result = filterHistoryLocally(items, 'guide')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('1')
  })

  it('filters by targetName', () => {
    const result = filterHistoryLocally(items, 'Dev Notes')
    expect(result).toHaveLength(2)
  })

  it('filters by notePreview', () => {
    const result = filterHistoryLocally(items, 'Important')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('1')
  })

  it('filters by contentPreview', () => {
    const result = filterHistoryLocally(items, 'Comprehensive')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('1')
  })

  it('returns empty array when no match', () => {
    const result = filterHistoryLocally(items, 'nonexistent')
    expect(result).toHaveLength(0)
  })

  it('tag search is case insensitive', () => {
    const result = filterHistoryLocally(items, 'PYTHON')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('2')
  })

  it('matches partial targetName', () => {
    const result = filterHistoryLocally(items, 'Dev')
    expect(result).toHaveLength(2)
  })

  it('matches partial URL', () => {
    const result = filterHistoryLocally(items, 'mozilla')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('1')
  })
})

describe('getModeLabel', () => {
  it('returns Chinese labels', () => {
    expect(getModeLabel('fullpage')).toBe('全文')
    expect(getModeLabel('selection')).toBe('选区')
    expect(getModeLabel('tutorial')).toBe('教程')
  })
})
