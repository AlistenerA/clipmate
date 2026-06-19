import { describe, it, expect } from 'vitest'
import {
  extractDomain,
  normalizeLinkCardUrl,
  truncateText,
  buildLinkCardDraft,
} from '../src/shared/linkCard/linkCardBuilder'
import type { LinkCardInput } from '../src/shared/linkCard/linkCard.types'

function makeInput(overrides?: Partial<LinkCardInput>): LinkCardInput {
  return {
    title: 'Test Title',
    url: 'https://example.com/page',
    source: 'current-page',
    ...overrides,
  }
}

describe('extractDomain', () => {
  it('returns hostname from full URL', () => {
    expect(extractDomain('https://example.com/page')).toBe('example.com')
  })

  it('returns hostname with subdomain', () => {
    expect(extractDomain('https://blog.example.com/article')).toBe('blog.example.com')
  })

  it('returns empty string for empty input', () => {
    expect(extractDomain('')).toBe('')
  })

  it('returns empty string for invalid URL', () => {
    expect(extractDomain('not a valid url')).toBe('')
  })
})

describe('normalizeLinkCardUrl', () => {
  it('accepts https URL', () => {
    expect(normalizeLinkCardUrl('https://example.com/page')).toBe('https://example.com/page')
  })

  it('accepts http URL', () => {
    expect(normalizeLinkCardUrl('http://example.com/page')).toBe('http://example.com/page')
  })

  it('rejects javascript: protocol', () => {
    expect(normalizeLinkCardUrl('javascript:alert(1)')).toBeUndefined()
  })

  it('rejects data: protocol', () => {
    expect(normalizeLinkCardUrl('data:text/html,hello')).toBeUndefined()
  })

  it('rejects blob: protocol', () => {
    expect(normalizeLinkCardUrl('blob:https://example.com/uuid')).toBeUndefined()
  })

  it('rejects chrome: protocol', () => {
    expect(normalizeLinkCardUrl('chrome://extensions')).toBeUndefined()
  })

  it('rejects edge: protocol', () => {
    expect(normalizeLinkCardUrl('edge://settings')).toBeUndefined()
  })

  it('rejects about: protocol', () => {
    expect(normalizeLinkCardUrl('about:blank')).toBeUndefined()
  })

  it('rejects file: protocol', () => {
    expect(normalizeLinkCardUrl('file:///C:/test.html')).toBeUndefined()
  })

  it('rejects vbscript: protocol', () => {
    expect(normalizeLinkCardUrl('vbscript:msgbox(1)')).toBeUndefined()
  })

  it('resolves relative URL with baseUrl', () => {
    expect(normalizeLinkCardUrl('/page/2', 'https://example.com')).toBe('https://example.com/page/2')
  })

  it('resolves relative URL without leading slash', () => {
    expect(normalizeLinkCardUrl('page/2', 'https://example.com/dir/')).toBe('https://example.com/dir/page/2')
  })

  it('returns undefined for relative URL without baseUrl', () => {
    expect(normalizeLinkCardUrl('/page/2')).toBeUndefined()
  })

  it('returns undefined for empty input', () => {
    expect(normalizeLinkCardUrl('')).toBeUndefined()
  })

  it('returns undefined for whitespace-only input', () => {
    expect(normalizeLinkCardUrl('   ')).toBeUndefined()
  })

  it('returns undefined for invalid URL', () => {
    expect(normalizeLinkCardUrl('not a valid :// url @#$')).toBeUndefined()
  })
})

describe('truncateText', () => {
  it('returns undefined for undefined input', () => {
    expect(truncateText(undefined, 10)).toBeUndefined()
  })

  it('returns undefined for empty string', () => {
    expect(truncateText('', 10)).toBeUndefined()
  })

  it('returns undefined for whitespace-only string', () => {
    expect(truncateText('   ', 10)).toBeUndefined()
  })

  it('returns text as-is when within limit', () => {
    expect(truncateText('short', 10)).toBe('short')
  })

  it('truncates text exceeding limit', () => {
    expect(truncateText('this is a long text', 10)).toBe('this is a ')
  })

  it('truncates exactly at maxLength', () => {
    expect(truncateText('1234567890', 10)).toBe('1234567890')
  })
})

