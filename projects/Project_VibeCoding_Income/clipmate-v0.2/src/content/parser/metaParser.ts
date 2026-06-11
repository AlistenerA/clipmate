export interface PageMeta {
  url: string
  title: string
  description: string
  siteName: string
  siteIconUrl?: string
  themeColor?: string
}

export function resolveIconUrl(href: string, baseUrl: string): string | undefined {
  try {
    return new URL(href, baseUrl).href
  } catch {
    return undefined
  }
}

export function extractThemeColor(doc: Document): string | undefined {
  try {
    const el = doc.querySelector('meta[name="theme-color"]')
    const content = el?.getAttribute('content')?.trim()
    return content || undefined
  } catch {
    return undefined
  }
}

const ICON_REL_PRIORITY = ['apple-touch-icon', 'icon', 'shortcut icon', 'mask-icon'] as const

export function extractSiteIconUrl(doc: Document, pageUrl: string): string | undefined {
  try {
    const links = doc.querySelectorAll('link')
    const baseURI = doc.baseURI || ''
    const baseUrl = baseURI.startsWith('http') ? baseURI : pageUrl

    let bestIcon: { priority: number; url: string } | null = null

    for (const link of links) {
      const rel = (link.getAttribute('rel') || '').trim().toLowerCase()
      if (!rel) continue
      const priority = ICON_REL_PRIORITY.indexOf(rel as typeof ICON_REL_PRIORITY[number])
      if (priority === -1) continue
      if (bestIcon && priority >= bestIcon.priority) continue

      const href = link.getAttribute('href')?.trim()
      if (href) {
        const url = resolveIconUrl(href, baseUrl)
        if (url) {
          bestIcon = { priority, url }
        }
      }
    }

    if (bestIcon) return bestIcon.url

    const origin = new URL(pageUrl).origin
    return resolveIconUrl('/favicon.ico', origin)
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
