import { describe, it, expect } from 'vitest'
import type { PageType } from '../src/shared/utils/pageTypeDetector'
import type { SelectionContext } from '../src/content/intent'
import type { CommentSelectionDraft } from '../src/content/commentSelection'
import {
  escapeMarkdownText,
  formatCommentSelectionMarkdown,
} from '../src/content/commentSelection'

function makeDraft(overrides: Partial<CommentSelectionDraft> = {}): CommentSelectionDraft {
  return {
    title: 'Test Page',
    url: 'https://example.com/page',
    domain: 'example.com',
    pageType: 'article' as PageType,
    mode: 'selection-generic',
    selectionContext: 'article' as SelectionContext,
    selectedTextLength: 100,
    markdown: '## Selected Content\n\nThis is the selected text.',
    reasons: ['selection-first'],
    ...overrides,
  }
}

// ============= escapeMarkdownText =============

describe('escapeMarkdownText', () => {
  it('escapes backslash', () => {
    expect(escapeMarkdownText('a\\b')).toBe('a\\\\b')
  })

  it('escapes asterisk', () => {
    expect(escapeMarkdownText('*bold*')).toBe('\\*bold\\*')
  })

  it('escapes underscore', () => {
    expect(escapeMarkdownText('_italic_')).toBe('\\_italic\\_')
  })

  it('escapes backtick', () => {
    expect(escapeMarkdownText('`code`')).toBe('\\`code\\`')
  })

  it('escapes square brackets', () => {
    expect(escapeMarkdownText('[link]')).toBe('\\[link\\]')
  })

  it('escapes parentheses', () => {
    expect(escapeMarkdownText('(text)')).toBe('\\(text\\)')
  })

  it('escapes curly braces', () => {
    expect(escapeMarkdownText('{text}')).toBe('\\{text\\}')
  })

  it('escapes angle brackets', () => {
    expect(escapeMarkdownText('<tag>')).toBe('\\<tag\\>')
  })

  it('escapes hash', () => {
    expect(escapeMarkdownText('# heading')).toBe('\\# heading')
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
    expect(escapeMarkdownText('!important')).toBe('\\!important')
  })

  it('escapes pipe', () => {
    expect(escapeMarkdownText('a|b')).toBe('a\\|b')
  })

  it('escapes tilde', () => {
    expect(escapeMarkdownText('~strike~')).toBe('\\~strike\\~')
  })

  it('handles empty string', () => {
    expect(escapeMarkdownText('')).toBe('')
  })

  it('handles Chinese text without escaping', () => {
    const text = '你好世界'
    expect(escapeMarkdownText(text)).toBe(text)
  })

  it('handles mixed text', () => {
    const result = escapeMarkdownText('Hello *world*!')
    expect(result).toBe('Hello \\*world\\*\\!')
  })

  it('handles multiple special chars in sequence', () => {
    const result = escapeMarkdownText('**__')
    expect(result).toBe('\\*\\*\\_\\_')
  })
})

// ============= formatCommentSelectionMarkdown =============

