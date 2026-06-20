import type { PageType } from '../../shared/utils/pageTypeDetector'
import type { SiteProfileMatch } from '../../shared/siteProfiles'
import type { IntentSnapshot } from '../intent'

export type NavigationSummaryMode =
  | 'navigation'
  | 'search-results'
  | 'low-confidence'

export interface NavigationSummaryLink {
  text: string
  href: string
  domain?: string
  reason?: string
}

export interface NavigationSummaryDraft {
  title: string
  url: string
  domain: string
  pageType: PageType
  siteProfileId?: string
  mode: NavigationSummaryMode
  warning: string
  links: NavigationSummaryLink[]
  reasons: string[]
}

export interface NavigationSummaryInput {
  document: Document
  title: string
  url: string
  pageType: PageType
  siteProfileMatch?: SiteProfileMatch | null
  intentSnapshot?: IntentSnapshot | null
  articleConfidence?: number
  linkDensity?: number
  maxLinks?: number
}
