import type { ClipDraft, ClipMode, MarkdownTarget, SaveStatus } from '../../shared/types/clip.types'
import type { HistoryAction, NotionTarget } from '../../shared/types/settings.types'

export interface HistoryInput {
  title: string
  url: string
  mode: ClipMode
  tags: string[]
  notePreview: string
  contentPreview: string
  markdown: string
  wordCount: number
  targetId?: string
  targetName?: string
  saveStatus?: SaveStatus
  siteName?: string
  siteIconUrl?: string
  themeColor?: string
  descriptionPreview?: string
  imageCount?: number
  firstImageUrl?: string
  skippedImageCount?: number
  action?: HistoryAction
  markdownTarget?: MarkdownTarget
  notionPageUrl?: string
}

export interface HistoryDetails {
  action?: HistoryAction
  markdownTarget?: MarkdownTarget
  markdown?: string
  notionPageUrl?: string
}

export function buildHistoryInput(
  draft: ClipDraft,
  target?: NotionTarget,
  saveStatus?: SaveStatus,
  details: HistoryDetails = {},
): HistoryInput {
  const contentText = draft.content?.contentText || ''
  const meta = draft.content?.metadata

  return {
    title: draft.title,
    url: draft.content.url,
    mode: draft.mode,
    tags: draft.tags,
    notePreview: draft.note.slice(0, 100),
    contentPreview: contentText.slice(0, 100),
    markdown: details.markdown ?? draft.content.markdown,
    wordCount: draft.content.wordCount,
    targetId: target?.id,
    targetName: target?.name,
    saveStatus,
    siteName: meta?.siteName,
    siteIconUrl: meta?.siteIconUrl,
    themeColor: meta?.themeColor,
    descriptionPreview: meta?.description,
    imageCount: draft.content.imageCount,
    firstImageUrl: draft.content.firstImageUrl,
    skippedImageCount: draft.content.skippedImageCount,
    action: details.action,
    markdownTarget: details.markdownTarget,
    notionPageUrl: details.notionPageUrl,
  }
}
