import type { SiteProfileMatch } from '../../shared/siteProfiles'
import type {
  CommentClipContext,
  CommentContextInput,
  CommentSourceMedia,
} from './commentSelection.types'
import { cleanSourceText, extractFirstTopicOrSentence, isAuthorRelationLike, hasDateLeading, stripAuthorRelationPrefix, filterSourceMedia, isContainerCommentOnly } from './commentContextCleaners'

export interface CommentContextResolver {
  id: string
  match(input: CommentContextInput): boolean
  resolve(input: CommentContextInput): Partial<CommentClipContext>
}

function getMetaContent(doc: Document, name: string, isProperty = false): string {
  const selector = isProperty
    ? `meta[property="${name}"]`
    : `meta[name="${name}"], meta[property="${name}"]`
  const el = doc.querySelector(selector)
  return el?.getAttribute('content')?.trim() || ''
}

function resolveSiteName(doc: Document, siteProfileMatch?: SiteProfileMatch | null): string {
  if (siteProfileMatch?.profile.label) return siteProfileMatch.profile.label
  const ogSiteName = getMetaContent(doc, 'og:site_name', true)
  if (ogSiteName) return ogSiteName
  try {
    const hostname = new URL(doc.URL || '').hostname
    return hostname || 'Unknown'
  } catch { return 'Unknown' }
}

function resolveSourceContainer(doc: Document, selectionRoot: Element | null, siteProfileMatch?: SiteProfileMatch | null): Element | null {
  const selectorHint = siteProfileMatch?.profile.selectorHints?.contentContainer
  if (selectorHint) {
    try {
      const els = doc.querySelectorAll(selectorHint)
      for (const el of els) {
        if (!isContainerCommentOnly(el)) return el
      }
    } catch { /* invalid selector */ }
  }
  if (selectionRoot) {
    let el: Element | null = selectionRoot
    while (el) {
      const tag = el.tagName.toLowerCase()
      if (tag === 'article' || tag === 'main') {
        if (!isContainerCommentOnly(el)) return el
      }
      el = el.parentElement
    }
  }
  const articles = doc.querySelectorAll('article')
  for (const article of articles) {
    if (!isContainerCommentOnly(article)) return article
  }
  const mainEl = doc.querySelector('main, [role="main"]')
  if (mainEl && !isContainerCommentOnly(mainEl)) {
    const firstArticle = mainEl.querySelector('article')
    if (firstArticle && !isContainerCommentOnly(firstArticle)) return firstArticle
    return mainEl
  }
  return null
}

function extractSourceText(el: Element, maxLength?: number): string {
  const clone = el.cloneNode(true) as Element
  const commentEls = clone.querySelectorAll('[class*="comment"], [class*="reply"], [class*="avatar"]')
  commentEls.forEach((c) => c.remove())
  const text = clone.textContent?.trim() || ''
  const cleaned = text.replace(/\s+/g, ' ').trim()
  if (!maxLength) return cleaned
  if (cleaned.length <= maxLength) return cleaned
  return cleaned.slice(0, maxLength) + '…'
}

function looksLikeUsername(text: string): boolean {
  if (!text || text.length < 1 || text.length > 50) return false
  if (/^(回复|赞|举报|删除|收起|展开|更多|最早|最新|最热)$/.test(text.trim())) return false
  if (/^\d{1,3}:\d{2}(:\d{2})?$/.test(text.trim())) return false
  if (/^\d{1,2}-\d{1,2}\s+\d{1,2}:\d{2}/.test(text.trim())) return false
  if (/^\d{4}-\d{2}-\d{2}/.test(text.trim())) return false
  if (/^[\d,.\s]+$/.test(text.trim())) return false
  return true
}

function findAuthorInElement(container: Element): string | undefined {
  try {
    const strong = container.querySelector('strong, b')
    if (strong) {
      const text = strong.textContent?.trim()
      if (text && looksLikeUsername(text) && text.length < 30) return text
    }
  } catch { /* query error */ }
  try {
    const authorSelectors = [
      '[class*="author"]', '[class*="user"]', '[class*="name"]', '[class*="nick"]',
      '[class*="username"]', '[class*="display-name"]', '[class*="comment-author"]',
      '[class*="reply-author"]', '[class*="评论者"]', '[class*="发布者"]',
    ]
    for (const sel of authorSelectors) {
      try {
        const el = container.querySelector(sel)
        if (el) {
          const text = el.textContent?.trim()
          if (text && looksLikeUsername(text) && text.length < 30) return text
        }
      } catch { /* invalid selector */ }
    }
  } catch { /* query error */ }
  return undefined
}

