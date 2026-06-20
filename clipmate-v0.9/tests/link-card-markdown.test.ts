import { describe, it, expect } from 'vitest'
import {
  escapeMarkdownText,
  formatLinkCardMarkdown,
} from '../src/shared/linkCard/linkCardMarkdown'
import type { LinkCardDraft } from '../src/shared/linkCard/linkCard.types'

function makeDraft(overrides?: Partial<LinkCardDraft>): LinkCardDraft {
  return {
    title: 'Test Page',
    url: 'https://example.com/article',
    domain: 'example.com',
    source: 'current-page',
    reasons: ['source=current-page', 'domain=example.com'],
    ...overrides,
  }
}

describe('escapeMarkdownText', () => {
  it('escapes backslash', () => {
    expect(escapeMarkdownText('a\\b')).toBe('a\\\\b')
  })

  it('escapes asterisk', () => {
    expect(escapeMarkdownText('a*b')).toBe('a\\*b')
  })

  it('escapes underscore', () => {
    expect(escapeMarkdownText('a_b')).toBe('a\\_b')
  })

  it('escapes backtick', () => {
    expect(escapeMarkdownText('a`b')).toBe('a\\`b')
  })

  it('escapes square brackets', () => {
    expect(escapeMarkdownText('a[b]')).toBe('a\\[b\\]')
  })

  it('escapes curly braces', () => {
    expect(escapeMarkdownText('a{b}')).toBe('a\\{b\\}')
  })

  it('escapes angle brackets', () => {
    expect(escapeMarkdownText('a<b>')).toBe('a\\<b\\>')
  })

  it('escapes hash', () => {
    expect(escapeMarkdownText('a#b')).toBe('a\\#b')
  })

  it('escapes plus', () => {
    expect(escapeMarkdownText('a+b')).toBe('a\\+b')
  })

  it('escapes dash', () => {
    expect(escapeMarkdownText('a-b')).toBe('a\\-b')
  })

  it('escapes dot', () => {
    expect(escapeMarkdownText('a.b')).toBe('a\\.b')
  })

  it('escapes exclamation mark', () => {
    expect(escapeMarkdownText('a!b')).toBe('a\\!b')
  })

  it('escapes pipe', () => {
    expect(escapeMarkdownText('a|b')).toBe('a\\|b')
  })

  it('escapes tilde', () => {
    expect(escapeMarkdownText('a~b')).toBe('a\\~b')
  })

  it('returns empty string for empty input', () => {
    expect(escapeMarkdownText('')).toBe('')
  })

  it('handles Chinese characters without escape', () => {
    expect(escapeMarkdownText('中文测试')).toBe('中文测试')
  })

  it('handles mixed content', () => {
    expect(escapeMarkdownText('Hello *World* 你好')).toBe('Hello \\*World\\* 你好')
  })

  it('escapes dots in URLs', () => {
    const result = escapeMarkdownText('https://example.com')
    expect(result).toBe('https://example\\.com')
  })
})

