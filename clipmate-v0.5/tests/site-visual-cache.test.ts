import { describe, it, expect } from 'vitest'
import {
  SITE_VISUAL_CACHE_TTL_MS,
  shouldUseCachedSiteVisual,
  mergeSiteVisualWithCache,
  toSiteVisualCacheRecord,
} from '../src/shared/siteVisual/siteVisualCache'
import type { SiteVisualMetadata, SiteVisualCacheRecord } from '../src/shared/siteVisual/siteVisual.types'

function makeRecord(overrides?: Partial<SiteVisualCacheRecord>): SiteVisualCacheRecord {
  return {
    domain: 'example.com',
    siteIconUrl: 'https://example.com/icon.png',
    themeColor: '#ffffff',
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}

function makeMetadata(source: 'document' | 'cache' | 'fallback' = 'document'): SiteVisualMetadata {
  return {
    domain: 'example.com',
    siteIconUrl: 'https://example.com/icon.png',
    themeColor: '#ffffff',
    source,
    updatedAt: new Date().toISOString(),
  }
}

describe('shouldUseCachedSiteVisual', () => {
  it('returns true for valid non-expired record', () => {
    const record = makeRecord()
    expect(shouldUseCachedSiteVisual(record)).toBe(true)
  })

  it('returns false for undefined record', () => {
    expect(shouldUseCachedSiteVisual(undefined)).toBe(false)
  })

  it('returns false for record with missing updatedAt', () => {
    const record = makeRecord({ updatedAt: '' })
    expect(shouldUseCachedSiteVisual(record)).toBe(false)
  })

  it('returns false for expired record', () => {
    const past = new Date(Date.now() - SITE_VISUAL_CACHE_TTL_MS - 1000).toISOString()
    const record = makeRecord({ updatedAt: past })
    expect(shouldUseCachedSiteVisual(record)).toBe(false)
  })

  it('returns true for record at exact TTL boundary', () => {
    const past = new Date(Date.now() - SITE_VISUAL_CACHE_TTL_MS + 1000).toISOString()
    const record = makeRecord({ updatedAt: past })
    expect(shouldUseCachedSiteVisual(record)).toBe(true)
  })

  it('accepts explicit now parameter', () => {
    const past = new Date('2024-01-01').toISOString()
    const record = makeRecord({ updatedAt: past })
    const now = new Date('2024-01-05').getTime()
    expect(shouldUseCachedSiteVisual(record, now)).toBe(true)
  })

  it('rejects record when now is far future', () => {
    const past = new Date('2024-01-01').toISOString()
    const record = makeRecord({ updatedAt: past })
    const now = new Date('2024-02-01').getTime()
    expect(shouldUseCachedSiteVisual(record, now)).toBe(false)
  })
})

describe('mergeSiteVisualWithCache', () => {
  it('uses extracted when cache is undefined', () => {
    const extracted = makeMetadata()
    const result = mergeSiteVisualWithCache(extracted, undefined)
    expect(result.siteIconUrl).toBe('https://example.com/icon.png')
    expect(result.themeColor).toBe('#ffffff')
    expect(result.source).toBe('document')
  })

  it('uses extracted when cache is expired', () => {
    const extracted = makeMetadata()
    const past = new Date(Date.now() - SITE_VISUAL_CACHE_TTL_MS - 1000).toISOString()
    const cached = makeRecord({ updatedAt: past })
    const result = mergeSiteVisualWithCache(extracted, cached)
    expect(result.source).toBe('document')
  })

  it('uses extracted icon when extracted has one', () => {
    const extracted = makeMetadata()
    extracted.siteIconUrl = 'https://example.com/new-icon.png'
    const cached = makeRecord({ siteIconUrl: 'https://example.com/old-icon.png' })
    const result = mergeSiteVisualWithCache(extracted, cached)
    expect(result.siteIconUrl).toBe('https://example.com/new-icon.png')
    expect(result.source).toBe('document')
  })

  it('uses extracted themeColor when extracted has one', () => {
    const extracted = makeMetadata()
    extracted.themeColor = '#ff0000'
    const cached = makeRecord({ themeColor: '#0000ff' })
    const result = mergeSiteVisualWithCache(extracted, cached)
    expect(result.themeColor).toBe('#ff0000')
    expect(result.source).toBe('document')
  })

  it('falls back to cached icon when extracted is missing', () => {
    const extracted = makeMetadata()
    extracted.siteIconUrl = undefined
    const cached = makeRecord({ siteIconUrl: 'https://example.com/cached-icon.png' })
    const result = mergeSiteVisualWithCache(extracted, cached)
    expect(result.siteIconUrl).toBe('https://example.com/cached-icon.png')
    expect(result.source).toBe('cache')
  })

  it('falls back to cached themeColor when extracted is missing', () => {
    const extracted = makeMetadata()
    extracted.themeColor = undefined
    const cached = makeRecord({ themeColor: '#00ff00' })
    const result = mergeSiteVisualWithCache(extracted, cached)
    expect(result.themeColor).toBe('#00ff00')
    expect(result.source).toBe('cache')
  })

  it('uses cache source when both icon and themeColor are cached', () => {
    const extracted = makeMetadata()
    extracted.siteIconUrl = undefined
    extracted.themeColor = undefined
    const cached = makeRecord({ siteIconUrl: 'https://example.com/cached-icon.png', themeColor: '#00ff00' })
    const result = mergeSiteVisualWithCache(extracted, cached)
    expect(result.siteIconUrl).toBe('https://example.com/cached-icon.png')
    expect(result.themeColor).toBe('#00ff00')
    expect(result.source).toBe('cache')
    expect(result.updatedAt).toBe(cached.updatedAt)
  })

  it('returns fallback source when nothing available', () => {
    const extracted = makeMetadata()
    extracted.siteIconUrl = undefined
    extracted.themeColor = undefined
    const cached = makeRecord({ siteIconUrl: undefined, themeColor: undefined })
    const result = mergeSiteVisualWithCache(extracted, cached)
    expect(result.siteIconUrl).toBeUndefined()
    expect(result.themeColor).toBeUndefined()
    expect(result.source).toBe('fallback')
  })

  it('does not use cached values when cache expired', () => {
    const extracted = makeMetadata()
    extracted.siteIconUrl = undefined
    extracted.themeColor = undefined
    const past = new Date(Date.now() - SITE_VISUAL_CACHE_TTL_MS - 1000).toISOString()
    const cached = makeRecord({ updatedAt: past, siteIconUrl: 'https://example.com/cached-icon.png' })
    const result = mergeSiteVisualWithCache(extracted, cached)
    expect(result.siteIconUrl).toBeUndefined()
    expect(result.source).toBe('fallback')
  })
})

describe('toSiteVisualCacheRecord', () => {
  it('strips to domain, siteIconUrl, themeColor, updatedAt only', () => {
    const metadata: SiteVisualMetadata = {
      domain: 'example.com',
      siteIconUrl: 'https://example.com/icon.png',
      themeColor: '#ffffff',
      source: 'document',
      updatedAt: new Date().toISOString(),
    }
    const record = toSiteVisualCacheRecord(metadata)
    expect(record).toBeTruthy()
    expect(record!.domain).toBe('example.com')
    expect(record!.siteIconUrl).toBe('https://example.com/icon.png')
    expect(record!.themeColor).toBe('#ffffff')
    expect(record!.updatedAt).toBeTruthy()
  })

  it('does not include source field', () => {
    const record = toSiteVisualCacheRecord(makeMetadata())
    expect(record).toBeTruthy()
    expect(record!).not.toHaveProperty('source')
  })

  it('does not include title, url, description, contentText, markdown', () => {
    const record = toSiteVisualCacheRecord(makeMetadata())
    const serialized = JSON.stringify(record)
    expect(serialized).not.toContain('"title"')
    expect(serialized).not.toContain('"url"')
    expect(serialized).not.toContain('"description"')
    expect(serialized).not.toContain('"contentText"')
    expect(serialized).not.toContain('"markdown"')
    expect(serialized).not.toContain('"body"')
    expect(serialized).not.toContain('"fullHtml"')
  })

  it('returns null for empty domain', () => {
    const metadata = makeMetadata()
    metadata.domain = ''
    expect(toSiteVisualCacheRecord(metadata)).toBeNull()
  })

  it('allows undefined icon and themeColor', () => {
    const metadata = makeMetadata()
    metadata.siteIconUrl = undefined
    metadata.themeColor = undefined
    const record = toSiteVisualCacheRecord(metadata)
    expect(record).toBeTruthy()
    expect(record!.siteIconUrl).toBeUndefined()
    expect(record!.themeColor).toBeUndefined()
  })
})

describe('cache module safety', () => {
  it('does not access chrome.storage', () => {
    const sources = [
      String(shouldUseCachedSiteVisual),
      String(mergeSiteVisualWithCache),
      String(toSiteVisualCacheRecord),
    ]
    for (const src of sources) {
      expect(src).not.toContain('chrome.storage')
    }
  })

  it('does not access network', () => {
    const sources = [
      String(shouldUseCachedSiteVisual),
      String(mergeSiteVisualWithCache),
      String(toSiteVisualCacheRecord),
    ]
    for (const src of sources) {
      expect(src).not.toContain('fetch(')
      expect(src).not.toContain('XMLHttpRequest')
    }
  })
})
