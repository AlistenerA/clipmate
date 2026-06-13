import { describe, it, expect } from 'vitest'
import { JSDOM } from 'jsdom'
import {
  sanitizeLinkText,
  isSafeLinkHref,
  toAbsoluteHttpUrl,
  extractDomain,
  shouldBuildNavigationSummary,
  collectNavigationSummaryLinks,
  buildNavigationSummaryDraft,
} from '../src/content/navigationSummary/navigationSummaryBuilder'
import type { NavigationSummaryInput } from '../src/content/navigationSummary/navigationSummary.types'

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

// ============= sanitizeLinkText =============

describe('sanitizeLinkText', () => {
  it('trims whitespace', () => {
    expect(sanitizeLinkText('  hello  ')).toBe('hello')
  })

  it('collapses consecutive whitespace', () => {
    expect(sanitizeLinkText('hello   world')).toBe('hello world')
  })

  it('truncates to maxLength', () => {
    const long = 'a'.repeat(100)
    expect(sanitizeLinkText(long)).toBe('a'.repeat(80))
  })

  it('truncates to custom maxLength', () => {
    const long = 'a'.repeat(50)
    expect(sanitizeLinkText(long, 30)).toBe('a'.repeat(30))
  })

  it('returns empty string for whitespace-only input', () => {
    expect(sanitizeLinkText('   ')).toBe('')
  })

  it('returns empty string for empty input', () => {
    expect(sanitizeLinkText('')).toBe('')
  })

  it('handles Chinese text', () => {
    expect(sanitizeLinkText('  你好 世界  ')).toBe('你好 世界')
  })
})

// ============= isSafeLinkHref =============

describe('isSafeLinkHref', () => {
  it('allows http URL', () => {
    expect(isSafeLinkHref('http://example.com')).toBe(true)
  })

  it('allows https URL', () => {
    expect(isSafeLinkHref('https://example.com/path')).toBe(true)
  })

  it('allows relative link', () => {
    expect(isSafeLinkHref('/path/to/page')).toBe(true)
  })

  it('allows root path link', () => {
    expect(isSafeLinkHref('/')).toBe(true)
  })

  it('rejects javascript: protocol', () => {
    expect(isSafeLinkHref('javascript:void(0)')).toBe(false)
  })

  it('rejects data: protocol', () => {
    expect(isSafeLinkHref('data:text/html;base64,abc')).toBe(false)
  })

  it('rejects mailto: protocol', () => {
    expect(isSafeLinkHref('mailto:test@example.com')).toBe(false)
  })

  it('rejects tel: protocol', () => {
    expect(isSafeLinkHref('tel:123456')).toBe(false)
  })

  it('rejects blob: protocol', () => {
    expect(isSafeLinkHref('blob:http://example.com/uuid')).toBe(false)
  })

  it('rejects chrome: protocol', () => {
    expect(isSafeLinkHref('chrome://settings')).toBe(false)
  })

  it('rejects edge: protocol', () => {
    expect(isSafeLinkHref('edge://settings')).toBe(false)
  })

  it('rejects about: protocol', () => {
    expect(isSafeLinkHref('about:blank')).toBe(false)
  })

  it('rejects # only href', () => {
    expect(isSafeLinkHref('#')).toBe(false)
  })

  it('rejects empty href', () => {
    expect(isSafeLinkHref('')).toBe(false)
  })

  it('allows href with hash fragment', () => {
    expect(isSafeLinkHref('/page#section')).toBe(true)
  })
})

// ============= toAbsoluteHttpUrl =============

describe('toAbsoluteHttpUrl', () => {
  it('converts relative link to absolute URL', () => {
    const result = toAbsoluteHttpUrl('/page', 'https://example.com/base/')
    expect(result).toBe('https://example.com/page')
  })

  it('returns null for javascript: href', () => {
    expect(toAbsoluteHttpUrl('javascript:void(0)', 'https://example.com')).toBeNull()
  })

  it('returns null for empty href', () => {
    expect(toAbsoluteHttpUrl('', 'https://example.com')).toBeNull()
  })

  it('returns null for empty baseUrl', () => {
    expect(toAbsoluteHttpUrl('/page', '')).toBeNull()
  })

  it('preserves absolute https URL', () => {
    expect(toAbsoluteHttpUrl('https://other.com/page', 'https://example.com')).toBe('https://other.com/page')
  })

  it('resolves relative to base', () => {
    expect(toAbsoluteHttpUrl('./relative', 'https://example.com/dir/')).toBe('https://example.com/dir/relative')
  })
})

