import { describe, it, expect } from 'vitest'
import {
  isSafeLinkHref,
  isLikelyImageUrl,
  sanitizeMarkdownCell,
  normalizeImageMarkdown,
  normalizeLinkMarkdown,
  normalizeTableMarkdown,
} from '../src/shared/markdown/mediaLinkTableNormalizer'
import { htmlToMarkdown } from '../src/content/parser/htmlToMarkdown'

describe('isSafeLinkHref', () => {
  it('accepts https url', () => {
    expect(isSafeLinkHref('https://example.com')).toBe(true)
  })

  it('accepts http url', () => {
    expect(isSafeLinkHref('http://example.com')).toBe(true)
  })

  it('accepts mailto', () => {
    expect(isSafeLinkHref('mailto:test@example.com')).toBe(true)
  })

  it('accepts tel', () => {
    expect(isSafeLinkHref('tel:+1234567890')).toBe(true)
  })

  it('accepts relative path', () => {
    expect(isSafeLinkHref('/about')).toBe(true)
  })

  it('accepts anchor', () => {
    expect(isSafeLinkHref('#section')).toBe(true)
  })

  it('rejects javascript:', () => {
    expect(isSafeLinkHref('javascript:void(0)')).toBe(false)
  })

  it('rejects data:', () => {
    expect(isSafeLinkHref('data:text/html,hello')).toBe(false)
  })

  it('rejects void(0)', () => {
    expect(isSafeLinkHref('void(0)')).toBe(false)
  })

  it('rejects null', () => {
    expect(isSafeLinkHref(null)).toBe(false)
  })

  it('rejects undefined', () => {
    expect(isSafeLinkHref(undefined)).toBe(false)
  })

  it('rejects empty string', () => {
    expect(isSafeLinkHref('')).toBe(false)
  })
})

describe('isLikelyImageUrl', () => {
  it('accepts https image url', () => {
    expect(isLikelyImageUrl('https://example.com/img.png')).toBe(true)
  })

  it('accepts http image url', () => {
    expect(isLikelyImageUrl('http://example.com/img.png')).toBe(true)
  })

  it('accepts protocol-relative url', () => {
    expect(isLikelyImageUrl('//example.com/img.png')).toBe(true)
  })

  it('accepts root-relative path', () => {
    expect(isLikelyImageUrl('/images/img.png')).toBe(true)
  })

  it('accepts relative path', () => {
    expect(isLikelyImageUrl('../images/img.png')).toBe(true)
  })

  it('rejects data:image', () => {
    expect(isLikelyImageUrl('data:image/png;base64,abc')).toBe(false)
  })

  it('rejects javascript:', () => {
    expect(isLikelyImageUrl('javascript:void(0)')).toBe(false)
  })

  it('rejects null', () => {
    expect(isLikelyImageUrl(null)).toBe(false)
  })

  it('rejects undefined', () => {
    expect(isLikelyImageUrl(undefined)).toBe(false)
  })

  it('rejects empty string', () => {
    expect(isLikelyImageUrl('')).toBe(false)
  })
})

describe('sanitizeMarkdownCell', () => {
  it('escapes pipe character', () => {
    expect(sanitizeMarkdownCell('a|b')).toBe('a\\|b')
  })

  it('collapses newlines to spaces', () => {
    expect(sanitizeMarkdownCell('hello\nworld')).toBe('hello world')
  })

  it('collapses multiple spaces', () => {
    expect(sanitizeMarkdownCell('hello   world')).toBe('hello world')
  })

  it('trims whitespace', () => {
    expect(sanitizeMarkdownCell('  hello  ')).toBe('hello')
  })

  it('returns empty for empty input', () => {
    expect(sanitizeMarkdownCell('')).toBe('')
  })

  it('handles CRLF newlines', () => {
    expect(sanitizeMarkdownCell('a\r\nb')).toBe('a b')
  })
})

