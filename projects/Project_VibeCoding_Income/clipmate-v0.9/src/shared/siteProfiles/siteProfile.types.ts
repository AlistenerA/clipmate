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
  conversationContainer?: string
  conversationMessage?: string
  userMessage?: string
  assistantMessage?: string
  transientMessage?: string
}

export interface SiteProfile {
  id: string
  label: string
  category: SiteProfileCategory
  domains: string[]
  pageTypes: PageType[]
  priority: number
  pathPatterns?: string[]
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
