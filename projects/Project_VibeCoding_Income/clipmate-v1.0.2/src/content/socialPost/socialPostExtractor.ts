import type {
  SocialPostComment,
  SocialPostExtraction,
  SocialPostExtractionOptions,
  SocialPostImage,
  SocialPostPlatform,
} from './socialPost.types'

export const MAX_SOCIAL_POST_COMMENTS = 50

const MAX_SCROLL_PASSES = 24
const SCROLL_SETTLE_MS = 120

interface SocialPostSnapshot {
  platform: SocialPostPlatform
  platformLabel: string
  title: string
  author?: string
  publishedAt?: string
  canonicalUrl: string
  bodyText: string
  images: SocialPostImage[]
  comments: SocialPostComment[]
}

export async function extractSupportedSocialPost(
  doc: Document,
  options: SocialPostExtractionOptions = {},
): Promise<SocialPostExtraction | null> {
  const platform = detectSocialPostPlatform(doc.URL)
  if (!platform) return null

  const maxComments = clampCommentLimit(options.maxComments)
  let snapshot = extractRawSocialPostSnapshot(doc, platform, maxComments)
  if (!snapshot) return null

  if (options.collectVirtualized !== false && snapshot.comments.length < maxComments) {
    const comments = await collectVirtualizedComments(
      doc,
      platform,
      snapshot.comments,
      maxComments,
      options.wait || delay,
    )
    snapshot = { ...snapshot, comments }
  }

  return finalizeSnapshot(snapshot)
}

export function extractSocialPostSnapshot(
  doc: Document,
  maxComments: number = MAX_SOCIAL_POST_COMMENTS,
): SocialPostExtraction | null {
  const platform = detectSocialPostPlatform(doc.URL)
  if (!platform) return null
  const limit = clampCommentLimit(maxComments)
  const snapshot = extractRawSocialPostSnapshot(doc, platform, limit)
  return snapshot ? finalizeSnapshot(snapshot) : null
}

function extractRawSocialPostSnapshot(
  doc: Document,
  platform: SocialPostPlatform,
  maxComments: number,
): SocialPostSnapshot | null {
  return platform === 'xiaohongshu'
    ? extractXiaohongshuSnapshot(doc, maxComments)
    : extractTiebaSnapshot(doc, maxComments)
}

export function detectSocialPostPlatform(url: string): SocialPostPlatform | null {
  try {
    const parsed = new URL(url)
    const hostname = parsed.hostname.toLowerCase()
    if (hostname === 'xiaohongshu.com' || hostname.endsWith('.xiaohongshu.com')) {
      return /^\/explore\/[^/]+/.test(parsed.pathname) ? 'xiaohongshu' : null
    }
    if (hostname === 'tieba.baidu.com') {
      return /^\/p\/\d+/.test(parsed.pathname) ? 'tieba' : null
    }
  } catch {
    return null
  }
  return null
}

function extractXiaohongshuSnapshot(
  doc: Document,
  maxComments: number,
): SocialPostSnapshot | null {
  const root = doc.querySelector('#noteContainer, .note-container')
  if (!root) return null

  const title = getText(root.querySelector('#detail-title')) || cleanPageTitle(doc.title, '小红书')
  const bodyText = getText(root.querySelector('#detail-desc'))
  const author = getText(
    root.querySelector('.author-container .name .username, .author-container .author-wrapper a.name'),
  ) || undefined
  const publishedAt = getText(
    root.querySelector('.note-content .bottom-container .date, .note-content span.date'),
  ) || undefined

  return {
    platform: 'xiaohongshu',
    platformLabel: '小红书',
    title: title || '小红书笔记',
    author,
    publishedAt,
    canonicalUrl: canonicalizeSourceUrl(doc.URL),
    bodyText,
    images: extractXiaohongshuImages(root, doc.URL),
    comments: extractXiaohongshuComments(root, doc.URL, maxComments),
  }
}

