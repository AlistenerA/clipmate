import { describe, it, expect } from 'vitest'
import { JSDOM } from 'jsdom'
import {
  extractDomain,
  normalizeThemeColor,
  isSafeIconUrl,
  normalizeIconUrl,
  extractSiteVisualMetadata,
} from '../src/shared/siteVisual/siteVisualExtractor'
import type { SiteVisualExtractInput } from '../src/shared/siteVisual/siteVisual.types'

describe('extractDomain', () => {
  it('returns hostname from full URL', () => {
    expect(extractDomain('https://example.com/page')).toBe('example.com')
  })

  it('returns hostname with subdomain', () => {
    expect(extractDomain('https://blog.example.com/article')).toBe('blog.example.com')
  })

  it('returns hostname without path', () => {
    expect(extractDomain('https://example.com')).toBe('example.com')
  })

  it('returns empty string for empty input', () => {
    expect(extractDomain('')).toBe('')
  })

  it('returns empty string for invalid URL', () => {
    expect(extractDomain('not a valid url')).toBe('')
  })
})

describe('normalizeThemeColor', () => {
  it('accepts #fff hex', () => {
    expect(normalizeThemeColor('#fff')).toBe('#fff')
  })

  it('accepts #ffffff hex and lowercases', () => {
    expect(normalizeThemeColor('#FF6600')).toBe('#ff6600')
  })

  it('accepts 6-digit hex', () => {
    expect(normalizeThemeColor('#ff6600')).toBe('#ff6600')
  })

  it('accepts rgb(r,g,b)', () => {
    expect(normalizeThemeColor('rgb(255, 100, 50)')).toBe('rgb(255, 100, 50)')
  })

  it('accepts rgba(r,g,b,a)', () => {
    expect(normalizeThemeColor('rgba(255, 100, 50, 0.5)')).toBe('rgba(255, 100, 50, 0.5)')
  })

  it('accepts hsl(h,s%,l%)', () => {
    expect(normalizeThemeColor('hsl(240, 100%, 50%)')).toBe('hsl(240, 100%, 50%)')
  })

  it('accepts hsla(h,s%,l%,a)', () => {
    expect(normalizeThemeColor('hsla(240, 100%, 50%, 0.5)')).toBe('hsla(240, 100%, 50%, 0.5)')
  })

  it('rejects javascript: protocol', () => {
    expect(normalizeThemeColor('javascript:alert(1)')).toBeUndefined()
  })

  it('rejects data: URL', () => {
    expect(normalizeThemeColor('data:text/html,<script>alert(1)</script>')).toBeUndefined()
  })

  it('rejects url() expressions', () => {
    expect(normalizeThemeColor('url(http://evil.com)')).toBeUndefined()
  })

  it('rejects expression() CSS', () => {
    expect(normalizeThemeColor('expression(alert(1))')).toBeUndefined()
  })

  it('rejects null input', () => {
    expect(normalizeThemeColor(null)).toBeUndefined()
  })

  it('rejects undefined input', () => {
    expect(normalizeThemeColor(undefined)).toBeUndefined()
  })

  it('rejects empty string', () => {
    expect(normalizeThemeColor('')).toBeUndefined()
  })

  it('rejects whitespace-only', () => {
    expect(normalizeThemeColor('   ')).toBeUndefined()
  })

  it('rejects overly long values', () => {
    expect(normalizeThemeColor('#'.repeat(130))).toBeUndefined()
  })

  it('rejects plain color name', () => {
    expect(normalizeThemeColor('blue')).toBeUndefined()
  })

  it('rejects calc() expressions', () => {
    expect(normalizeThemeColor('calc(100% - 20px)')).toBeUndefined()
  })

  it('rejects var() expressions', () => {
    expect(normalizeThemeColor('var(--theme-color)')).toBeUndefined()
  })

  it('trims whitespace before validation', () => {
    expect(normalizeThemeColor('  #fff  ')).toBe('#fff')
  })
})