describe('buildLinkCardDraft', () => {
  it('builds basic current-page card', () => {
    const draft = buildLinkCardDraft(makeInput())
    expect(draft).not.toBeNull()
    expect(draft!.title).toBe('Test Title')
    expect(draft!.url).toBe('https://example.com/page')
    expect(draft!.domain).toBe('example.com')
    expect(draft!.source).toBe('current-page')
  })

  it('builds selected-link card', () => {
    const draft = buildLinkCardDraft(makeInput({ source: 'selected-link' }))
    expect(draft!.source).toBe('selected-link')
  })

  it('builds navigation-link card', () => {
    const draft = buildLinkCardDraft(makeInput({ source: 'navigation-link' }))
    expect(draft!.source).toBe('navigation-link')
  })

  it('builds manual-input card', () => {
    const draft = buildLinkCardDraft(makeInput({ source: 'manual-input' }))
    expect(draft!.source).toBe('manual-input')
  })

  it('falls back to domain when title is missing', () => {
    const draft = buildLinkCardDraft(makeInput({ title: undefined }))
    expect(draft!.title).toBe('example.com')
  })

  it('falls back to domain when title is empty string', () => {
    const draft = buildLinkCardDraft(makeInput({ title: '' }))
    expect(draft!.title).toBe('example.com')
  })

  it('truncates title exceeding 120 characters', () => {
    const longTitle = 'A'.repeat(200)
    const draft = buildLinkCardDraft(makeInput({ title: longTitle }))
    expect(draft!.title.length).toBe(120)
  })

  it('truncates description exceeding 240 characters', () => {
    const longDesc = 'B'.repeat(300)
    const draft = buildLinkCardDraft(makeInput({ description: longDesc }))
    expect(draft!.description!.length).toBe(240)
  })

  it('returns null for empty url', () => {
    expect(buildLinkCardDraft(makeInput({ url: '' }))).toBeNull()
  })

  it('returns null for javascript url', () => {
    expect(buildLinkCardDraft(makeInput({ url: 'javascript:void(0)' }))).toBeNull()
  })

  it('returns null for data url', () => {
    expect(buildLinkCardDraft(makeInput({ url: 'data:text/html,hello' }))).toBeNull()
  })

  it('returns null for invalid url', () => {
    expect(buildLinkCardDraft(makeInput({ url: 'not a url' }))).toBeNull()
  })

  it('includes siteIconUrl when safe', () => {
    const draft = buildLinkCardDraft(makeInput({ siteIconUrl: 'https://example.com/icon.png' }))
    expect(draft!.siteIconUrl).toBe('https://example.com/icon.png')
  })

  it('discards unsafe siteIconUrl', () => {
    const draft = buildLinkCardDraft(makeInput({ siteIconUrl: 'javascript:alert(1)' }))
    expect(draft!.siteIconUrl).toBeUndefined()
  })

  it('includes valid themeColor', () => {
    const draft = buildLinkCardDraft(makeInput({ themeColor: '#ff6600' }))
    expect(draft!.themeColor).toBe('#ff6600')
  })

  it('discards unsafe themeColor', () => {
    const draft = buildLinkCardDraft(makeInput({ themeColor: 'javascript:alert(1)' }))
    expect(draft!.themeColor).toBeUndefined()
  })

  it('includes pageType when not unknown', () => {
    const draft = buildLinkCardDraft(makeInput({ pageType: 'article' }))
    expect(draft!.pageType).toBe('article')
  })

  it('does not include pageType reason when pageType is unknown', () => {
    const draft = buildLinkCardDraft(makeInput({ pageType: 'unknown' }))
    const hasPageTypeReason = draft!.reasons.some((r) => r.startsWith('pageType='))
    expect(hasPageTypeReason).toBe(false)
  })

  it('includes siteProfileId', () => {
    const draft = buildLinkCardDraft(makeInput({ siteProfileId: 'google-search' }))
    expect(draft!.siteProfileId).toBe('google-search')
  })

  it('generates source reason', () => {
    const draft = buildLinkCardDraft(makeInput())
    expect(draft!.reasons).toContain('source=current-page')
  })

  it('generates domain reason', () => {
    const draft = buildLinkCardDraft(makeInput())
    expect(draft!.reasons).toContain('domain=example.com')
  })

  it('generates siteVisual reason when icon present', () => {
    const draft = buildLinkCardDraft(makeInput({ siteIconUrl: 'https://example.com/icon.png' }))
    expect(draft!.reasons).toContain('siteVisual=present')
  })

  it('generates themeColor reason when present', () => {
    const draft = buildLinkCardDraft(makeInput({ themeColor: '#ff6600' }))
    expect(draft!.reasons).toContain('themeColor=present')
  })

  it('generates pageType reason', () => {
    const draft = buildLinkCardDraft(makeInput({ pageType: 'article' }))
    expect(draft!.reasons).toContain('pageType=article')
  })

  it('generates siteProfile reason', () => {
    const draft = buildLinkCardDraft(makeInput({ siteProfileId: 'google-search' }))
    expect(draft!.reasons).toContain('siteProfile=google-search')
  })

  it('generates custom reason', () => {
    const draft = buildLinkCardDraft(makeInput({ reason: 'test reason' }))
    expect(draft!.reasons).toContain('reason=test reason')
  })

  it('does not contain description when not provided', () => {
    const draft = buildLinkCardDraft(makeInput())
    expect(draft!.description).toBeUndefined()
  })

  it('does not strip https from url', () => {
    const draft = buildLinkCardDraft(makeInput({ url: 'https://example.com/page' }))
    expect(draft!.url).toBe('https://example.com/page')
  })
})

describe('buildLinkCardDraft safety checks', () => {
  it('does not contain contentText field', () => {
    const draft = buildLinkCardDraft(makeInput())
    expect((draft as Record<string, unknown>).contentText).toBeUndefined()
  })

  it('does not contain selectedText field', () => {
    const draft = buildLinkCardDraft(makeInput())
    expect((draft as Record<string, unknown>).selectedText).toBeUndefined()
  })

  it('does not contain commentBody field', () => {
    const draft = buildLinkCardDraft(makeInput())
    expect((draft as Record<string, unknown>).commentBody).toBeUndefined()
  })

  it('does not contain fullHtml field', () => {
    const draft = buildLinkCardDraft(makeInput())
    expect((draft as Record<string, unknown>).fullHtml).toBeUndefined()
  })

  it('does not contain fullText field', () => {
    const draft = buildLinkCardDraft(makeInput())
    expect((draft as Record<string, unknown>).fullText).toBeUndefined()
  })

  it('does not contain markdown field', () => {
    const draft = buildLinkCardDraft(makeInput())
    expect((draft as Record<string, unknown>).markdown).toBeUndefined()
  })

  it('does not contain settings field', () => {
    const draft = buildLinkCardDraft(makeInput())
    expect((draft as Record<string, unknown>).settings).toBeUndefined()
  })

  it('does not contain request field', () => {
    const draft = buildLinkCardDraft(makeInput())
    expect((draft as Record<string, unknown>).request).toBeUndefined()
  })
})
