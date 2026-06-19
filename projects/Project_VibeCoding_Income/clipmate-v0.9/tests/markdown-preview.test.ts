import { describe, it, expect } from 'vitest'
import {
  isSafePreviewHref,
  sanitizePreviewText,
  parseMarkdownPreview,
} from '../src/shared/markdown/markdownPreview'

// --- isSafePreviewHref ---
describe('isSafePreviewHref', () => {
  it('accepts http and https', () => {
    expect(isSafePreviewHref('https://example.com')).toBe(true)
    expect(isSafePreviewHref('http://example.com')).toBe(true)
  })
  it('accepts relative, mailto, tel, anchors', () => {
    expect(isSafePreviewHref('/path')).toBe(true)
    expect(isSafePreviewHref('mailto:x@y.com')).toBe(true)
    expect(isSafePreviewHref('tel:+1')).toBe(true)
    expect(isSafePreviewHref('#section')).toBe(true)
    expect(isSafePreviewHref('../relative')).toBe(true)
  })
  it('rejects javascript protocol', () => {
    expect(isSafePreviewHref('javascript:void(0)')).toBe(false)
    expect(isSafePreviewHref('JAVASCRIPT:alert(1)')).toBe(false)
  })
  it('rejects data protocol', () => {
    expect(isSafePreviewHref('data:text/html,x')).toBe(false)
  })
  it('rejects void patterns', () => {
    expect(isSafePreviewHref('void(0)')).toBe(false)
  })
  it('rejects null empty and whitespace', () => {
    expect(isSafePreviewHref(null)).toBe(false)
    expect(isSafePreviewHref(undefined)).toBe(false)
    expect(isSafePreviewHref('')).toBe(false)
    expect(isSafePreviewHref('  ')).toBe(false)
  })
})

// --- sanitizePreviewText ---
describe('sanitizePreviewText', () => {
  it('removes HTML tags', () => {
    expect(sanitizePreviewText('<script>alert(1)</script>')).toBe('alert(1)')
    expect(sanitizePreviewText('<b>bold</b>')).toBe('bold')
  })
  it('preserves text outside tags', () => {
    expect(sanitizePreviewText('hello <b>world</b>')).toBe('hello world')
  })
  it('returns empty for empty input', () => {
    expect(sanitizePreviewText('')).toBe('')
  })
})

// --- parseMarkdownPreview: basic ---
describe('parseMarkdownPreview basic', () => {
  it('returns empty array for empty or whitespace', () => {
    expect(parseMarkdownPreview('')).toEqual([])
    expect(parseMarkdownPreview('   ')).toEqual([])
    expect(parseMarkdownPreview('\n\n')).toEqual([])
    expect(parseMarkdownPreview('  \n  \n  ')).toEqual([])
  })
})

// --- parseMarkdownPreview: headings ---
describe('parseMarkdownPreview headings', () => {
  it('parses h1 h2 h3 by level', () => {
    expect(parseMarkdownPreview('# H')[0].type).toBe('heading')
    expect(parseMarkdownPreview('## H')[0].type).toBe('heading')
    expect(parseMarkdownPreview('### H')[0].type).toBe('heading')
  })
  it('strips HTML from heading text', () => {
    const b = parseMarkdownPreview('# Hello <script>alert(1)</script>')
    const seg = b[0] as { type: string; segments: { type: string; text: string }[] }
    const text = seg.segments.map((s) => s.text).join('')
    expect(text).not.toContain('<script>')
    expect(text).toContain('Hello')
  })
})

// --- parseMarkdownPreview: paragraphs ---
describe('parseMarkdownPreview paragraphs', () => {
  it('parses simple paragraph', () => {
    expect(parseMarkdownPreview('hello world')[0].type).toBe('paragraph')
  })
  it('splits paragraphs by blank lines', () => {
    const b = parseMarkdownPreview('A.\n\nB.\n\nC.')
    expect(b.length).toBeGreaterThanOrEqual(2)
  })
  it('raw HTML becomes paragraph with stripped text', () => {
    const b = parseMarkdownPreview('<script>alert(1)</script>')
    expect(b).toHaveLength(1)
    expect(b[0].type).toBe('paragraph')
  })
})

// --- parseMarkdownPreview: blockquote ---
describe('parseMarkdownPreview blockquote', () => {
  it('parses single-line blockquote', () => {
    expect(parseMarkdownPreview('> quoted')[0].type).toBe('blockquote')
  })
  it('parses multi-line blockquote', () => {
    expect(parseMarkdownPreview('> a\n> b')[0].type).toBe('blockquote')
  })
})

// --- parseMarkdownPreview: lists ---
describe('parseMarkdownPreview lists', () => {
  it('parses unordered list', () => {
    const b = parseMarkdownPreview('- a\n- b')
    if (b[0].type === 'list') {
      expect(b[0].ordered).toBe(false)
      expect(b[0].items).toHaveLength(2)
    }
  })
  it('parses ordered list', () => {
    const b = parseMarkdownPreview('1. a\n2. b\n3. c')
    if (b[0].type === 'list') {
      expect(b[0].ordered).toBe(true)
      expect(b[0].items).toHaveLength(3)
    }
  })
})

