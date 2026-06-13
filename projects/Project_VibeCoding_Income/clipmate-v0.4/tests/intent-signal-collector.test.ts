import { describe, it, expect } from 'vitest'
import { JSDOM } from 'jsdom'
import type { PageType } from '../src/shared/utils/pageTypeDetector'
import type { SiteProfileMatch, SiteProfile, SiteProfileCategory } from '../src/shared/siteProfiles'
import {
  sanitizeClassHints,
  getSelectionTextLength,
  getSelectionRootElement,
  classifyElementContext,
  collectVisibleContext,
  detectClipIntent,
  collectIntentSnapshot,
} from '../src/content/intent'
import type {
  IntentSnapshot,
  IntentSignalInput,
  VisibleContextSnapshot,
} from '../src/content/intent'

function makeDom(bodyHtml: string, url = 'https://example.com/'): Document {
  const dom = new JSDOM(
    `<!DOCTYPE html><html><head></head><body>${bodyHtml}</body></html>`,
    { url },
  )
  return dom.window.document
}

function makeSimpleSelection(doc: Document, selector: string): Selection | null {
  const el = doc.querySelector(selector)
  if (!el || !el.textContent) return null

  const range = doc.createRange()
  range.selectNodeContents(el)
  const sel = doc.defaultView!.getSelection()!
  sel.removeAllRanges()
  sel.addRange(range)
  return sel
}

function makeSiteProfileMatch(overrides: Partial<SiteProfileMatch> = {}): SiteProfileMatch {
  const profile: SiteProfile = {
    id: 'test-site',
    label: 'Test Site',
    category: 'community',
    domains: ['example.com'],
    pageTypes: ['article'],
    priority: 10,
    ...overrides.profile,
  } as SiteProfile

  return {
    profile,
    matchedDomain: 'example.com',
    matchedPageType: 'article',
    confidence: 0.8,
    reasons: ['test match'],
    ...overrides,
  }
}

// ============= sanitizeClassHints =============

describe('sanitizeClassHints', () => {
  it('returns only whitelisted hints', () => {
    const result = sanitizeClassHints('comment thread random something reply')
    expect(result).toContain('comment')
    expect(result).toContain('thread')
    expect(result).toContain('reply')
    expect(result).not.toContain('random')
    expect(result).not.toContain('something')
  })

  it('does not return full class names', () => {
    const result = sanitizeClassHints('user-avatar-12345 comment-container-abc')
    expect(result).toContain('comment')
    expect(result).not.toContain('user-avatar-12345')
    expect(result).not.toContain('comment-container-abc')
  })

  it('deduplicates and limits to 8', () => {
    const result = sanitizeClassHints(
      'comment reply comment thread discussion conversation message assistant user answer question article post content main nav menu video player description caption search result',
    )
    expect(result.length).toBeLessThanOrEqual(8)
    const unique = new Set(result)
    expect(unique.size).toBe(result.length)
  })

  it('handles empty string', () => {
    expect(sanitizeClassHints('')).toEqual([])
  })

  it('handles undefined-like empty string', () => {
    expect(sanitizeClassHints('   ')).toEqual([])
  })

  it('handles hyphenated and underscored class tokens', () => {
    const result = sanitizeClassHints('nav-menu search_result video-player')
    expect(result).toContain('nav')
    expect(result).toContain('menu')
    expect(result).toContain('search')
    expect(result).toContain('result')
    expect(result).toContain('video')
    expect(result).toContain('player')
  })

  it('does not leak random hash or path-like tokens', () => {
    const result = sanitizeClassHints('css-a1b2c3d4 content xyz-container-789')
    expect(result).toContain('content')
    expect(result).not.toContain('css-a1b2c3d4')
    expect(result).not.toContain('xyz-container-789')
    expect(result).not.toContain('a1b2c3d4')
  })
})

// ============= getSelectionTextLength =============

describe('getSelectionTextLength', () => {
  it('returns 0 for null selection', () => {
    expect(getSelectionTextLength(null)).toBe(0)
  })

  it('returns length without returning text', () => {
    const doc = makeDom('<p>Hello World</p>')
    const sel = makeSimpleSelection(doc, 'p')
    const len = getSelectionTextLength(sel)
    expect(len).toBe(11)
    expect(typeof len).toBe('number')
  })

  it('returns 0 for empty selection', () => {
    const doc = makeDom('<p></p>')
    const sel = makeSimpleSelection(doc, 'p')
    expect(getSelectionTextLength(sel)).toBe(0)
  })
})

