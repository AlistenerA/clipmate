import { describe, it, expect } from 'vitest'
import type { PageType } from '../src/shared/utils/pageTypeDetector'
import type { SiteProfileMatch, SiteProfile } from '../src/shared/siteProfiles'
import type { IntentSnapshot, SelectionContext } from '../src/content/intent'
import {
  extractDomain,
  detectCommentSelectionMode,
  getCommentSelectionWarning,
  buildCommentSelectionDraft,
} from '../src/content/commentSelection'
import type {
  CommentSelectionInput,
  CommentSelectionDraft,
} from '../src/content/commentSelection'

function makeSiteProfileMatch(
  overrides: Partial<SiteProfileMatch> = {},
): SiteProfileMatch {
  return {
    profile: {
      id: 'test-site',
      label: 'Test Site',
      category: 'community',
      domains: ['example.com'],
      pageTypes: ['forum-or-comment'] as PageType[],
      priority: 10,
    } as SiteProfile,
    matchedDomain: 'example.com',
    matchedPageType: 'forum-or-comment' as PageType,
    confidence: 0.8,
    reasons: ['test match'],
    ...overrides,
  }
}

function makeIntentSnapshot(
  overrides: Partial<IntentSnapshot> = {},
): IntentSnapshot {
  return {
    pageType: 'unknown' as PageType,
    siteProfileId: undefined,
    selectionPresent: true,
    selectionTextLength: 100,
    selectionContext: 'unknown' as SelectionContext,
    nearestRole: undefined,
    nearestTag: undefined,
    nearestClassHints: [],
    visibleContext: {
      visibleVideoCount: 0,
      visibleCommentLikeCount: 0,
      visibleSearchResultLikeCount: 0,
      visibleArticleLikeCount: 0,
    },
    confidence: 0.5,
    intent: 'clip-selection-generic',
    reasons: [],
    ...overrides,
  }
}

function makeInput(
  overrides: Partial<CommentSelectionInput> = {},
): CommentSelectionInput {
  return {
    title: 'Test Page',
    url: 'https://example.com/test',
    pageType: 'article' as PageType,
    selectionText: 'selected text content',
    selectionContext: 'article' as SelectionContext,
    ...overrides,
  }
}

// ============= extractDomain =============

describe('extractDomain', () => {
  it('returns hostname from URL', () => {
    expect(extractDomain('https://example.com/path')).toBe('example.com')
  })

  it('returns hostname without port', () => {
    expect(extractDomain('https://sub.example.com:8080/path')).toBe('sub.example.com')
  })

  it('returns empty for invalid URL', () => {
    expect(extractDomain('not-a-url')).toBe('')
  })

  it('returns empty for empty string', () => {
    expect(extractDomain('')).toBe('')
  })
})

// ============= detectCommentSelectionMode =============