describe('formatCommentSelectionMarkdown', () => {
  it('outputs title as H1', () => {
    const draft = makeDraft({ title: 'My Page' })
    const md = formatCommentSelectionMarkdown(draft)
    expect(md).toContain('# My Page')
  })

  it('outputs Source URL', () => {
    const draft = makeDraft()
    const md = formatCommentSelectionMarkdown(draft)
    expect(md).toContain('https://example.com/page')
  })

  it('outputs pageType', () => {
    const draft = makeDraft({ pageType: 'forum-or-comment' })
    const md = formatCommentSelectionMarkdown(draft)
    expect(md).toContain('forum-or-comment')
  })

  it('outputs selectionContext', () => {
    const draft = makeDraft({ selectionContext: 'comment' })
    const md = formatCommentSelectionMarkdown(draft)
    expect(md).toContain('comment')
  })

  it('outputs selectedTextLength as number', () => {
    const draft = makeDraft({ selectedTextLength: 256 })
    const md = formatCommentSelectionMarkdown(draft)
    expect(md).toContain('256')
  })

  it('comment-selection outputs warning', () => {
    const draft = makeDraft({
      mode: 'comment-selection',
      selectionContext: 'comment',
      warning: 'Current selection is in a comment-related area.',
    })
    const md = formatCommentSelectionMarkdown(draft)
    expect(md).toContain('comment')
    expect(md).toContain('area')
  })

  it('forum-selection outputs warning with forum mention', () => {
    const draft = makeDraft({
      mode: 'forum-selection',
      selectionContext: 'comment',
      pageType: 'forum-or-comment',
      warning: 'Current selection is in a forum/thread area.',
    })
    const md = formatCommentSelectionMarkdown(draft)
    expect(md).toContain('forum')
  })

  it('video-comment-selection outputs warning', () => {
    const draft = makeDraft({
      mode: 'video-comment-selection',
      selectionContext: 'comment',
      pageType: 'video',
      warning: 'Current selection may be from the video comment area.',
    })
    const md = formatCommentSelectionMarkdown(draft)
    expect(md).toContain('video comment')
  })

  it('ai-answer-selection outputs warning with AI mention', () => {
    const draft = makeDraft({
      mode: 'ai-answer-selection',
      selectionContext: 'ai-answer',
      pageType: 'ai-answer',
      warning: 'Current selection may be from an AI conversation area.',
    })
    const md = formatCommentSelectionMarkdown(draft)
    expect(md).toContain('AI')
    expect(md).toContain('conversation')
  })

  it('selection-generic does not force comment warning', () => {
    const draft = makeDraft({
      mode: 'selection-generic',
      selectionContext: 'article',
      pageType: 'article',
      warning: undefined,
    })
    const md = formatCommentSelectionMarkdown(draft)
    expect(md).not.toContain('> **Note**:')
  })

  it('markdown contains user-selected content', () => {
    const draft = makeDraft({
      markdown: '## User Content\n\nHello World',
    })
    const md = formatCommentSelectionMarkdown(draft)
    expect(md).toContain('## User Content')
    expect(md).toContain('Hello World')
  })

  it('markdown does not contain DOM references', () => {
    const draft = makeDraft()
    const md = formatCommentSelectionMarkdown(draft)
    expect(md).not.toContain('innerHTML')
    expect(md).not.toContain('outerHTML')
    expect(md).not.toContain('<html>')
    expect(md).not.toContain('<body>')
  })

  it('outputs siteProfileId when present', () => {
    const draft = makeDraft({ siteProfileId: 'zhihu-community' })
    const md = formatCommentSelectionMarkdown(draft)
    expect(md).toContain('zhihu')
    expect(md).toContain('community')
  })

  it('does not output siteProfileId line when absent', () => {
    const draft = makeDraft({ siteProfileId: undefined })
    const md = formatCommentSelectionMarkdown(draft)
    expect(md).not.toContain('- Site:')
  })

  it('outputs reasons (up to 5)', () => {
    const draft = makeDraft({
      reasons: ['selection-first', 'context=comment', 'intent=clip-comment'],
    })
    const md = formatCommentSelectionMarkdown(draft)
    expect(md).toContain('selection')
    expect(md).toContain('context')
    expect(md).toContain('comment')
    expect(md).toContain('clip')
  })

  it('does not output more than 5 reasons', () => {
    const draft = makeDraft({
      reasons: ['r1', 'r2', 'r3', 'r4', 'r5', 'r6'],
    })
    const md = formatCommentSelectionMarkdown(draft)
    expect(md).not.toContain('r6')
  })

  it('escapes title with special chars', () => {
    const draft = makeDraft({ title: 'Test *Page* [link]' })
    const md = formatCommentSelectionMarkdown(draft)
    expect(md).toContain('Test \\*Page\\* \\[link\\]')
  })

  it('escapes warning with special chars', () => {
    const draft = makeDraft({
      mode: 'comment-selection',
      warning: 'Warning *with* markdown',
    })
    const md = formatCommentSelectionMarkdown(draft)
    expect(md).toContain('\\*with\\*')
  })

  it('escapes reason text', () => {
    const draft = makeDraft({
      reasons: ['context=comment*with*star'],
    })
    const md = formatCommentSelectionMarkdown(draft)
    expect(md).toContain('\\*with\\*')
  })

  it('contextLabel is escaped in output', () => {
    const draft = makeDraft({
      mode: 'comment-selection',
      selectionContext: 'comment',
      contextLabel: 'comment *area*',
    })
    const md = formatCommentSelectionMarkdown(draft)
    expect(md).toContain('\\*area\\*')
  })

  it('handles empty markdown content', () => {
    const draft = makeDraft({ markdown: '' })
    const md = formatCommentSelectionMarkdown(draft)
    expect(md).toBeDefined()
  })

  it('handles empty reasons', () => {
    const draft = makeDraft({ reasons: [] })
    const md = formatCommentSelectionMarkdown(draft)
    expect(md).toBeDefined()
  })
})

// ============= safety checks =============

describe('comment selection markdown safety', () => {
  it('serializer is pure - no chrome API', () => {
    const src = formatCommentSelectionMarkdown.toString()
    expect(src).not.toContain('chrome.')
  })

  it('serializer does not access storage', () => {
    const src = formatCommentSelectionMarkdown.toString()
    expect(src).not.toContain('storage')
  })

  it('serializer does not access document', () => {
    const src = formatCommentSelectionMarkdown.toString()
    expect(src).not.toContain('document')
  })

  it('serializer does not access network', () => {
    const src = formatCommentSelectionMarkdown.toString()
    expect(src).not.toContain('fetch(')
    expect(src).not.toContain('XMLHttpRequest')
  })

  it('markdown output does not contain full DOM', () => {
    const draft = makeDraft()
    const md = formatCommentSelectionMarkdown(draft)
    expect(md).not.toContain('<!DOCTYPE')
    expect(md).not.toContain('<html')
    expect(md).not.toContain('<head>')
    expect(md).not.toContain('<script')
    expect(md).not.toContain('<style')
  })

  it('markdown output does not contain settings or message request', () => {
    const draft = makeDraft()
    const md = formatCommentSelectionMarkdown(draft)
    expect(md).not.toContain('settings')
    expect(md).not.toContain('message request')
  })

  it('markdown output does not contain token or API key fields', () => {
    const draft = makeDraft()
    const md = formatCommentSelectionMarkdown(draft)
    expect(md).not.toContain('token')
    expect(md).not.toContain('api_key')
    expect(md).not.toContain('pageId')
  })
})
