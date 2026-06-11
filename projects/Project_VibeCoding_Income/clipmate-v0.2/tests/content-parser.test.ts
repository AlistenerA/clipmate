import { describe, it, expect } from 'vitest'
import { JSDOM } from 'jsdom'
import { cleanDocument } from '../src/content/parser/contentCleaner'
import { parseMetadata } from '../src/content/parser/metaParser'
import { ERROR_MESSAGES, DEFAULT_SETTINGS, STORAGE_KEYS } from '../src/shared/constants/defaults'

describe('contentCleaner', () => {
  it('removes script, style, noscript, iframe elements', () => {
    const dom = new JSDOM(`<!DOCTYPE html><html><body>
      <div>keep me</div>
      <script>alert('xss')</script>
      <style>.red{color:red}</style>
      <noscript>no js</noscript>
      <iframe src="https://example.com"></iframe>
    </body></html>`)

    cleanDocument(dom.window.document)

    expect(dom.window.document.querySelector('script')).toBeNull()
    expect(dom.window.document.querySelector('style')).toBeNull()
    expect(dom.window.document.querySelector('noscript')).toBeNull()
    expect(dom.window.document.querySelector('iframe')).toBeNull()
    expect(dom.window.document.querySelector('div')?.textContent).toBe('keep me')
  })

  it('handles pages with no elements to remove', () => {
    const dom = new JSDOM(`<!DOCTYPE html><html><body>
      <article><h1>Hello</h1><p>world</p></article>
    </body></html>`)

    cleanDocument(dom.window.document)

    expect(dom.window.document.querySelector('h1')?.textContent).toBe('Hello')
    expect(dom.window.document.querySelector('p')?.textContent).toBe('world')
  })

  it('handles multiple elements of the same type', () => {
    const dom = new JSDOM(`<!DOCTYPE html><html><body>
      <script>a</script>
      <script>b</script>
      <script>c</script>
      <p>survive</p>
    </body></html>`)

    cleanDocument(dom.window.document)

    expect(dom.window.document.querySelectorAll('script').length).toBe(0)
    expect(dom.window.document.querySelector('p')?.textContent).toBe('survive')
  })
})

describe('parseMetadata', () => {
  it('extracts standard title and description', () => {
    const dom = new JSDOM(`<!DOCTYPE html><html><head>
      <title>Test Page</title>
      <meta name="description" content="A test page description">
    </head><body></body></html>`)

    const meta = parseMetadata(dom.window.document)

    expect(meta.title).toBe('Test Page')
    expect(meta.description).toBe('A test page description')
  })

  it('prefers og:title over document title', () => {
    const dom = new JSDOM(`<!DOCTYPE html><html><head>
      <title>Document Title</title>
      <meta property="og:title" content="OG Title">
    </head><body></body></html>`)

    const meta = parseMetadata(dom.window.document)

    expect(meta.title).toBe('OG Title')
  })

  it('prefers og:description over meta description', () => {
    const dom = new JSDOM(`<!DOCTYPE html><html><head>
      <meta name="description" content="Meta desc">
      <meta property="og:description" content="OG desc">
    </head><body></body></html>`)

    const meta = parseMetadata(dom.window.document)

    expect(meta.description).toBe('OG desc')
  })

  it('extracts og:site_name', () => {
    const dom = new JSDOM(`<!DOCTYPE html><html><head>
      <meta property="og:site_name" content="Example Site">
    </head><body></body></html>`)

    const meta = parseMetadata(dom.window.document)

    expect(meta.siteName).toBe('Example Site')
  })

  it('returns empty strings when no metadata is present', () => {
    const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body></body></html>`)

    const meta = parseMetadata(dom.window.document)

    expect(meta.title).toBe('')
    expect(meta.description).toBe('')
    expect(meta.siteName).toBe('')
  })

  it('extracts URL from document', () => {
    const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body></body></html>`, {
      url: 'https://example.com/articles/123',
    })

    const meta = parseMetadata(dom.window.document)

    expect(meta.url).toBe('https://example.com/articles/123')
  })
})

describe('ERROR_MESSAGES', () => {
  it('has Chinese messages for known error codes', () => {
    expect(ERROR_MESSAGES.NO_SELECTION).toBe('请先选中页面文字后再提取')
    expect(ERROR_MESSAGES.EXTRACTION_FAILED).toBe('内容提取失败，请尝试全文模式')
  })
})

describe('DEFAULT_SETTINGS', () => {
  it('has empty token and page ID by default', () => {
    expect(DEFAULT_SETTINGS.notionToken).toBe('')
    expect(DEFAULT_SETTINGS.notionPageId).toBe('')
    expect(DEFAULT_SETTINGS.defaultTags).toEqual([])
    expect(DEFAULT_SETTINGS.saveHistoryEnabled).toBe(true)
  })
})

describe('STORAGE_KEYS', () => {
  it('defines prefixed storage keys', () => {
    expect(STORAGE_KEYS.SETTINGS).toBe('clipmate_settings')
    expect(STORAGE_KEYS.LAST_CLIP).toBe('clipmate_last_clip')
  })
})
