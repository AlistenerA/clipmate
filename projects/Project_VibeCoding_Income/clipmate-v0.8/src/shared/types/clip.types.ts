import type { ClipDocument } from '../../features/document'

export type ClipMode = 'fullpage' | 'selection' | 'tutorial'

export type SaveStatus = 'unsaved' | 'saved' | 'failed'

export interface ClipMetadata {
  url: string
  title: string
  description: string
  siteName: string
  createdAt: string
  author?: string
  publishedAt?: string
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
  imageCount?: number
  firstImageUrl?: string
  skippedImageCount?: number
  selectedImages?: SelectedImageAsset[]
  assetPickerBaseMarkdown?: string
  clipDocument?: ClipDocument
}

export type SelectedImageOrigin = 'img' | 'picture' | 'figure' | 'srcset' | 'poster'

export interface SelectedImageAsset {
  id: string
  url: string
  alt?: string
  title?: string
  caption?: string
  width?: number
  height?: number
  sourceUrl?: string
  index: number
  origin: SelectedImageOrigin
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