describe('detectCommentSelectionMode', () => {
  it('comment + forum-or-comment → forum-selection', () => {
    const input = makeInput({
      selectionContext: 'comment',
      pageType: 'forum-or-comment',
    })
    expect(detectCommentSelectionMode(input)).toBe('forum-selection')
  })

  it('comment + video → video-comment-selection', () => {
    const input = makeInput({
      selectionContext: 'comment',
      pageType: 'video',
    })
    expect(detectCommentSelectionMode(input)).toBe('video-comment-selection')
  })

  it('comment + video + short-video profile → short-video-caption-selection', () => {
    const match = makeSiteProfileMatch({
      profile: {
        id: 'tiktok-short-video',
        label: 'TikTok',
        category: 'short-video',
        domains: ['tiktok.com'],
        pageTypes: ['video'] as PageType[],
        priority: 20,
      } as SiteProfile,
    })
    const input = makeInput({
      selectionContext: 'comment',
      pageType: 'video',
      siteProfileMatch: match,
    })
    expect(detectCommentSelectionMode(input)).toBe('short-video-caption-selection')
  })

  it('video-description → video-description-selection', () => {
    const input = makeInput({
      selectionContext: 'video-description',
      pageType: 'video',
    })
    expect(detectCommentSelectionMode(input)).toBe('video-description-selection')
  })

  it('video-description + short-video profile → short-video-caption-selection', () => {
    const match = makeSiteProfileMatch({
      profile: {
        id: 'douyin-short-video',
        label: 'Douyin',
        category: 'short-video',
        domains: ['douyin.com'],
        pageTypes: ['video'] as PageType[],
        priority: 20,
      } as SiteProfile,
    })
    const input = makeInput({
      selectionContext: 'video-description',
      pageType: 'video',
      siteProfileMatch: match,
    })
    expect(detectCommentSelectionMode(input)).toBe('short-video-caption-selection')
  })

  it('ai-answer selectionContext → ai-answer-selection', () => {
    const input = makeInput({
      selectionContext: 'ai-answer',
      pageType: 'article',
    })
    expect(detectCommentSelectionMode(input)).toBe('ai-answer-selection')
  })

  it('ai-answer pageType → ai-answer-selection', () => {
    const input = makeInput({
      selectionContext: 'unknown',
      pageType: 'ai-answer',
    })
    expect(detectCommentSelectionMode(input)).toBe('ai-answer-selection')
  })

  it('comment + unknown → comment-selection', () => {
    const input = makeInput({
      selectionContext: 'comment',
      pageType: 'unknown',
    })
    expect(detectCommentSelectionMode(input)).toBe('comment-selection')
  })

  it('article → selection-generic', () => {
    const input = makeInput({
      selectionContext: 'article',
      pageType: 'article',
    })
    expect(detectCommentSelectionMode(input)).toBe('selection-generic')
  })

  it('unknown → selection-generic', () => {
    const input = makeInput({
      selectionContext: 'unknown',
      pageType: 'unknown',
    })
    expect(detectCommentSelectionMode(input)).toBe('selection-generic')
  })

  it('navigation → selection-generic', () => {
    const input = makeInput({
      selectionContext: 'navigation',
      pageType: 'navigation',
    })
    expect(detectCommentSelectionMode(input)).toBe('selection-generic')
  })

  it('search-result → selection-generic', () => {
    const input = makeInput({
      selectionContext: 'search-result',
      pageType: 'search-results',
    })
    expect(detectCommentSelectionMode(input)).toBe('selection-generic')
  })

  it('handles undefined selectionContext', () => {
    const input = makeInput({
      selectionContext: undefined,
      pageType: 'comment' as PageType,
    })
    expect(detectCommentSelectionMode(input)).toBe('selection-generic')
  })
})

// ============= getCommentSelectionWarning =============

describe('getCommentSelectionWarning', () => {
  it('returns warning for comment-selection', () => {
    const warning = getCommentSelectionWarning('comment-selection')
    expect(warning).toBeDefined()
    expect(warning).toContain('comment')
  })

  it('returns warning for forum-selection', () => {
    const warning = getCommentSelectionWarning('forum-selection')
    expect(warning).toBeDefined()
    expect(warning).toContain('forum')
    expect(warning).toContain('avoid')
  })

  it('returns warning for video-comment-selection', () => {
    const warning = getCommentSelectionWarning('video-comment-selection')
    expect(warning).toBeDefined()
    expect(warning).toContain('video')
  })

  it('returns warning for video-description-selection', () => {
    const warning = getCommentSelectionWarning('video-description-selection')
    expect(warning).toBeDefined()
    expect(warning).toContain('description')
  })

  it('returns warning for short-video-caption-selection', () => {
    const warning = getCommentSelectionWarning('short-video-caption-selection')
    expect(warning).toBeDefined()
    expect(warning).toContain('short video')
  })

  it('returns warning for ai-answer-selection', () => {
    const warning = getCommentSelectionWarning('ai-answer-selection')
    expect(warning).toBeDefined()
    expect(warning).toContain('AI')
    expect(warning).toContain('conversation')
  })

  it('returns undefined for selection-generic', () => {
    expect(getCommentSelectionWarning('selection-generic')).toBeUndefined()
  })
})

// ============= buildCommentSelectionDraft =============

