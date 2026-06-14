export interface ArticleImageCandidate {
  url: string
  alt?: string
  title?: string
  caption?: string
  width?: number
  height?: number
  sourceUrl?: string
  index: number
  origin: 'img' | 'picture' | 'figure' | 'srcset'
}

export interface ArticleImageExtractionOptions {
  pageUrl?: string
  maxImages?: number
  minWidth?: number
  minHeight?: number
  allowDataUri?: boolean
}

export interface ArticleImageExtractionResult {
  images: ArticleImageCandidate[]
  skipped: Array<{
    url?: string
    reason: string
  }>
  stats: {
    totalFound: number
    kept: number
    skipped: number
  }
}

const DEFAULT_MAX_IMAGES = 20
const DEFAULT_MIN_WIDTH = 60
const DEFAULT_MIN_HEIGHT = 40

const NOISE_CLASS_PATTERNS = [
  /\b(?:avatar|avator|profile-?pic|user-?pic)\b/i,
  /\b(?:icon|ico)\b/i,
  /\b(?:logo|brand)\b/i,
  /\b(?:badge|ribbon|label-?tag|pill)\b/i,
  /\b(?:emoji|emoticon|smile|sticker)\b/i,
  /\b(?:sprite|spritesheet)\b/i,
  /\b(?:thumb|thumbnail|thumb-?img)\b/i,
  /\b(?:favicon|apple-touch-icon)\b/i,
  /\b(?:qr-?code)\b/i,
  /\b(?:loading-?(?:spinner|gif|img))\b/i,
]

const NOISE_SRC_PATTERNS = [
  /\b(?:tracking|pixel|beacon|analytics|counter)\b/i,
  /\/?(?:pixel|tracker|beacon|analytics)(?:\/|\.)/i,
  /\/?(?:1x1|1x1_pixel|blank|transparent|spacer|dot_clear|empty)(?:\.gif|\.png)/i,
  /\/?(?:avatar|avator)(?:\/|\.)/i,
  /\/?(?:emoji|emoticon|smile|sticker)(?:\/|\.)/i,
  /\/?(?:icon|ico)(?:\/|\.)/i,
  /\/?(?:logo)(?:\/|\.)/i,
  /\/?(?:badge)(?:\/|\.)/i,
  /\/?(?:sprite)(?:\/|\.)/i,
  /\/?(?:favicon)/i,
  /\/?(?:qr-?code)/i,
  /\/default\//i,
  /\/api\/auto\/resize\b/i,
  /\/sinakd[/.]/i,
]

function isDataUri(url: string): boolean {
  return url.startsWith('data:')
}

function isBlobUri(url: string): boolean {
  return url.startsWith('blob:')
}

function isNoiseUrl(url: string): boolean {
  if (isDataUri(url) || isBlobUri(url)) return true
  for (const pattern of NOISE_SRC_PATTERNS) {
    if (pattern.test(url)) return true
  }
  return false
}

function isNoiseByClassName(el: Element): boolean {
  const classList = el.className
  if (!classList || typeof classList !== 'string') return false

  const checkStr = classList
  for (const pattern of NOISE_CLASS_PATTERNS) {
    if (pattern.test(checkStr)) return true
  }
  return false
}

function isNoiseByAttribute(el: Element): boolean {
  const id = el.id
  if (id) {
    for (const pattern of NOISE_CLASS_PATTERNS) {
      if (pattern.test(id)) return true
    }
  }

  const role = el.getAttribute('role')
  if (role === 'presentation' || role === 'none') return true

  return false
}

const NOISE_ANCESTOR_PATTERNS = [
  /\b(?:recommend|recommended)\b/i,
  /\b(?:related|related-?(?:articles?|posts?|news?|content))\b/i,
  /\b(?:hot|hot-?(?:news?|articles?|topics?|content)|trending)\b/i,
  /\b(?:rank|ranking)\b/i,
  /\b(?:sidebar|side-?bar|aside)\b/i,
  /\b(?:feed-?card|feed-?item)\b/i,
  /\b(?:news-?list|article-?list)\b/i,
  /\b(?:sinakd)\b/i,
  /\b(?:bottom-?recommend)\b/i,
  /\b(?:popular|popular-?(?:articles?|posts?))\b/i,
]

