export type ClipMode = 'fullpage' | 'selection'

export type SaveStatus = 'unsaved' | 'saved' | 'failed'

export interface ClipMetadata {
  url: string
  title: string
  description: string
  siteName: string
  createdAt: string
}

export interface ExtractedContent {
  mode: ClipMode
  title: string
  url: string
  description: string
  contentText: string
  contentHtml: string
  markdown: string
  wordCount: number
  metadata: ClipMetadata
}

export interface ClipDraft {
  title: string
  tags: string[]
  note: string
  mode: ClipMode
  content: ExtractedContent
}
