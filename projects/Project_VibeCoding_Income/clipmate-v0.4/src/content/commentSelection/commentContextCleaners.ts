import type { CommentSourceMedia } from './commentSelection.types'

const UI_NOISE_PATTERNS: RegExp[] = [
  /返回\s*/g,
  /公开\s*/g,
  /来自\s*\S*/g,
  /关注\s*/g,
  /微博直播平台\s*/g,
  /转发\s*\d*/g,
  /评论\s*\d*/g,
  /点赞\s*\d*/g,
  /分享\s*/g,
  /收藏\s*/g,
  /投诉\s*/g,
  /\d{4}[-/]\d{1,2}[-/]\d{1,2}\s*/g,
  /\d{1,2}[-/]\d{1,2}\s+\d{1,2}:\d{2}(:\d{2})?\s*/g,
  /\d{1,2}:\d{2}(:\d{2})?\s*/g,
  /编辑\s*\d{2,}[-/]\d{2,}\s*/g,
  /置顶\s*/g,
  /热\s*门\s*/g,
  /最\s*新\s*/g,
  /最\s*早\s*/g,
  /展开\s*/g,
  /收起\s*/g,
  /更多\s*/g,
  /粉丝\s*\d*\s*/g,
  /粉丝\s*/g,
  /\S+\s*与\s*\S+\s*的共创微博\s*/g,
  /的共创微博\s*/g,
]

const AUTHOR_RELATION_PATTERNS: RegExp[] = [
  /^\S{1,20}[-–—]\S{1,20}$/,
  /^\S+和\S+的共创微博/,
]

const DATE_LEADING_PATTERNS: RegExp[] = [
  /^\d{1,2}[-/]\d{1,2}\s+\d{1,2}:\d{2}/,
  /^\d{4}[-/]\d{1,2}[-/]\d{1,2}/,
]

export function cleanSourceText(text: string, maxLength?: number): string {
  if (!text) return ''

  let cleaned = text
  for (const pattern of UI_NOISE_PATTERNS) {
    cleaned = cleaned.replace(pattern, '')
  }

  cleaned = cleaned.replace(/^\s*[·•●\-–—]+/g, '')
  cleaned = cleaned.replace(/\s{2,}/g, ' ')
  cleaned = cleaned.replace(/^\s*[,\\.，,。;；!！?？:：]+\s*/g, '')
  cleaned = cleaned.trim()

  if (!cleaned) return ''
  if (!maxLength || cleaned.length <= maxLength) return cleaned
  return cleaned.slice(0, maxLength).replace(/\s+\S*$/, '') + '…'
}

export function isAuthorRelationLike(text: string): boolean {
  if (!text || text.length > 60) return false
  for (const pattern of AUTHOR_RELATION_PATTERNS) {
    if (pattern.test(text.trim())) return true
  }
  return false
}

export function hasDateLeading(text: string): boolean {
  if (!text) return false
  for (const pattern of DATE_LEADING_PATTERNS) {
    if (pattern.test(text.trim())) return true
  }
  return false
}

export function stripAuthorRelationPrefix(text: string): string {
  if (!text) return ''

  let cleaned = text.trim()
  for (const pattern of AUTHOR_RELATION_PATTERNS) {
    cleaned = cleaned.replace(pattern, '').trim()
  }

  return cleaned || text
}

