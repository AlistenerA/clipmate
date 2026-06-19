import type { ClipDraft, ClipMode, ExtractedContent } from '../../shared/types/clip.types'

export interface CreateClipDraftInput {
  content: ExtractedContent
  tags: string[]
  note: string
  title?: string
  mode?: ClipMode
}

export function getDraftBodyText(draft: ClipDraft): string {
  return draft.content?.markdown || draft.content?.contentText || ''
}

export function isDraftSaveable(draft: ClipDraft): boolean {
  return getDraftBodyText(draft).trim().length > 0
}

export function createClipDraft(input: CreateClipDraftInput): ClipDraft {
  return {
    title: input.title || input.content.title,
    tags: [...input.tags],
    note: input.note,
    mode: input.mode || input.content.mode,
    content: input.content,
  }
}