function extractXiaohongshuImages(root: Element, pageUrl: string): SocialPostImage[] {
  const indexed = new Map<number, SocialPostImage>()
  const unindexed: SocialPostImage[] = []
  const seenUrls = new Set<string>()

  for (const slide of root.querySelectorAll('.media-container .swiper-slide')) {
    const image = slide.querySelector('img')
    const url = image ? getImageUrl(image, pageUrl) : ''
    if (!url || seenUrls.has(url)) continue
    const item = { url, alt: cleanOptionalText(image?.getAttribute('alt')) }
    const indexValue = slide.getAttribute('data-swiper-slide-index') || slide.getAttribute('data-index')
    const index = indexValue === null ? Number.NaN : Number.parseInt(indexValue, 10)
    if (Number.isFinite(index)) {
      if (!indexed.has(index)) indexed.set(index, item)
    } else {
      unindexed.push(item)
    }
    seenUrls.add(url)
  }

  if (indexed.size === 0 && unindexed.length === 0) {
    for (const image of root.querySelectorAll('.media-container img')) {
      const url = getImageUrl(image, pageUrl)
      if (!url || seenUrls.has(url)) continue
      seenUrls.add(url)
      unindexed.push({ url, alt: cleanOptionalText(image.getAttribute('alt')) })
    }
  }

  const ordered = [...indexed.entries()]
    .sort(([left], [right]) => left - right)
    .map(([, image]) => image)
  return dedupeImages([...ordered, ...unindexed])
}

function extractXiaohongshuComments(
  root: Element,
  pageUrl: string,
  maxComments: number,
): SocialPostComment[] {
  const comments: SocialPostComment[] = []
  for (const item of root.querySelectorAll('.comments-container .comment-item')) {
    if (comments.length >= maxComments) break
    const parent = item.closest('.parent-comment')
    const firstItem = parent?.querySelector('.comment-item')
    const depth: 0 | 1 = firstItem === item ? 0 : 1
    const author = getText(
      item.querySelector('.comment-inner-container .author-wrapper .author .name, .comment-inner-container .author-wrapper a.name'),
    ) || undefined
    const text = getText(
      item.querySelector('.comment-inner-container > .right > .content, .comment-inner-container .right .content'),
    )
    const date = getText(
      item.querySelector('.comment-inner-container > .right > .info .date > span:not(.location), .comment-inner-container .date > span:not(.location)'),
    ) || undefined
    const images = [...item.querySelectorAll('.comment-inner-container .comment-picture img')]
      .map((image) => ({
        url: getImageUrl(image, pageUrl),
        alt: cleanOptionalText(image.getAttribute('alt')),
      }))
      .filter((image) => Boolean(image.url))
    if (!text && images.length === 0) continue
    comments.push({
      key: item.id || item.getAttribute('data-id') || buildCommentKey(author, text, date, depth),
      author,
      text,
      date,
      depth,
      images: dedupeImages(images),
    })
  }
  return comments
}

function extractTiebaSnapshot(doc: Document, maxComments: number): SocialPostSnapshot | null {
  const firstFloor = doc.querySelector('.image-text')
  const contentRoot = firstFloor?.querySelector('.pb-content-wrap')
  if (!firstFloor || !contentRoot) return null

  const title = getText(firstFloor.querySelector('.pc-pb-title .pb-title'))
    || cleanPageTitle(doc.title, '百度贴吧')
  const author = getText(firstFloor.querySelector('.head-line.user-info .head-name')) || undefined
  const publishedAt = getText(firstFloor.querySelector('.head-line.user-info .desc-info')) || undefined
  const body = extractTiebaRichContent(contentRoot, doc.URL)

  return {
    platform: 'tieba',
    platformLabel: '百度贴吧',
    title: title || '百度贴吧主题',
    author,
    publishedAt,
    canonicalUrl: canonicalizeSourceUrl(doc.URL),
    bodyText: body.text,
    images: body.images,
    comments: extractTiebaComments(doc, maxComments),
  }
}

