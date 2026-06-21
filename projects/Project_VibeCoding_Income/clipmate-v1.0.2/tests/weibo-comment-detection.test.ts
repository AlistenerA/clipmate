import { describe, it, expect } from 'vitest'
import { JSDOM } from 'jsdom'
import type { PageType } from '../src/shared/utils/pageTypeDetector'
import type { SelectionContext } from '../src/content/intent'
import { detectCommentSelectionMode } from '../src/content/commentSelection'
import type { CommentSelectionInput } from '../src/content/commentSelection/commentSelection.types'

function makeInput(overrides: Partial<CommentSelectionInput> = {}): CommentSelectionInput {
  return {
    title: 'Test Page',
    url: 'https://weibo.com/status/12345',
    pageType: 'forum-or-comment' as PageType,
    selectionText: 'selected comment text',
    selectionContext: 'unknown' as SelectionContext,
    ...overrides,
  }
}

describe('detectCommentSelectionMode on Weibo', () => {
  it('unknown + forum-or-comment → comment-selection (CSS Modules fallback)', () => {
    const input = makeInput({
      selectionContext: 'unknown',
      pageType: 'forum-or-comment',
    })
    expect(detectCommentSelectionMode(input)).toBe('comment-selection')
  })

  it('comment + forum-or-comment → forum-selection (existing behavior)', () => {
    const input = makeInput({
      selectionContext: 'comment',
      pageType: 'forum-or-comment',
    })
    expect(detectCommentSelectionMode(input)).toBe('forum-selection')
  })

  it('unknown + article → selection-generic (no change)', () => {
    const input = makeInput({
      selectionContext: 'unknown',
      pageType: 'article',
    })
    expect(detectCommentSelectionMode(input)).toBe('selection-generic')
  })

  it('unknown + video → selection-generic (no change)', () => {
    const input = makeInput({
      selectionContext: 'unknown',
      pageType: 'video',
    })
    expect(detectCommentSelectionMode(input)).toBe('selection-generic')
  })

  it('unknown + search-results → selection-generic (no change)', () => {
    const input = makeInput({
      selectionContext: 'unknown',
      pageType: 'search-results',
    })
    expect(detectCommentSelectionMode(input)).toBe('selection-generic')
  })

  it('unknown + ai-answer → ai-answer-selection (existing behavior)', () => {
    const input = makeInput({
      selectionContext: 'unknown',
      pageType: 'ai-answer',
    })
    expect(detectCommentSelectionMode(input)).toBe('ai-answer-selection')
  })

  it('article + forum-or-comment → selection-generic (explicit article context)', () => {
    const input = makeInput({
      selectionContext: 'article',
      pageType: 'forum-or-comment',
    })
    expect(detectCommentSelectionMode(input)).toBe('selection-generic')
  })

  it('undefined selectionContext + forum-or-comment → comment-selection', () => {
    const input = makeInput({
      selectionContext: undefined,
      pageType: 'forum-or-comment',
    })
    expect(detectCommentSelectionMode(input)).toBe('comment-selection')
  })

  it('undefined selectionContext + article → selection-generic', () => {
    const input = makeInput({
      selectionContext: undefined,
      pageType: 'article',
    })
    expect(detectCommentSelectionMode(input)).toBe('selection-generic')
  })
})
