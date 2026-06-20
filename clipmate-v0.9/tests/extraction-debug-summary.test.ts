import { describe, it, expect } from 'vitest'
import { buildExtractionDebugSummary, type ExtractionDebugSummary } from '../src/content/debug/extractionDebugSummary'
import type { ExtractedContent } from '../src/shared/types/clip.types'

function makeContent(overrides: Partial<ExtractedContent> = {}): ExtractedContent {
  return {
    mode: 'selection',
    title: 'Test Title',
    url: 'https://weibo.com/123',
    description: '',
    contentText: 'content',
    contentHtml: '<p>content</p>',
    markdown: '# Test',
    wordCount: 1,
    metadata: {
      url: 'https://weibo.com/123',
      title: 'Test Title',
      description: '',
      siteName: 'weibo.com',
      createdAt: new Date().toISOString(),
    },
    ...overrides,
  }
}

describe('buildExtractionDebugSummary', () => {
  it('produces summary without title text', () => {
    const content = makeContent({ title: '微博正文 - 微博' })
    const summary = buildExtractionDebugSummary({
      content,
      selectionMode: 'selection-generic',
      hasSelection: true,
      selectedTextLength: 45,
    })
    const json = JSON.stringify(summary)
    expect(json).not.toContain('微博正文')
    expect(json).not.toContain('微博')
  })

  it('produces summary without selected text', () => {
    const content = makeContent()
    const summary = buildExtractionDebugSummary({
      content,
      hasSelection: true,
      selectedTextLength: 123,
    })
    const json = JSON.stringify(summary)
    expect(json).not.toContain('selected text')
    expect(json).not.toContain('comment body')
  })

  it('detects generic title bypass risk', () => {
    const content = makeContent({ title: '微博正文 - 微博' })
    const summary = buildExtractionDebugSummary({
      content,
      selectionMode: 'selection-generic',
      hasSelection: true,
      selectedTextLength: 50,
    })
    expect(summary.risks).toContain('path:generic-selection-comment-context-skipped')
    expect(summary.risks.some((r) => r.includes('generic-title-bypass'))).toBe(true)
  })

  it('reports comment-context markdown formatter when context is present', () => {
    const content = makeContent()
    const summary = buildExtractionDebugSummary({
      content,
      selectionMode: 'comment-selection',
      context: {
        siteName: 'Weibo',
        pageUrl: 'https://weibo.com/123',
        pageTitle: '微博正文',
        sourceTitle: '微博：今天天气真好',
        sourceMedia: [],
        selectedComment: { text: 'comment' },
        warnings: [],
        mode: 'comment-selection',
        reasons: [],
      },
      hasSelection: true,
      selectedTextLength: 40,
    })
    expect(summary.markdownFormatter).toBe('comment-context')
  })

  it('reports generic-selection markdown formatter when no context', () => {
    const content = makeContent()
    const summary = buildExtractionDebugSummary({
      content,
      selectionMode: 'selection-generic',
      hasSelection: true,
      selectedTextLength: 10,
    })
    expect(summary.markdownFormatter).toBe('generic-selection')
  })

  it('detects sourceTitle still generic', () => {
    const content = makeContent({ title: '微博正文' })
    const summary = buildExtractionDebugSummary({
      content,
      selectionMode: 'comment-selection',
      context: {
        siteName: 'Weibo',
        pageUrl: 'https://weibo.com/123',
        pageTitle: '微博正文',
        sourceTitle: '微博正文',
        sourceMedia: [],
        selectedComment: { text: 'c' },
        warnings: ['source-title-unresolved'],
        mode: 'comment-selection',
        reasons: [],
      },
      hasSelection: true,
      selectedTextLength: 5,
    })
    expect(summary.sourceTitleLooksGeneric).toBe(true)
  })

  it('sourceTitleLooksGeneric false for resolved title', () => {
    const content = makeContent()
    const summary = buildExtractionDebugSummary({
      content,
      selectionMode: 'comment-selection',
      context: {
        siteName: 'Weibo',
        pageUrl: 'https://weibo.com/123',
        pageTitle: '微博正文',
        sourceTitle: '微博：Good Morning Everyone',
        sourceMedia: [],
        selectedComment: { text: 'c' },
        warnings: [],
        mode: 'comment-selection',
        reasons: [],
      },
      hasSelection: true,
      selectedTextLength: 5,
    })
    expect(summary.sourceTitleLooksGeneric).toBe(false)
  })

  it('includes length buckets as strings only', () => {
    const content = makeContent({ title: 'A title' })
    const summary = buildExtractionDebugSummary({
      content,
      hasSelection: true,
      selectedTextLength: 45,
      sourceContainerTextLength: 200,
    })
    const validBuckets = ['0', '1-30', '30-80', '80-500', '500+']
    expect(validBuckets).toContain(summary.selectedTextLengthBucket)
    expect(validBuckets).toContain(summary.sourceContainerTextLengthBucket)
  })

  it('hasSelection reflects input', () => {
    const content = makeContent()
    const withSel = buildExtractionDebugSummary({
      content,
      hasSelection: true,
      selectedTextLength: 20,
    })
    const withoutSel = buildExtractionDebugSummary({
      content,
      hasSelection: false,
      selectedTextLength: 0,
    })
    expect(withSel.hasSelection).toBe(true)
    expect(withoutSel.hasSelection).toBe(false)
  })

  it('context warnings are included', () => {
    const content = makeContent()
    const summary = buildExtractionDebugSummary({
      content,
      context: {
        siteName: 'Weibo',
        pageUrl: 'https://weibo.com/123',
        pageTitle: '微博正文',
        sourceTitle: '微博正文',
        sourceMedia: [],
        selectedComment: { text: 'c' },
        warnings: ['author-unresolved', 'source-title-unresolved'],
        mode: 'comment-selection',
        reasons: [],
      },
      hasSelection: true,
      selectedTextLength: 10,
    })
    expect(summary.contextWarnings).toContain('author-unresolved')
    expect(summary.contextWarnings).toContain('source-title-unresolved')
  })
})