function resolveCommentAuthor(doc: Document, selectionRoot: Element | null): string | undefined {
  if (!selectionRoot) return undefined
  let current: Element | null = selectionRoot
  while (current && current !== doc.body && current !== doc.documentElement) {
    const tag = current.tagName.toLowerCase()
    if (tag === 'li' || tag === 'article' || tag === 'section') {
      const authorEl = findAuthorInElement(current)
      if (authorEl) return authorEl
    }
    if (current.className && typeof current.className === 'string') {
      const cls = current.className.toLowerCase()
      if (cls.includes('comment') || cls.includes('reply') || cls.includes('item') || cls.includes('thread')) {
        const authorEl = findAuthorInElement(current)
        if (authorEl) return authorEl
      }
    }
    current = current.parentElement
  }
  if (selectionRoot) {
    const authorEl = findAuthorInElement(selectionRoot)
    if (authorEl) return authorEl
  }
  if (selectionRoot) {
    const text = selectionRoot.textContent?.trim() || ''
    const match = text.match(/^@([^\s:：]+)/)
    if (match && looksLikeUsername(match[1])) return match[1]
  }
  return undefined
}

function isSafeImageUrl(url: string): boolean {
  if (!url) return false
  const trimmed = url.trim()
  if (!trimmed) return false
  return /^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith('/')
}

function extractMediaFromContainer(sourceContainer: Element | null, platform: string): CommentSourceMedia[] {
  if (!sourceContainer) return []
  try {
    const imgs = sourceContainer.querySelectorAll('img[src]')
    return filterSourceMedia(Array.from(imgs) as HTMLImageElement[], platform)
  } catch { return [] }
}

function extractMetaMedia(doc: Document): CommentSourceMedia[] {
  const media: CommentSourceMedia[] = []
  const ogImage = getMetaContent(doc, 'og:image', true)
  if (ogImage && isSafeImageUrl(ogImage)) {
    media.push({ type: 'image', url: ogImage })
  }
  const twImage = getMetaContent(doc, 'twitter:image')
  if (twImage && isSafeImageUrl(twImage)) {
    media.push({ type: 'image', url: twImage })
  }
  return media
}

function extractVideoPoster(sourceContainer: Element | null): CommentSourceMedia[] {
  if (!sourceContainer) return []
  const media: CommentSourceMedia[] = []
  try {
    const videos = sourceContainer.querySelectorAll('video[poster]')
    for (const video of videos) {
      const poster = video.getAttribute('poster') || ''
      if (isSafeImageUrl(poster)) {
        media.push({ type: 'poster', url: poster, label: 'Video poster' })
        if (media.length >= 1) break
      }
    }
  } catch { /* query error */ }
  return media
}

function makeSourceTitle(
  title: string,
  sourceContainer: Element | null,
  platformName: string,
): string {
  if (title && title.length > 0 && title !== 'Untitled') return cleanSourceText(title, 200)

  if (sourceContainer) {
    const excerpt = extractSourceText(sourceContainer, 60)
    const cleaned = cleanSourceText(excerpt, 60)
    if (cleaned) {
      if (platformName === '微博') return `微博：${extractFirstTopicOrSentence(cleaned, 60)}`
      if (platformName === 'Douyin') return `抖音：${extractFirstTopicOrSentence(cleaned, 60)}`
      if (platformName === 'Xiaohongshu') return `小红书：${extractFirstTopicOrSentence(cleaned, 60)}`
      return extractFirstTopicOrSentence(cleaned, 60)
    }
  }

  return `${platformName}评论摘录`
}

function makeSourceExcerpt(sourceContainer: Element | null, maxLength: number = 50): string | undefined {
  if (!sourceContainer) return undefined
  const text = extractSourceText(sourceContainer)
  const cleaned = cleanSourceText(text, maxLength)
  if (!cleaned) return undefined
  return cleaned
}

// ===== Weibo Resolver =====

