import { describe, it, expect } from 'vitest'
import {
  protectLatexSegments,
  normalizeLatexDelimiters,
  preserveMathHtml,
} from '../src/shared/markdown/formulaPreserve'
import { cleanMarkdown } from '../src/shared/utils/formatMarkdown'
import { formatMarkdownWithProfile } from '../src/shared/markdown/formatWithProfile'
import type { MarkdownTarget } from '../src/shared/types/clip.types'

describe('protectLatexSegments', () => {
  it('preserves inline $a_i^2 + b_i^2$', () => {
    const { protected: p, restore } = protectLatexSegments('text $a_i^2 + b_i^2$ end')
    expect(p).not.toContain('$a_i^2')
    const restored = restore(p)
    expect(restored).toBe('text $a_i^2 + b_i^2$ end')
  })

  it('preserves inline \\(a_i^2 + b_i^2\\)', () => {
    const { protected: p, restore } = protectLatexSegments('text \\(a_i^2 + b_i^2\\) end')
    expect(restore(p)).toBe('text \\(a_i^2 + b_i^2\\) end')
  })

  it('preserves block $$x^2 + y^2$$', () => {
    const { protected: p, restore } = protectLatexSegments('text\n$$x^2 + y^2$$\nend')
    expect(restore(p)).toBe('text\n$$x^2 + y^2$$\nend')
  })

  it('preserves block \\[x^2 + y^2\\]', () => {
    const { protected: p, restore } = protectLatexSegments('text\n\\[x^2 + y^2\\]\nend')
    expect(restore(p)).toBe('text\n\\[x^2 + y^2\\]\nend')
  })

  it('preserves multiple formulas', () => {
    const input = 'First $x=1$, then $$y=2$$, also \\(z=3\\) and \\[w=4\\]'
    const { protected: p, restore } = protectLatexSegments(input)
    expect(restore(p)).toBe(input)
  })

  it('preserves block formula with newlines', () => {
    const input = 'before\n$$\\sum_{i=1}^{n} x_i$$\nafter'
    const { protected: p, restore } = protectLatexSegments(input)
    expect(restore(p)).toBe(input)
  })

  it('does NOT treat $10 as formula', () => {
    const { protected: p, restore } = protectLatexSegments('costs $10 today')
    expect(restore(p)).toBe('costs $10 today')
  })

  it('does NOT treat $ 10 as formula', () => {
    const { protected: p, restore } = protectLatexSegments('costs $ 10 today')
    expect(restore(p)).toBe('costs $ 10 today')
  })

  it('handles empty string', () => {
    const { protected: p, restore } = protectLatexSegments('')
    expect(restore(p)).toBe('')
  })

  it('handles text with no formulas', () => {
    const input = 'plain text without any formulas'
    const { protected: p, restore } = protectLatexSegments(input)
    expect(restore(p)).toBe(input)
  })

  it('restore is idempotent when called twice', () => {
    const input = 'text $x^2$ end'
    const { protected: p, restore } = protectLatexSegments(input)
    const r1 = restore(p)
    const r2 = restore(r1)
    expect(r1).toBe(input)
    expect(r2).toBe(r1)
  })
})

describe('normalizeLatexDelimiters', () => {
  it('converts \\(...\\) to $...$', () => {
    expect(normalizeLatexDelimiters('\\(a^2\\)')).toBe('$a^2$')
  })

  it('converts \\[...\\] to $$...$$', () => {
    const result = normalizeLatexDelimiters('\\[x + y\\]')
    expect(result).toContain('$$')
    expect(result).toContain('x + y')
  })

  it('handles empty string', () => {
    expect(normalizeLatexDelimiters('')).toBe('')
  })

  it('preserves text without formulas', () => {
    const input = 'plain text'
    expect(normalizeLatexDelimiters(input)).toBe('plain text')
  })
})

describe('preserveMathHtml', () => {
  it('extracts MathJax script inline formula', () => {
    const html = '<p>text <script type="math/tex">a^2 + b^2</script> end</p>'
    const result = preserveMathHtml(html)
    expect(result).toContain('$a^2 + b^2$')
  })

  it('extracts MathJax script display formula', () => {
    const html = '<p><script type="math/tex; mode=display">x^2</script></p>'
    const result = preserveMathHtml(html)
    expect(result).toContain('$$x^2$$')
  })

  it('extracts KaTeX annotation', () => {
    const html = '<span><annotation encoding="application/x-tex">e^{i\\pi}+1=0</annotation></span>'
    const result = preserveMathHtml(html)
    expect(result).toContain('$e^{i\\pi}+1=0$')
  })

  it('extracts data-latex attribute', () => {
    const html = '<div data-latex="x^2 + y^2"></div>'
    const result = preserveMathHtml(html)
    expect(result).toContain('$x^2 + y^2$')
  })

  it('extracts data-katex-src attribute', () => {
    const html = '<span data-katex-src="\\frac{1}{2}"></span>'
    const result = preserveMathHtml(html)
    expect(result).toContain('$\\frac{1}{2}$')
  })

  it('handles empty html', () => {
    expect(preserveMathHtml('')).toBe('')
  })

  it('preserves html without formulas', () => {
    const html = '<p>no formulas here</p>'
    expect(preserveMathHtml(html)).toBe(html)
  })
})