// ============= getSelectionRootElement =============

describe('getSelectionRootElement', () => {
  it('returns null for null selection', () => {
    expect(getSelectionRootElement(null)).toBeNull()
  })

  it('returns element for selection within a paragraph', () => {
    const doc = makeDom('<div><p>Selected text</p></div>')
    const sel = makeSimpleSelection(doc, 'p')
    const el = getSelectionRootElement(sel)
    expect(el).not.toBeNull()
    expect(el!.tagName).toBe('P')
  })

  it('returns ancestor for cross-element selection', () => {
    const doc = makeDom('<div><span>A</span><span>B</span></div>')
    const range = doc.createRange()
    const spans = doc.querySelectorAll('span')
    range.setStart(spans[0].firstChild!, 0)
    range.setEnd(spans[1].firstChild!, 1)
    const sel = doc.defaultView!.getSelection()!
    sel.removeAllRanges()
    sel.addRange(range)
    const el = getSelectionRootElement(sel)
    expect(el).not.toBeNull()
    expect(el!.tagName).toBe('DIV')
  })
})

// ============= classifyElementContext =============

describe('classifyElementContext', () => {
  it('returns comment for element with comment class', () => {
    const doc = makeDom('<div class="comment"><p>text</p></div>')
    const el = doc.querySelector('p')
    expect(classifyElementContext(el)).toBe('comment')
  })

  it('returns comment for ancestor with reply class', () => {
    const doc = makeDom('<div class="reply"><span>text</span></div>')
    const el = doc.querySelector('span')
    expect(classifyElementContext(el)).toBe('comment')
  })

  it('returns comment for thread ancestor', () => {
    const doc = makeDom('<div class="thread"><p>text</p></div>')
    const el = doc.querySelector('p')
    expect(classifyElementContext(el)).toBe('comment')
  })

  it('returns comment for discussion ancestor', () => {
    const doc = makeDom('<div class="discussion"><p>text</p></div>')
    const el = doc.querySelector('p')
    expect(classifyElementContext(el)).toBe('comment')
  })

  it('returns ai-answer for assistant context', () => {
    const doc = makeDom('<div class="assistant"><p>text</p></div>')
    const el = doc.querySelector('p')
    expect(classifyElementContext(el)).toBe('ai-answer')
  })

  it('returns video-description for video context', () => {
    const doc = makeDom('<div class="video"><p>text</p></div>')
    const el = doc.querySelector('p')
    expect(classifyElementContext(el)).toBe('video-description')
  })

  it('returns search-result for search context', () => {
    const doc = makeDom('<div class="search-results"><p>text</p></div>')
    const el = doc.querySelector('p')
    expect(classifyElementContext(el)).toBe('search-result')
  })

  it('returns navigation for nav tag', () => {
    const doc = makeDom('<nav><p>text</p></nav>')
    const el = doc.querySelector('p')
    expect(classifyElementContext(el)).toBe('navigation')
  })

  it('returns article for article tag', () => {
    const doc = makeDom('<article><p>text</p></article>')
    const el = doc.querySelector('p')
    expect(classifyElementContext(el)).toBe('article')
  })

  it('returns unknown for no signals', () => {
    const doc = makeDom('<div><span>text</span></div>')
    const el = doc.querySelector('span')
    expect(classifyElementContext(el)).toBe('unknown')
  })

  it('returns unknown for null element', () => {
    expect(classifyElementContext(null)).toBe('unknown')
  })

  it('comment has higher priority than video', () => {
    const doc = makeDom('<div class="comment"><div class="video"><p>text</p></div></div>')
    const el = doc.querySelector('p')
    expect(classifyElementContext(el)).toBe('comment')
  })

  it('returns article for content class', () => {
    const doc = makeDom('<div class="content"><p>text</p></div>')
    const el = doc.querySelector('p')
    expect(classifyElementContext(el)).toBe('article')
  })
})

// ============= collectVisibleContext =============