export function extractFirstTopicOrSentence(text: string, maxLength: number = 200): string {
  if (!text) return ''

  const cleaned = text.trim()

  const topicMatch = cleaned.match(/#([^#]+)#/)
  if (topicMatch && topicMatch.index !== undefined) {
    const before = cleaned.slice(Math.max(0, topicMatch.index - 30), topicMatch.index)
    const topic = topicMatch[0]
    const after = cleaned.slice(topicMatch.index + topic.length, topicMatch.index + topic.length + 80)

    let result = `${topic}${after}`
    if (before.trim()) result = `${before.trim()}${result}`
    if (result.length <= maxLength) return result.trim()
    return result.slice(0, maxLength).replace(/\s+\S*$/, '') + '…'
  }

  if (cleaned.length <= maxLength) return cleaned
  return cleaned.slice(0, maxLength).replace(/\s+\S*$/, '') + '…'
}

function isSafeImageUrl(url: string): boolean {
  if (!url) return false
  const trimmed = url.trim()
  if (!trimmed) return false
  return /^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith('/')
}

function isWeiboBadgeOrEmoji(img: { alt?: string; className?: string; src?: string; width?: number; height?: number }): boolean {
  const alt = (img.alt || '').toLowerCase()
  const classStr = (img.className || '').toLowerCase()
  const src = (img.src || '').toLowerCase()

  if (alt.includes('emoji') || alt.includes('表情') || alt.includes('emot')) return true
  if (/^\[.+\]$/.test(alt.trim()) && alt.length < 20) return true

  if (classStr.includes('emoji') || classStr.includes('emotion') ||
      classStr.includes('face') || classStr.includes('badge') ||
      classStr.includes('svip') || classStr.includes('member') ||
      classStr.includes('level'))
    return true

  if (src.includes('face.t.sinajs.cn')) return true
  if (src.includes('/crop.') || src.includes('_crop')) return true
  if (/\/svip\//i.test(src)) return true
  if (/\/member\//i.test(src)) return true
  if (/\/badge\//i.test(src)) return true
  if (/\/emotion\//i.test(src)) return true
  if (/\/face\//i.test(src) && !src.includes('/face/')) return true
  if (/\/emoji\//i.test(src)) return true
  if (/\/icon\//i.test(src)) return true
  if (src.includes('tvax') && (src.includes('crop') || src.includes('avatar'))) return true
  if (src.includes('h5.sinaimg.cn/upload') && (src.includes('svip') || src.includes('member')))
    return true
  if (src.includes('a.sinaimg.cn/mintra')) return true

  const width = img.width || 0
  const height = img.height || 0
  if (width > 0 && height > 0 && width < 50 && height < 50) return true

  return false
}

function isAvatarLike(img: { alt?: string; className?: string; src?: string; width?: number; height?: number }): boolean {
  const alt = (img.alt || '').toLowerCase()
  if (alt.includes('avatar') || alt.includes('头像') || alt.includes('icon')) return true

  const classStr = (img.className || '').toLowerCase()
  if (classStr.includes('avatar') || classStr.includes('头像') || classStr.includes('icon')) return true

  const width = img.width || 0
  const height = img.height || 0
  if (width > 0 && width < 40) return true
  if (height > 0 && height < 40) return true
  if (width > 0 && height > 0 && width < 60 && height < 60) return true

  const src = (img.src || '').toLowerCase()
  if (src.includes('avatar') || src.includes('头像') || src.includes('icon')) return true

  return false
}

function isCommentAreaElement(el: Element): boolean {
  let current: Element | null = el
  while (current) {
    const classStr = (current.className && typeof current.className === 'string')
      ? current.className.toLowerCase() : ''
    const id = current.id?.toLowerCase() || ''
    if (
      classStr.includes('comment') || classStr.includes('reply') ||
      classStr.includes('avatar') || id.includes('comment') ||
      id.includes('reply') || id.includes('avatar')
    ) {
      return true
    }
    current = current.parentElement
  }
  return false
}

export function filterSourceMedia(
  imgs: HTMLImageElement[],
  platform: string,
): CommentSourceMedia[] {
  const media: CommentSourceMedia[] = []
  const maxMedia = platform === 'weibo' ? 2 : 2

  for (const img of imgs) {
    if (media.length >= maxMedia) break
    if (isCommentAreaElement(img)) continue
    if (isAvatarLike({ alt: img.alt, className: img.className, src: img.src, width: parseInt(img.getAttribute('width') || '', 10) || undefined, height: parseInt(img.getAttribute('height') || '', 10) || undefined })) continue

    if (platform === 'weibo') {
      if (isWeiboBadgeOrEmoji({ alt: img.alt, className: img.className, src: img.src, width: parseInt(img.getAttribute('width') || '', 10) || undefined, height: parseInt(img.getAttribute('height') || '', 10) || undefined })) continue

      const src = (img.src || '').toLowerCase()
      const isSinaImg = src.includes('sinaimg.cn')
      if (isSinaImg && !src.includes('/large/') && !src.includes('/mw690/') && !src.includes('/mw1024/') && !src.includes('/orj360/')) {
        continue
      }
    }

    if (platform === 'douyin') {
      if (isWeiboBadgeOrEmoji({ alt: img.alt, className: img.className, src: img.src, width: parseInt(img.getAttribute('width') || '', 10) || undefined, height: parseInt(img.getAttribute('height') || '', 10) || undefined })) continue
      if (isAvatarLike({ alt: img.alt, className: img.className, src: img.src, width: parseInt(img.getAttribute('width') || '', 10) || undefined, height: parseInt(img.getAttribute('height') || '', 10) || undefined })) continue
    }

    if (platform === 'xiaohongshu') {
      if (isWeiboBadgeOrEmoji({ alt: img.alt, className: img.className, src: img.src, width: parseInt(img.getAttribute('width') || '', 10) || undefined, height: parseInt(img.getAttribute('height') || '', 10) || undefined })) continue
      if (isAvatarLike({ alt: img.alt, className: img.className, src: img.src, width: parseInt(img.getAttribute('width') || '', 10) || undefined, height: parseInt(img.getAttribute('height') || '', 10) || undefined })) continue
    }

    if (platform === 'bilibili') {
      if (isAvatarLike({ alt: img.alt, className: img.className, src: img.src, width: parseInt(img.getAttribute('width') || '', 10) || undefined, height: parseInt(img.getAttribute('height') || '', 10) || undefined })) continue
    }

    const src = img.src || img.getAttribute('src') || ''
    if (!isSafeImageUrl(src)) continue

    media.push({
      type: 'image',
      url: src,
      alt: img.alt?.trim() || undefined,
    })
  }

  return media
}

export function isContainerCommentOnly(el: Element): boolean {
  const tag = el.tagName.toLowerCase()
  if (tag === 'main' || tag === 'article' || tag === 'section') return false

  const classStr = (el.className && typeof el.className === 'string')
    ? el.className.toLowerCase() : ''
  const id = el.id?.toLowerCase() || ''

  return (
    classStr.includes('comment') || classStr.includes('reply') ||
    id.includes('comment') || id.includes('reply')
  )
}