describe('formatLinkCardMarkdown', () => {
  it('outputs title as H3', () => {
    const md = formatLinkCardMarkdown(makeDraft())
    expect(md).toContain('### Test Page')
  })

  it('outputs Source URL', () => {
    const md = formatLinkCardMarkdown(makeDraft())
    expect(md).toContain('- Source: https://example.com/article')
  })

  it('outputs Domain', () => {
    const md = formatLinkCardMarkdown(makeDraft())
    expect(md).toContain('- Domain: example\\.com')
  })

  it('outputs Type', () => {
    const md = formatLinkCardMarkdown(makeDraft())
    expect(md).toContain('- Type: current-page')
  })

  it('outputs description as blockquote when present', () => {
    const draft = makeDraft({ description: 'A test description' })
    const md = formatLinkCardMarkdown(draft)
    expect(md).toContain('> A test description')
  })

  it('does not output empty blockquote when no description', () => {
    const md = formatLinkCardMarkdown(makeDraft())
    expect(md).not.toContain('>')
  })

  it('outputs Page type when present', () => {
    const md = formatLinkCardMarkdown(makeDraft({ pageType: 'article' }))
    expect(md).toContain('- Page type: article')
  })

  it('does not output Page type when absent', () => {
    const md = formatLinkCardMarkdown(makeDraft())
    expect(md).not.toContain('Page type')
  })

  it('outputs Site profile when present', () => {
    const md = formatLinkCardMarkdown(makeDraft({ siteProfileId: 'google-search' }))
    expect(md).toContain('google\\-search')
  })

  it('does not output Site profile when absent', () => {
    const md = formatLinkCardMarkdown(makeDraft())
    expect(md).not.toContain('Site profile')
  })

  it('outputs Icon when present', () => {
    const md = formatLinkCardMarkdown(makeDraft({ siteIconUrl: 'https://example.com/icon.png' }))
    expect(md).toContain('- Icon: https://example.com/icon.png')
  })

  it('does not output Icon when absent', () => {
    const md = formatLinkCardMarkdown(makeDraft())
    expect(md).not.toContain('Icon:')
  })

  it('outputs Theme color when present', () => {
    const md = formatLinkCardMarkdown(makeDraft({ themeColor: '#ff6600' }))
    expect(md).toContain('- Theme color: #ff6600')
  })

  it('does not output Theme color when absent', () => {
    const md = formatLinkCardMarkdown(makeDraft())
    expect(md).not.toContain('Theme color')
  })

  it('outputs warning when present', () => {
    const md = formatLinkCardMarkdown(makeDraft({ warning: 'Unsafe source' }))
    expect(md).toContain('Unsafe source')
  })

  it('escapes title special characters', () => {
    const md = formatLinkCardMarkdown(makeDraft({ title: 'Hello *World*' }))
    expect(md).toContain('### Hello \\*World\\*')
  })

  it('escapes description special characters', () => {
    const md = formatLinkCardMarkdown(makeDraft({ description: 'a_b' }))
    expect(md).toContain('> a\\_b')
  })

  it('does not escape URL in Source line', () => {
    const md = formatLinkCardMarkdown(makeDraft())
    expect(md).toContain('- Source: https://example.com/article')
  })

  it('escapes domain with dots', () => {
    const md = formatLinkCardMarkdown(makeDraft({ domain: 'sub.example.com' }))
    expect(md).toContain('sub\\.example\\.com')
  })

  it('outputs reasons', () => {
    const md = formatLinkCardMarkdown(makeDraft())
    expect(md).toContain('source=current')
    expect(md).toContain('domain=example')
  })

  it('limits reasons to 5', () => {
    const draft = makeDraft({
      reasons: ['r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7'],
    })
    const md = formatLinkCardMarkdown(draft)
    expect(md).toContain('r1')
    expect(md).toContain('r5')
    expect(md).not.toContain('r6')
  })
})

describe('formatLinkCardMarkdown safety checks', () => {
  it('does not contain contentText', () => {
    const md = formatLinkCardMarkdown(makeDraft())
    expect(md).not.toContain('contentText')
  })

  it('does not contain selectedText', () => {
    const md = formatLinkCardMarkdown(makeDraft())
    expect(md).not.toContain('selectedText')
  })

  it('does not contain commentBody', () => {
    const md = formatLinkCardMarkdown(makeDraft())
    expect(md).not.toContain('commentBody')
  })

  it('does not contain fullHtml', () => {
    const md = formatLinkCardMarkdown(makeDraft())
    expect(md).not.toContain('fullHtml')
  })

  it('does not contain fullText', () => {
    const md = formatLinkCardMarkdown(makeDraft())
    expect(md).not.toContain('fullText')
  })

  it('does not contain settings', () => {
    const md = formatLinkCardMarkdown(makeDraft())
    expect(md).not.toContain('settings')
  })

  it('does not contain request', () => {
    const md = formatLinkCardMarkdown(makeDraft())
    expect(md).not.toContain('request')
  })

  it('is a pure string function', () => {
    const d1 = makeDraft({ title: 'A' })
    const d2 = makeDraft({ title: 'B' })
    const r1 = formatLinkCardMarkdown(d1)
    const r2 = formatLinkCardMarkdown(d2)
    expect(r1).not.toBe(r2)
  })
})
