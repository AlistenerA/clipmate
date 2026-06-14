import type { SiteProfileMatch } from '../../shared/siteProfiles'
import type {
  CommentClipContext,
  CommentContextInput,
  CommentSourceMedia,
} from './commentSelection.types'

const GENERIC_TITLE_PATTERNS = [
  /^微博正文$/,
  /^微博正文\s*[-–—|]\s*微博$/,
  /^微博\s*[-–—|]\s*.+$/,
  /^微博$/,
  /^Weibo$/i,
  /^weibo\.com$/i,
]

export function isGenericPlatformTitle(title: string, siteName?: string): boolean {
  const trimmed = title.trim()
  if (!trimmed) return false

  for (const pattern of GENERIC_TITLE_PATTERNS) {
    if (pattern.test(trimmed)) return true
  }

  if (siteName) {
    const lowerSite = siteName.toLowerCase().trim()
    const lowerTitle = trimmed.toLowerCase()
    if (
      lowerTitle === lowerSite ||
      lowerTitle === `${lowerSite}.com` ||
      lowerTitle === `www.${lowerSite}.com`
    ) {
      return true
    }
  }

  return false
}

const PLATFORM_SUFFIXES = [
  /\s*[-–—|]\s*微博/g,
  /\s*[-–—|]\s*知乎/g,
  /\s*[-–—|]\s*Bilibili\s*$/gi,
  /\s*[-–—|]\s*Reddit\s*$/gi,
  /\s*[-–—|]\s*YouTube\s*$/gi,
  /\s*[-–—|]\s*Twitter\s*$/gi,
  /\s*[-–—|]\s*X\s*$/gi,
  /\s*[-–—|]\s*Douyin\s*$/gi,
  /\s*[-–—|]\s*TikTok\s*$/gi,
  /\s*[-–—|]\s*Xiaohongshu\s*$/gi,
]

const COMMENT_LINK_KEYWORDS = [
  '/user/', '/users/', '/people/', '/profile/',
  '/u/', '/member/', '/author/',
]



function stripPlatformSuffix(title: string): string {
  let result = title
  for (const pattern of PLATFORM_SUFFIXES) {
    const cleaned = result.replace(pattern, '').trim()
    if (cleaned) result = cleaned
  }
  return result || title
}

function getMetaContent(doc: Document, name: string, isProperty = false): string {
  const selector = isProperty
    ? `meta[property="${name}"]`
    : `meta[name="${name}"], meta[property="${name}"]`
  const el = doc.querySelector(selector)
  return el?.getAttribute('content')?.trim() || ''
}

