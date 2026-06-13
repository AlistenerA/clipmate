export interface SiteVisualMetadata {
  domain: string
  siteIconUrl?: string
  themeColor?: string
  source: 'document' | 'cache' | 'fallback'
  updatedAt: string
}

export interface SiteVisualExtractInput {
  document: Document
  pageUrl: string
}

export interface SiteVisualCacheRecord {
  domain: string
  siteIconUrl?: string
  themeColor?: string
  updatedAt: string
}