describe('normalizeImageMarkdown', () => {
  it('produces markdown image with alt and src', () => {
    expect(normalizeImageMarkdown({ src: 'https://example.com/img.png', alt: 'pic' }))
      .toBe('![pic](https://example.com/img.png)')
  })

  it('produces markdown image without alt', () => {
    expect(normalizeImageMarkdown({ src: 'https://example.com/img.png', alt: '' }))
      .toBe('![](https://example.com/img.png)')
  })

  it('includes caption as italic after image', () => {
    expect(normalizeImageMarkdown({ src: 'https://example.com/img.png', alt: 'pic', caption: 'A nice image' }))
      .toBe('![pic](https://example.com/img.png)\n*A nice image*')
  })

  it('skips caption when same as alt', () => {
    expect(normalizeImageMarkdown({ src: 'https://example.com/img.png', alt: 'same', caption: 'same' }))
      .toBe('![same](https://example.com/img.png)')
  })

  it('returns empty for missing src', () => {
    expect(normalizeImageMarkdown({ src: undefined, alt: '' })).toBe('')
  })

  it('returns alt text when src missing', () => {
    expect(normalizeImageMarkdown({ src: undefined, alt: 'missing image' }))
      .toBe('missing image')
  })

  it('returns empty for data:image src', () => {
    expect(normalizeImageMarkdown({ src: 'data:image/png;base64,abc', alt: 'x' })).toBe('x')
  })

  it('returns empty for javascript: src', () => {
    expect(normalizeImageMarkdown({ src: 'javascript:void(0)', alt: 'x' })).toBe('x')
  })

  it('escapes parentheses in src', () => {
    expect(normalizeImageMarkdown({ src: 'https://example.com/(1).png', alt: 'img' }))
      .toBe('![img](https://example.com/%281%29.png)')
  })
})

describe('normalizeLinkMarkdown', () => {
  it('produces markdown link with text and href', () => {
    expect(normalizeLinkMarkdown({ href: 'https://example.com', text: 'Click here' }))
      .toBe('[Click here](https://example.com)')
  })

  it('uses href as text when text is empty', () => {
    expect(normalizeLinkMarkdown({ href: 'https://example.com', text: '' }))
      .toBe('[https://example.com](https://example.com)')
  })

  it('strips javascript: href', () => {
    expect(normalizeLinkMarkdown({ href: 'javascript:void(0)', text: 'Click' }))
      .toBe('Click')
  })

  it('returns empty for javascript: without text', () => {
    expect(normalizeLinkMarkdown({ href: 'javascript:void(0)', text: '' })).toBe('')
  })

  it('preserves mailto link', () => {
    expect(normalizeLinkMarkdown({ href: 'mailto:test@example.com', text: 'Email' }))
      .toBe('[Email](mailto:test@example.com)')
  })

  it('preserves tel link', () => {
    expect(normalizeLinkMarkdown({ href: 'tel:+123', text: 'Call' }))
      .toBe('[Call](tel:+123)')
  })

  it('preserves relative path', () => {
    expect(normalizeLinkMarkdown({ href: '/about', text: 'About' }))
      .toBe('[About](/about)')
  })

  it('preserves anchor link', () => {
    expect(normalizeLinkMarkdown({ href: '#section', text: 'Section' }))
      .toBe('[Section](#section)')
  })

  it('collapses newlines in text', () => {
    expect(normalizeLinkMarkdown({ href: 'https://x.com', text: 'a\nb' }))
      .toBe('[a b](https://x.com)')
  })

  it('strips data: href', () => {
    expect(normalizeLinkMarkdown({ href: 'data:text/html,hello', text: 'Data' }))
      .toBe('Data')
  })
})