describe('collectVisibleContext', () => {
  it('counts video elements', () => {
    const doc = makeDom('<video></video><video></video>')
    const ctx = collectVisibleContext(doc)
    expect(ctx.visibleVideoCount).toBe(2)
  })

  it('counts video iframes with player src', () => {
    const doc = makeDom('<iframe src="https://example.com/player/abc"></iframe>')
    const ctx = collectVisibleContext(doc)
    expect(ctx.visibleVideoCount).toBeGreaterThanOrEqual(1)
  })

  it('counts generic player class elements', () => {
    const doc = makeDom('<div class="player"></div><div class="video"></div>')
    const ctx = collectVisibleContext(doc)
    expect(ctx.visibleVideoCount).toBeGreaterThanOrEqual(2)
  })

  it('counts comment-like elements', () => {
    const doc = makeDom(`
      <div class="comment">a</div>
      <div class="reply">b</div>
      <div class="thread">c</div>
    `)
    const ctx = collectVisibleContext(doc)
    expect(ctx.visibleCommentLikeCount).toBeGreaterThanOrEqual(3)
  })

  it('counts search-result-like elements', () => {
    const doc = makeDom(`
      <div class="result"></div>
      <div class="result"></div>
      <div class="g"></div>
    `)
    const ctx = collectVisibleContext(doc)
    expect(ctx.visibleSearchResultLikeCount).toBeGreaterThanOrEqual(3)
  })

  it('counts article-like elements', () => {
    const doc = makeDom(`
      <article></article>
      <main></main>
      <div class="post"></div>
    `)
    const ctx = collectVisibleContext(doc)
    expect(ctx.visibleArticleLikeCount).toBeGreaterThanOrEqual(3)
  })

  it('counts role=main as article-like', () => {
    const doc = makeDom('<div role="main"></div>')
    const ctx = collectVisibleContext(doc)
    expect(ctx.visibleArticleLikeCount).toBeGreaterThanOrEqual(1)
  })

  it('uses siteProfileMatch selectorHints.videoPlayer to count site-specific video elements', () => {
    const doc = makeDom('<div class="custom-media-frame"></div><div class="custom-media-frame"></div>')
    const match = makeSiteProfileMatch({
      profile: {
        id: 'test-video',
        label: 'Test Video',
        category: 'video',
        domains: ['example.com'],
        pageTypes: ['video'],
        priority: 10,
        selectorHints: { videoPlayer: '.custom-media-frame' },
      } as SiteProfile,
    })
    const ctx = collectVisibleContext(doc, match)
    expect(ctx.visibleVideoCount).toBeGreaterThanOrEqual(2)
  })

  it('handles comma-separated videoPlayer selectors', () => {
    const doc = makeDom('<div class="player-a"></div><span class="player-b"></span>')
    const match = makeSiteProfileMatch({
      profile: {
        id: 'multi-selector',
        label: 'Multi',
        category: 'video',
        domains: ['example.com'],
        pageTypes: ['video'],
        priority: 10,
        selectorHints: { videoPlayer: '.player-a, .player-b' },
      } as SiteProfile,
    })
    const ctx = collectVisibleContext(doc, match)
    expect(ctx.visibleVideoCount).toBeGreaterThanOrEqual(2)
  })

  it('returns 0 for null siteProfileMatch', () => {
    const doc = makeDom('<div class="custom-player"></div>')
    const ctx = collectVisibleContext(doc, null)
    expect(ctx.visibleVideoCount).toBeGreaterThanOrEqual(0)
  })
})

// ============= detectClipIntent =============

function makeDetectInput(overrides: Partial<Omit<IntentSnapshot, 'intent' | 'confidence' | 'reasons'>> = {}): Omit<IntentSnapshot, 'intent' | 'confidence' | 'reasons'> {
  return {
    pageType: 'article',
    siteProfileId: undefined,
    selectionPresent: false,
    selectionTextLength: 0,
    selectionContext: 'unknown',
    selectionRectArea: undefined,
    nearestRole: undefined,
    nearestTag: undefined,
    nearestClassHints: [],
    visibleContext: {
      visibleVideoCount: 0,
      visibleCommentLikeCount: 0,
      visibleSearchResultLikeCount: 0,
      visibleArticleLikeCount: 0,
    },
    ...overrides,
  }
}

