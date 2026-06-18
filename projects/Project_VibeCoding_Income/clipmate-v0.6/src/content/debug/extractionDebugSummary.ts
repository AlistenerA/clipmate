import type { ExtractedContent } from '../../shared/types/clip.types'
import type { CommentSelectionMode, CommentClipContext } from '../commentSelection/commentSelection.types'

export type LengthBucket = '0' | '1-30' | '30-80' | '80-500' | '500+'

export interface ExtractionDebugSummary {
  site: string
  urlHost: string
  pageType?: string
  siteProfileId?: string
  selectionMode?: CommentSelectionMode | 'generic-selection'
  hasSelection: boolean
  selectedTextLengthBucket: LengthBucket
  titleSource?: 'source-container' | 'meta-og' | 'meta-twitter' | 'document-title' | 'fallback' | 'unknown'
  sourceTitleLengthBucket?: LengthBucket
  sourceTitleLooksGeneric?: boolean
  sourceContainerTag?: string
  sourceContainerSelectorHint?: string
  sourceContainerTextLengthBucket?: LengthBucket
  sourceExcerptLengthBucket?: LengthBucket
  mediaCount?: number
  commentAuthorResolved?: boolean
  markdownFormatter?: 'comment-context' | 'comment-selection' | 'generic-selection' | 'unknown'
  contextWarnings?: string[]
  risks: string[]
}

function toLengthBucket(length: number | undefined): LengthBucket {
  if (length === undefined || length === 0) return '0'
  if (length <= 30) return '1-30'
  if (length <= 80) return '30-80'
  if (length <= 500) return '80-500'
  return '500+'
}

function getUrlHost(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return ''
  }
}

export function buildExtractionDebugSummary(params: {
  content: ExtractedContent | null
  selectionMode?: CommentSelectionMode | 'selection-generic'
  context?: CommentClipContext | null
  hasSelection: boolean
  selectedTextLength: number
  titleSource?: ExtractionDebugSummary['titleSource']
  sourceContainerTag?: string
  sourceContainerSelectorHint?: string
  sourceContainerTextLength?: number
}): ExtractionDebugSummary {
  const risks: string[] = []

  const selectedTextLengthBucket = toLengthBucket(params.selectedTextLength)
  const sourceTitleLengthBucket = toLengthBucket(
    params.content?.title?.length ?? 0,
  )
  const sourceExcerptLengthBucket = toLengthBucket(
    params.context?.sourceExcerpt?.length ?? 0,
  )
  const sourceContainerTextLengthBucket = toLengthBucket(params.sourceContainerTextLength)

  let sourceTitleLooksGeneric: boolean | undefined
  if (params.context?.sourceTitle) {
    const st = params.context.sourceTitle
    sourceTitleLooksGeneric =
      /^微博正文/.test(st) || /^Weibo$/i.test(st) || /^微博$/.test(st)
  }

  let markdownFormatter: ExtractionDebugSummary['markdownFormatter'] = 'unknown'
  if (params.selectionMode) {
    if (params.selectionMode === 'selection-generic') {
      markdownFormatter = 'generic-selection'
    } else if (params.context) {
      markdownFormatter = 'comment-context'
    } else {
      markdownFormatter = 'comment-selection'
    }
  }

  let siteProfileId = params.context?.siteName
  if (params.content?.metadata?.siteName) {
    siteProfileId = params.content.metadata.siteName
  }

  if (params.selectionMode === 'selection-generic' && params.content?.title) {
    const t = params.content.title
    if (/^微博正文|^Weibo$|^weibo\.com$/i.test(t)) {
      risks.push('selection-index:generic-title-bypass')
    }
  }

  if (
    params.context &&
    params.context.sourceTitle === params.content?.title &&
    (/^微博正文/.test(params.context.sourceTitle) ||
     /^Weibo$/i.test(params.context.sourceTitle))
  ) {
    risks.push('sourceTitle:generic-unchanged')
  }

  if (params.selectionMode === 'selection-generic') {
    risks.push('path:generic-selection-comment-context-skipped')
  }

  return {
    site: siteProfileId || getUrlHost(params.content?.url || '') || 'unknown',
    urlHost: getUrlHost(params.content?.url || ''),
    pageType: params.content?.metadata?.siteName || undefined,
    siteProfileId: params.context?.siteName || params.content?.metadata?.siteName,
    selectionMode: params.selectionMode,
    hasSelection: params.hasSelection,
    selectedTextLengthBucket,
    titleSource: params.titleSource,
    sourceTitleLengthBucket,
    sourceTitleLooksGeneric,
    sourceContainerTag: params.sourceContainerTag,
    sourceContainerSelectorHint: params.sourceContainerSelectorHint,
    sourceContainerTextLengthBucket,
    sourceExcerptLengthBucket,
    mediaCount: params.context?.sourceMedia.length,
    commentAuthorResolved: params.context?.selectedComment.author !== undefined,
    markdownFormatter,
    contextWarnings: params.context?.warnings,
    risks,
  }
}
