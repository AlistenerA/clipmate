import type { PageType } from '../../shared/utils/pageTypeDetector'
import type { SelectionContext } from '../intent'
import type {
  CommentSelectionDraft,
  CommentSelectionInput,
  CommentSelectionMode,
} from './commentSelection.types'

export function extractDomain(url: string): string {
  if (!url) return ''
  try {
    return new URL(url).hostname
  } catch {
    return ''
  }
}

export function detectCommentSelectionMode(input: CommentSelectionInput): CommentSelectionMode {
  const selectionContext: SelectionContext = input.selectionContext || 'unknown'
  const pageType: PageType = input.pageType || 'unknown'

  if (selectionContext === 'comment' && pageType === 'forum-or-comment') {
    return 'forum-selection'
  }

  if (selectionContext === 'comment' && pageType === 'video') {
    const siteProfileId = input.siteProfileMatch?.profile.id || ''
    if (siteProfileId.includes('short-video')) {
      return 'short-video-caption-selection'
    }
    return 'video-comment-selection'
  }

  if (selectionContext === 'video-description') {
    const siteProfileId = input.siteProfileMatch?.profile.id || ''
    if (siteProfileId.includes('short-video')) {
      return 'short-video-caption-selection'
    }
    return 'video-description-selection'
  }

  if (selectionContext === 'ai-answer' || pageType === 'ai-answer') {
    return 'ai-answer-selection'
  }

  if (selectionContext === 'comment') {
    return 'comment-selection'
  }

  if (selectionContext === 'article' || selectionContext === 'search-result' ||
      selectionContext === 'navigation') {
    return 'selection-generic'
  }

  if (selectionContext === 'unknown' && pageType === 'forum-or-comment') {
    return 'comment-selection'
  }

  return 'selection-generic'

  return 'selection-generic'
}

const WARNING_MAP: Record<CommentSelectionMode, string | undefined> = {
  'selection-generic': undefined,
  'comment-selection':
    'Current selection is in a comment-related area. Only your selected content is saved.',
  'forum-selection':
    'Current selection is in a forum/thread area. Only your selected content is saved to avoid capturing the full thread.',
  'video-comment-selection':
    'Current selection may be from the video comment area. Only your selected content is saved.',
  'video-description-selection':
    'Current selection may be from the video description area. Only your selected content is saved.',
  'short-video-caption-selection':
    'Current selection may be from a short video caption area. Only your selected content is saved.',
  'ai-answer-selection':
    'Current selection may be from an AI conversation area. Only your selected content is saved to avoid capturing the full conversation.',
}

const MODE_LABEL_MAP: Record<CommentSelectionMode, string> = {
  'selection-generic': 'generic',
  'comment-selection': 'comment area',
  'forum-selection': 'forum/thread area',
  'video-description-selection': 'video description area',
  'video-comment-selection': 'video comment area',
  'short-video-caption-selection': 'short video caption area',
  'ai-answer-selection': 'AI conversation area',
}

export function getCommentSelectionWarning(mode: CommentSelectionMode): string | undefined {
  return WARNING_MAP[mode]
}

export function buildCommentSelectionDraft(input: CommentSelectionInput): CommentSelectionDraft {
  const mode = detectCommentSelectionMode(input)
  const domain = extractDomain(input.url)
  const warning = getCommentSelectionWarning(mode)
  const contextLabel = MODE_LABEL_MAP[mode]
  const selectedTextLength = input.selectionText.length
  const selectionMarkdown = input.selectionMarkdown || input.selectionText
  const siteProfileId = input.siteProfileMatch?.profile.id

  const reasons: string[] = ['selection-first']

  if (input.selectionContext) {
    reasons.push(`context=${input.selectionContext}`)
  }

  if (input.intentSnapshot?.intent) {
    const intent = input.intentSnapshot.intent
    if (intent !== 'clip-selection-generic' && intent !== 'unknown') {
      reasons.push(`intent=${intent}`)
    }
  }

  if (input.pageType && input.pageType !== 'unknown') {
    reasons.push(`pageType=${input.pageType}`)
  }

  return {
    title: input.title,
    url: input.url,
    domain,
    pageType: input.pageType,
    siteProfileId,
    mode,
    selectionContext: input.selectionContext || 'unknown',
    selectedTextLength,
    warning,
    contextLabel,
    sourceHint: undefined,
    markdown: selectionMarkdown,
    reasons,
  }
}