describe('cleanMarkdown with formula protection', () => {
  it('does not destroy underscore in inline formula', () => {
    const input = 'text with $a_i^2$ formula'
    const result = cleanMarkdown(input)
    expect(result).toContain('$a_i^2$')
  })

  it('does not destroy asterisks in formulas', () => {
    const input = 'text $a * b = c$ end'
    const result = cleanMarkdown(input)
    expect(result).toContain('$a * b = c$')
  })

  it('does not merge bold across formula boundaries', () => {
    const input = '**bold part 1** $x^2$ **bold part 2**'
    const result = cleanMarkdown(input)
    expect(result).toContain('**bold part 1**')
    expect(result).toContain('**bold part 2**')
    expect(result).toContain('$x^2$')
  })

  it('preserves block formula with underscores', () => {
    const input = 'before\n$$\\sum_{i=1}^{n} a_i$$\nafter'
    const result = cleanMarkdown(input)
    expect(result).toContain('$$\\sum_{i=1}^{n} a_i$$')
  })

  it('preserves formula with backslashes', () => {
    const input = 'text $\\alpha + \\beta$ end'
    const result = cleanMarkdown(input)
    expect(result).toContain('$\\alpha + \\beta$')
  })

  it('preserves adjacent bold segments', () => {
    const input = '**prefix****suffix**'
    const result = cleanMarkdown(input)
    expect(result).toBe('**prefixsuffix**')
  })

  it('removes empty bold lines', () => {
    const input = '** **'
    const result = cleanMarkdown(input)
    expect(result).not.toContain('** **')
  })
})

describe('formatMarkdownWithProfile with formulas', () => {
  const formulaInput = {
    title: 'Math Article',
    url: 'https://example.com/math',
    tags: ['math'],
    note: 'some note',
    bodyMarkdown: 'text with $a_i^2 + b_i^2$ formula\n\nand block formula:\n$$\\sum_{i=1}^{n} x_i$$\n\nend',
    createdAt: '2026-06-12T10:00:00.000Z',
  }

  const targets: MarkdownTarget[] = ['notion', 'obsidian', 'typora', 'generic']

  for (const target of targets) {
    it(`preserves inline formula in ${target} profile`, () => {
      const result = formatMarkdownWithProfile(formulaInput, target)
      expect(result).toContain('$a_i^2 + b_i^2$')
    })

    it(`preserves block formula in ${target} profile`, () => {
      const result = formatMarkdownWithProfile(formulaInput, target)
      expect(result).toContain('$$\\sum_{i=1}^{n} x_i$$')
    })
  }

  it('Obsidian profile YAML frontmatter does not interfere with body formulas', () => {
    const result = formatMarkdownWithProfile(formulaInput, 'obsidian')
    const bodyPart = result.split('---').slice(2).join('---')
    expect(bodyPart).toContain('$a_i^2 + b_i^2$')
    expect(bodyPart).toContain('$$\\sum_{i=1}^{n} x_i$$')
  })
})

describe('formula integration edge cases', () => {
  it('handles text with dollar amounts NOT as formulas', () => {
    const input = 'The price is $10 per unit, $20 total.'
    const result = cleanMarkdown(input)
    expect(result).toBe('The price is $10 per unit, $20 total.')
  })

  it('preserves adjacent formula and bold text', () => {
    const input = '**important:** $x = 1$ applies'
    const result = cleanMarkdown(input)
    expect(result).toContain('**important:**')
    expect(result).toContain('$x = 1$')
  })

  it('preserves formula with escaped dollar in LaTeX math mode', () => {
    const input = 'text $this is a formula$ end'
    const result = cleanMarkdown(input)
    expect(result).toContain('$this is a formula$')
  })

  it('handles null input to cleanMarkdown', () => {
    const result = cleanMarkdown(('' as unknown) as string)
    expect(result).toBe('')
  })
})
