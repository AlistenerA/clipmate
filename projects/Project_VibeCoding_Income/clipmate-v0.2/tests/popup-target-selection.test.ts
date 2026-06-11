import { describe, it, expect } from 'vitest'
import { resolveSelectedTarget, maskPageId } from '../src/popup/utils/targetSelection'
import { buildHistoryInput } from '../src/popup/utils/historyPayload'
import type { NotionTarget } from '../src/shared/types/settings.types'
import type { ClipDraft, ExtractedContent } from '../src/shared/types/clip.types'

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

function makeDraft(overrides: Partial<ClipDraft> = {}): ClipDraft {
  return {
    title: overrides.title ?? 'Test Page',
    tags: overrides.tags ?? ['test'],
    note: overrides.note ?? 'some note',
    mode: overrides.mode ?? 'fullpage',
    content: overrides.content ?? makeContent(),
  }
}

function makeContent(overrides: Partial<ExtractedContent> = {}): ExtractedContent {
  return {
    mode: overrides.mode ?? 'fullpage',
    title: overrides.title ?? 'Test Page',
    url: overrides.url ?? 'https://example.com',
    description: overrides.description ?? 'A test page',
    contentText: overrides.contentText ?? 'This is the main content.',
    contentHtml: overrides.contentHtml ?? '<p>This is the main content.</p>',
    markdown: overrides.markdown ?? 'This is the main content.',
    wordCount: overrides.wordCount ?? 5,
    metadata: overrides.metadata ?? {
      url: 'https://example.com',
      title: 'Test Page',
      description: 'A test page',
      siteName: 'Example',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  }
}

describe('resolveSelectedTarget', () => {
  it('returns undefined when targets array is empty', () => {
    expect(resolveSelectedTarget([])).toBeUndefined()
  })

  it('returns undefined when targets is empty even with defaultTargetId', () => {
    expect(resolveSelectedTarget([], 'any-id')).toBeUndefined()
  })

  it('returns first target when no defaultTargetId', () => {
    const targets = [
      makeTarget({ id: 't1', name: 'First' }),
      makeTarget({ id: 't2', name: 'Second', isDefault: true }),
    ]
    expect(resolveSelectedTarget(targets)).toEqual(targets[0])
  })

  it('returns first target when no defaultTargetId provided', () => {
    const targets = [
      makeTarget({ id: 't1', name: 'First' }),
    ]
    expect(resolveSelectedTarget(targets, undefined)).toEqual(targets[0])
  })

  it('returns target matching defaultTargetId', () => {
    const targets = [
      makeTarget({ id: 't1', name: 'First' }),
      makeTarget({ id: 't2', name: 'Second' }),
    ]
    expect(resolveSelectedTarget(targets, 't2')).toEqual(targets[1])
  })

  it('falls back to first target when defaultTargetId not found', () => {
    const targets = [
      makeTarget({ id: 't1', name: 'First' }),
    ]
    expect(resolveSelectedTarget(targets, 'non-existent')).toEqual(targets[0])
  })

  it('falls back to first target when defaultTargetId is empty string', () => {
    const targets = [
      makeTarget({ id: 't1', name: 'First' }),
    ]
    expect(resolveSelectedTarget(targets, '')).toEqual(targets[0])
  })

  it('returns the only target regardless of defaultTargetId', () => {
    const t = makeTarget({ id: 'only', name: 'Only Target' })
    expect(resolveSelectedTarget([t], undefined)).toEqual(t)
    expect(resolveSelectedTarget([t], 'different-id')).toEqual(t)
    expect(resolveSelectedTarget([t], 'only')).toEqual(t)
  })
})

describe('maskPageId', () => {
  it('returns empty string for empty input', () => {
    expect(maskPageId('')).toBe('')
  })

  it('returns full string when length <= 6', () => {
    expect(maskPageId('abc')).toBe('abc')
    expect(maskPageId('abcdef')).toBe('abcdef')
  })

  it('masks with ... prefix showing last 6 chars', () => {
    expect(maskPageId('abc123def4567890abc123def4567890')).toBe('...567890')
    expect(maskPageId('1234567')).toBe('...234567')
  })
})

describe('buildHistoryInput', () => {
  it('builds history input from draft with no target', () => {
    const draft = makeDraft({
      title: 'My Page',
      note: 'A longer note that gets truncated if too long',
    })
    const result = buildHistoryInput(draft)

    expect(result.title).toBe('My Page')
    expect(result.url).toBe('https://example.com')
    expect(result.mode).toBe('fullpage')
    expect(result.tags).toEqual(['test'])
    expect(result.notePreview).toBe('A longer note that gets truncated if too long')
    expect(result.contentPreview).toBe('This is the main content.')
    expect(result.markdown).toBe('This is the main content.')
    expect(result.wordCount).toBe(5)
    expect(result.targetId).toBeUndefined()
    expect(result.targetName).toBeUndefined()
    expect(result.saveStatus).toBeUndefined()
  })

  it('includes target info when target is provided', () => {
    const draft = makeDraft()
    const target = makeTarget({ id: 't1', name: 'My Workspace' })
    const result = buildHistoryInput(draft, target)

    expect(result.targetId).toBe('t1')
    expect(result.targetName).toBe('My Workspace')
  })

  it('includes saveStatus when provided', () => {
    const draft = makeDraft()
    const result = buildHistoryInput(draft, undefined, 'saved')

    expect(result.saveStatus).toBe('saved')
  })

  it('truncates notePreview to 100 chars', () => {
    const draft = makeDraft({
      note: 'A'.repeat(200),
    })
    const result = buildHistoryInput(draft)
    expect(result.notePreview.length).toBeLessThanOrEqual(100)
  })

  it('truncates contentPreview to 100 chars', () => {
    const content = makeContent({
      contentText: 'B'.repeat(200),
    })
    const draft = makeDraft({ content })
    const result = buildHistoryInput(draft)
    expect(result.contentPreview.length).toBeLessThanOrEqual(100)
  })

  it('uses empty string for empty contentText', () => {
    const content = { ...makeContent(), contentText: '' }
    const draft = makeDraft({ content })
    const result = buildHistoryInput(draft)
    expect(result.contentPreview).toBe('')
  })

  it('uses empty string for empty note', () => {
    const draft = { ...makeDraft(), note: '' }
    const result = buildHistoryInput(draft)
    expect(result.notePreview).toBe('')
  })

  it('preserves selection mode', () => {
    const content = makeContent({ mode: 'selection' })
    const draft = makeDraft({ mode: 'selection', content })
    const result = buildHistoryInput(draft)

    expect(result.mode).toBe('selection')
  })
})
