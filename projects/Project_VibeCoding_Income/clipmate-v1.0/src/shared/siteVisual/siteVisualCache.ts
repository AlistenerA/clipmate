import type { SiteVisualMetadata, SiteVisualCacheRecord } from './siteVisual.types'

export const SITE_VISUAL_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000

export function shouldUseCachedSiteVisual(
  record: SiteVisualCacheRecord | undefined,
  now?: number,
): boolean {
  if (!record) return false
  if (!record.updatedAt) return false

  const currentTime = now ?? Date.now()

  try {
    const updatedTime = new Date(record.updatedAt).getTime()
    if (isNaN(updatedTime)) return false
    return currentTime - updatedTime < SITE_VISUAL_CACHE_TTL_MS
  } catch {
    return false
  }
}

export function mergeSiteVisualWithCache(
  extracted: SiteVisualMetadata,
  cached?: SiteVisualCacheRecord,
  now?: number,
): SiteVisualMetadata {
  if (!cached || !shouldUseCachedSiteVisual(cached, now)) {
    if (!extracted.siteIconUrl && !extracted.themeColor) {
      return { ...extracted, source: 'fallback' as const }
    }
    return extracted
  }

  const usedCachedIcon = !extracted.siteIconUrl && !!cached.siteIconUrl
  const usedCachedTheme = !extracted.themeColor && !!cached.themeColor

  const merged: SiteVisualMetadata = {
    domain: extracted.domain,
    siteIconUrl: extracted.siteIconUrl ?? cached.siteIconUrl,
    themeColor: extracted.themeColor ?? cached.themeColor,
    source: 'document',
    updatedAt: extracted.updatedAt,
  }

  const hasExtractedVisual = !!(extracted.siteIconUrl || extracted.themeColor)

  if (!hasExtractedVisual && (cached.siteIconUrl || cached.themeColor)) {
    merged.source = 'cache'
    merged.updatedAt = cached.updatedAt
  } else if (usedCachedIcon || usedCachedTheme) {
    merged.source = 'cache'
    merged.updatedAt = cached.updatedAt
  }

  if (!merged.siteIconUrl && !merged.themeColor) {
    merged.source = 'fallback'
  }

  return merged
}

export function toSiteVisualCacheRecord(
  metadata: SiteVisualMetadata,
): SiteVisualCacheRecord | null {
  if (!metadata.domain) return null

  return {
    domain: metadata.domain,
    siteIconUrl: metadata.siteIconUrl,
    themeColor: metadata.themeColor,
    updatedAt: metadata.updatedAt,
  }
}
