import { describe, it, expect } from 'vitest'
import { JSDOM } from 'jsdom'
import {
  escapeMarkdownText,
  formatNavigationSummaryMarkdown,
  buildNavigationMarkdownFallback,
} from '../src/content/navigationSummary/navigationSummaryMarkdown'
import type {
  NavigationSummaryDraft,
  NavigationSummaryInput,
} from '../src/content/navigationSummary/navigationSummary.types'

function makeDom(bodyHtml: string, url = 'https://example.com/', title?: string): Document {
  const titleTag = title ? `<title>${title}</title>` : ''
  const dom = new JSDOM(
    `<!DOCTYPE html><html><head>${titleTag}</head><body>${bodyHtml}</body></html>`,
    { url },
  )
  return dom.window.document
}

function makeInput(overrides: Partial<NavigationSummaryInput> = {}): NavigationSummaryInput {
  const doc = overrides.document ?? makeDom('<p>test</p>')
  return {
    document: doc,
    title: 'Test Page',
    url: doc.URL || 'https://example.com/',
    pageType: 'article',
    ...overrides,
  }
}

function makeDraft(overrides: Partial<NavigationSummaryDraft> = {}): NavigationSummaryDraft {
  return {
    title: 'Test Page',
    url: 'https://example.com/page',
    domain: 'example.com',
    pageType: 'search-results',
    mode: 'search-results',
    warning: '当前页面更像搜索结果页，已生成主要结果摘要。',
    links: [
      { text: 'Result 1', href: 'https://example.com/a', domain: 'example.com', reason: 'search result' },
      { text: 'Result 2', href: 'https://other.org/b', domain: 'other.org', reason: 'search result' },
    ],
    reasons: ['Page type detected as search results'],
    ...overrides,
  }
}

// ============= escapeMarkdownText =============

describe('escapeMarkdownText', () => {
  it('returns empty string for empty input', () => {
    expect(escapeMarkdownText('')).toBe('')
  })

  it('does not modify plain text', () => {
    expect(escapeMarkdownText('Hello World')).toBe('Hello World')
  })

  it('escapes backslash', () => {
    expect(escapeMarkdownText('a\\b')).toBe('a\\\\b')
  })

  it('escapes backtick', () => {
    expect(escapeMarkdownText('a`b')).toBe('a\\`b')
  })

  it('escapes asterisk', () => {
    expect(escapeMarkdownText('a*b')).toBe('a\\*b')
  })

  it('escapes underscore', () => {
    expect(escapeMarkdownText('a_b')).toBe('a\\_b')
  })

  it('escapes curly braces', () => {
    expect(escapeMarkdownText('a{b}c')).toBe('a\\{b\\}c')
  })

  it('escapes square brackets', () => {
    expect(escapeMarkdownText('a[b]c')).toBe('a\\[b\\]c')
  })

  it('escapes parentheses', () => {
    expect(escapeMarkdownText('a(b)c')).toBe('a\\(b\\)c')
  })

  it('escapes hash', () => {
    expect(escapeMarkdownText('#title')).toBe('\\#title')
  })

  it('escapes plus', () => {
    expect(escapeMarkdownText('a+b')).toBe('a\\+b')
  })

  it('escapes minus', () => {
    expect(escapeMarkdownText('a-b')).toBe('a\\-b')
  })

  it('escapes dot', () => {
    expect(escapeMarkdownText('a.b')).toBe('a\\.b')
  })

  it('escapes exclamation', () => {
    expect(escapeMarkdownText('Hello!')).toBe('Hello\\!')
  })

  it('escapes pipe', () => {
    expect(escapeMarkdownText('a|b')).toBe('a\\|b')
  })

  it('escapes greater-than', () => {
    expect(escapeMarkdownText('a>b')).toBe('a\\>b')
  })

  it('does not break Chinese text', () => {
    expect(escapeMarkdownText('你好世界')).toBe('你好世界')
  })

  it('does not break mixed CJK and basic text', () => {
    expect(escapeMarkdownText('结果：result')).toBe('结果：result')
  })

  it('escapes multiple special chars in sequence', () => {
    expect(escapeMarkdownText('*_`')).toBe('\\*\\_\\`')
  })
})

// ============= formatNavigationSummaryMarkdown =============