function isNoiseByAncestor(el: Element): boolean {
  let parent = el.parentElement
  for (let depth = 0; depth < 8 && parent; depth++) {
    const tag = parent.tagName
    if (tag === 'BODY' || tag === 'HTML') break

    const raw = (parent.getAttribute('class') || '') + ' ' + (parent.getAttribute('id') || '')
    for (const pattern of NOISE_ANCESTOR_PATTERNS) {
      if (pattern.test(raw)) return true
    }
    parent = parent.parentElement
  }
  return false
}

function isTrackingPixel(width: number, height: number, url: string): boolean {
  if (width === 1 && height === 1) return true
  if (width <= 2 && height <= 2 && /(?:tracking|pixel|beacon)/i.test(url)) return true
  return false
}

function getBestSrc(el: HTMLImageElement): string | undefined {
  const candidates: (string | null)[] = [
    el.getAttribute('src'),
    el.getAttribute('currentSrc'),
    el.src || null,
    (el as HTMLImageElement & { currentSrc?: string }).currentSrc ?? null,
  ]
  for (const c of candidates) {
    if (c && c.trim()) {
      return c.trim()
    }
  }
  return undefined
}

function getSrcsetCandidate(el: HTMLImageElement): string | undefined {
  const srcset = el.getAttribute('srcset')
  if (!srcset) return undefined

  const parts = srcset.split(',').map((s) => s.trim()).filter(Boolean)
  if (parts.length === 0) return undefined

  const candidates: Array<{ url: string; descriptor: number }> = []

  for (const part of parts) {
    const match = part.match(/^(\S+)\s+(\d+)([wx])?$/i)
    if (match) {
      const url = match[1]
      const num = parseInt(match[2], 10)
      const unit = (match[3] || 'w').toLowerCase()

      if (!isDataUri(url) && !isBlobUri(url)) {
        if (unit === 'x') {
          candidates.push({ url, descriptor: num * 100 })
        } else {
          candidates.push({ url, descriptor: num })
        }
      }
    } else {
      const url = part.trim()
      if (url && !isDataUri(url) && !isBlobUri(url)) {
        candidates.push({ url, descriptor: 1 })
      }
    }
  }

  if (candidates.length === 0) return undefined

  candidates.sort((a, b) => b.descriptor - a.descriptor)
  return candidates[0].url
}

