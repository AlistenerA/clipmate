import type { SiteVisualMetadata, SiteVisualExtractInput } from './siteVisual.types'

const UNSAFE_PROTOCOLS = /^(javascript|data|blob|chrome|edge|about|file|vbscript):/i

const THEME_COLOR_HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

const THEME_COLOR_RGB = /^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(?:,\s*(?:0|1|0?\.\d+))?\s*\)$/i

const THEME_COLOR_HSL = /^hsla?\(\s*\d{1,3}(?:deg)?\s*,?\s*\d{1,3}%\s*,?\s*\d{1,3}%\s*(?:,\s*(?:0|1|0?\.\d+))?\s*\)$/i

const DANGEROUS_COLOR_TOKENS = /(?:javascript|data|url|expression|calc|var|attr)\s*[(:]/i

export function extractDomain(url: string): string {
  if (!url) return ''
  try {
    const parsed = new URL(url)
    return parsed.hostname
  } catch {
    return ''
  }
}

export function normalizeThemeColor(value?: string | null): string | undefined {
  if (!value || typeof value !== 'string') return undefined

  const trimmed = value.trim()
  if (!trimmed) return undefined

  if (trimmed.length > 128) return undefined

  if (DANGEROUS_COLOR_TOKENS.test(trimmed)) return undefined

  if (THEME_COLOR_HEX.test(trimmed)) return trimmed.toLowerCase()

  if (THEME_COLOR_RGB.test(trimmed)) return trimmed

  if (THEME_COLOR_HSL.test(trimmed)) return trimmed

  return undefined
}

export function isSafeIconUrl(url: string): boolean {
  if (!url) return false
  const trimmed = url.trim()
  if (!trimmed) return false

  if (UNSAFE_PROTOCOLS.test(trimmed)) return false

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return true
  }

  if (trimmed.startsWith('/') || trimmed.startsWith('./') || trimmed.startsWith('../')) {
    return true
  }

  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    return false
  }

  return true
}

export function normalizeIconUrl(url: string, baseUrl: string): string | undefined {
  if (!isSafeIconUrl(url)) return undefined

  const trimmed = url.trim()

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const parsed = new URL(trimmed)
      if (UNSAFE_PROTOCOLS.test(parsed.protocol)) return undefined
      return parsed.href
    } catch {
      return undefined
    }
  }

  try {
    const absolute = new URL(trimmed, baseUrl)
    if (UNSAFE_PROTOCOLS.test(absolute.protocol)) return undefined
    return absolute.href
  } catch {
    return undefined
  }
}

export function extractIconFromLinks(doc: Document, baseUrl: string): string | undefined {
  const links = doc.querySelectorAll('link')
  const baseURI = doc.baseURI || ''
  const resolvedBase = baseURI.startsWith('http') ? baseURI : baseUrl

  const priorities: Record<string, number> = {
    'apple-touch-icon': 0,
    'icon': 1,
    'shortcut icon': 2,
    'mask-icon': 3,
  }

  let bestIcon: { priority: number; url: string } | null = null

  for (const link of links) {
    const rel = (link.getAttribute('rel') || '').trim().toLowerCase()
    if (!rel) continue

    const priority = priorities[rel]
    if (priority === undefined) continue
    if (bestIcon && priority >= bestIcon.priority) continue

    const href = link.getAttribute('href')?.trim()
    if (!href) continue

    const url = normalizeIconUrl(href, resolvedBase)
    if (url) {
      bestIcon = { priority, url }
    }
  }

  return bestIcon?.url
}

export function extractSiteVisualMetadata(input: SiteVisualExtractInput): SiteVisualMetadata {
  const domain = extractDomain(input.pageUrl)
  const baseUrl = input.pageUrl || ''

  let siteIconUrl: string | undefined
  try {
    siteIconUrl = extractIconFromLinks(input.document, baseUrl)
    if (!siteIconUrl) {
      const origin = domain ? `https://${domain}` : baseUrl
      siteIconUrl = normalizeIconUrl('/favicon.ico', origin)
    }
  } catch {
    siteIconUrl = undefined
  }

  let themeColor: string | undefined
  try {
    const el = input.document.querySelector('meta[name="theme-color"]')
    const content = el?.getAttribute('content')?.trim()
    themeColor = normalizeThemeColor(content || null)
  } catch {
    themeColor = undefined
  }

  return {
    domain,
    siteIconUrl,
    themeColor,
    source: 'document',
    updatedAt: new Date().toISOString(),
  }
}
