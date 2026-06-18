import type { LinkCardDraft, LinkCardInput } from './linkCard.types'
import { isSafeIconUrl, normalizeThemeColor } from '../siteVisual/siteVisualExtractor'

const UNSAFE_PROTOCOLS = /^(javascript|data|blob|chrome|edge|about|file|vbscript):/i

const TITLE_MAX_LENGTH = 120
const DESCRIPTION_MAX_LENGTH = 240

export function extractDomain(url: string): string {
  if (!url) return ''
  try {
    const parsed = new URL(url)
    return parsed.hostname
  } catch {
    return ''
  }
}

export function normalizeLinkCardUrl(url: string, baseUrl?: string): string | undefined {
  if (!url) return undefined
  const trimmed = url.trim()
  if (!trimmed) return undefined

  if (UNSAFE_PROTOCOLS.test(trimmed)) return undefined

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const parsed = new URL(trimmed)
      if (UNSAFE_PROTOCOLS.test(parsed.protocol)) return undefined
      return parsed.href
    } catch {
      return undefined
    }
  }

  if (baseUrl) {
    try {
      const absolute = new URL(trimmed, baseUrl)
      if (UNSAFE_PROTOCOLS.test(absolute.protocol)) return undefined
      return absolute.href
    } catch {
      return undefined
    }
  }

  return undefined
}

export function truncateText(value: string | undefined, maxLength: number): string | undefined {
  if (!value) return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  if (trimmed.length <= maxLength) return trimmed
  return trimmed.slice(0, maxLength)
}

export function buildLinkCardDraft(input: LinkCardInput): LinkCardDraft | null {
  if (!input.url) return null

  const normalizedUrl = normalizeLinkCardUrl(input.url)
  if (!normalizedUrl) return null

  const domain = extractDomain(normalizedUrl)
  if (!domain) return null

  const reasons: string[] = []

  const title = truncateText(input.title, TITLE_MAX_LENGTH) || domain

  const description = truncateText(input.description, DESCRIPTION_MAX_LENGTH)

  let siteIconUrl: string | undefined
  if (input.siteIconUrl && isSafeIconUrl(input.siteIconUrl)) {
    siteIconUrl = input.siteIconUrl.trim()
  }

  const themeColor = normalizeThemeColor(input.themeColor || null)

  reasons.push(`source=${input.source}`)
  reasons.push(`domain=${domain}`)

  if (siteIconUrl) {
    reasons.push('siteVisual=present')
  }

  if (themeColor) {
    reasons.push('themeColor=present')
  }

  if (input.pageType && input.pageType !== 'unknown') {
    reasons.push(`pageType=${input.pageType}`)
  }

  if (input.siteProfileId) {
    reasons.push(`siteProfile=${input.siteProfileId}`)
  }

  if (input.reason) {
    reasons.push(`reason=${input.reason}`)
  }

  return {
    title,
    description,
    url: normalizedUrl,
    domain,
    source: input.source,
    siteIconUrl,
    themeColor,
    pageType: input.pageType,
    siteProfileId: input.siteProfileId,
    reasons,
  }
}