describe('normalizeTableMarkdown', () => {
  it('converts simple table with header', () => {
    const result = normalizeTableMarkdown({
      rows: [['Name', 'Value'], ['A', '1'], ['B', '2']],
      hasHeader: true,
    })
    expect(result).toBe(
      '| Name | Value |\n| --- | --- |\n| A | 1 |\n| B | 2 |',
    )
  })

  it('converts table without header', () => {
    const result = normalizeTableMarkdown({
      rows: [['A', '1'], ['B', '2']],
      hasHeader: false,
    })
    expect(result).toBe(
      '| Column 1 | Column 2 |\n| --- | --- |\n| A | 1 |\n| B | 2 |',
    )
  })

  it('escapes pipe in cell', () => {
    const result = normalizeTableMarkdown({
      rows: [['a|b', 'c']],
      hasHeader: true,
    })
    expect(result).toBe('| a\\|b | c |\n| --- | --- |')
  })

  it('collapses newlines in cells', () => {
    const result = normalizeTableMarkdown({
      rows: [['hello\nworld', 'test']],
      hasHeader: true,
    })
    expect(result).toBe('| hello world | test |\n| --- | --- |')
  })

  it('returns empty for empty rows', () => {
    expect(normalizeTableMarkdown({ rows: [] })).toBe('')
  })

  it('handles complex table with simplified output', () => {
    const result = normalizeTableMarkdown({
      rows: [['A', '1'], ['B', '2']],
      hasHeader: false,
      complex: true,
    })
    expect(result).toContain('表格已简化')
    expect(result).toContain('A | 1')
  })

  it('returns empty for complex empty table', () => {
    expect(normalizeTableMarkdown({ rows: [], complex: true })).toBe('')
  })

  it('handles uneven row lengths', () => {
    const result = normalizeTableMarkdown({
      rows: [['A', '1', 'extra'], ['B', '2']],
      hasHeader: false,
    })
    expect(result).toContain('| A | 1 | extra |')
    expect(result).toContain('| B | 2 |')
  })
})

describe('htmlToMarkdown - images', () => {
  it('converts img to markdown image', () => {
    const md = htmlToMarkdown('<img src="/img.png" alt="test" />')
    expect(md).toBe('![test](/img.png)')
  })

  it('uses data-src as fallback', () => {
    const md = htmlToMarkdown('<img data-src="/lazy.png" alt="lazy" />')
    expect(md).toBe('![lazy](/lazy.png)')
  })

  it('uses data-original as fallback', () => {
    const md = htmlToMarkdown('<img data-original="/orig.png" alt="orig" />')
    expect(md).toBe('![orig](/orig.png)')
  })

  it('converts figure with img and figcaption', () => {
    const md = htmlToMarkdown('<figure><img src="/img.png" alt="pic" /><figcaption>Caption text</figcaption></figure>')
    expect(md).toContain('![pic](/img.png)')
    expect(md).toContain('*Caption text*')
  })

  it('retains caption even when same as alt via figure rule', () => {
    const md = htmlToMarkdown('<figure><img src="/img.png" alt="same" /><figcaption>same</figcaption></figure>')
    expect(md).toContain('![same](/img.png)')
    expect(md).toContain('*same*')
  })

  it('handles img without src', () => {
    const md = htmlToMarkdown('<img alt="missing" />')
    expect(md).toBe('missing')
  })
})

describe('htmlToMarkdown - links', () => {
  it('converts anchor to markdown link', () => {
    const md = htmlToMarkdown('<a href="https://example.com">Visit</a>')
    expect(md).toBe('[Visit](https://example.com)')
  })

  it('strips javascript: href', () => {
    const md = htmlToMarkdown('<a href="javascript:void(0)">Click</a>')
    expect(md).toBe('Click')
  })

  it('preserves mailto link', () => {
    const md = htmlToMarkdown('<a href="mailto:a@b.com">Email</a>')
    expect(md).toBe('[Email](mailto:a@b.com)')
  })

  it('uses href as text when empty', () => {
    const md = htmlToMarkdown('<a href="/about"></a>')
    expect(md).toBe('[/about](/about)')
  })
})