const weiboResolver: CommentContextResolver = {
  id: 'weibo',
  match(input: CommentContextInput): boolean {
    const profileId = input.siteProfileMatch?.profile.id || ''
    return profileId === 'weibo-social'
  },
  resolve(input: CommentContextInput): Partial<CommentClipContext> {
    const siteName = resolveSiteName(input.document, input.siteProfileMatch)
    const sourceContainer = resolveSourceContainer(input.document, input.selectionRoot ?? null, input.siteProfileMatch)
    const author = resolveCommentAuthor(input.document, input.selectionRoot ?? null)

    let sourceTitle = ''

    if (sourceContainer) {
      const heading = sourceContainer.querySelector('h1, h2, h3')
      if (heading) {
        const headingText = heading.textContent?.trim()
        if (headingText && headingText.length > 0 && headingText.length < 200) {
          sourceTitle = cleanSourceText(headingText, 200)
        }
      }
      if (!sourceTitle) {
        const rawText = extractSourceText(sourceContainer, 120)
        let cleaned = cleanSourceText(rawText, 80)
        if (hasDateLeading(cleaned) || isAuthorRelationLike(cleaned)) {
          cleaned = stripAuthorRelationPrefix(cleaned)
          cleaned = cleanSourceText(cleaned, 80)
        }
        const topicSentence = extractFirstTopicOrSentence(cleaned, 80)
        sourceTitle = topicSentence ? `微博：${topicSentence}` : `微博评论摘录`
      }
    }

    if (!sourceTitle || sourceTitle === '微博评论摘录') {
      const ogTitle = getMetaContent(input.document, 'og:title', true)
      if (ogTitle && ogTitle !== '微博正文 - 微博' && ogTitle !== '微博正文' && !/^微博/.test(ogTitle)) {
        sourceTitle = cleanSourceText(ogTitle, 200)
      }
    }

    if (!sourceTitle) {
      sourceTitle = makeSourceTitle('微博评论摘录', sourceContainer, '微博')
    }

    const sourceExcerpt = makeSourceExcerpt(sourceContainer, 50)

    let sourceMedia = extractMediaFromContainer(sourceContainer, 'weibo')
    if (sourceMedia.length === 0) {
      sourceMedia = extractMetaMedia(input.document).slice(0, 2)
    }
    const posters = extractVideoPoster(sourceContainer)
    if (posters.length > 0 && sourceMedia.length < 2) {
      sourceMedia.push(...posters.slice(0, 2 - sourceMedia.length))
    }

    const warnings: string[] = []
    if (!author) warnings.push('author-unresolved')
    if (sourceMedia.length === 0) warnings.push('no-media')
    if (!sourceExcerpt) warnings.push('no-excerpt')

    return {
      siteName,
      sourceTitle,
      sourceAuthor: undefined,
      sourceExcerpt,
      sourceMedia,
      selectedComment: { author, text: input.selectionText },
      warnings,
      mode: input.mode,
      reasons: input.reasons,
      pageTitle: input.pageTitle,
      pageUrl: input.pageUrl,
    }
  },
}

// ===== Bilibili Resolver =====

const bilibiliResolver: CommentContextResolver = {
  id: 'bilibili',
  match(input: CommentContextInput): boolean {
    const profileId = input.siteProfileMatch?.profile.id || ''
    return profileId === 'bilibili-video'
  },
  resolve(input: CommentContextInput): Partial<CommentClipContext> {
    const siteName = resolveSiteName(input.document, input.siteProfileMatch)
    const sourceContainer = resolveSourceContainer(input.document, input.selectionRoot ?? null, input.siteProfileMatch)
    const author = resolveCommentAuthor(input.document, input.selectionRoot ?? null)

    let sourceTitle = ''

    if (sourceContainer) {
      const heading = sourceContainer.querySelector('h1, h2, .video-info-title, .video-title')
      if (heading) {
        const headingText = heading.textContent?.trim()
        if (headingText && headingText.length > 0 && headingText.length < 200) {
          sourceTitle = cleanSourceText(headingText, 200)
        }
      }
    }

    if (!sourceTitle) {
      const ogTitle = getMetaContent(input.document, 'og:title', true)
      if (ogTitle) {
        const cleaned = ogTitle
          .replace(/\s*[-–—|_]\s*Bilibili\s*$/gi, '')
          .replace(/\s*[-–—|_]\s*bilibili\s*$/i, '')
          .replace(/\s*_哔哩哔哩_bilibili\s*$/i, '')
          .replace(/\s*_哔哩哔哩\s*$/i, '')
          .trim()
        if (cleaned) sourceTitle = cleanSourceText(cleaned, 200)
      }
    }

    if (!sourceTitle) {
      const h1 = input.document.querySelector('h1')
      if (h1) {
        const h1Text = h1.textContent?.trim()
        if (h1Text && h1Text.length < 200) {
          sourceTitle = cleanSourceText(h1Text, 200)
        }
      }
    }

    if (!sourceTitle) {
      sourceTitle = makeSourceTitle(input.pageTitle, sourceContainer, 'Bilibili')
    }

    const sourceExcerpt = makeSourceExcerpt(sourceContainer, 60)

    let sourceMedia = extractMediaFromContainer(sourceContainer, 'bilibili')
    if (sourceMedia.length === 0) {
      sourceMedia = extractMetaMedia(input.document).slice(0, 2)
    }
    const posters = extractVideoPoster(sourceContainer)
    if (posters.length > 0 && sourceMedia.length < 2) {
      sourceMedia.push(...posters.slice(0, 2 - sourceMedia.length))
    }

    const warnings: string[] = []
    if (!author) warnings.push('author-unresolved')
    if (sourceMedia.length === 0) warnings.push('no-media')

    return {
      siteName,
      sourceTitle,
      sourceAuthor: undefined,
      sourceExcerpt,
      sourceMedia,
      selectedComment: { author, text: input.selectionText },
      warnings,
      mode: input.mode,
      reasons: input.reasons,
      pageTitle: input.pageTitle,
      pageUrl: input.pageUrl,
    }
  },
}

