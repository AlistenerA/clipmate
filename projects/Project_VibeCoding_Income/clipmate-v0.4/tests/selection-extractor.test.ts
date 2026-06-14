import { describe, it, expect, vi, afterEach } from 'vitest'
import { JSDOM } from 'jsdom'
import { getSelectionText } from '../src/content/selection/getSelectionText'
import { getSelectionHtml } from '../src/content/selection/getSelectionHtml'
import { extractSelection, normalizeSelectionHtml } from '../src/content/extractors/selectionExtractor'

function setupDom(bodyHtml: string): { dom: JSDOM; doc: Document } {
  const dom = new JSDOM(
    `<!DOCTYPE html><html><body>${bodyHtml}</body></html>`,
    { url: 'https://example.com/' },
  )
  const doc = dom.window.document
  return { dom, doc }
}

function mockSelection(doc: Document, text: string, html?: string): void {
  const range = doc.createRange()
  range.selectNodeContents(doc.body)
  const sel = {
    isCollapsed: text.length === 0,
    rangeCount: text.length > 0 ? 1 : 0,
    toString: () => text,
    getRangeAt: (_idx: number) => {
      const r = doc.createRange()
      r.selectNodeContents(doc.body)
      const originalClone = r.cloneContents.bind(r)
      r.cloneContents = () => {
        if (html === undefined) return originalClone()
        if (html === '') return doc.createDocumentFragment()
        const div = doc.createElement('div')
        div.innerHTML = html
        return div
      }
      return r
    },
  } as unknown as Selection
  vi.stubGlobal('window', { ...globalThis.window, getSelection: () => sel })
}

function mockNoSelection(): void {
  const sel = { isCollapsed: true, rangeCount: 0, toString: () => '' } as unknown as Selection
  vi.stubGlobal('window', { ...globalThis.window, getSelection: () => sel })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('getSelectionText', () => {
  it('returns trimmed text for normal selection', () => {
    const { doc } = setupDom('<p id="target">Hello World</p>')
    mockSelection(doc, 'Hello World')
    expect(getSelectionText()).toBe('Hello World')
  })

  it('returns null when no selection exists', () => {
    setupDom('<p>text</p>')
    mockNoSelection()
    expect(getSelectionText()).toBeNull()
  })

  it('strips zero-width space characters', () => {
    const { doc } = setupDom('<p id="t">text</p>')
    mockSelection(doc, 'text\u200Bwith\u200Bzwsp')
    expect(getSelectionText()).toBe('textwithzwsp')
  })

  it('strips zero-width non-joiner and other invisible chars', () => {
    const { doc } = setupDom('<p id="t">text</p>')
    mockSelection(doc, '\u200B\u200C\u200Dtext\uFEFF')
    expect(getSelectionText()).toBe('text')
  })

  it('returns null when text is only zero-width chars', () => {
    const { doc } = setupDom('<p id="t">zw</p>')
    mockSelection(doc, '\u200B\u200B\u200B')
    expect(getSelectionText()).toBeNull()
  })

  it('returns null when text is only whitespace', () => {
    const { doc } = setupDom('<p id="t">ws</p>')
    mockSelection(doc, '   \n  \t  ')
    expect(getSelectionText()).toBeNull()
  })
})

describe('getSelectionHtml', () => {
  it('returns inner HTML for a selection', () => {
    const { doc } = setupDom('<p id="t"><strong>bold</strong> text</p>')
    mockSelection(doc, 'bold text', '<strong>bold</strong> text')
    const html = getSelectionHtml()
    expect(html).not.toBeNull()
    expect(html).toContain('bold')
  })

  it('returns null when no selection', () => {
    setupDom('<p>text</p>')
    mockNoSelection()
    expect(getSelectionHtml()).toBeNull()
  })

  it('returns null for empty result from cloneContents', () => {
    const { doc } = setupDom('<div id="t"></div>')
    mockSelection(doc, '', '')
    expect(getSelectionHtml()).toBeNull()
  })
})

describe('extractSelection', () => {
  it('returns text and html for valid selection', () => {
    const { doc } = setupDom('<p id="t">Hello World</p>')
    mockSelection(doc, 'Hello World', '<p>Hello World</p>')
    const result = extractSelection()
    expect(result).not.toBeNull()
    expect(result!.text).toBe('Hello World')
    expect(result!.html).toContain('Hello')
  })

  it('returns null when no selection text', () => {
    setupDom('<p>text</p>')
    mockNoSelection()
    expect(extractSelection()).toBeNull()
  })

  it('falls back to wrapping text in p when html extraction returns empty', () => {
    const { doc } = setupDom('<p id="t">Simple content</p>')
    mockSelection(doc, 'Simple content', '')
    const result = extractSelection()
    expect(result).not.toBeNull()
    expect(result!.text).toBe('Simple content')
    expect(result!.html).toContain('<p>Simple content</p>')
  })
})

describe('normalizeSelectionHtml', () => {
  it('wraps plain text in p tag', () => {
    expect(normalizeSelectionHtml('Plain text here')).toBe('<p>Plain text here</p>')
  })

  it('preserves html that starts with block element', () => {
    expect(normalizeSelectionHtml('<p>Already wrapped</p>')).toBe('<p>Already wrapped</p>')
  })

  it('adds p wrapper for text with leading whitespace before tag', () => {
    expect(normalizeSelectionHtml('  text <span>before tag</span>')).toBe('<p>text</p><span>before tag</span>')
  })

  it('returns unchanged for empty string', () => {
    expect(normalizeSelectionHtml('')).toBe('')
  })

  it('preserves div as block start', () => {
    expect(normalizeSelectionHtml('<div class="x">content</div>')).toBe('<div class="x">content</div>')
  })

  it('preserves h1 as block start', () => {
    expect(normalizeSelectionHtml('<h1>Title</h1>')).toBe('<h1>Title</h1>')
  })
})
