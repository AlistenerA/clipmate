export type LinkCardSource =
  | 'current-page'
  | 'selected-link'
  | 'navigation-link'
  | 'manual-input'

export interface LinkCardInput {
  title?: string
  description?: string
  url: string
  source: LinkCardSource
  siteIconUrl?: string
  themeColor?: string
  pageType?: string
  siteProfileId?: string
  reason?: string
}

export interface LinkCardDraft {
  title: string
  description?: string
  url: string
  domain: string
  source: LinkCardSource
  siteIconUrl?: string
  themeColor?: string
  pageType?: string
  siteProfileId?: string
  warning?: string
  reasons: string[]
}
