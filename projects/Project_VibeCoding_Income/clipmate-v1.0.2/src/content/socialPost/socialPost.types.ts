export type SocialPostPlatform = 'xiaohongshu' | 'tieba'

export interface SocialPostImage {
  url: string
  alt?: string
}

export interface SocialPostComment {
  key: string
  author?: string
  text: string
  date?: string
  depth: 0 | 1
  images: SocialPostImage[]
}

export interface SocialPostExtraction {
  platform: SocialPostPlatform
  platformLabel: string
  title: string
  author?: string
  publishedAt?: string
  canonicalUrl: string
  bodyText: string
  images: SocialPostImage[]
  comments: SocialPostComment[]
  description: string
  contentText: string
  contentHtml: string
  markdown: string
}

export interface SocialPostExtractionOptions {
  collectVirtualized?: boolean
  maxComments?: number
  wait?: (milliseconds: number) => Promise<void>
}
