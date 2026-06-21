import { describe, it, expect } from 'vitest'
import {
  highlightText,
  getHistoryMatchInfo,
  getDomainFromUrl,
  getSiteInitial,
  getHistorySummary,
  extractMarkdownBodyPreview,
  getStableSiteColor,
  shouldAutoExtractForActiveTab,
  filterHistoryLocally,
  stripMarkdownImages,
  normalizeSummaryText,
} from '../src/options/utils/historyView'
import type { ClipHistoryItem } from '../src/shared/types/settings.types'

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
    savedAt: overrides.savedAt,
    errorCode: overrides.errorCode,
    createdAt: overrides.createdAt ?? '2026-06-11T10:00:00.000Z',
    updatedAt: overrides.updatedAt ?? '2026-06-11T10:00:00.000Z',
    siteName: overrides.siteName,
    siteIconUrl: overrides.siteIconUrl,
    themeColor: overrides.themeColor,
    descriptionPreview: overrides.descriptionPreview,
  }
}

describe('highlightText', () => {
  it('returns original text as single token when query is empty', () => {
    const result = highlightText('hello world', '')
    expect(result).toEqual(['hello world'])
  })

  it('highlights matching substring', () => {
    const result = highlightText('hello world', 'hello')
    expect(result).toEqual([{ match: 'hello' }, ' world'])
  })

  it('is case insensitive', () => {
    const result = highlightText('Hello World', 'hello')
    expect(result).toEqual([{ match: 'Hello' }, ' World'])
  })

  it('highlights multiple occurrences', () => {
    const result = highlightText('hello hello world', 'hello')
    expect(result).toEqual([
      { match: 'hello' },
      ' ',
      { match: 'hello' },
      ' world',
    ])
  })

  it('returns original when no match found', () => {
    const result = highlightText('hello world', 'xyz')
    expect(result).toEqual(['hello world'])
  })

  it('handles special regex characters in query', () => {
    const result = highlightText('test (hello) world', '(hello)')
    expect(result).toEqual(['test ', { match: '(hello)' }, ' world'])
  })

  it('handles multi-word query', () => {
    const result = highlightText('the quick brown fox', 'quick brown')
    expect(result).toEqual([
      'the ',
      { match: 'quick brown' },
      ' fox',
    ])
  })
})

describe('getHistoryMatchInfo', () => {
  it('returns all false for empty query', () => {
    const item = makeHistoryItem()
    const info = getHistoryMatchInfo(item, '')
    expect(info.titleMatched).toBe(false)
    expect(info.urlMatched).toBe(false)
    expect(info.tagsMatched).toEqual([])
    expect(info.targetMatched).toBe(false)
    expect(info.noteMatched).toBe(false)
    expect(info.contentMatched).toBe(false)
    expect(info.markdownMatched).toBe(false)
  })

  it('detects title match', () => {
    const item = makeHistoryItem({ title: 'JavaScript Guide' })
    const info = getHistoryMatchInfo(item, 'JavaScript')
    expect(info.titleMatched).toBe(true)
    expect(info.urlMatched).toBe(false)
  })

  it('detects URL match', () => {
    const item = makeHistoryItem({ url: 'https://css-tricks.com/flexbox' })
    const info = getHistoryMatchInfo(item, 'css-tricks')
    expect(info.urlMatched).toBe(true)
  })

  it('detects matching tags', () => {
    const item = makeHistoryItem({ tags: ['javascript', 'guide'] })
    const info = getHistoryMatchInfo(item, 'guide')
    expect(info.tagsMatched).toEqual(['guide'])
  })

  it('detects target name match', () => {
    const item = makeHistoryItem({ targetName: 'Dev Notes' })
    const info = getHistoryMatchInfo(item, 'Notes')
    expect(info.targetMatched).toBe(true)
  })

  it('targetMatched is false when targetName is undefined', () => {
    const item = makeHistoryItem({ targetName: undefined })
    const info = getHistoryMatchInfo(item, 'Notes')
    expect(info.targetMatched).toBe(false)
  })

  it('detects note preview match', () => {
    const item = makeHistoryItem({ notePreview: 'Important reference' })
    const info = getHistoryMatchInfo(item, 'Important')
    expect(info.noteMatched).toBe(true)
  })

  it('detects content preview match', () => {
    const item = makeHistoryItem({ contentPreview: 'CSS tricks for modern layouts' })
    const info = getHistoryMatchInfo(item, 'modern')
    expect(info.contentMatched).toBe(true)
  })

  it('detects markdown body match when contentPreview does not match', () => {
    const item = makeHistoryItem({
      contentPreview: 'short preview',
      markdown: '# Title\n\n---\n\nhidden body text here',
    })
    const info = getHistoryMatchInfo(item, 'hidden body')
    expect(info.contentMatched).toBe(false)
    expect(info.markdownMatched).toBe(true)
  })

  it('does not set markdownMatched when contentPreview already matched', () => {
    const item = makeHistoryItem({
      contentPreview: 'hidden in preview too',
      markdown: '# Title\n\n---\n\nhidden in body as well',
    })
    const info = getHistoryMatchInfo(item, 'hidden')
    expect(info.contentMatched).toBe(true)
    expect(info.markdownMatched).toBe(false)
  })

  it('is case insensitive', () => {
    const item = makeHistoryItem({ title: 'JavaScript' })
    const info = getHistoryMatchInfo(item, 'javascript')
    expect(info.titleMatched).toBe(true)
  })
})