describe('isSafeIconUrl', () => {
  it('accepts https URL', () => {
    expect(isSafeIconUrl('https://example.com/icon.png')).toBe(true)
  })

  it('accepts http URL', () => {
    expect(isSafeIconUrl('http://example.com/icon.png')).toBe(true)
  })

  it('accepts absolute path', () => {
    expect(isSafeIconUrl('/favicon.ico')).toBe(true)
  })

  it('accepts relative path', () => {
    expect(isSafeIconUrl('images/icon.png')).toBe(true)
  })

  it('accepts parent directory relative path', () => {
    expect(isSafeIconUrl('../favicon.ico')).toBe(true)
  })

  it('rejects javascript: protocol', () => {
    expect(isSafeIconUrl('javascript:void(0)')).toBe(false)
  })

  it('rejects data: protocol', () => {
    expect(isSafeIconUrl('data:image/png;base64,abc')).toBe(false)
  })

  it('rejects blob: protocol', () => {
    expect(isSafeIconUrl('blob:https://example.com/uuid')).toBe(false)
  })

  it('rejects chrome: protocol', () => {
    expect(isSafeIconUrl('chrome://settings')).toBe(false)
  })

  it('rejects edge: protocol', () => {
    expect(isSafeIconUrl('edge://settings')).toBe(false)
  })

  it('rejects about: protocol', () => {
    expect(isSafeIconUrl('about:blank')).toBe(false)
  })

  it('rejects file: protocol', () => {
    expect(isSafeIconUrl('file:///C:/icon.ico')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(isSafeIconUrl('')).toBe(false)
  })

  it('rejects vbscript: protocol', () => {
    expect(isSafeIconUrl('vbscript:msgbox(1)')).toBe(false)
  })
})

describe('normalizeIconUrl', () => {
  it('resolves absolute https URL', () => {
    expect(normalizeIconUrl('https://example.com/icon.png', 'https://other.com')).toBe('https://example.com/icon.png')
  })

  it('resolves relative path to absolute', () => {
    expect(normalizeIconUrl('/favicon.ico', 'https://example.com')).toBe('https://example.com/favicon.ico')
  })

  it('resolves relative path without leading slash', () => {
    expect(normalizeIconUrl('images/icon.png', 'https://example.com/page/')).toBe('https://example.com/page/images/icon.png')
  })

  it('returns undefined for javascript: protocol', () => {
    expect(normalizeIconUrl('javascript:void(0)', 'https://example.com')).toBeUndefined()
  })

  it('returns undefined for data: protocol', () => {
    expect(normalizeIconUrl('data:image/png;base64,abc', 'https://example.com')).toBeUndefined()
  })

  it('returns undefined for blob: protocol', () => {
    expect(normalizeIconUrl('blob:https://example.com/uuid', 'https://example.com')).toBeUndefined()
  })

  it('returns undefined for chrome: protocol', () => {
    expect(normalizeIconUrl('chrome://settings', 'https://example.com')).toBeUndefined()
  })

  it('returns undefined for edge: protocol', () => {
    expect(normalizeIconUrl('edge://settings', 'https://example.com')).toBeUndefined()
  })

  it('returns undefined for about: protocol', () => {
    expect(normalizeIconUrl('about:blank', 'https://example.com')).toBeUndefined()
  })

  it('returns undefined for file: protocol', () => {
    expect(normalizeIconUrl('file:///C:/icon.ico', 'https://example.com')).toBeUndefined()
  })

  it('returns undefined for empty href', () => {
    expect(normalizeIconUrl('', '')).toBeUndefined()
  })

  it('returns undefined for non-http custom protocol', () => {
    expect(normalizeIconUrl('ftp://example.com/icon.png', 'https://example.com')).toBeUndefined()
  })
})

function makeDom(headHtml: string, pageUrl = 'https://example.com'): Document {
  const dom = new JSDOM(`<!DOCTYPE html><html><head>${headHtml}</head><body></body></html>`, {
    url: pageUrl,
  })
  return dom.window.document
}

describe('extractSiteVisualMetadata', () => {
  it('extracts domain from pageUrl', () => {
    const input: SiteVisualExtractInput = { document: makeDom(''), pageUrl: 'https://example.com/page' }
    const result = extractSiteVisualMetadata(input)
    expect(result.domain).toBe('example.com')
  })

  it('extracts link rel icon', () => {
    const input: SiteVisualExtractInput = {
      document: makeDom('<link rel="icon" href="https://example.com/favicon.ico">'),
      pageUrl: 'https://example.com',
    }
    const result = extractSiteVisualMetadata(input)
    expect(result.siteIconUrl).toBe('https://example.com/favicon.ico')
    expect(result.source).toBe('document')
  })

  it('prefers apple-touch-icon over icon', () => {
    const input: SiteVisualExtractInput = {
      document: makeDom(`
        <link rel="icon" href="/icon.ico">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">
      `),
      pageUrl: 'https://example.com',
    }
    const result = extractSiteVisualMetadata(input)
    expect(result.siteIconUrl).toBe('https://example.com/apple-touch-icon.png')
  })

  it('prefers icon over shortcut icon', () => {
    const html = `
        <link rel="shortcut icon" href="/shortcut.ico">
        <link rel="icon" href="/icon.png">
      `
    const input: SiteVisualExtractInput = {
      document: makeDom(html, 'https://site.com'),
      pageUrl: 'https://site.com',
    }
    const result = extractSiteVisualMetadata(input)
    expect(result.siteIconUrl).toBe('https://site.com/icon.png')
  })

  it('falls back to /favicon.ico when no link icon', () => {
    const input: SiteVisualExtractInput = {
      document: makeDom(''),
      pageUrl: 'https://example.com/page',
    }
    const result = extractSiteVisualMetadata(input)
    expect(result.siteIconUrl).toBe('https://example.com/favicon.ico')
  })

  it('extracts meta theme-color', () => {
    const input: SiteVisualExtractInput = {
      document: makeDom('<meta name="theme-color" content="#ff6600">'),
      pageUrl: 'https://example.com',
    }
    const result = extractSiteVisualMetadata(input)
    expect(result.themeColor).toBe('#ff6600')
  })

  it('rejects unsafe icon URL in link', () => {
    const input: SiteVisualExtractInput = {
      document: makeDom('<link rel="icon" href="javascript:void(0)">'),
      pageUrl: 'https://example.com',
    }
    const result = extractSiteVisualMetadata(input)
    expect(result.siteIconUrl).toBe('https://example.com/favicon.ico')
  })

  it('rejects data: icon URL in link', () => {
    const input: SiteVisualExtractInput = {
      document: makeDom('<link rel="icon" href="data:image/png;base64,abc">'),
      pageUrl: 'https://example.com',
    }
    const result = extractSiteVisualMetadata(input)
    expect(result.siteIconUrl).toBe('https://example.com/favicon.ico')
  })

  it('returns undefined themeColor for invalid value', () => {
    const input: SiteVisualExtractInput = {
      document: makeDom('<meta name="theme-color" content="javascript:alert(1)">'),
      pageUrl: 'https://example.com',
    }
    const result = extractSiteVisualMetadata(input)
    expect(result.themeColor).toBeUndefined()
  })

  it('returns undefined themeColor for url() value', () => {
    const input: SiteVisualExtractInput = {
      document: makeDom('<meta name="theme-color" content="url(http://evil.com)">'),
      pageUrl: 'https://example.com',
    }
    const result = extractSiteVisualMetadata(input)
    expect(result.themeColor).toBeUndefined()
  })

  it('returns updatedAt as ISO string', () => {
    const input: SiteVisualExtractInput = { document: makeDom(''), pageUrl: 'https://example.com' }
    const result = extractSiteVisualMetadata(input)
    expect(result.updatedAt).toBeTruthy()
    expect(new Date(result.updatedAt).getTime()).not.toBeNaN()
  })

  it('handles missing both icon and theme-color gracefully', () => {
    const input: SiteVisualExtractInput = { document: makeDom(''), pageUrl: 'https://test.com' }
    const result = extractSiteVisualMetadata(input)
    expect(result.domain).toBe('test.com')
    expect(result.siteIconUrl).toBe('https://test.com/favicon.ico')
    expect(result.themeColor).toBeUndefined()
    expect(result.source).toBe('document')
  })

  it('handles empty pageUrl gracefully', () => {
    const input: SiteVisualExtractInput = { document: makeDom(''), pageUrl: '' }
    const result = extractSiteVisualMetadata(input)
    expect(result.domain).toBe('')
    expect(result.siteIconUrl).toBeUndefined()
  })

  it('does not use fetch or XMLHttpRequest', () => {
    const source = String(extractSiteVisualMetadata)
    expect(source).not.toContain('fetch(')
    expect(source).not.toContain('XMLHttpRequest')
  })

  it('does not access chrome.storage', () => {
    const source = String(extractSiteVisualMetadata)
    expect(source).not.toContain('chrome.storage')
  })

  it('does not save full DOM or body content', () => {
    const input: SiteVisualExtractInput = {
      document: makeDom('<meta name="theme-color" content="#ff6600"><link rel="icon" href="/icon.png">'),
      pageUrl: 'https://example.com',
    }
    const result = extractSiteVisualMetadata(input)
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('innerHTML')
    expect(serialized).not.toContain('outerHTML')
    expect(serialized).not.toContain('textContent')
  })
})