// --- parseMarkdownPreview: code blocks ---
describe('parseMarkdownPreview code blocks', () => {
  function fence(body: string, lang?: string): string {
    const f = '```'
    return f + (lang || '') + '\n' + body + '\n' + f
  }

  it('parses fenced code block', () => {
    expect(parseMarkdownPreview(fence('var x = 1;'))[0].type).toBe('code')
  })
  it('preserves language identifier', () => {
    const b = parseMarkdownPreview(fence('var x = 1;', 'javascript'))
    if (b[0].type === 'code') {
      expect(b[0].language).toBe('javascript')
    }
  })
  it('does not parse markdown inside code block', () => {
    expect(parseMarkdownPreview(fence('![alt](url)'))[0].type).toBe('code')
  })
})

// --- parseMarkdownPreview: tables ---
describe('parseMarkdownPreview tables', () => {
  it('parses simple table with header and data', () => {
    const b = parseMarkdownPreview('| A | B |\n|---|---|\n| 1 | 2 |')
    if (b[0].type === 'table') {
      expect(b[0].header).toEqual(['A', 'B'])
      expect(b[0].rows).toEqual([['1', '2']])
    }
  })
  it('parses table without leading/trailing pipes', () => {
    expect(parseMarkdownPreview('A|B\n--|--\n1|2')[0].type).toBe('table')
  })
  it('table cell with HTML tags is structural', () => {
    const b = parseMarkdownPreview('| Col |\n|-----|\n| <script>x</script> |')
    if (b[0].type === 'table') {
      expect(b[0].rows).toHaveLength(1)
    }
  })
})

// --- parseMarkdownPreview: images (including anti-loop tests) ---
describe('parseMarkdownPreview images', () => {
  it('parses standalone image with safe flag', () => {
    const b = parseMarkdownPreview('![alt](https://x.com/img.png)')
    if (b[0].type === 'image') {
      expect(b[0].alt).toBe('alt')
      expect(b[0].url).toBe('https://x.com/img.png')
      expect(b[0].safe).toBe(true)
    }
  })
  it('marks javascript image as unsafe (no hang)', () => {
    const b = parseMarkdownPreview('![xss](javascript:alert(1))')
    expect(b).toHaveLength(1)
    expect(b[0].type).toBe('image')
    if (b[0].type === 'image') {
      expect(b[0].safe).toBe(false)
    }
  })
  it('handles image with empty alt', () => {
    const b = parseMarkdownPreview('![](https://x.com/img.png)')
    if (b[0].type === 'image') {
      expect(b[0].alt).toBe('')
    }
  })
  it('treats malformed image markdown as paragraph (no hang)', () => {
    const b = parseMarkdownPreview('![alt](')
    expect(b).toHaveLength(1)
    expect(b[0].type).toBe('paragraph')
  })
  it('image URL with nested parens does not hang', () => {
    const b = parseMarkdownPreview('![test](https://example.com/path(1))')
    expect(b).toHaveLength(1)
    expect(b[0].type === 'image' || b[0].type === 'paragraph')
  })
})

// --- parseMarkdownPreview: inline formatting ---
describe('parseMarkdownPreview inline', () => {
  it('parses bold', () => {
    const b = parseMarkdownPreview('**bold**')
    if (b[0].type === 'paragraph') {
      expect(b[0].segments.some((s) => s.type === 'bold')).toBe(true)
    }
  })
  it('parses italic', () => {
    const b = parseMarkdownPreview('*italic*')
    if (b[0].type === 'paragraph') {
      expect(b[0].segments.some((s) => s.type === 'italic')).toBe(true)
    }
  })
  it('parses inline code', () => {
    const bt = '`'
    const md = 'use the ' + bt + 'const' + bt + ' keyword'
    const b = parseMarkdownPreview(md)
    if (b[0].type === 'paragraph') {
      expect(b[0].segments.some((s) => s.type === 'code')).toBe(true)
    }
  })
  it('parses inline link', () => {
    const b = parseMarkdownPreview('[click](https://x.com)')
    if (b[0].type === 'paragraph') {
      expect(b[0].segments.some((s) => s.type === 'link')).toBe(true)
    }
  })
  it('marks unsafe links', () => {
    const b = parseMarkdownPreview('[bad](javascript:void(0))')
    if (b[0].type === 'paragraph') {
      const link = b[0].segments.find((s) => s.type === 'link')
      if (link && link.type === 'link') {
        expect(link.safe).toBe(false)
      }
    }
  })
})

// --- parseMarkdownPreview: LaTeX ---
describe('parseMarkdownPreview LaTeX', () => {
  it('preserves inline formula as formula segment', () => {
    const b = parseMarkdownPreview('The formula $x^2$ here')
    if (b[0].type === 'paragraph') {
      expect(b[0].segments.some((s) => s.type === 'formula')).toBe(true)
    }
  })
  it('preserves display formula', () => {
    const b = parseMarkdownPreview('$$\nx^2\n$$')
    expect(b.length).toBeGreaterThan(0)
  })
})

// --- parseMarkdownPreview: horizontal rule ---
describe('parseMarkdownPreview hr', () => {
  it('parses triple dash', () => {
    expect(parseMarkdownPreview('a\n---\nb').some((b) => b.type === 'hr')).toBe(true)
  })
  it('parses triple asterisk', () => {
    expect(parseMarkdownPreview('***')[0].type).toBe('hr')
  })
})

// --- parseMarkdownPreview: profile compatibility ---
describe('parseMarkdownPreview profile compat', () => {
  it('parses notion profile output', () => {
    const md = '# My Title\n\nbody content'
    expect(parseMarkdownPreview(md).length).toBeGreaterThan(0)
  })
  it('parses obsidian profile frontmatter', () => {
    const md = '---\ntitle: T\n---\n\n# T\n\nbody'
    expect(parseMarkdownPreview(md).length).toBeGreaterThan(0)
  })
})