describe('buildCommentSelectionDraft', () => {
  it('builds draft with title, url, domain', () => {
    const input = makeInput({
      title: 'Test Title',
      url: 'https://example.com/page',
    })
    const draft = buildCommentSelectionDraft(input)
    expect(draft.title).toBe('Test Title')
    expect(draft.url).toBe('https://example.com/page')
    expect(draft.domain).toBe('example.com')
  })

  it('computes selectedTextLength from selectionText', () => {
    const input = makeInput({
      selectionText: 'Hello World',
    })
    const draft = buildCommentSelectionDraft(input)
    expect(draft.selectedTextLength).toBe(11)
  })

  it('saves selectedTextLength only, not selectedText field', () => {
    const input = makeInput({
      selectionText: 'secure content should not leak',
    })
    const draft = buildCommentSelectionDraft(input)
    expect((draft as Record<string, unknown>).selectedText).toBeUndefined()
  })

  it('draft does not contain commentBody/fullHtml/fullText fields', () => {
    const input = makeInput({})
    const draft = buildCommentSelectionDraft(input)
    expect((draft as Record<string, unknown>).commentBody).toBeUndefined()
    expect((draft as Record<string, unknown>).fullHtml).toBeUndefined()
    expect((draft as Record<string, unknown>).fullText).toBeUndefined()
  })

  it('draft does not contain body or fullPage fields', () => {
    const input = makeInput({})
    const draft = buildCommentSelectionDraft(input)
    expect((draft as Record<string, unknown>).body).toBeUndefined()
    expect((draft as Record<string, unknown>).innerHTML).toBeUndefined()
    expect((draft as Record<string, unknown>).fullPage).toBeUndefined()
  })

  it('reasons are short strings', () => {
    const input = makeInput({})
    const draft = buildCommentSelectionDraft(input)
    expect(draft.reasons.length).toBeGreaterThan(0)
    for (const reason of draft.reasons) {
      expect(typeof reason).toBe('string')
      expect(reason.length).toBeLessThan(80)
    }
  })

  it('reasons include selection-first', () => {
    const input = makeInput({})
    const draft = buildCommentSelectionDraft(input)
    expect(draft.reasons).toContain('selection-first')
  })

  it('reasons include context when selectionContext is set', () => {
    const input = makeInput({ selectionContext: 'comment' })
    const draft = buildCommentSelectionDraft(input)
    expect(draft.reasons.some((r) => r.includes('context=comment'))).toBe(true)
  })

  it('reasons include intent from intentSnapshot', () => {
    const snapshot = makeIntentSnapshot({ intent: 'clip-comment' })
    const input = makeInput({ intentSnapshot: snapshot, selectionContext: 'comment' })
    const draft = buildCommentSelectionDraft(input)
    expect(draft.reasons.some((r) => r.includes('intent=clip-comment'))).toBe(true)
  })

  it('does not add intent reason for generic intent', () => {
    const snapshot = makeIntentSnapshot({ intent: 'clip-selection-generic' })
    const input = makeInput({ intentSnapshot: snapshot, selectionContext: 'article' })
    const draft = buildCommentSelectionDraft(input)
    expect(draft.reasons.some((r) => r.startsWith('intent='))).toBe(false)
  })

  it('does not add intent reason for unknown intent', () => {
    const snapshot = makeIntentSnapshot({ intent: 'unknown' })
    const input = makeInput({ intentSnapshot: snapshot, selectionContext: 'article' })
    const draft = buildCommentSelectionDraft(input)
    expect(draft.reasons.some((r) => r.startsWith('intent='))).toBe(false)
  })

  it('includes pageType reason when not unknown', () => {
    const input = makeInput({ pageType: 'forum-or-comment' })
    const draft = buildCommentSelectionDraft(input)
    expect(draft.reasons.some((r) => r.includes('pageType=forum-or-comment'))).toBe(true)
  })

  it('does not include pageType reason for unknown pageType', () => {
    const input = makeInput({ pageType: 'unknown' })
    const draft = buildCommentSelectionDraft(input)
    expect(draft.reasons.some((r) => r.startsWith('pageType='))).toBe(false)
  })

  it('includes siteProfileId when site profile matches', () => {
    const match = makeSiteProfileMatch()
    const input = makeInput({ siteProfileMatch: match })
    const draft = buildCommentSelectionDraft(input)
    expect(draft.siteProfileId).toBe('test-site')
  })

  it('uses selectionMarkdown if provided', () => {
    const input = makeInput({
      selectionText: 'plain text',
      selectionMarkdown: '**bold** text',
    })
    const draft = buildCommentSelectionDraft(input)
    expect(draft.markdown).toBe('**bold** text')
  })

  it('falls back to selectionText if no selectionMarkdown', () => {
    const input = makeInput({ selectionText: 'plain text' })
    const draft = buildCommentSelectionDraft(input)
    expect(draft.markdown).toBe('plain text')
  })

  it('sets mode correctly for forum selection', () => {
    const input = makeInput({
      selectionContext: 'comment',
      pageType: 'forum-or-comment',
    })
    const draft = buildCommentSelectionDraft(input)
    expect(draft.mode).toBe('forum-selection')
  })

  it('sets warning for non-generic modes', () => {
    const input = makeInput({
      selectionContext: 'comment',
      pageType: 'forum-or-comment',
    })
    const draft = buildCommentSelectionDraft(input)
    expect(draft.warning).toBeDefined()
    expect(draft.warning).toContain('forum')
  })

  it('sets no warning for selection-generic', () => {
    const input = makeInput({
      selectionContext: 'article',
      pageType: 'article',
    })
    const draft = buildCommentSelectionDraft(input)
    expect(draft.warning).toBeUndefined()
  })

  it('sets contextLabel for non-generic modes', () => {
    const input = makeInput({
      selectionContext: 'comment',
      pageType: 'forum-or-comment',
    })
    const draft = buildCommentSelectionDraft(input)
    expect(draft.contextLabel).toBeDefined()
  })

  it('handles empty title gracefully', () => {
    const input = makeInput({ title: '' })
    const draft = buildCommentSelectionDraft(input)
    expect(draft.title).toBe('')
    expect(draft.mode).toBe('selection-generic')
  })

  it('handles empty url gracefully', () => {
    const input = makeInput({ url: '' })
    const draft = buildCommentSelectionDraft(input)
    expect(draft.domain).toBe('')
  })

  it('handles null intentSnapshot', () => {
    const input = makeInput({
      intentSnapshot: null,
      selectionContext: 'comment',
    })
    const draft = buildCommentSelectionDraft(input)
    expect(draft.mode).toBe('comment-selection')
    expect(draft.reasons).toContain('selection-first')
  })

  it('handles null siteProfileMatch', () => {
    const input = makeInput({
      siteProfileMatch: null,
      selectionContext: 'comment',
      pageType: 'video',
    })
    const draft = buildCommentSelectionDraft(input)
    expect(draft.mode).toBe('video-comment-selection')
  })

  it('intentSnapshot clip-comment adds intent reason', () => {
    const snapshot = makeIntentSnapshot({ intent: 'clip-comment' })
    const input = makeInput({
      intentSnapshot: snapshot,
      selectionContext: 'comment',
      pageType: 'unknown',
    })
    const draft = buildCommentSelectionDraft(input)
    expect(draft.reasons.some((r) => r === 'intent=clip-comment')).toBe(true)
  })

  it('intentSnapshot clip-video-comment adds intent reason', () => {
    const snapshot = makeIntentSnapshot({ intent: 'clip-video-comment' })
    const input = makeInput({
      intentSnapshot: snapshot,
      selectionContext: 'comment',
      pageType: 'video',
    })
    const draft = buildCommentSelectionDraft(input)
    expect(draft.reasons.some((r) => r === 'intent=clip-video-comment')).toBe(true)
  })

  it('intentSnapshot clip-ai-answer adds intent reason', () => {
    const snapshot = makeIntentSnapshot({ intent: 'clip-ai-answer' })
    const input = makeInput({
      intentSnapshot: snapshot,
      selectionContext: 'ai-answer',
      pageType: 'ai-answer',
    })
    const draft = buildCommentSelectionDraft(input)
    expect(draft.reasons.some((r) => r === 'intent=clip-ai-answer')).toBe(true)
  })

  it('does not exceed 5 reasons', () => {
    const snapshot = makeIntentSnapshot({
      intent: 'clip-comment',
      reasons: ['r1', 'r2', 'r3', 'r4'],
    })
    const input = makeInput({
      intentSnapshot: snapshot,
      selectionContext: 'comment',
      pageType: 'forum-or-comment',
    })
    const draft = buildCommentSelectionDraft(input)
    expect(draft.reasons.length).toBeLessThanOrEqual(5)
  })
})
