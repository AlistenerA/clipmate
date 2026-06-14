export type ClipMode = 'fullpage' | 'selection'

export type SaveStatus = 'unsaved' | 'saved' | 'failed'

export interface ClipMetadata {
  url: string
  title: string
  description: string
  siteName: string
  createdAt: string
  siteIconUrl?: string
  themeColor?: string
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
  clipMode?: 'comment-context'
}

export interface ClipDraft {
  title: string
  tags: string[]
  note: string
  mode: ClipMode
  content: ExtractedContent
}

export type MarkdownTarget = 'notion' | 'obsidian' | 'typora' | 'generic'

export interface MarkdownProfile {
  target: MarkdownTarget
  label: string
  description: string
  frontmatter: boolean
  tagStyle: 'hashtag' | 'yaml'
  sourceStyle: 'plain-label' | 'markdown-link' | 'frontmatter'
  headingStyle: 'standard'
  imageStyle: 'standard' | 'preserve'
  tableStyle: 'standard' | 'preserve'
  formulaStyle: 'preserve-text'
  codeBlockStyle: 'standard' | 'preserve-language'
}
