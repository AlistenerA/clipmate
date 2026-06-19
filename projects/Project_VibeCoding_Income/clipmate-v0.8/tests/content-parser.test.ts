import { describe, it, expect } from 'vitest'
import { JSDOM } from 'jsdom'
import { cleanDocument } from '../src/content/parser/contentCleaner'
import { parseMetadata, extractSiteIconUrl, extractThemeColor, resolveIconUrl } from '../src/content/parser/metaParser'
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

describe('resolveIconUrl', () => {
  it('resolves absolute URL as-is', () => {
    expect(resolveIconUrl('https://example.com/icon.png', 'https://other.com')).toBe('https://example.com/icon.png')
  })

  it('resolves relative path against base URL', () => {
    expect(resolveIconUrl('/favicon.ico', 'https://example.com')).toBe('https://example.com/favicon.ico')
  })

  it('resolves relative path without leading slash', () => {
    expect(resolveIconUrl('images/icon.png', 'https://example.com/page/')).toBe('https://example.com/page/images/icon.png')
  })

  it('returns undefined for invalid URL', () => {
    expect(resolveIconUrl('', '')).toBeUndefined()
  })
})

describe('extractThemeColor', () => {
  it('extracts theme-color meta tag', () => {
    const dom = new JSDOM(`<!DOCTYPE html><html><head>
      <meta name="theme-color" content="#ff6600">
    </head><body></body></html>`)
    expect(extractThemeColor(dom.window.document)).toBe('#ff6600')
  })

  it('returns undefined when no theme-color meta tag', () => {
    const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body></body></html>`)
    expect(extractThemeColor(dom.window.document)).toBeUndefined()
  })
})

describe('extractSiteIconUrl', () => {
  it('extracts standard rel=icon', () => {
    const dom = new JSDOM(`<!DOCTYPE html><html><head>
      <link rel="icon" href="https://example.com/favicon.ico">
    </head><body></body></html>`)
    expect(extractSiteIconUrl(dom.window.document, 'https://example.com')).toBe('https://example.com/favicon.ico')
  })

  it('prefers apple-touch-icon over icon', () => {
    const dom = new JSDOM(`<!DOCTYPE html><html><head>
      <link rel="icon" href="/icon.ico">
      <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    </head><body></body></html>`)
    const result = extractSiteIconUrl(dom.window.document, 'https://example.com')
    expect(result).toBe('https://example.com/apple-touch-icon.png')
  })

  it('prefers icon over shortcut icon', () => {
    const dom = new JSDOM(`<!DOCTYPE html><html><head>
      <link rel="shortcut icon" href="/shortcut.ico">
      <link rel="icon" href="/icon.png">
    </head><body></body></html>`)
    const result = extractSiteIconUrl(dom.window.document, 'https://site.com')
    expect(result).toBe('https://site.com/icon.png')
  })

  it('resolves relative icon path to absolute', () => {
    const dom = new JSDOM(`<!DOCTYPE html><html><head>
      <link rel="icon" href="/images/favicon.png">
    </head><body></body></html>`)
    const result = extractSiteIconUrl(dom.window.document, 'https://news.cn')
    expect(result).toBe('https://news.cn/images/favicon.png')
  })

  it('falls back to /favicon.ico when no link icon defined', () => {
    const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body></body></html>`)
    const result = extractSiteIconUrl(dom.window.document, 'https://example.com/page')
    expect(result).toBe('https://example.com/favicon.ico')
  })

  it('uses baseURI over pageUrl when available', () => {
    const dom = new JSDOM(`<!DOCTYPE html><html><head>
      <base href="https://cdn.example.com/">
      <link rel="icon" href="favicon.ico">
    </head><body></body></html>`)
    const result = extractSiteIconUrl(dom.window.document, 'https://example.com')
    expect(result).toBe('https://cdn.example.com/favicon.ico')
  })

  it('does not throw for invalid href', () => {
    const dom = new JSDOM(`<!DOCTYPE html><html><head>
      <link rel="icon" href="">
    </head><body></body></html>`)
    const result = extractSiteIconUrl(dom.window.document, 'https://example.com')
    expect(result).toBe('https://example.com/favicon.ico')
  })

  it('includes siteIconUrl in parseMetadata result', () => {
    const dom = new JSDOM(`<!DOCTYPE html><html><head>
      <link rel="icon" href="/favicon.ico">
    </head><body></body></html>`, { url: 'https://example.com/page' })
    const meta = parseMetadata(dom.window.document)
    expect(meta.siteIconUrl).toBe('https://example.com/favicon.ico')
  })

  it('extracts mask-icon when no higher-priority icon found', () => {
    const dom = new JSDOM(`<!DOCTYPE html><html><head>
      <link rel="mask-icon" href="/mask-icon.svg">
    </head><body></body></html>`)
    const result = extractSiteIconUrl(dom.window.document, 'https://example.com')
    expect(result).toBe('https://example.com/mask-icon.svg')
  })
})