function extractTiebaComments(doc: Document, maxComments: number): SocialPostComment[] {
  const comments: SocialPostComment[] = []
  for (const item of doc.querySelectorAll('.pc-pb-reply-list .pb-comment-item')) {
    if (comments.length >= maxComments) break
    const content = item.querySelector(':scope > .comment-content') || item.querySelector('.comment-content')
    const rich = content?.querySelector('.pb-rich-text') || content
    const body = extractTiebaRichContent(rich, doc.URL)
    const author = getText(item.querySelector(':scope > .head-line.user-info .head-name')) || undefined
    const date = getText(
      content?.querySelector('.pc-pb-comments-desc .comment-desc-left') || null,
    ) || getText(item.querySelector(':scope > .head-line.user-info .desc-info')) || undefined
    if (body.text || body.images.length > 0) {
      comments.push({
        key: item.getAttribute('data-id') || buildCommentKey(author, body.text, date, 0),
        author,
        text: body.text,
        date,
        depth: 0,
        images: body.images,
      })
    }

    for (const reply of item.querySelectorAll('.lzl-wrapper .pb-lzl-item')) {
      if (comments.length >= maxComments) break
      const replyContent = reply.querySelector(':scope > .comment-content') || reply.querySelector('.comment-content')
      const replyRich = replyContent?.querySelector('.pb-rich-text') || replyContent
      const replyBody = extractTiebaRichContent(replyRich, doc.URL)
      const replyAuthor = getText(reply.querySelector('.head-line.user-info .head-name'))
        || getText(reply.querySelector('.head-line.user-info .name-info-link'))
        || undefined
      const replyDate = getText(replyContent?.querySelector('.comment-desc-left') || null) || undefined
      if (!replyBody.text && replyBody.images.length === 0) continue
      comments.push({
        key: reply.getAttribute('data-id') || buildCommentKey(replyAuthor, replyBody.text, replyDate, 1),
        author: replyAuthor,
        text: replyBody.text,
        date: replyDate,
        depth: 1,
        images: replyBody.images,
      })
    }
  }
  return comments
}

function extractTiebaRichContent(
  root: Element | null | undefined,
  pageUrl: string,
): { text: string; images: SocialPostImage[] } {
  if (!root) return { text: '', images: [] }
  const container = root.matches('.richtext-item, .pb-rich-text')
    ? root
    : root.querySelector('.richtext-item, .pb-rich-text') || root
  const blocks = [...container.children].filter((child) =>
    child.matches('.pb-content-item, .image-card-wrapper, .richtext-item'),
  )
  const textParts: string[] = []
  const images: SocialPostImage[] = []
  const candidates = blocks.length > 0 ? blocks : [container]

  for (const block of candidates) {
    if (block.matches('.image-card-wrapper') || block.querySelector('img')) {
      for (const image of block.querySelectorAll('img')) {
        const url = getImageUrl(image, pageUrl)
        if (url) images.push({ url, alt: cleanOptionalText(image.getAttribute('alt')) })
      }
      if (block.matches('.image-card-wrapper')) continue
    }
    const text = getText(block)
    if (text) textParts.push(text)
  }

  return {
    text: dedupeStrings(textParts).join('\n\n'),
    images: dedupeImages(images),
  }
}

async function collectVirtualizedComments(
  doc: Document,
  platform: SocialPostPlatform,
  initial: SocialPostComment[],
  maxComments: number,
  wait: (milliseconds: number) => Promise<void>,
): Promise<SocialPostComment[]> {
  const selector = platform === 'xiaohongshu'
    ? '#noteContainer .note-scroller, .note-container .note-scroller'
    : '.pc-pb-box.styled-scrollbar.deep, .pc-pb-box'
  const scroller = doc.querySelector(selector) as HTMLElement | null
  if (!scroller || scroller.scrollHeight <= scroller.clientHeight) {
    return mergeComments([], initial, maxComments)
  }

  const comments = mergeComments([], initial, maxComments)
  const originalScrollTop = scroller.scrollTop
  const ScrollEvent = doc.defaultView?.Event || Event
  let stablePasses = 0
  try {
    for (let pass = 0; pass < MAX_SCROLL_PASSES && comments.length < maxComments; pass += 1) {
      const previousCount = comments.length
      const step = Math.max(Math.floor(scroller.clientHeight * 0.8), 600)
      const maxScrollTop = Math.max(scroller.scrollHeight - scroller.clientHeight, 0)
      const nextScrollTop = Math.min(scroller.scrollTop + step, maxScrollTop)
      scroller.scrollTop = nextScrollTop
      scroller.dispatchEvent(new ScrollEvent('scroll', { bubbles: false }))
      await wait(SCROLL_SETTLE_MS)

      const nextSnapshot = platform === 'xiaohongshu'
        ? extractXiaohongshuSnapshot(doc, maxComments)
        : extractTiebaSnapshot(doc, maxComments)
      if (nextSnapshot) {
        const merged = mergeComments(comments, nextSnapshot.comments, maxComments)
        comments.splice(0, comments.length, ...merged)
      }

      stablePasses = comments.length === previousCount ? stablePasses + 1 : 0
      const reachedBottom = nextScrollTop >= maxScrollTop
      if (reachedBottom && stablePasses >= 2) break
    }
  } finally {
    scroller.scrollTop = originalScrollTop
    scroller.dispatchEvent(new ScrollEvent('scroll', { bubbles: false }))
  }
  return comments.slice(0, maxComments)
}