describe('formatNavigationSummaryMarkdown', () => {
  it('outputs title as H1', () => {
    const draft = makeDraft({ title: 'My Page' })
    const md = formatNavigationSummaryMarkdown(draft)
    expect(md).toContain('# My Page')
  })

  it('outputs escaped title for special chars', () => {
    const draft = makeDraft({ title: 'Page [with] *bold*' })
    const md = formatNavigationSummaryMarkdown(draft)
    expect(md).toContain('# Page \\[with\\] \\*bold\\*')
  })

  it('outputs warning as blockquote', () => {
    const draft = makeDraft()
    const md = formatNavigationSummaryMarkdown(draft)
    expect(md).toContain('> ')
  })

  it('escapes warning text', () => {
    const draft = makeDraft({ warning: 'page *type* [nav]' })
    const md = formatNavigationSummaryMarkdown(draft)
    expect(md).toContain('> page \\*type\\* \\[nav\\]')
  })

  it('outputs source URL', () => {
    const draft = makeDraft({ url: 'https://example.com/path' })
    const md = formatNavigationSummaryMarkdown(draft)
    expect(md).toContain('- Source: https://example.com/path')
  })

  it('outputs page type', () => {
    const draft = makeDraft({ pageType: 'navigation' })
    const md = formatNavigationSummaryMarkdown(draft)
    expect(md).toContain('- Page type: navigation')
  })

  it('outputs domain (escaped)', () => {
    const draft = makeDraft({ domain: 'example.com' })
    const md = formatNavigationSummaryMarkdown(draft)
    expect(md).toContain('- Domain: example\\.com')
  })

  it('outputs site profile when present (escaped)', () => {
    const draft = makeDraft({ siteProfileId: 'google-search' })
    const md = formatNavigationSummaryMarkdown(draft)
    expect(md).toContain('- Site profile: google\\-search')
  })

  it('omits site profile when absent', () => {
    const draft = makeDraft({ siteProfileId: undefined })
    const md = formatNavigationSummaryMarkdown(draft)
    expect(md).not.toContain('Site profile')
  })

  it('outputs links section with numbered list', () => {
    const draft = makeDraft()
    const md = formatNavigationSummaryMarkdown(draft)
    expect(md).toContain('## 主要链接')
    expect(md).toContain('1. [Result 1](https://example.com/a)')
    expect(md).toContain('2. [Result 2](https://other.org/b)')
  })

  it('link text is escaped', () => {
    const draft = makeDraft({
      links: [{ text: 'text *with* stars', href: 'https://example.com/a', domain: 'example.com' }],
    })
    const md = formatNavigationSummaryMarkdown(draft)
    expect(md).toContain('[text \\*with\\* stars](https://example.com/a)')
  })

  it('link domain suffix is escaped', () => {
    const draft = makeDraft({
      links: [{ text: 'Result', href: 'https://example.com/a', domain: 'bad_domain' }],
    })
    const md = formatNavigationSummaryMarkdown(draft)
    expect(md).toContain('bad\\_domain')
  })

  it('outputs empty state for no links', () => {
    const draft = makeDraft({ links: [] })
    const md = formatNavigationSummaryMarkdown(draft)
    expect(md).toContain('未找到可安全提取的主要链接。')
  })

  it('outputs reasons section', () => {
    const draft = makeDraft()
    const md = formatNavigationSummaryMarkdown(draft)
    expect(md).toContain('## 生成原因')
  })

  it('escapes reason text', () => {
    const draft = makeDraft({ reasons: ['detected *nav*'] })
    const md = formatNavigationSummaryMarkdown(draft)
    expect(md).toContain('- detected \\*nav\\*')
  })

  it('limits reasons to 5', () => {
    const draft = makeDraft({
      reasons: ['r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7'],
    })
    const md = formatNavigationSummaryMarkdown(draft)
    const reasonSection = md.split('## 生成原因')[1] || ''
    const reasonLines = reasonSection.split('\n').filter((l) => l.startsWith('- '))
    expect(reasonLines.length).toBeLessThanOrEqual(5)
  })

  it('omits reasons section when empty', () => {
    const draft = makeDraft({ reasons: [] })
    const md = formatNavigationSummaryMarkdown(draft)
    expect(md).not.toContain('## 生成原因')
  })

  it('does not contain full body text fields', () => {
    const draft = makeDraft()
    const md = formatNavigationSummaryMarkdown(draft)
    expect(md).not.toContain('body')
    expect(md).not.toContain('innerHTML')
    expect(md).not.toContain('outerHTML')
  })

  it('does not contain comment text', () => {
    const draft = makeDraft()
    const md = formatNavigationSummaryMarkdown(draft)
    expect(md).not.toContain('comment')
  })

  it('does not output complete DOM or HTML', () => {
    const draft = makeDraft()
    const md = formatNavigationSummaryMarkdown(draft)
    expect(md).not.toContain('<html')
    expect(md).not.toContain('<body')
    expect(md).not.toContain('<div')
  })
})

// ============= buildNavigationMarkdownFallback =============