describe('detectClipIntent', () => {
  it('clip-comment for comment selection', () => {
    const result = detectClipIntent(makeDetectInput({
      selectionPresent: true,
      selectionContext: 'comment',
      selectionTextLength: 100,
    }))
    expect(result.intent).toBe('clip-comment')
    expect(result.confidence).toBeGreaterThanOrEqual(0.8)
  })

  it('clip-video-comment for video page with comment selection', () => {
    const result = detectClipIntent(makeDetectInput({
      pageType: 'video',
      selectionPresent: true,
      selectionContext: 'comment',
      selectionTextLength: 50,
    }))
    expect(result.intent).toBe('clip-video-comment')
    expect(result.confidence).toBeGreaterThanOrEqual(0.85)
  })

  it('clip-short-video-comment for short-video with comment selection', () => {
    const result = detectClipIntent(makeDetectInput({
      pageType: 'video',
      siteProfileId: 'tiktok-short-video',
      selectionPresent: true,
      selectionContext: 'comment',
      selectionTextLength: 30,
    }))
    expect(result.intent).toBe('clip-short-video-comment')
    expect(result.confidence).toBeGreaterThanOrEqual(0.9)
  })

  it('clip-video-description for video description selection', () => {
    const result = detectClipIntent(makeDetectInput({
      pageType: 'video',
      selectionPresent: true,
      selectionContext: 'video-description',
      selectionTextLength: 80,
    }))
    expect(result.intent).toBe('clip-video-description')
    expect(result.confidence).toBeGreaterThanOrEqual(0.8)
  })

  it('clip-short-video-caption for short-video description selection', () => {
    const result = detectClipIntent(makeDetectInput({
      pageType: 'video',
      siteProfileId: 'douyin-short-video',
      selectionPresent: true,
      selectionContext: 'video-description',
      selectionTextLength: 20,
    }))
    expect(result.intent).toBe('clip-short-video-caption')
    expect(result.confidence).toBeGreaterThanOrEqual(0.85)
  })

  it('clip-search-result for search result selection', () => {
    const result = detectClipIntent(makeDetectInput({
      pageType: 'search-results',
      selectionPresent: true,
      selectionContext: 'search-result',
      selectionTextLength: 60,
    }))
    expect(result.intent).toBe('clip-search-result')
  })

  it('clip-ai-answer for AI answer selection', () => {
    const result = detectClipIntent(makeDetectInput({
      pageType: 'ai-answer',
      selectionPresent: true,
      selectionContext: 'ai-answer',
      selectionTextLength: 200,
    }))
    expect(result.intent).toBe('clip-ai-answer')
  })

  it('clip-article for article no selection', () => {
    const result = detectClipIntent(makeDetectInput({
      pageType: 'article',
      selectionPresent: false,
    }))
    expect(result.intent).toBe('clip-article')
    expect(result.confidence).toBeGreaterThanOrEqual(0.7)
  })

  it('clip-navigation-summary for navigation no selection', () => {
    const result = detectClipIntent(makeDetectInput({
      pageType: 'navigation',
      selectionPresent: false,
    }))
    expect(result.intent).toBe('clip-navigation-summary')
    expect(result.confidence).toBeGreaterThanOrEqual(0.7)
  })

  it('clip-video-page for video no selection', () => {
    const result = detectClipIntent(makeDetectInput({
      pageType: 'video',
      selectionPresent: false,
    }))
    expect(result.intent).toBe('clip-video-page')
  })

  it('clip-forum-thread for forum-or-comment no selection', () => {
    const result = detectClipIntent(makeDetectInput({
      pageType: 'forum-or-comment',
      selectionPresent: false,
    }))
    expect(result.intent).toBe('clip-forum-thread')
  })

  it('unknown for unknown pageType no selection', () => {
    const result = detectClipIntent(makeDetectInput({
      pageType: 'unknown',
      selectionPresent: false,
    }))
    expect(result.intent).toBe('unknown')
  })

  it('clip-selection-generic for selection with unknown context', () => {
    const result = detectClipIntent(makeDetectInput({
      selectionPresent: true,
      selectionContext: 'unknown',
      selectionTextLength: 100,
    }))
    expect(result.intent).toBe('clip-selection-generic')
    expect(result.confidence).toBeLessThanOrEqual(0.5)
  })

  it('reasons are short strings without full content', () => {
    const result = detectClipIntent(makeDetectInput({
      pageType: 'article',
      selectionPresent: true,
      selectionContext: 'comment',
      selectionTextLength: 100,
    }))
    for (const reason of result.reasons) {
      expect(typeof reason).toBe('string')
      expect(reason.length).toBeLessThan(200)
    }
  })
})

