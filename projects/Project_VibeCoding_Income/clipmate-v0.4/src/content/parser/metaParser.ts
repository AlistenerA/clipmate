import {
  extractIconFromLinks,
  normalizeIconUrl,
  normalizeThemeColor,
} from '../../shared/siteVisual/siteVisualExtractor'

export interface PageMeta {
  url: string
  title: string
  description: string
  siteName: string
  siteIconUrl?: string
  themeColor?: string
}

export function resolveIconUrl(href: string, baseUrl: string): string | undefined {
  return normalizeIconUrl(href, baseUrl)
}

export function extractThemeColor(doc: Document): string | undefined {
  try {
    const el = doc.querySelector('meta[name="theme-color"]')
    const content = el?.getAttribute('content')?.trim()
    return normalizeThemeColor(content || null)
  } catch {
    return undefined
  }
}

export function extractSiteIconUrl(doc: Document, pageUrl: string): string | undefined {
  try {
    const baseURI = doc.baseURI || ''
    const resolvedBase = baseURI.startsWith('http') ? baseURI : pageUrl

    const iconUrl = extractIconFromLinks(doc, resolvedBase)
    if (iconUrl) return iconUrl

    const origin = new URL(pageUrl).origin
    return normalizeIconUrl('/favicon.ico', origin)
  } catch {
    return undefined
  }
}

export function parseMetadata(doc: Document): PageMeta {
  const getMetaContent = (name: string, isProperty = false): string => {
    const selector = isProperty
      ? `meta[property="${name}"]`
      : `meta[name="${name}"], meta[property="${name}"]`
    const el = doc.querySelector(selector)
    const content = el?.getAttribute('content')?.trim()
    return content || ''
  }

  const pageUrl = doc.URL || ''

  return {
    url: pageUrl,
    title: getMetaContent('og:title', true) || doc.title || '',
    description:
      getMetaContent('og:description', true) || getMetaContent('description') || '',
    siteName: getMetaContent('og:site_name', true) || '',
    siteIconUrl: extractSiteIconUrl(doc, pageUrl),
    themeColor: extractThemeColor(doc),
  }
}