describe('getDomainFromUrl', () => {
  it('extracts domain from valid URL', () => {
    expect(getDomainFromUrl('https://www.example.com/path?q=1')).toBe('www.example.com')
  })

  it('returns original for invalid URL', () => {
    expect(getDomainFromUrl('not-a-url')).toBe('not-a-url')
  })

  it('returns empty string for empty input', () => {
    expect(getDomainFromUrl('')).toBe('')
  })
})

describe('getSiteInitial', () => {
  it('returns uppercase first character', () => {
    expect(getSiteInitial('example.com')).toBe('E')
  })

  it('returns ? for empty string', () => {
    expect(getSiteInitial('')).toBe('?')
  })

  it('handles CJK domain', () => {
    const result = getSiteInitial('中国.com')
    expect(result.length).toBe(1)
  })

  it('handles leading www', () => {
    expect(getSiteInitial('www.example.com')).toBe('W')
  })
})

describe('getHistorySummary', () => {
  it('prioritizes descriptionPreview when available', () => {
    const item = makeHistoryItem({
      descriptionPreview: 'Page meta description',
      notePreview: 'Important reference note',
      contentPreview: 'Main content here',
    })
    expect(getHistorySummary(item)).toBe('Page meta description')
  })

  it('falls back to contentPreview when descriptionPreview is empty', () => {
    const item = makeHistoryItem({
      descriptionPreview: '',
      notePreview: 'A note',
      contentPreview: 'Main content here',
    })
    expect(getHistorySummary(item)).toBe('Main content here')
  })

  it('cleans markdown images from contentPreview', () => {
    const item = makeHistoryItem({
      contentPreview: '![](https://example.com/img.jpg) hello',
      notePreview: '',
    })
    expect(getHistorySummary(item)).toBe('hello')
  })

  it('falls back to cleaned markdown body when both previews are empty', () => {
    const item = makeHistoryItem({
      descriptionPreview: '',
      notePreview: '',
      contentPreview: '',
      markdown: '# Title\n\n---\n\nThe body content goes here.',
    })
    const summary = getHistorySummary(item)
    expect(summary).toBe('The body content goes here.')
  })

  it('skips leading markdown image in body summary', () => {
    const item = makeHistoryItem({
      descriptionPreview: '',
      notePreview: '',
      contentPreview: '',
      markdown: '# Title\n\n---\n\n![](https://example.com/img.jpg)\n\nReal text here.',
    })
    const summary = getHistorySummary(item)
    expect(summary).toBe('Real text here.')
  })

  it('skips multiple leading markdown images in body summary', () => {
    const item = makeHistoryItem({
      descriptionPreview: '',
      notePreview: '',
      contentPreview: '',
      markdown: '# Title\n\n---\n\n![](url1.jpg)\n![alt](url2.png)\n\nActual content.',
    })
    const summary = getHistorySummary(item)
    expect(summary).toBe('Actual content.')
  })

  it('skips linked markdown images in body summary', () => {
    const item = makeHistoryItem({
      descriptionPreview: '',
      notePreview: '',
      contentPreview: '',
      markdown: '# Title\n\n---\n\n[![](https://img.jpg)](https://link.com)\n\nText after.',
    })
    const summary = getHistorySummary(item)
    expect(summary).toBe('Text after.')
  })

  it('skips HTML img tag in body summary', () => {
    const item = makeHistoryItem({
      descriptionPreview: '',
      notePreview: '',
      contentPreview: '',
      markdown: '# Title\n\n---\n\n<img src="photo.jpg" />\n\nReal paragraph.',
    })
    const summary = getHistorySummary(item)
    expect(summary).toBe('Real paragraph.')
  })

  it('falls back to url when body is all images', () => {
    const item = makeHistoryItem({
      descriptionPreview: '',
      notePreview: '',
      contentPreview: '',
      markdown: '# Title\n\n---\n\n![](a.jpg)\n![](b.jpg)\n![](c.jpg)',
      url: 'https://example.com/page',
    })
    const summary = getHistorySummary(item)
    expect(summary).toBe('https://example.com/page')
  })

  it('falls back to url when everything is empty', () => {
    const item = makeHistoryItem({
      descriptionPreview: '',
      notePreview: '',
      contentPreview: '',
      markdown: '',
      url: 'https://example.com/page',
    })
    expect(getHistorySummary(item)).toBe('https://example.com/page')
  })

  it('falls back to title when url is also empty', () => {
    const item = makeHistoryItem({
      descriptionPreview: '',
      notePreview: '',
      contentPreview: '',
      markdown: '',
      url: '',
      title: 'Test Page Title',
    })
    expect(getHistorySummary(item)).toBe('Test Page Title')
  })

  it('does not delete normal text in body', () => {
    const item = makeHistoryItem({
      descriptionPreview: '',
      notePreview: '',
      contentPreview: '',
      markdown: '# Title\n\n---\n\nNormal text with some words.',
    })
    const summary = getHistorySummary(item)
    expect(summary).toBe('Normal text with some words.')
  })
})