// ============= extractDomain =============

describe('extractDomain', () => {
  it('returns hostname from URL', () => {
    expect(extractDomain('https://example.com/path?q=1')).toBe('example.com')
  })

  it('returns empty string for invalid URL', () => {
    expect(extractDomain('not a url')).toBe('')
  })

  it('returns empty string for empty input', () => {
    expect(extractDomain('')).toBe('')
  })
})

// ============= shouldBuildNavigationSummary =============

describe('shouldBuildNavigationSummary', () => {
  it('returns true when intentSnapshot.intent is clip-navigation-summary', () => {
    const input = makeInput({
      pageType: 'unknown',
      intentSnapshot: {
        pageType: 'navigation',
        selectionPresent: false,
        selectionTextLength: 0,
        selectionContext: 'unknown',
        nearestClassHints: [],
        visibleContext: {
          visibleVideoCount: 0,
          visibleCommentLikeCount: 0,
          visibleSearchResultLikeCount: 0,
          visibleArticleLikeCount: 0,
        },
        confidence: 0.7,
        intent: 'clip-navigation-summary',
        reasons: ['Navigation page, no selection'],
      },
    })
    expect(shouldBuildNavigationSummary(input)).toBe(true)
  })

  it('returns true for navigation pageType without selection', () => {
    const input = makeInput({
      pageType: 'navigation',
      intentSnapshot: {
        pageType: 'navigation',
        selectionPresent: false,
        selectionTextLength: 0,
        selectionContext: 'unknown',
        nearestClassHints: [],
        visibleContext: {
          visibleVideoCount: 0,
          visibleCommentLikeCount: 0,
          visibleSearchResultLikeCount: 0,
          visibleArticleLikeCount: 0,
        },
        confidence: 0.5,
        intent: 'unknown',
        reasons: [],
      },
    })
    expect(shouldBuildNavigationSummary(input)).toBe(true)
  })

  it('returns true for search-results pageType without selection', () => {
    const input = makeInput({
      pageType: 'search-results',
    })
    expect(shouldBuildNavigationSummary(input)).toBe(true)
  })

  it('returns true for low articleConfidence + high linkDensity', () => {
    const input = makeInput({
      pageType: 'unknown',
      articleConfidence: 0.3,
      linkDensity: 0.6,
    })
    expect(shouldBuildNavigationSummary(input)).toBe(true)
  })

  it('returns true for unknown pageType with high linkDensity', () => {
    const input = makeInput({
      pageType: 'unknown',
      linkDensity: 0.7,
    })
    expect(shouldBuildNavigationSummary(input)).toBe(true)
  })

  it('returns false when user has valid selection (selection-first)', () => {
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
    expect(shouldBuildNavigationSummary(input)).toBe(false)
  })

  it('returns false for normal article page', () => {
    const input = makeInput({ pageType: 'article' })
    expect(shouldBuildNavigationSummary(input)).toBe(false)
  })

  it('returns false when articleConfidence is exactly 0.45 (not below threshold)', () => {
    const input = makeInput({
      pageType: 'unknown',
      articleConfidence: 0.45,
      linkDensity: 0.6,
    })
    expect(shouldBuildNavigationSummary(input)).toBe(false)
  })

  it('does not throw when intentSnapshot is null', () => {
    const input = makeInput({
      pageType: 'navigation',
      intentSnapshot: null,
    })
    expect(shouldBuildNavigationSummary(input)).toBe(true)
  })

  it('does not throw when intentSnapshot is undefined', () => {
    const input = makeInput({ pageType: 'search-results' })
    expect(shouldBuildNavigationSummary(input)).toBe(true)
  })
})

// ============= collectNavigationSummaryLinks =============

