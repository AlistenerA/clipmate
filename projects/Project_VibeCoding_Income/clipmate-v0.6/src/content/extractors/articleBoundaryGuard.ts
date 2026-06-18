import type { PageType } from '../../shared/utils/pageTypeDetector'
import { extractSignalsFromDocument, detectPageType } from '../../shared/utils/pageTypeDetector'
import { buildNavigationMarkdownFallback } from '../navigationSummary/navigationSummaryMarkdown'
import type { NavigationSummaryInput } from '../navigationSummary/navigationSummary.types'

export type { PageType }

const NOISE_TAG_NAMES = new Set([
  'script', 'style', 'noscript', 'iframe',
  'form', 'canvas', 'button', 'input', 'select', 'textarea',
])

const NOISE_ROLES = new Set([
  'navigation', 'banner', 'complementary', 'contentinfo',
  'search', 'dialog', 'alert', 'form',
])

const NOISE_CSS_KEYWORDS = [
  'ad', 'ads', 'advert', 'advertisement', 'sponsor', 'sponsored',
  'banner', 'popup', 'modal', 'cookie-banner',
  'login', 'signin', 'signup', 'register',
  'share', 'social', 'social-share', 'share-bar', 'share-buttons',
  'toolbar', 'action-bar', 'actionbar',
  'comment', 'comments', 'reply', 'discuss',
  'related', 'recommend', 'recommended', 'hot', 'popular', 'trending',
  'read-more', 'more-news', 'next-article', 'prev-article',
  'sidebar', 'side-bar',
  'breadcrumb', 'breadcrumbs',
  'qrcode', 'qr-code', 'app-download', 'download-app', 'open-app',
  'newsletter', 'subscribe', 'promotion', 'rank', 'ranking',
  'article-bar-bottom', 'more-toolbox', 'article-info-box',
  'read-count-box', 'blog-tags-box', 'copyright-box',
  'second-recommend', 'column-group',
  'danmaku', 'danmu',
  '广告', '推广', '赞助', '弹窗',
  '登录', '注册',
  '分享', '微博', '微信', '收藏', '点赞',
  '评论', '跟帖',
  '相关推荐', '相关阅读', '热门', '热榜', '排行榜',
  '更多报道', '更多新闻', '猜你喜欢', '为你推荐',
  '打开app', '下载app', '客户端', '二维码',
  '听全文', '字号', '责任编辑', '版权声明', '免责声明',
  '举报', '反馈',
  '目录', '版权',
  '弹幕',
]

const CONTENT_CSS_KEYWORDS = [
  'article', 'main-content', 'post', 'entry', 'story', 'detail',
  'article-content', 'article-body', 'post-content', 'entry-content',
  'rich_media_content', 'markdown-body',
  'news-content', 'news-body', 'article-main', 'article-detail',
  '正文', '内容', '文章', '详情', '稿件', '报道', '阅读',
]

const TAIL_CUT_PATTERNS = [
  '责任编辑：', '责任编辑 ', '编辑：', '责编：',
  '版权声明', '免责声明',
  '分享到', '分享至',
  '打开app', '下载客户端', '打开客户端',
  '相关推荐', '相关阅读', '更多报道', '更多新闻',
  '热门推荐', '猜你喜欢', '为你推荐',
  '下一篇：', '上一篇：',
  '广告', '推广',
]

const ARTICLE_CONFIDENCE_NUMERIC: Record<string, number> = {
  high: 0.9,
  medium: 0.5,
  low: 0.2,
}

export function confidenceToNumeric(confidence: string): number {
  return ARTICLE_CONFIDENCE_NUMERIC[confidence] ?? 0
}

const MIN_ARTICLE_TEXT_LENGTH = 200
const MIN_PARAGRAPH_COUNT = 2
const MAX_LINK_DENSITY_HIGH = 0.3
const MAX_LINK_DENSITY_MEDIUM = 0.5
const MIN_NOISE_TEXT_LENGTH_THRESHOLD = 500
const MAX_SUMMARY_LINKS = 10

export interface ArticleBoundaryReport {
  confidence: 'high' | 'medium' | 'low'
  removedNodeCount: number
  reasonCodes: string[]
  linkDensity?: number
  paragraphCount?: number
  textLength?: number
  pageType?: PageType
}

function matchesCssPattern(text: string, patterns: string[]): boolean {
  const lower = text.toLowerCase()
  return patterns.some((kw) => lower.includes(kw.toLowerCase()))
}

function getTextLength(element: Element): number {
  return (element.textContent || '').trim().length
}

function isArticleContainer(element: Element): boolean {
  const tag = element.tagName.toLowerCase()
  if (tag === 'article' || tag === 'main') return true
  if (tag === 'section' && matchesCssPattern(getElementClassAttr(element), CONTENT_CSS_KEYWORDS)) return true
  if (tag === 'div' && matchesCssPattern(getElementClassAttr(element), CONTENT_CSS_KEYWORDS)) {
    return getTextLength(element) > MIN_ARTICLE_TEXT_LENGTH
  }
  return false
}