function mergeComments(
  existing: SocialPostComment[],
  incoming: SocialPostComment[],
  maxComments: number,
): SocialPostComment[] {
  const merged: SocialPostComment[] = []
  const seen = new Set<string>()
  for (const comment of [...existing, ...incoming]) {
    if (merged.length >= maxComments) break
    if (seen.has(comment.key)) continue
    seen.add(comment.key)
    merged.push(comment)
  }
  return merged
}

function finalizeSnapshot(snapshot: SocialPostSnapshot): SocialPostExtraction {
  const comments = snapshot.comments.slice(0, MAX_SOCIAL_POST_COMMENTS)
  const markdown = formatSocialPostMarkdown(snapshot, comments)
  const contentText = [
    snapshot.title,
    snapshot.author || '',
    snapshot.bodyText,
    ...comments.map((comment) => comment.text),
  ].filter(Boolean).join('\n')
  return {
    ...snapshot,
    comments,
    description: snapshot.bodyText.slice(0, 280),
    contentText,
    markdown,
    contentHtml: formatSocialPostHtml(snapshot, comments),
  }
}

function formatSocialPostMarkdown(
  snapshot: SocialPostSnapshot,
  comments: SocialPostComment[],
): string {
  const lines = [
    `# ${escapeMarkdownText(snapshot.title)}`,
    '',
    `- 平台：${snapshot.platformLabel}`,
  ]
  if (snapshot.author) lines.push(`- 作者：${escapeMarkdownText(snapshot.author)}`)
  if (snapshot.publishedAt) lines.push(`- 时间：${escapeMarkdownText(snapshot.publishedAt)}`)
  lines.push(`- 来源：[原帖](${snapshot.canonicalUrl})`, '', '## 正文', '')
  if (snapshot.bodyText) lines.push(snapshot.bodyText, '')
  for (const image of snapshot.images) {
    lines.push(`![${escapeMarkdownAlt(image.alt || snapshot.title)}](${image.url})`, '')
  }

  if (comments.length > 0) {
    lines.push(`## 评论（最多 ${MAX_SOCIAL_POST_COMMENTS} 条）`, '')
    comments.forEach((comment, index) => {
      lines.push(`${comment.depth === 1 ? '####' : '###'} ${comment.depth === 1 ? '回复' : '评论'} ${index + 1}`)
      lines.push('')
      if (comment.author) lines.push(`**${escapeMarkdownText(comment.author)}**`)
      if (comment.date) lines.push(`_${escapeMarkdownText(comment.date)}_`)
      if (comment.author || comment.date) lines.push('')
      if (comment.text) lines.push(comment.text, '')
      for (const image of comment.images) {
        lines.push(`![评论图片](${image.url})`, '')
      }
    })
  }
  return lines.join('\n').trim()
}

