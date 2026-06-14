import type { PageType } from '../utils/pageTypeDetector'

export type SiteProfileCategory =
  | 'search'
  | 'video'
  | 'short-video'
  | 'social'
  | 'community'
  | 'ai-chat'

export interface SiteProfileSelectorHints {
  contentContainer?: string
  commentContainer?: string
  videoPlayer?: string
  mainHeading?: string
  searchResultCard?: string
  excludeSelector?: string
}

export interface SiteProfile {
  id: string
  label: string
  category: SiteProfileCategory
  domains: string[]
  pageTypes: PageType[]
  priority: number
  selectorHints?: SiteProfileSelectorHints
}

export interface SiteProfileMatchInput {
  url: string
  pageType?: PageType
}

export interface SiteProfileMatch {
  profile: SiteProfile
  matchedDomain: string
  matchedPageType?: PageType
  confidence: number
  reasons: string[]
}
