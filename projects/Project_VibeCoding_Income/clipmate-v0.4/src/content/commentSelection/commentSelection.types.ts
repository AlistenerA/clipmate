import type { PageType } from '../../shared/utils/pageTypeDetector'
import type { SiteProfileMatch } from '../../shared/siteProfiles'
import type { IntentSnapshot, SelectionContext } from '../intent'

export type CommentSelectionMode =
  | 'selection-generic'
  | 'comment-selection'
  | 'forum-selection'
  | 'video-description-selection'
  | 'video-comment-selection'
  | 'short-video-caption-selection'
  | 'ai-answer-selection'

export interface CommentSelectionDraft {
  title: string
  url: string
  domain: string
  pageType: PageType
  siteProfileId?: string
  mode: CommentSelectionMode
  selectionContext: SelectionContext
  selectedTextLength: number
  warning?: string
  contextLabel?: string
  sourceHint?: string
  markdown: string
  reasons: string[]
}

export interface CommentSelectionInput {
  title: string
  url: string
  pageType: PageType
  siteProfileMatch?: SiteProfileMatch | null
  intentSnapshot?: IntentSnapshot | null
  selectionText: string
  selectionHtml?: string
  selectionMarkdown?: string
  selectionContext?: SelectionContext
  selectionRoot?: Element | null
}

export interface CommentSourceMedia {
  type: 'image' | 'video' | 'cover' | 'poster' | 'link'
  url?: string
  alt?: string
  label?: string
}

export interface CommentClipContext {
  siteName: string
  pageUrl: string
  pageTitle: string
  sourceTitle: string
  sourceAuthor?: string
  sourceExcerpt?: string
  sourceMedia: CommentSourceMedia[]
  selectedComment: {
    author?: string
    text: string
  }
  warnings: string[]
  mode: CommentSelectionMode
  reasons: string[]
}

export interface CommentContextInput {
  document: Document
  pageTitle: string
  pageUrl: string
  siteProfileMatch?: SiteProfileMatch | null
  selectionText: string
  selectionRoot?: Element | null
  mode: CommentSelectionMode
  reasons: string[]
}