// ============= collectIntentSnapshot =============

function makeIntentInput(overrides: Partial<IntentSignalInput> = {}): IntentSignalInput {
  const doc = makeDom('<main><article><p>Test content for intent detection.</p></article></main>')
  return {
    document: doc,
    pageType: 'article',
    selection: null,
    ...overrides,
  }
}

describe('collectIntentSnapshot', () => {
  it('produces snapshot with article pageType and no selection', () => {
    const input = makeIntentInput({ pageType: 'article' })
    const snapshot = collectIntentSnapshot(input)
    expect(snapshot.pageType).toBe('article')
    expect(snapshot.selectionPresent).toBe(false)
    expect(snapshot.intent).toBe('clip-article')
    expect(snapshot.confidence).toBeGreaterThanOrEqual(0.7)
  })

  it('produces snapshot with siteProfileId from match', () => {
    const match = makeSiteProfileMatch({ profile: { id: 'zhihu-community' } as SiteProfile })
    const input = makeIntentInput({
      pageType: 'forum-or-comment',
      siteProfileMatch: match,
    })
    const snapshot = collectIntentSnapshot(input)
    expect(snapshot.siteProfileId).toBe('zhihu-community')
  })

  it('selectionPresent is false when text length is 0', () => {
    const doc = makeDom('<p></p>')
    const sel = makeSimpleSelection(doc, 'p')
    const input = makeIntentInput({ document: doc, selection: sel })
    const snapshot = collectIntentSnapshot(input)
    expect(snapshot.selectionPresent).toBe(false)
  })

  it('selectionPresent is true when text is selected', () => {
    const doc = makeDom('<p>Selected text here</p>')
    const sel = makeSimpleSelection(doc, 'p')
    const input = makeIntentInput({ document: doc, selection: sel })
    const snapshot = collectIntentSnapshot(input)
    expect(snapshot.selectionPresent).toBe(true)
    expect(snapshot.selectionTextLength).toBeGreaterThan(0)
  })

  it('does not contain full selected text in reasons', () => {
    const doc = makeDom('<div class="comment"><p>Some comment text that is selected.</p></div>')
    const sel = makeSimpleSelection(doc, 'p')
    const input = makeIntentInput({ document: doc, selection: sel })
    const snapshot = collectIntentSnapshot(input)
    for (const reason of snapshot.reasons) {
      expect(reason).not.toContain('Some comment text')
    }
  })

  it('does not contain full className in nearestClassHints', () => {
    const doc = makeDom('<div class="css-abc123 comment-wrapper xyz"><p>text</p></div>')
    const sel = makeSimpleSelection(doc, 'p')
    const input = makeIntentInput({ document: doc, selection: sel })
    const snapshot = collectIntentSnapshot(input)
    for (const hint of snapshot.nearestClassHints) {
      expect(hint).not.toContain('css-abc123')
      expect(hint).not.toContain('comment-wrapper')
      expect(hint).not.toContain('xyz')
    }
  })

  it('nearestTag is set from selection root', () => {
    const doc = makeDom('<div class="comment"><p>text</p></div>')
    const sel = makeSimpleSelection(doc, 'p')
    const input = makeIntentInput({ document: doc, selection: sel })
    const snapshot = collectIntentSnapshot(input)
    expect(snapshot.nearestTag).toBe('p')
  })

  it('has visibleContext with all four fields', () => {
    const input = makeIntentInput()
    const snapshot = collectIntentSnapshot(input)
    expect(snapshot.visibleContext).toBeDefined()
    expect(typeof snapshot.visibleContext.visibleVideoCount).toBe('number')
    expect(typeof snapshot.visibleContext.visibleCommentLikeCount).toBe('number')
    expect(typeof snapshot.visibleContext.visibleSearchResultLikeCount).toBe('number')
    expect(typeof snapshot.visibleContext.visibleArticleLikeCount).toBe('number')
  })

  it('confidence is between 0 and 1', () => {
    const input = makeIntentInput()
    const snapshot = collectIntentSnapshot(input)
    expect(snapshot.confidence).toBeGreaterThanOrEqual(0)
    expect(snapshot.confidence).toBeLessThanOrEqual(1)
  })

  it('reasons are defined and non-empty', () => {
    const input = makeIntentInput()
    const snapshot = collectIntentSnapshot(input)
    expect(Array.isArray(snapshot.reasons)).toBe(true)
    expect(snapshot.reasons.length).toBeGreaterThan(0)
    for (const reason of snapshot.reasons) {
      expect(typeof reason).toBe('string')
    }
  })

  it('comment selection on video page returns clip-video-comment', () => {
    const doc = makeDom('<div class="comment"><p>Comment text selected by user.</p></div>')
    const sel = makeSimpleSelection(doc, 'p')
    const input = makeIntentInput({
      document: doc,
      pageType: 'video',
      selection: sel,
    })
    const snapshot = collectIntentSnapshot(input)
    expect(snapshot.intent).toBe('clip-video-comment')
    expect(snapshot.confidence).toBeGreaterThanOrEqual(0.8)
  })

  it('navigation page without selection returns navigation-summary', () => {
    const input = makeIntentInput({ pageType: 'navigation' })
    const snapshot = collectIntentSnapshot(input)
    expect(snapshot.intent).toBe('clip-navigation-summary')
  })

  it('unknown pageType without selection returns unknown', () => {
    const input = makeIntentInput({ pageType: 'unknown' })
    const snapshot = collectIntentSnapshot(input)
    expect(snapshot.intent).toBe('unknown')
  })

  it('passes siteProfileMatch to collectVisibleContext for site-specific video detection', () => {
    const doc = makeDom('<div class="test-player"></div>')
    const match = makeSiteProfileMatch({
      profile: {
        id: 'test-video-site',
        label: 'Test',
        category: 'video',
        domains: ['example.com'],
        pageTypes: ['video'],
        priority: 10,
        selectorHints: { videoPlayer: '.test-player' },
      } as SiteProfile,
    })
    const input = makeIntentInput({
      document: doc,
      pageType: 'video',
      siteProfileMatch: match,
    })
    const snapshot = collectIntentSnapshot(input)
    expect(snapshot.visibleContext.visibleVideoCount).toBeGreaterThanOrEqual(1)
  })
})