function resolveSourceContainer(
  doc: Document,
  selectionRoot: Element | null,
  siteProfileMatch?: SiteProfileMatch | null,
): Element | null {
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

function resolveSiteName(
  doc: Document,
  siteProfileMatch?: SiteProfileMatch | null,
): string {
  if (siteProfileMatch?.profile.label) {
    return siteProfileMatch.profile.label
  }

  const ogSiteName = getMetaContent(doc, 'og:site_name', true)
  if (ogSiteName) return ogSiteName

  try {
    const hostname = new URL(doc.URL || '').hostname
    return hostname || 'Unknown'
  } catch {
    return 'Unknown'
  }
}

export function extractSourceTitle(
  doc: Document,
  selectionRoot: Element | null,
  siteProfileMatch: SiteProfileMatch | null | undefined,
  pageTitle: string,
): string {
  const sourceContainer = resolveSourceContainer(doc, selectionRoot, siteProfileMatch)
  const siteName = siteProfileMatch?.profile.label

  if (sourceContainer) {
    const heading = sourceContainer.querySelector('h1, h2, h3')
    if (heading) {
      const headingText = heading.textContent?.trim()
      if (headingText && headingText.length > 0 && headingText.length < 200) {
        return headingText
      }
    }

    const sourceText = extractSourceText(sourceContainer, 100)
    if (sourceText && sourceText.length > 3) {
      if (isGenericPlatformTitle(doc.title || '', siteName) ||
          isGenericPlatformTitle(pageTitle, siteName)) {
        const excerpt = extractSourceText(sourceContainer, 50)
        if (excerpt) {
          if (siteName === 'Weibo' || siteName?.toLowerCase().includes('weibo')) {
            return `微博：${excerpt}`
          }
          return excerpt
        }
      }
    }
  }

  const ogTitle = getMetaContent(doc, 'og:title', true)
  if (ogTitle && !isGenericPlatformTitle(ogTitle, siteName)) {
    return ogTitle
  }

  const twitterTitle = getMetaContent(doc, 'twitter:title')
  if (twitterTitle && !isGenericPlatformTitle(twitterTitle, siteName)) {
    return twitterTitle
  }

  if (sourceContainer && isGenericPlatformTitle(doc.title || pageTitle, siteName)) {
    const excerpt = extractSourceText(sourceContainer, 50)
    if (excerpt) {
      if (siteName === 'Weibo' || siteName?.toLowerCase().includes('weibo')) {
        return `微博：${excerpt}`
      }
      return excerpt
    }
  }

  const cleaned = stripPlatformSuffix(doc.title || pageTitle)
  if (cleaned && cleaned.length > 0 && !isGenericPlatformTitle(cleaned, siteName)) {
    return cleaned
  }

  return pageTitle || 'Untitled'
}

export function extractSourceExcerpt(
  doc: Document,
  selectionRoot: Element | null,
  siteProfileMatch: SiteProfileMatch | null | undefined,
  maxLength: number = 50,
): string | undefined {
  const sourceContainer = resolveSourceContainer(doc, selectionRoot, siteProfileMatch)
  if (!sourceContainer) return undefined

  const text = extractSourceText(sourceContainer, maxLength)
  if (!text) return undefined

  return text.length <= maxLength ? text : text.slice(0, maxLength) + '…'
}

function isSafeImageUrl(url: string): boolean {
  if (!url) return false
  const trimmed = url.trim()
  if (!trimmed) return false
  return /^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith('/')
}

function isCommentAreaElement(el: Element): boolean {
  let current: Element | null = el
  while (current) {
    const className = (current.className && typeof current.className === 'string')
      ? current.className.toLowerCase() : ''
    const id = current.id?.toLowerCase() || ''
    if (
      className.includes('comment') || className.includes('reply') ||
      className.includes('avatar') || id.includes('comment') ||
      id.includes('reply') || id.includes('avatar')
    ) {
      return true
    }
    current = current.parentElement
  }
  return false
}

function isContainerCommentOnly(el: Element): boolean {
  const tag = el.tagName.toLowerCase()
  if (tag === 'main' || tag === 'article' || tag === 'section') return false

  const className = (el.className && typeof el.className === 'string')
    ? el.className.toLowerCase() : ''
  const id = el.id?.toLowerCase() || ''

  return (
    className.includes('comment') || className.includes('reply') ||
    id.includes('comment') || id.includes('reply')
  )
}

function isAvatarImage(img: HTMLImageElement): boolean {
  const alt = (img.alt || '').toLowerCase()
  if (alt.includes('avatar') || alt.includes('头像') || alt.includes('icon')) return true

  const classStr = (img.className && typeof img.className === 'string')
    ? img.className.toLowerCase() : ''
  if (classStr.includes('avatar') || classStr.includes('头像') || classStr.includes('icon')) return true

  const width = parseInt(img.getAttribute('width') || '', 10)
  const height = parseInt(img.getAttribute('height') || '', 10)
  if (!isNaN(width) && width < 40) return true
  if (!isNaN(height) && height < 40) return true
  if (!isNaN(width) && !isNaN(height) && width < 60 && height < 60) return true

  const src = (img.src || '').toLowerCase()
  if (src.includes('avatar') || src.includes('头像') || src.includes('icon')) return true

  return false
}

export function extractSourceMedia(
  doc: Document,
  selectionRoot: Element | null,
  siteProfileMatch: SiteProfileMatch | null | undefined,
): CommentSourceMedia[] {
  const media: CommentSourceMedia[] = []

  const sourceContainer = resolveSourceContainer(doc, selectionRoot, siteProfileMatch)

  if (sourceContainer) {
    try {
      const images = sourceContainer.querySelectorAll('img[src]')
      for (const img of images) {
        const htmlImg = img as HTMLImageElement
        if (isCommentAreaElement(htmlImg)) continue
        if (isAvatarImage(htmlImg)) continue

        const src = htmlImg.src || htmlImg.getAttribute('src') || ''
        if (!isSafeImageUrl(src)) continue

        media.push({
          type: 'image',
          url: src,
          alt: htmlImg.alt?.trim() || undefined,
        })

        if (media.length >= 5) break
      }
    } catch { /* DOM access error */ }
  }

  if (media.length < 5) {
    const ogImage = getMetaContent(doc, 'og:image', true)
    if (ogImage && isSafeImageUrl(ogImage)) {
      media.push({ type: 'image', url: ogImage })
    }
  }

  if (media.length < 5) {
    const twitterImage = getMetaContent(doc, 'twitter:image')
    if (twitterImage && isSafeImageUrl(twitterImage)) {
      media.push({ type: 'image', url: twitterImage })
    }
  }

  if (sourceContainer && media.length < 5) {
    try {
      const videos = sourceContainer.querySelectorAll('video[poster]')
      for (const video of videos) {
        const poster = video.getAttribute('poster') || ''
        if (isSafeImageUrl(poster)) {
          media.push({ type: 'poster', url: poster, label: 'Video poster' })
          if (media.length >= 5) break
        }
      }
    } catch { /* DOM access error */ }
  }

  return media
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

export function resolveCommentAuthor(
  doc: Document,
  selectionRoot: Element | null,
): string | undefined {
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
      if (
        cls.includes('comment') || cls.includes('reply') ||
        cls.includes('item') || cls.includes('thread')
      ) {
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
    if (match && looksLikeUsername(match[1])) {
      return match[1]
    }
  }

  return undefined
}

function findAuthorInElement(container: Element): string | undefined {
  try {
    const strong = container.querySelector('strong, b')
    if (strong) {
      const text = strong.textContent?.trim()
      if (text && looksLikeUsername(text) && text.length < 30) {
        return text
      }
    }
  } catch { /* query error */ }

  try {
    const authorSelectors = [
      '[class*="author"]', '[class*="user"]',
      '[class*="name"]', '[class*="nick"]',
      '[class*="username"]', '[class*="display-name"]',
      '[class*="comment-author"]', '[class*="reply-author"]',
      '[class*="评论者"]', '[class*="发布者"]',
    ]
    for (const sel of authorSelectors) {
      try {
        const el = container.querySelector(sel)
        if (el) {
          const text = el.textContent?.trim()
          if (text && looksLikeUsername(text) && text.length < 30) {
            return text
          }
        }
      } catch { /* invalid selector */ }
    }
  } catch { /* query error */ }

  try {
    const links = container.querySelectorAll('a[href]')
    for (const link of links) {
      const href = (link.getAttribute('href') || '').trim()
      const isProfileLink = COMMENT_LINK_KEYWORDS.some((kw) =>
        href.toLowerCase().includes(kw),
      )
      if (isProfileLink) {
        const text = link.textContent?.trim()
        if (text && looksLikeUsername(text) && text.length < 50) {
          return text
        }
      }
    }
  } catch { /* query error */ }

  return undefined
}

export function buildCommentClipContext(input: CommentContextInput): CommentClipContext {
  const selectionRoot: Element | null = input.selectionRoot ?? null

  const siteName = resolveSiteName(input.document, input.siteProfileMatch)
  const sourceTitle = extractSourceTitle(
    input.document,
    selectionRoot,
    input.siteProfileMatch,
    input.pageTitle,
  )
  const sourceExcerpt = extractSourceExcerpt(
    input.document,
    selectionRoot,
    input.siteProfileMatch,
  )
  const sourceMedia = extractSourceMedia(
    input.document,
    selectionRoot,
    input.siteProfileMatch,
  )
  const author = resolveCommentAuthor(input.document, selectionRoot)

  const warnings: string[] = []

  if (!author) {
    warnings.push('author-unresolved')
  }

  if (sourceMedia.length === 0) {
    warnings.push('no-media')
  }

  if (
    isGenericPlatformTitle(sourceTitle, siteName) ||
    (sourceTitle === input.pageTitle && isGenericPlatformTitle(input.pageTitle, siteName))
  ) {
    warnings.push('source-title-unresolved')
  }

  return {
    siteName,
    pageUrl: input.pageUrl,
    pageTitle: input.pageTitle,
    sourceTitle,
    sourceExcerpt,
    sourceMedia,
    selectedComment: {
      author,
      text: input.selectionText,
    },
    warnings,
    mode: input.mode,
    reasons: input.reasons,
  }
}