describe('collectNavigationSummaryLinks', () => {
  it('returns links from document anchors', () => {
    const doc = makeDom(`
      <a href="https://example.com/page1">Page 1</a>
      <a href="https://example.com/page2">Page 2</a>
      <a href="https://example.com/page3">Page 3</a>
    `)
    const input = makeInput({ document: doc })
    const links = collectNavigationSummaryLinks(input)
    expect(links.length).toBe(3)
    expect(links[0].text).toBe('Page 1')
  })

  it('filters dangerous links (javascript:)', () => {
    const doc = makeDom(`
      <a href="https://example.com/page1">Safe</a>
      <a href="javascript:void(0)">Danger</a>
    `)
    const input = makeInput({ document: doc })
    const links = collectNavigationSummaryLinks(input)
    expect(links.length).toBe(1)
    expect(links[0].text).toBe('Safe')
  })

  it('filters empty text links', () => {
    const doc = makeDom(`
      <a href="https://example.com/page1">Text</a>
      <a href="https://example.com/page2"></a>
      <a href="https://example.com/page3">   </a>
    `)
    const input = makeInput({ document: doc })
    const links = collectNavigationSummaryLinks(input)
    expect(links.length).toBe(1)
    expect(links[0].text).toBe('Text')
  })

  it('filters too-short text links (less than 2 chars)', () => {
    const doc = makeDom(`
      <a href="https://example.com/page1">OK</a>
      <a href="https://example.com/page2">a</a>
    `)
    const input = makeInput({ document: doc })
    const links = collectNavigationSummaryLinks(input)
    expect(links.length).toBe(1)
    expect(links[0].text).toBe('OK')
  })

  it('deduplicates by href', () => {
    const doc = makeDom(`
      <a href="https://example.com/page1">First</a>
      <a href="https://example.com/page1">Duplicate</a>
    `)
    const input = makeInput({ document: doc })
    const links = collectNavigationSummaryLinks(input)
    expect(links.length).toBe(1)
    expect(links[0].text).toBe('First')
  })

  it('limits total links to default 15', () => {
    const anchors = Array.from({ length: 30 }, (_, i) =>
      `<a href="https://example.com/page${i}">Link ${i}</a>`).join('')
    const doc = makeDom(anchors)
    const input = makeInput({ document: doc })
    const links = collectNavigationSummaryLinks(input)
    expect(links.length).toBeLessThanOrEqual(15)
  })

  it('respects custom maxLinks', () => {
    const anchors = Array.from({ length: 20 }, (_, i) =>
      `<a href="https://example.com/page${i}">Link ${i}</a>`).join('')
    const doc = makeDom(anchors)
    const input = makeInput({ document: doc, maxLinks: 5 })
    const links = collectNavigationSummaryLinks(input)
    expect(links.length).toBeLessThanOrEqual(5)
  })

  it('limits to max 3 per domain', () => {
    const doc = makeDom(`
      <a href="https://example.com/a">A</a>
      <a href="https://example.com/b">B</a>
      <a href="https://example.com/c">C</a>
      <a href="https://example.com/d">D</a>
      <a href="https://other.com/x">X</a>
    `)
    const input = makeInput({ document: doc })
    const links = collectNavigationSummaryLinks(input)
    const exampleLinks = links.filter((l) => l.domain === 'example.com')
    expect(exampleLinks.length).toBeLessThanOrEqual(3)
  })

  it('prefers links from searchResultCard selector', () => {
    const doc = makeDom(`
      <div class="result">
        <a href="https://example.com/inside">Inside</a>
      </div>
      <a href="https://example.com/outside">Outside</a>
    `)
    const input = makeInput({
      document: doc,
      siteProfileMatch: {
        profile: {
          id: 'test-search',
          label: 'Test',
          category: 'search',
          domains: ['example.com'],
          pageTypes: ['search-results'],
          priority: 10,
          selectorHints: { searchResultCard: '.result' },
        },
        matchedDomain: 'example.com',
        confidence: 0.8,
        reasons: [],
      },
    })
    const links = collectNavigationSummaryLinks(input)
    expect(links.length).toBe(2)
    expect(links[0].text).toBe('Inside')
    expect(links[0].reason).toBe('search result')
  })

  it('falls back to main/content area when no searchResultCard', () => {
    const doc = makeDom(`
      <main>
        <a href="https://example.com/inside">Inside</a>
      </main>
      <a href="https://example.com/outside">Outside</a>
    `)
    const input = makeInput({ document: doc })
    const links = collectNavigationSummaryLinks(input)
    expect(links.length).toBe(2)
    expect(links[0].text).toBe('Inside')
    expect(links[0].reason).toBe('main content')
  })

  it('falls back to full body links as last resort', () => {
    const doc = makeDom(`
      <span>Not a link</span>
      <a href="https://example.com/link1">Link 1</a>
    `)
    const input = makeInput({ document: doc })
    const links = collectNavigationSummaryLinks(input)
    expect(links.length).toBe(1)
  })

  it('resolves relative hrefs to absolute', () => {
    const doc = makeDom(
      `<a href="/page">Page</a>`,
      'https://example.com/',
    )
    const input = makeInput({ document: doc })
    const links = collectNavigationSummaryLinks(input)
    expect(links.length).toBe(1)
    expect(links[0].href).toBe('https://example.com/page')
  })

  it('includes domain field for each link', () => {
    const doc = makeDom(`
      <a href="https://example.com/page1">Page 1</a>
    `)
    const input = makeInput({ document: doc })
    const links = collectNavigationSummaryLinks(input)
    expect(links[0].domain).toBe('example.com')
  })
})