function getElementClassAttr(element: Element): string {
  return element.getAttribute('class') || element.className || ''
}

function getElementIdAttr(element: Element): string {
  return element.id || element.getAttribute('id') || ''
}

export function isLikelyNoiseElement(element: Element): boolean {
  const tag = element.tagName.toLowerCase()

  if (tag === 'script' || tag === 'style' || tag === 'noscript') return true

  if (NOISE_TAG_NAMES.has(tag)) return true

  const role = (element.getAttribute('role') || '').toLowerCase()
  if (role && NOISE_ROLES.has(role)) return true

  if (tag === 'nav' || tag === 'footer' || tag === 'aside') {
    if (getTextLength(element) > MIN_NOISE_TEXT_LENGTH_THRESHOLD) return false
    if (isArticleContainer(element)) return false
    return true
  }

  const classText = getElementClassAttr(element)
  const idText = getElementIdAttr(element)
  const classAndId = [classText, idText].filter(Boolean).join(' ')
  if (matchesCssPattern(classAndId, NOISE_CSS_KEYWORDS)) {
    if (isArticleContainer(element)) return false
    if (getTextLength(element) > MIN_NOISE_TEXT_LENGTH_THRESHOLD) return false
    return true
  }

  return false
}

export function calculateLinkDensity(element: Element): number {
  const links = element.querySelectorAll('a')
  if (links.length === 0) return 0

  let linkTextLen = 0
  links.forEach((a) => {
    linkTextLen += (a.textContent || '').trim().length
  })

  const totalLen = getTextLength(element)
  if (totalLen === 0) return 0
  return Math.min(linkTextLen / totalLen, 1.0)
}

export function classifyPageType(doc: Document): PageType {
  const signals = extractSignalsFromDocument(doc)
  const result = detectPageType(signals)
  return result.type
}

export function hasEnoughArticleText(text: string): boolean {
  if (!text || text.trim().length < MIN_ARTICLE_TEXT_LENGTH) return false

  const trimmed = text.trim()
  const paragraphs = trimmed.split(/\n\s*\n/).filter((p) => p.trim().length > 20)
  if (paragraphs.length < MIN_PARAGRAPH_COUNT) return false

  return true
}

export function preCleanDocument(doc: Document, excludeSelectors?: string): number {
  let removedCount = 0

  if (excludeSelectors) {
    const selectors = excludeSelectors
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    for (const sel of selectors) {
      try {
        doc.querySelectorAll(sel).forEach((el) => {
          el.remove()
          removedCount++
        })
      } catch {
        // skip invalid selector
      }
    }
  }

  const tagSelectors = [
    'form', 'canvas', 'button', 'input', 'select', 'textarea',
  ]
  for (const sel of tagSelectors) {
    try {
      doc.querySelectorAll(sel).forEach((el) => {
        el.remove()
        removedCount++
      })
    } catch {
      // skip invalid selector
    }
  }

  const roleSelectors = [
    '[role="navigation"]', '[role="banner"]',
    '[role="complementary"]', '[role="contentinfo"]',
    '[role="search"]', '[role="dialog"]', '[role="alert"]',
  ]
  for (const sel of roleSelectors) {
    try {
      doc.querySelectorAll(sel).forEach((el) => {
        if (el.tagName === 'ARTICLE' || el.tagName === 'MAIN') return
        el.remove()
        removedCount++
      })
    } catch {
      // skip invalid selector
    }
  }

  const walker = doc.createTreeWalker(
    doc.body,
    NodeFilter.SHOW_ELEMENT,
    {
      acceptNode: (node) => {
        const el = node as Element
        if (isLikelyNoiseElement(el)) return NodeFilter.FILTER_ACCEPT
        return NodeFilter.FILTER_SKIP
      },
    },
  )

  const toRemove: Element[] = []
  let node: Node | null
  while ((node = walker.nextNode())) {
    toRemove.push(node as Element)
  }

  for (const el of toRemove) {
    if (el.parentNode) {
      el.parentNode.removeChild(el)
      removedCount++
    }
  }

  return removedCount
}

export function trimArticleBody(markdown: string): string {
  if (!markdown) return markdown

  const lines = markdown.split('\n')
  const startIdx = Math.floor(lines.length * 0.6)

  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i].trim()
    if (line.length > 100) continue
    if (line.length < 3) continue

    for (const pattern of TAIL_CUT_PATTERNS) {
      if (line.includes(pattern)) {
        const result = lines.slice(0, i).join('\n').trimEnd()
        return result || markdown
      }
    }
  }

  return markdown
}