function resolveUrl(src: string, pageUrl?: string): string {
  if (/^https?:\/\//.test(src)) return src
  if (src.startsWith('//')) return 'https:' + src
  if (!pageUrl) return src

  try {
    return new URL(src, pageUrl).href
  } catch {
    return src
  }
}

function extractCaption(el: Element): string | undefined {
  let parent = el.parentElement

  for (let depth = 0; depth < 5 && parent; depth++) {
    if (parent.tagName === 'FIGURE') {
      const figcaption = parent.querySelector('figcaption')
      if (figcaption) {
        const text = figcaption.textContent?.trim()
        if (text) {
          return text.length <= 300 ? text : text.substring(0, 297) + '...'
        }
      }
      return undefined
    }
    parent = parent.parentElement
  }

  return undefined
}

function findNearestSourceUrl(): string | undefined {
  try {
    if (typeof window !== 'undefined' && window?.location?.href) {
      return window.location.href
    }
  } catch {
    // window not available (e.g. jsdom test environment)
  }
  try {
    if (typeof document !== 'undefined' && document?.URL) {
      return document.URL
    }
  } catch {
    // document not available
  }
  return undefined
}

function determineOrigin(el: Element): ArticleImageCandidate['origin'] {
  let parent = el.parentElement
  for (let depth = 0; depth < 5 && parent; depth++) {
    const tag = parent.tagName
    if (tag === 'FIGURE') return 'figure'
    if (tag === 'PICTURE') return 'picture'
    parent = parent.parentElement
  }
  return 'img'
}

export function extractArticleImages(
  root: Document | Element,
  options?: ArticleImageExtractionOptions,
): ArticleImageExtractionResult {
  const maxImages = options?.maxImages ?? DEFAULT_MAX_IMAGES
  const minWidth = options?.minWidth ?? DEFAULT_MIN_WIDTH
  const minHeight = options?.minHeight ?? DEFAULT_MIN_HEIGHT
  const pageUrl = options?.pageUrl
  const allowDataUri = options?.allowDataUri ?? false

  const images: ArticleImageCandidate[] = []
  const skipped: Array<{ url?: string; reason: string }> = []
  const seenUrls = new Set<string>()

  const imgElements = root.querySelectorAll('img')

  let totalFound = 0
  let index = 0

  for (const img of imgElements) {
    totalFound++

    if (isNoiseByClassName(img) || isNoiseByAttribute(img) || isNoiseByAncestor(img)) {
      skipped.push({ url: img.src || undefined, reason: 'noise_class_or_attr' })
      continue
    }

    const rawWidth = img.getAttribute('width')
    const rawHeight = img.getAttribute('height')
    const width = rawWidth ? parseInt(rawWidth, 10) : (img.naturalWidth || 0)
    const height = rawHeight ? parseInt(rawHeight, 10) : (img.naturalHeight || 0)

    if (isTrackingPixel(width, height, img.src || img.getAttribute('src') || '')) {
      skipped.push({ url: img.src || undefined, reason: 'tracking_pixel' })
      continue
    }

    const bestSrc = getBestSrc(img)
    if (!bestSrc) {
      skipped.push({ url: undefined, reason: 'no_src' })
      continue
    }

    if (isDataUri(bestSrc)) {
      if (allowDataUri) {
        const alt = img.getAttribute('alt')?.trim() || undefined
        const title = img.getAttribute('title')?.trim() || undefined
        const caption = extractCaption(img)
        const sourceUrl = findNearestSourceUrl()

        images.push({
          url: bestSrc,
          alt,
          title: title !== alt ? title : undefined,
          caption,
          width: width > 0 ? width : undefined,
          height: height > 0 ? height : undefined,
          sourceUrl,
          index: index++,
          origin: determineOrigin(img),
        })
        continue
      }
      skipped.push({ url: bestSrc.substring(0, 50) + '...', reason: 'data_uri' })
      continue
    }

    if (isBlobUri(bestSrc)) {
      skipped.push({ url: bestSrc, reason: 'blob_uri' })
      continue
    }

    if (isNoiseUrl(bestSrc)) {
      skipped.push({ url: bestSrc, reason: 'noise_url' })
      continue
    }

    if (width > 0 && height > 0 && (width < minWidth || height < minHeight)) {
      skipped.push({ url: bestSrc, reason: 'below_min_size' })
      continue
    }

    const resolvedUrl = resolveUrl(bestSrc, pageUrl)
    if (seenUrls.has(resolvedUrl)) {
      skipped.push({ url: bestSrc, reason: 'duplicate' })
      continue
    }

    if (images.length >= maxImages) {
      skipped.push({ url: bestSrc, reason: 'max_images_reached' })
      continue
    }

    seenUrls.add(resolvedUrl)

    const alt = img.getAttribute('alt')?.trim() || undefined
    const title = img.getAttribute('title')?.trim() || undefined
    const caption = extractCaption(img)
    const sourceUrl = findNearestSourceUrl()

    images.push({
      url: resolvedUrl,
      alt,
      title: title !== alt ? title : undefined,
      caption,
      width: width > 0 ? width : undefined,
      height: height > 0 ? height : undefined,
      sourceUrl,
      index: index++,
      origin: determineOrigin(img),
    })
  }

  return {
    images,
    skipped,
    stats: {
      totalFound,
      kept: images.length,
      skipped: skipped.length,
    },
  }
}

export {
  getSrcsetCandidate,
  resolveUrl,
  isNoiseUrl,
  isTrackingPixel,
  getBestSrc,
  extractCaption,
  isNoiseByClassName,
  isNoiseByAttribute,
  isNoiseByAncestor,
  isDataUri,
  isBlobUri,
}