describe('htmlToMarkdown - tables', () => {
  it('converts simple table to markdown table', () => {
    const html = '<table><thead><tr><th>A</th><th>B</th></tr></thead><tbody><tr><td>1</td><td>2</td></tr></tbody></table>'
    const md = htmlToMarkdown(html)
    expect(md).toContain('| A | B |')
    expect(md).toContain('| --- | --- |')
    expect(md).toContain('| 1 | 2 |')
  })

  it('handles table with colspan as complex', () => {
    const html = '<table><tr><td>A</td><td colspan="2">BC</td></tr></table>'
    const md = htmlToMarkdown(html)
    expect(md).toContain('表格已简化')
  })

  it('returns empty for empty table', () => {
    const html = '<table></table>'
    const md = htmlToMarkdown(html)
    expect(md).toBe('')
  })

  it('handles table without thead', () => {
    const html = '<table><tr><td>A</td><td>B</td></tr><tr><td>1</td><td>2</td></tr></table>'
    const md = htmlToMarkdown(html)
    expect(md).toContain('| Column 1 | Column 2 |')
    expect(md).toContain('| A | B |')
  })

  it('handles table with th as header', () => {
    const html = '<table><tr><th>Name</th><th>Value</th></tr><tr><td>X</td><td>10</td></tr></table>'
    const md = htmlToMarkdown(html)
    expect(md).toContain('| Name | Value |')
    expect(md).toContain('| X | 10 |')
  })

  it('collapses cell newlines', () => {
    const html = '<table><tr><td>hello<br>world</td></tr></table>'
    const md = htmlToMarkdown(html)
    expect(md).toContain('hello world')
  })

  it('escapes pipe in cell', () => {
    const html = '<table><tr><td>x|y</td></tr></table>'
    const md = htmlToMarkdown(html)
    expect(md).toContain('x\\|y')
  })
})

describe('htmlToMarkdown - compatibility with formula and code block', () => {
  it('preserves LaTeX in markdown with images', () => {
    const md = htmlToMarkdown('<p>$E=mc^2$</p><img src="/img.png" alt="formula" />')
    expect(md).toContain('$E=mc^2$')
    expect(md).toContain('![formula](/img.png)')
  })

  it('preserves code blocks with links', () => {
    const md = htmlToMarkdown('<pre><code>const x = 1</code></pre><a href="/docs">Docs</a>')
    expect(md).toContain('```')
    expect(md).toContain('const x = 1')
    expect(md).toContain('[Docs](/docs)')
  })

  it('strips trailing digits after block formula', () => {
    const md = htmlToMarkdown('<span data-latex="\\begin{bmatrix}a&b\\\\c&d\\end{bmatrix}">rendered matrix</span>3')
    expect(md).toContain('\\begin{bmatrix}')
    expect(md).toContain('\\end{bmatrix}')
    expect(md).not.toMatch(/\$\$[\s\S]*?\$\$3/)
  })
})

describe('normalizeImageMarkdown - edge cases', () => {
  it('handles undefined input gracefully', () => {
    expect(normalizeImageMarkdown({})).toBe('')
  })

  it('handles empty caption', () => {
    expect(normalizeImageMarkdown({ src: '/a.png', alt: 'x', caption: '' }))
      .toBe('![x](/a.png)')
  })

  it('handles whitespace-only caption', () => {
    expect(normalizeImageMarkdown({ src: '/a.png', alt: 'x', caption: '  ' }))
      .toBe('![x](/a.png)')
  })
})

describe('normalizeLinkMarkdown - edge cases', () => {
  it('handles undefined inputs', () => {
    expect(normalizeLinkMarkdown({})).toBe('')
  })

  it('handles href without text', () => {
    expect(normalizeLinkMarkdown({ href: 'https://x.com' }))
      .toBe('[https://x.com](https://x.com)')
  })

  it('handles text without href', () => {
    expect(normalizeLinkMarkdown({ text: 'plain text' })).toBe('plain text')
  })
})

describe('normalizeTableMarkdown - edge cases', () => {
  it('handles single row table', () => {
    const result = normalizeTableMarkdown({
      rows: [['single']],
      hasHeader: true,
    })
    expect(result).toBe('| single |\n| --- |')
  })

  it('handles header-only table', () => {
    const result = normalizeTableMarkdown({
      rows: [['H1', 'H2']],
      hasHeader: true,
    })
    expect(result).toBe('| H1 | H2 |\n| --- | --- |')
  })

  it('handles empty strings in cells', () => {
    const result = normalizeTableMarkdown({
      rows: [['', 'B'], ['C', '']],
      hasHeader: false,
    })
    expect(result).toContain('|  | B |')
    expect(result).toContain('| C |  |')
  })
})