function formatSocialPostHtml(
  snapshot: SocialPostSnapshot,
  comments: SocialPostComment[],
): string {
  const metadata = [
    `<p>平台：${escapeHtml(snapshot.platformLabel)}</p>`,
    snapshot.author ? `<p>作者：${escapeHtml(snapshot.author)}</p>` : '',
    snapshot.publishedAt ? `<p>时间：${escapeHtml(snapshot.publishedAt)}</p>` : '',
    `<p>来源：${escapeHtml(snapshot.canonicalUrl)}</p>`,
  ].filter(Boolean).join('')
  const bodyImages = snapshot.images
    .map((image) => `<figure><img src="${escapeHtmlAttribute(image.url)}" alt="${escapeHtmlAttribute(image.alt || snapshot.title)}"></figure>`)
    .join('')
  const commentHtml = comments.map((comment) => {
    const images = comment.images
      .map((image) => `<img src="${escapeHtmlAttribute(image.url)}" alt="评论图片">`)
      .join('')
    return `<article data-depth="${comment.depth}">${comment.author ? `<h3>${escapeHtml(comment.author)}</h3>` : ''}${comment.date ? `<p>${escapeHtml(comment.date)}</p>` : ''}<p>${escapeHtml(comment.text)}</p>${images}</article>`
  }).join('')
  return `<article data-clipmate-social-post="${snapshot.platform}"><h1>${escapeHtml(snapshot.title)}</h1>${metadata}<section><h2>正文</h2><p>${escapeHtml(snapshot.bodyText)}</p>${bodyImages}</section>${comments.length > 0 ? `<section><h2>评论</h2>${commentHtml}</section>` : ''}</article>`
}

function canonicalizeSourceUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl)
    parsed.search = ''
    parsed.hash = ''
    return parsed.toString()
  } catch {
    return rawUrl
  }
}

function getImageUrl(image: Element, pageUrl: string): string {
  const candidates = [
    image.getAttribute('data-src'),
    image instanceof HTMLImageElement ? image.currentSrc : null,
    image.getAttribute('src'),
  ]
  for (const candidate of candidates) {
    if (!candidate) continue
    try {
      const parsed = new URL(candidate, pageUrl)
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return parsed.toString()
    } catch {
      continue
    }
  }
  return ''
}

function getText(element: Element | null | undefined): string {
  if (!element) return ''
  const clone = element.cloneNode(true) as Element
  clone.querySelectorAll('script, style, svg, button, .comment-menu, .interactions, .more-popover')
    .forEach((node) => node.remove())
  clone.querySelectorAll('img[alt]').forEach((image) => {
    const alt = image.getAttribute('alt')?.trim()
    if (alt) image.replaceWith(clone.ownerDocument.createTextNode(alt))
  })
  return normalizeText(clone.textContent || '')
}

function normalizeText(value: string): string {
  return value.replace(/\u00a0/g, ' ').replace(/[ \t]+/g, ' ').replace(/\s*\n\s*/g, '\n').trim()
}

function cleanPageTitle(title: string, suffix: string): string {
  const cleaned = title.replace(new RegExp(`\\s*[-–—|]\\s*${suffix}\\s*$`, 'i'), '').trim()
  return cleaned || title.trim()
}

function cleanOptionalText(value: string | null | undefined): string | undefined {
  const cleaned = value ? normalizeText(value) : ''
  return cleaned || undefined
}

function dedupeImages(images: SocialPostImage[]): SocialPostImage[] {
  const seen = new Set<string>()
  return images.filter((image) => {
    if (!image.url || seen.has(image.url)) return false
    seen.add(image.url)
    return true
  })
}

function dedupeStrings(values: string[]): string[] {
  const seen = new Set<string>()
  return values.filter((value) => {
    if (!value || seen.has(value)) return false
    seen.add(value)
    return true
  })
}

function buildCommentKey(
  author: string | undefined,
  text: string,
  date: string | undefined,
  depth: 0 | 1,
): string {
  return `${depth}|${author || ''}|${date || ''}|${text.slice(0, 160)}`
}

function escapeMarkdownText(value: string): string {
  return value
    .replace(/([\\`*_{}<>#+])/g, '\\$1')
    .replaceAll('[', '\\[')
    .replaceAll(']', '\\]')
}

function escapeMarkdownAlt(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replaceAll('[', '\\[')
    .replaceAll(']', '\\]')
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function escapeHtmlAttribute(value: string): string {
  return escapeHtml(value)
}

function clampCommentLimit(value: number | undefined): number {
  if (!Number.isFinite(value)) return MAX_SOCIAL_POST_COMMENTS
  return Math.max(1, Math.min(Math.floor(value as number), MAX_SOCIAL_POST_COMMENTS))
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}