export function assessArticleConfidence(
  text: string,
  html: string,
): ArticleBoundaryReport {
  const report: ArticleBoundaryReport = {
    confidence: 'high',
    removedNodeCount: 0,
    reasonCodes: [],
  }

  const trimmed = text.trim()
  report.textLength = trimmed.length

  const paragraphs = trimmed.split(/\n\s*\n/).filter((p) => p.trim().length > 20)
  report.paragraphCount = paragraphs.length

  const linkMatches = html.match(/<a[^>]*>([\s\S]*?)<\/a>/gi) || []
  let linkTextLen = 0
  for (const link of linkMatches) {
    const textMatch = link.match(/>([\s\S]*?)</)
    if (textMatch) {
      linkTextLen += textMatch[1].trim().length
    }
  }
  const totalTextLen = trimmed.length || 1
  report.linkDensity = Math.min(linkTextLen / totalTextLen, 1.0)

  const hasEnoughText = trimmed.length >= MIN_ARTICLE_TEXT_LENGTH
  const hasEnoughParagraphs = paragraphs.length >= MIN_PARAGRAPH_COUNT
  const hasVeryHighLinkDensity = report.linkDensity > MAX_LINK_DENSITY_MEDIUM

  if (!hasEnoughText && !hasEnoughParagraphs) {
    report.confidence = 'low'
    report.reasonCodes.push('INSUFFICIENT_CONTENT')
  } else if (!hasEnoughText || !hasEnoughParagraphs) {
    report.confidence = 'medium'
    report.reasonCodes.push('INSUFFICIENT_CONTENT')
  }

  if (hasVeryHighLinkDensity) {
    if (report.confidence === 'low') {
      report.reasonCodes.push('HIGH_LINK_DENSITY')
    } else if (!hasEnoughText || !hasEnoughParagraphs) {
      report.confidence = 'low'
      report.reasonCodes.push('HIGH_LINK_DENSITY')
    } else {
      report.confidence = 'medium'
      report.reasonCodes.push('HIGH_LINK_DENSITY')
    }
  } else if (report.linkDensity > MAX_LINK_DENSITY_HIGH && report.confidence === 'high') {
    report.confidence = 'medium'
    report.reasonCodes.push('MODERATE_LINK_DENSITY')
  }

  if (report.confidence !== 'low') {
    const linkTagCount = (html.match(/<a\b[^>]*>/gi) || []).length
    const linkToParagraphRatio = paragraphs.length > 0 ? linkTagCount / paragraphs.length : 999
    const avgParagraphLen = paragraphs.length > 0 ? trimmed.length / paragraphs.length : 0

    if (linkToParagraphRatio > 5 && avgParagraphLen < 80 && trimmed.length < 1000) {
      report.confidence = 'low'
      report.reasonCodes.push('LIST_PAGE')
    }
  }

  return report
}

export function buildLowConfidenceSummary(
  doc: Document,
  title: string,
  url: string,
  pageType?: PageType,
  articleConfidence?: number,
  linkDensity?: number,
): string {
  const resolvedPageType: PageType = pageType ?? 'unknown'
  const navInput: NavigationSummaryInput = {
    document: doc,
    title,
    url,
    pageType: resolvedPageType,
    siteProfileMatch: null,
    intentSnapshot: null,
    articleConfidence,
    linkDensity,
  }

  const navMarkdown = buildNavigationMarkdownFallback(navInput)
  if (navMarkdown) return navMarkdown

  const parts: string[] = []

  if (resolvedPageType === 'search-results') {
    parts.push('> 当前页面可能是搜索结果页，已仅保留少量主要结果链接。')
  } else if (resolvedPageType === 'navigation') {
    parts.push('> 当前页面可能是导航或聚合页，已避免保存大量无关链接。')
  } else if (resolvedPageType === 'forum-or-comment') {
    parts.push('> 当前页面可能是评论或论坛页，已避免保存大量楼层。')
  } else if (resolvedPageType === 'video') {
    parts.push('> 当前页面可能是视频页，已避免保存大量媒体元素。')
  } else if (resolvedPageType === 'ai-answer') {
    parts.push('> 当前页面可能是 AI 对话页，已避免保存完整对话内容。')
  } else {
    parts.push('> 当前页面可能不是文章页，已避免保存大量导航或推荐链接。')
  }
  parts.push('')

  if (title) {
    parts.push(`**${title}**`)
    parts.push('')
  }

  if (url) {
    parts.push(`来源：${url}`)
    parts.push('')
  }

  const seenUrls = new Set<string>()
  const links: { text: string; href: string }[] = []

  const allLinks = doc.querySelectorAll('a[href]')
  for (const a of allLinks) {
    const href = (a.getAttribute('href') || '').trim()
    const text = (a.textContent || '').trim()

    if (!href || !text) continue
    if (text.length < 4 || text.length > 120) continue
    if (href.startsWith('javascript:')) continue
    if (href.startsWith('#')) continue
    if (seenUrls.has(href)) continue

    const classAndId = [a.className, a.id].filter(Boolean).join(' ')
    if (matchesCssPattern(classAndId, NOISE_CSS_KEYWORDS)) continue
    if (matchesCssPattern(text, NOISE_CSS_KEYWORDS)) continue

    seenUrls.add(href)
    links.push({ text, href })

    if (links.length >= MAX_SUMMARY_LINKS) break
  }

  if (links.length > 0) {
    parts.push('---')
    parts.push('')
    for (const link of links) {
      parts.push(`- [${link.text}](${link.href})`)
    }
  }

  return parts.join('\n')
}