describe('extractMarkdownBodyPreview', () => {
  it('extracts body up to maxLength', () => {
    const md = '# Title\n\n---\n\nThe quick brown fox'
    expect(extractMarkdownBodyPreview(md, 10)).toBe('The quick ')
  })

  it('returns empty for empty body', () => {
    const md = '# Title\n\n---\n\n'
    expect(extractMarkdownBodyPreview(md, 10)).toBe('')
  })

  it('returns full markdown when no separator', () => {
    const md = 'just some markdown'
    expect(extractMarkdownBodyPreview(md, 100)).toBe('just some markdown')
  })
})

describe('getStableSiteColor', () => {
  it('returns same color for same domain', () => {
    const c1 = getStableSiteColor('example.com')
    const c2 = getStableSiteColor('example.com')
    expect(c1).toBe(c2)
  })

  it('returns same color regardless of protocol', () => {
    const c1 = getStableSiteColor('example.com')
    const c2 = getStableSiteColor('example.com')
    expect(c1).toBe(c2)
  })

  it('returns different colors for different domains (most of the time)', () => {
    const domains = ['google.com', 'github.com', 'stackoverflow.com', 'reddit.com']
    const colors = domains.map((d) => getStableSiteColor(d))
    const uniqueColors = new Set(colors)
    expect(uniqueColors.size).toBeGreaterThanOrEqual(2)
  })

  it('returns default color for empty domain', () => {
    expect(getStableSiteColor('')).toBe('#6B7280')
  })

  it('returns a valid hex color', () => {
    const color = getStableSiteColor('example.com')
    expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/)
  })
})