// ===== Generic Social Resolver (Douyin, Xiaohongshu, etc.) =====

const genericSocialCommentResolver: CommentContextResolver = {
  id: 'generic-social',
  match(_input: CommentContextInput): boolean {
    void _input
    return true
  },
  resolve(input: CommentContextInput): Partial<CommentClipContext> {
    const siteName = resolveSiteName(input.document, input.siteProfileMatch)
    const sourceContainer = resolveSourceContainer(input.document, input.selectionRoot ?? null, input.siteProfileMatch)
    const author = resolveCommentAuthor(input.document, input.selectionRoot ?? null)

    const sourceTitle = makeSourceTitle(input.pageTitle, sourceContainer, siteName)
    const sourceExcerpt = makeSourceExcerpt(sourceContainer, 80)

    let platform = 'generic'
    const profileId = input.siteProfileMatch?.profile.id || ''
    if (profileId.includes('douyin')) platform = 'douyin'
    else if (profileId.includes('xiaohongshu')) platform = 'xiaohongshu'

    let sourceMedia = extractMediaFromContainer(sourceContainer, platform)
    if (sourceMedia.length === 0) {
      sourceMedia = extractMetaMedia(input.document).slice(0, 2)
    }
    const posters = extractVideoPoster(sourceContainer)
    if (posters.length > 0 && sourceMedia.length < 2) {
      sourceMedia.push(...posters.slice(0, 2 - sourceMedia.length))
    }

    const warnings: string[] = []
    if (!author) warnings.push('author-unresolved')
    if (sourceMedia.length === 0) warnings.push('no-media')
    if (!sourceExcerpt) warnings.push('no-excerpt')

    return {
      siteName,
      sourceTitle,
      sourceAuthor: undefined,
      sourceExcerpt,
      sourceMedia,
      selectedComment: { author, text: input.selectionText },
      warnings,
      mode: input.mode,
      reasons: input.reasons,
      pageTitle: input.pageTitle,
      pageUrl: input.pageUrl,
    }
  },
}

// ===== Pipeline =====

const RESOLVERS: CommentContextResolver[] = [
  weiboResolver,
  bilibiliResolver,
]

const FALLBACK_RESOLVER: CommentContextResolver = genericSocialCommentResolver

function findResolver(input: CommentContextInput): CommentContextResolver {
  for (const resolver of RESOLVERS) {
    if (resolver.match(input)) return resolver
  }
  return FALLBACK_RESOLVER
}

export function resolveCommentContext(input: CommentContextInput): CommentClipContext {
  const resolver = findResolver(input)
  const partial = resolver.resolve(input)

  const fallback = FALLBACK_RESOLVER.match(input) === true && resolver.id !== 'generic-social'
    ? FALLBACK_RESOLVER.resolve(input)
    : null

  const merge = <T>(val: T | undefined, fallback: T | undefined): T | undefined =>
    val !== undefined ? val : fallback

  const sourceTitle = merge(partial.sourceTitle, fallback?.sourceTitle) || 'Untitled'
  const sourceExcerpt = merge(partial.sourceExcerpt, fallback?.sourceExcerpt)
  const sourceMedia = merge(partial.sourceMedia, fallback?.sourceMedia) || []
  const author = merge(partial.selectedComment?.author, fallback?.selectedComment?.author)
  const siteName = merge(partial.siteName, fallback?.siteName) || 'Unknown'
  const warnings = [...(partial.warnings || []), ...((fallback?.warnings || []).filter((w: string) => !(partial.warnings || []).includes(w)))]

  return {
    siteName,
    pageUrl: input.pageUrl,
    pageTitle: input.pageTitle,
    sourceTitle,
    sourceAuthor: partial.sourceAuthor || fallback?.sourceAuthor,
    sourceExcerpt: sourceExcerpt || undefined,
    sourceMedia: sourceMedia || [],
    selectedComment: {
      author,
      text: input.selectionText,
    },
    warnings: warnings.filter((w, i, arr) => arr.indexOf(w) === i),
    mode: input.mode,
    reasons: input.reasons,
  }
}