// ============= buildNavigationSummaryDraft =============

describe('buildNavigationSummaryDraft', () => {
  it('sets mode to search-results for search-results pageType', () => {
    const input = makeInput({ pageType: 'search-results' })
    const draft = buildNavigationSummaryDraft(input)
    expect(draft.mode).toBe('search-results')
    expect(draft.warning).toBe('当前页面更像搜索结果页，已生成主要结果摘要。')
  })

  it('sets mode to navigation for navigation pageType', () => {
    const input = makeInput({ pageType: 'navigation' })
    const draft = buildNavigationSummaryDraft(input)
    expect(draft.mode).toBe('navigation')
    expect(draft.warning).toBe('当前页面更像导航/目录页，已生成主要链接摘要。')
  })

  it('sets mode to low-confidence for other pageTypes', () => {
    const input = makeInput({ pageType: 'unknown' })
    const draft = buildNavigationSummaryDraft(input)
    expect(draft.mode).toBe('low-confidence')
    expect(draft.warning).toBe('当前页面正文置信度较低，已生成安全摘要。')
  })

  it('uses input title when provided', () => {
    const input = makeInput({ title: 'Custom Title' })
    const draft = buildNavigationSummaryDraft(input)
    expect(draft.title).toBe('Custom Title')
  })

  it('falls back to document.title when input title is empty', () => {
    const doc = makeDom('<p>content</p>', 'https://example.com/', 'Doc Title')
    const input = makeInput({ document: doc, title: '' })
    const draft = buildNavigationSummaryDraft(input)
    expect(draft.title).toBe('Doc Title')
  })

  it('falls back to domain when both titles are empty', () => {
    const doc = makeDom('<p>content</p>', 'https://example.com/')
    const input = makeInput({ document: doc, title: '' })
    const draft = buildNavigationSummaryDraft(input)
    expect(draft.title).toBe('example.com')
  })

  it('extracts domain from url', () => {
    const input = makeInput({ url: 'https://example.com/path?q=1' })
    const draft = buildNavigationSummaryDraft(input)
    expect(draft.domain).toBe('example.com')
  })

  it('sets siteProfileId from siteProfileMatch', () => {
    const input = makeInput({
      siteProfileMatch: {
        profile: {
          id: 'test-profile',
          label: 'Test',
          category: 'search',
          domains: ['example.com'],
          pageTypes: ['search-results'],
          priority: 10,
        },
        matchedDomain: 'example.com',
        confidence: 0.8,
        reasons: [],
      },
    })
    const draft = buildNavigationSummaryDraft(input)
    expect(draft.siteProfileId).toBe('test-profile')
  })

  it('returns empty links when document has no valid anchors', () => {
    const doc = makeDom('<p>No links here</p>')
    const input = makeInput({ document: doc })
    const draft = buildNavigationSummaryDraft(input)
    expect(draft.links).toEqual([])
  })

  it('does not throw on invalid input (returns safe empty draft)', () => {
    const draft = buildNavigationSummaryDraft({} as NavigationSummaryInput)
    expect(draft.mode).toBe('low-confidence')
    expect(draft.links).toEqual([])
  })

  it('includes reasons array', () => {
    const input = makeInput({
      pageType: 'search-results',
      intentSnapshot: {
        pageType: 'search-results',
        selectionPresent: false,
        selectionTextLength: 0,
        selectionContext: 'unknown',
        nearestClassHints: [],
        visibleContext: {
          visibleVideoCount: 0,
          visibleCommentLikeCount: 0,
          visibleSearchResultLikeCount: 0,
          visibleArticleLikeCount: 0,
        },
        confidence: 0.6,
        intent: 'clip-search-result',
        reasons: [],
      },
    })
    const draft = buildNavigationSummaryDraft(input)
    expect(draft.reasons.length).toBeGreaterThan(0)
  })

  it('includes reasons referencing link density when provided', () => {
    const input = makeInput({
      pageType: 'unknown',
      articleConfidence: 0.3,
      linkDensity: 0.7,
      intentSnapshot: {
        pageType: 'unknown',
        selectionPresent: false,
        selectionTextLength: 0,
        selectionContext: 'unknown',
        nearestClassHints: [],
        visibleContext: {
          visibleVideoCount: 0,
          visibleCommentLikeCount: 0,
          visibleSearchResultLikeCount: 0,
          visibleArticleLikeCount: 0,
        },
        confidence: 0.3,
        intent: 'unknown',
        reasons: [],
      },
    })
    const draft = buildNavigationSummaryDraft(input)
    expect(draft.reasons.some((r) => r.includes('link density'))).toBe(true)
  })
})