describe('buildNavigationMarkdownFallback', () => {
  it('returns markdown string for search-results pageType', () => {
    const doc = makeDom('<a href="https://example.com/r1">Result 1</a>')
    const input = makeInput({ document: doc, pageType: 'search-results' })
    const result = buildNavigationMarkdownFallback(input)
    expect(result).toBeTruthy()
    expect(result).toContain('# Test Page')
    expect(result).toContain('Result 1')
  })

  it('returns markdown string for navigation pageType', () => {
    const input = makeInput({ pageType: 'navigation' })
    const result = buildNavigationMarkdownFallback(input)
    expect(result).toBeTruthy()
    expect(result).toContain('# Test Page')
    expect(result).toContain('> 当前页面更像导航/目录页')
  })

  it('returns markdown for low confidence + high link density', () => {
    const input = makeInput({
      pageType: 'unknown',
      articleConfidence: 0.3,
      linkDensity: 0.7,
    })
    const result = buildNavigationMarkdownFallback(input)
    expect(result).toBeTruthy()
    expect(result).toContain('# Test Page')
  })

  it('returns null for article pageType', () => {
    const input = makeInput({ pageType: 'article' })
    const result = buildNavigationMarkdownFallback(input)
    expect(result).toBeNull()
  })

  it('returns null for forum-or-comment pageType', () => {
    const input = makeInput({ pageType: 'forum-or-comment' })
    const result = buildNavigationMarkdownFallback(input)
    expect(result).toBeNull()
  })

  it('returns null for video pageType', () => {
    const input = makeInput({ pageType: 'video' })
    const result = buildNavigationMarkdownFallback(input)
    expect(result).toBeNull()
  })

  it('returns null when user has valid selection', () => {
    const input = makeInput({
      pageType: 'navigation',
      intentSnapshot: {
        pageType: 'navigation',
        selectionPresent: true,
        selectionTextLength: 50,
        selectionContext: 'navigation',
        nearestClassHints: [],
        visibleContext: {
          visibleVideoCount: 0,
          visibleCommentLikeCount: 0,
          visibleSearchResultLikeCount: 0,
          visibleArticleLikeCount: 0,
        },
        confidence: 0.8,
        intent: 'clip-selection-generic',
        reasons: [],
      },
    })
    const result = buildNavigationMarkdownFallback(input)
    expect(result).toBeNull()
  })

  it('dangerous links are not present in output', () => {
    const doc = makeDom(`
      <a href="https://example.com/safe">Safe</a>
      <a href="javascript:alert(1)">Danger</a>
    `)
    const input = makeInput({ document: doc, pageType: 'search-results' })
    const result = buildNavigationMarkdownFallback(input)
    expect(result).not.toContain('javascript')
  })

  it('output does not contain full DOM or HTML', () => {
    const doc = makeDom('<a href="https://example.com/r1">Result</a>')
    const input = makeInput({ document: doc, pageType: 'search-results' })
    const result = buildNavigationMarkdownFallback(input)
    expect(result).not.toContain('<html')
    expect(result).not.toContain('<body')
    expect(result).not.toContain('<div')
    expect(result).not.toContain('<!DOCTYPE')
  })
})

// ============= Safety Checks =============

describe('safety checks (markdown)', () => {
  it('escapeMarkdownText does not access chrome API', () => {
    const src = escapeMarkdownText.toString()
    expect(src).not.toContain('chrome.')
    expect(src).not.toContain('browser.')
  })

  it('formatNavigationSummaryMarkdown does not access chrome API', () => {
    const src = formatNavigationSummaryMarkdown.toString()
    expect(src).not.toContain('chrome.')
    expect(src).not.toContain('browser.')
  })

  it('formatNavigationSummaryMarkdown does not access storage', () => {
    const src = formatNavigationSummaryMarkdown.toString()
    expect(src).not.toContain('localStorage')
    expect(src).not.toContain('sessionStorage')
    expect(src).not.toContain('chrome.storage')
  })

  it('formatNavigationSummaryMarkdown does not access document', () => {
    const src = formatNavigationSummaryMarkdown.toString()
    expect(src).not.toContain('document.')
    expect(src).not.toContain('window.')
  })

  it('formatNavigationSummaryMarkdown does not make network requests', () => {
    const src = formatNavigationSummaryMarkdown.toString()
    expect(src).not.toContain('fetch(')
    expect(src).not.toContain('XMLHttpRequest')
  })

  it('buildNavigationMarkdownFallback does not make network requests', () => {
    const src = buildNavigationMarkdownFallback.toString()
    expect(src).not.toContain('fetch(')
    expect(src).not.toContain('XMLHttpRequest')
  })

  it('does not persist selected text, full body, comments, Markdown', () => {
    const src = formatNavigationSummaryMarkdown.toString() +
      buildNavigationMarkdownFallback.toString()
    expect(src).not.toContain('selectedText')
    expect(src).not.toContain('commentBody')
    expect(src).not.toContain('markdownBody')
    expect(src).not.toContain('fullHtml')
    expect(src).not.toContain('fullText')
  })
})
