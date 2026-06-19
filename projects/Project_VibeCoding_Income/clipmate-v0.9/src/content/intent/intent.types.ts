import type { PageType } from '../../shared/utils/pageTypeDetector'
import type { SiteProfileMatch } from '../../shared/siteProfiles'

export type ClipIntent =
  | 'clip-article'
  | 'clip-search-result'
  | 'clip-navigation-summary'
  | 'clip-video-page'
  | 'clip-video-description'
  | 'clip-video-comment'
  | 'clip-short-video-caption'
  | 'clip-short-video-comment'
  | 'clip-forum-thread'
  | 'clip-comment'
  | 'clip-ai-answer'
  | 'clip-selection-generic'
  | 'unknown'
  | 'needs-ai-later'

export type SelectionContext =
  | 'article'
  | 'comment'
  | 'video-description'
  | 'search-result'
  | 'navigation'
  | 'ai-answer'
  | 'unknown'

export interface VisibleContextSnapshot {
  visibleVideoCount: number
  visibleCommentLikeCount: number
  visibleSearchResultLikeCount: number
  visibleArticleLikeCount: number
}

export interface IntentSnapshot {
  pageType: PageType
  siteProfileId?: string
  selectionPresent: boolean
  selectionTextLength: number
  selectionContext: SelectionContext
  selectionRectArea?: number
  nearestRole?: string
  nearestTag?: string
  nearestClassHints: string[]
  visibleContext: VisibleContextSnapshot
  confidence: number
  intent: ClipIntent
  reasons: string[]
}

export interface IntentSignalInput {
  document: Document
  pageType: PageType
  siteProfileMatch?: SiteProfileMatch | null
  selection?: Selection | null
}