// ============= Safety Checks =============

describe('safety checks', () => {
  it('does not access chrome API in any exported function', () => {
    const src = collectNavigationSummaryLinks.toString() +
      buildNavigationSummaryDraft.toString() +
      shouldBuildNavigationSummary.toString() +
      sanitizeLinkText.toString() +
      isSafeLinkHref.toString() +
      toAbsoluteHttpUrl.toString() +
      extractDomain.toString()

    expect(src).not.toContain('chrome.')
    expect(src).not.toContain('browser.')
  })

  it('does not access storage in any exported function', () => {
    const src = collectNavigationSummaryLinks.toString() +
      buildNavigationSummaryDraft.toString() +
      shouldBuildNavigationSummary.toString()

    expect(src).not.toContain('localStorage')
    expect(src).not.toContain('sessionStorage')
    expect(src).not.toContain('chrome.storage')
  })

  it('does not make network requests in any exported function', () => {
    const src = collectNavigationSummaryLinks.toString() +
      buildNavigationSummaryDraft.toString() +
      sanitizeLinkText.toString() +
      isSafeLinkHref.toString()

    expect(src).not.toContain('fetch(')
    expect(src).not.toContain('XMLHttpRequest')
  })

  it('does not save selected text, full body, comments, or Markdown', () => {
    const src = buildNavigationSummaryDraft.toString() +
      collectNavigationSummaryLinks.toString()

    expect(src).not.toContain('selectedText')
    expect(src).not.toContain('commentBody')
    expect(src).not.toContain('markdownBody')
    expect(src).not.toContain('fullHtml')
    expect(src).not.toContain('fullText')
  })

  it('does not read innerHTML or outerHTML', () => {
    const src = collectNavigationSummaryLinks.toString() +
      buildNavigationSummaryDraft.toString()

    expect(src).not.toContain('innerHTML')
    expect(src).not.toContain('outerHTML')
  })

  it('NavigationSummaryDraft does not contain full-text fields', () => {
    const draft = buildNavigationSummaryDraft(makeInput({ pageType: 'search-results' }))
    expect(draft).not.toHaveProperty('body')
    expect(draft).not.toHaveProperty('markdown')
    expect(draft).not.toHaveProperty('textContent')
    expect(draft).not.toHaveProperty('htmlContent')
    expect(draft).not.toHaveProperty('selectedText')
    expect(draft).not.toHaveProperty('commentBody')
  })

  it('reason strings are short sentences', () => {
    const doc = makeDom('<a href="https://example.com/page1">Test link</a>')
    const input = makeInput({ document: doc })
    const links = collectNavigationSummaryLinks(input)
    for (const link of links) {
      expect(link.reason?.length ?? 0).toBeLessThanOrEqual(100)
    }
  })
})