// ============= no chrome/storage/network access =============

describe('intent signal collector - no external dependencies', () => {
  it('collectIntentSnapshot does not access chrome API', () => {
    expect(typeof globalThis.chrome).toBe('undefined')
    const input = makeIntentInput()
    const snapshot = collectIntentSnapshot(input)
    expect(snapshot).toBeDefined()
  })

  it('all exported functions are callable without mocks', () => {
    const doc = makeDom('<div class="comment"><p>test</p></div>')
    const sel = makeSimpleSelection(doc, 'p')

    expect(sanitizeClassHints('nav menu')).toBeInstanceOf(Array)
    expect(getSelectionTextLength(sel)).toBeGreaterThanOrEqual(0)
    expect(getSelectionRootElement(sel)).not.toBeNull()
    expect(typeof classifyElementContext(doc.querySelector('p'))).toBe('string')
    const ctx = collectVisibleContext(doc)
    expect(typeof ctx.visibleVideoCount).toBe('number')
  })

  it('intentSignalCollector does not contain site-specific domain names', () => {
    const src = String(collectVisibleContext)
    expect(src).not.toMatch(/\byoutube\b/i)
    expect(src).not.toMatch(/\bbilibili\b/i)
    expect(src).not.toMatch(/\byouku\b/i)
    expect(src).not.toMatch(/\biqiyi\b/i)
    expect(src).not.toMatch(/\btiktok\b/i)
    expect(src).not.toMatch(/\bdouyin\b/i)
    expect(src).not.toMatch(/\bkuaishou\b/i)
  })
})
