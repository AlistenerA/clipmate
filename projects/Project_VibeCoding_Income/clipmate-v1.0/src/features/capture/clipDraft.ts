import type { ClipDraft, ClipMode, ExtractedContent } from '../../shared/types/clip.types'

export interface CreateClipDraftInput {
  content: ExtractedContent
  tags: string[]
  note: string
  title?: string
  mode?: ClipMode
  sourceTabId?: number
}

export function getDraftBodyText(draft: ClipDraft): string {
  return draft.content?.markdown || draft.content?.contentText || ''
}

export function isDraftSaveable(draft: ClipDraft): boolean {
  return getDraftBodyText(draft).trim().length > 0
}

export function canRestoreClipDraft(
  draft: ClipDraft | null | undefined,
  activeUrl?: string,
  activeTabId?: number,
): draft is ClipDraft {
  if (!draft?.content?.url || draft.content.url !== activeUrl) return false
  if (draft.sourceTabId !== undefined) return draft.sourceTabId === activeTabId
  return draft.mode !== 'selection'
}

export function createClipDraft(input: CreateClipDraftInput): ClipDraft {
  return {
    title: input.title || input.content.title,
    tags: [...input.tags],
    note: input.note,
    mode: input.mode || input.content.mode,
    content: input.content,
    sourceTabId: input.sourceTabId,
  }
}