describe('shouldAutoExtractForActiveTab', () => {
  it('returns false when activeTabUrl is empty', () => {
    expect(shouldAutoExtractForActiveTab('https://old.com', '')).toBe(false)
  })

  it('returns false when activeTabUrl is undefined', () => {
    expect(shouldAutoExtractForActiveTab('https://old.com', undefined)).toBe(false)
  })

  it('returns true when draftUrl is undefined (no draft)', () => {
    expect(shouldAutoExtractForActiveTab(undefined, 'https://example.com')).toBe(true)
  })

  it('returns false when URLs match exactly', () => {
    expect(
      shouldAutoExtractForActiveTab('https://example.com/page', 'https://example.com/page'),
    ).toBe(false)
  })

  it('returns true when URLs differ even on same domain', () => {
    expect(
      shouldAutoExtractForActiveTab('https://news.cn/article/1', 'https://news.cn/article/2'),
    ).toBe(true)
  })

  it('returns true when URLs differ on different domains', () => {
    expect(
      shouldAutoExtractForActiveTab('https://old.example.com', 'https://new.example.com'),
    ).toBe(true)
  })
})

describe('filterHistoryLocally body matching', () => {
  const items = [
    makeHistoryItem({
      id: '1',
      title: 'Article One',
      contentPreview: 'Preview text only',
      markdown: '# Article One\n\n---\n\nSecret keyword deep in body text',
    }),
  ]

  it('matches query in markdown body even when not in contentPreview', () => {
    const result = filterHistoryLocally(items, 'Secret keyword')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('1')
  })

  it('does not match when query is not in any field', () => {
    const result = filterHistoryLocally(items, 'nonexistent')
    expect(result).toHaveLength(0)
  })
})

describe('stripMarkdownImages', () => {
  it('removes image syntax with no alt text', () => {
    expect(stripMarkdownImages('![](url.jpg)')).toBe('')
  })

  it('removes image syntax with alt text', () => {
    expect(stripMarkdownImages('![alt text](url.png)')).toBe('')
  })

  it('removes linked image syntax', () => {
    expect(stripMarkdownImages('[![alt](img.jpg)](link)')).toBe('')
  })

  it('removes HTML img tag', () => {
    expect(stripMarkdownImages('<img src="photo.jpg" />')).toBe('')
    expect(stripMarkdownImages('<img src="photo.jpg" width="100">')).toBe('')
  })

  it('preserves text around images', () => {
    expect(stripMarkdownImages('before ![](img.jpg) after')).toBe('before  after')
  })

  it('removes multiple images', () => {
    expect(stripMarkdownImages('![](a.jpg)\n![alt](b.png)\n')).toBe('\n\n')
  })

  it('preserves text without images unchanged', () => {
    const text = 'Normal paragraph text.'
    expect(stripMarkdownImages(text)).toBe(text)
  })

  it('handles empty string', () => {
    expect(stripMarkdownImages('')).toBe('')
  })
})

describe('normalizeSummaryText', () => {
  it('trims whitespace', () => {
    expect(normalizeSummaryText('  hello world  ')).toBe('hello world')
  })

  it('collapses multiple whitespace to single space', () => {
    expect(normalizeSummaryText('hello   \n  world')).toBe('hello world')
  })

  it('returns empty for whitespace-only', () => {
    expect(normalizeSummaryText('   \n  ')).toBe('')
  })

  it('preserves meaningful text', () => {
    expect(normalizeSummaryText('Hello, this is a test.')).toBe('Hello, this is a test.')
  })
})
