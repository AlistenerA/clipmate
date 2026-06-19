import type { ClipMode, SaveStatus } from './clip.types'

export interface ClipMateSettings {
  notionToken: string
  notionPageId: string
  defaultTags: string[]
  saveHistoryEnabled: boolean
}

export interface NotionTarget {
  id: string
  name: string
  pageId: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
  lastUsedAt?: string
}

export interface ClipHistoryItem {
  id: string
  title: string
  url: string
  mode: ClipMode
  tags: string[]
  notePreview: string
  contentPreview: string
  markdown: string
  markdownTruncated: boolean
  wordCount: number
  targetId?: string
  targetName?: string
  saveStatus: SaveStatus
  savedAt?: string
  errorCode?: string
  createdAt: string
  updatedAt: string
  siteName?: string
  siteIconUrl?: string
  themeColor?: string
  descriptionPreview?: string
  imageCount?: number
  firstImageUrl?: string
  skippedImageCount?: number
}

export interface ClipMateSettingsV2 extends ClipMateSettings {
  version: 2
  notionTargets: NotionTarget[]
  defaultTargetId?: string
  historyLimit: number
}
