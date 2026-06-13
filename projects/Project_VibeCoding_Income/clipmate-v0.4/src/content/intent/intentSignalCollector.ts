import type {
  IntentSignalInput,
  IntentSnapshot,
  VisibleContextSnapshot,
} from './intent.types'

const CLASS_HINT_WHITELIST = new Set([
  'comment',
  'reply',
  'thread',
  'discussion',
  'conversation',
  'message',
  'assistant',
  'user',
  'answer',
  'question',
  'article',
  'post',
  'content',
  'main',
  'search',
  'result',
  'video',
  'player',
  'description',
  'caption',
  'nav',
  'menu',
])

const MAX_CLASS_HINTS = 8

export function sanitizeClassHints(className: string): string[] {
  if (!className) return []

  const tokens = className.split(/\s+/)
  const seen = new Set<string>()
  const hints: string[] = []

  for (const token of tokens) {
    if (hints.length >= MAX_CLASS_HINTS) break

    const lower = token.toLowerCase()
    const cleaned = lower.replace(/[-_]/g, ' ').split(/\s+/)

    for (const part of cleaned) {
      if (hints.length >= MAX_CLASS_HINTS) break
      if (CLASS_HINT_WHITELIST.has(part) && !seen.has(part)) {
        seen.add(part)
        hints.push(part)
      }
    }
  }

  return hints
}

export function getSelectionTextLength(selection?: Selection | null): number {
  if (!selection || selection.rangeCount === 0) return 0
  return selection.toString().length
}

export function getSelectionRootElement(selection?: Selection | null): Element | null {
  if (!selection || selection.rangeCount === 0) return null

  const range = selection.getRangeAt(0)
  let node: Node | null = range.commonAncestorContainer

  while (node) {
    if (node.nodeType === Node.ELEMENT_NODE) return node as Element
    node = node.parentElement
  }

  return null
}

function tagAndRoleMatch(el: Element, keyword: string): boolean {
  const tag = el.tagName.toLowerCase()
  const role = el.getAttribute('role')?.toLowerCase() || ''
  return tag === keyword || role === keyword
}

function classAndIdMatch(el: Element, keyword: string): boolean {
  const className = (el as HTMLElement).className?.toLowerCase() || ''
  const id = el.id?.toLowerCase() || ''
  return className.includes(keyword) || id.includes(keyword)
}

function elementMatches(el: Element, keyword: string): boolean {
  return tagAndRoleMatch(el, keyword) || classAndIdMatch(el, keyword)
}

function matchAnyKeyword(el: Element, keywords: string[]): boolean {
  for (const kw of keywords) {
    if (elementMatches(el, kw)) return true
  }
  return false
}

const CONTEXT_COMMENT_KEYWORDS = ['comment', 'reply', 'thread', 'discussion']
const CONTEXT_AI_KEYWORDS = ['assistant', 'conversation', 'message', 'chat']
const CONTEXT_VIDEO_DESC_KEYWORDS = ['video-description', 'description', 'caption']
const CONTEXT_VIDEO_PLAYER_KEYWORDS = ['video', 'player']
const CONTEXT_SEARCH_KEYWORDS = ['search', 'result']

const MAX_ANCESTOR_DEPTH = 12

export function classifyElementContext(element: Element | null): SelectionContext {
  if (!element) return 'unknown'

  let current: Element | null = element

  for (let depth = 0; depth < MAX_ANCESTOR_DEPTH && current; depth++) {
    if (matchAnyKeyword(current, CONTEXT_COMMENT_KEYWORDS)) {
      return 'comment'
    }

    current = current.parentElement
  }

  current = element
  for (let depth = 0; depth < MAX_ANCESTOR_DEPTH && current; depth++) {
    const inVideoContext = matchAnyKeyword(current, CONTEXT_VIDEO_PLAYER_KEYWORDS) ||
      matchAnyKeyword(current, CONTEXT_VIDEO_DESC_KEYWORDS)

    if (matchAnyKeyword(current, CONTEXT_AI_KEYWORDS) && !inVideoContext) {
      return 'ai-answer'
    }

    if (inVideoContext) {
      return 'video-description'
    }

    current = current.parentElement
  }

  current = element
  for (let depth = 0; depth < MAX_ANCESTOR_DEPTH && current; depth++) {
    if (matchAnyKeyword(current, CONTEXT_SEARCH_KEYWORDS)) {
      return 'search-result'
    }

    current = current.parentElement
  }

  current = element
  for (let depth = 0; depth < MAX_ANCESTOR_DEPTH && current; depth++) {
    if (tagAndRoleMatch(current, 'nav') || matchAnyKeyword(current, ['menu'])) {
      return 'navigation'
    }

    current = current.parentElement
  }

  current = element
  for (let depth = 0; depth < MAX_ANCESTOR_DEPTH && current; depth++) {
    if (tagAndRoleMatch(current, 'article') || tagAndRoleMatch(current, 'main') ||
        matchAnyKeyword(current, ['post', 'content'])) {
      return 'article'
    }

    current = current.parentElement
  }

  return 'unknown'
}

export function collectVisibleContext(document: Document): VisibleContextSnapshot {
  let visibleVideoCount = 0
  let visibleCommentLikeCount = 0
  let visibleSearchResultLikeCount = 0
  let visibleArticleLikeCount = 0

  visibleVideoCount += document.querySelectorAll('video').length

  const videoIframeSelectors = [
    'iframe[src*="youtube"]',
    'iframe[src*="bilibili"]',
    'iframe[src*="youku"]',
    'iframe[src*="player"]',
  ]
  for (const sel of videoIframeSelectors) {
    try {
      visibleVideoCount += document.querySelectorAll(sel).length
    } catch { /* ignore */ }
  }

  const commentSelectors = [
    '[class*="comment"]',
    '[class*="reply"]',
    '[class*="thread"]',
    '[class*="discussion"]',
    '[id*="comment"]',
    '[id*="reply"]',
    '[id*="thread"]',
  ]
  for (const sel of commentSelectors) {
    try {
      visibleCommentLikeCount += document.querySelectorAll(sel).length
    } catch { /* ignore */ }
  }

  const searchSelectors = [
    '.g',
    '.b_algo',
    '.result',
    '[class*="search-result"]',
    '[class*="search-results"]',
  ]
  for (const sel of searchSelectors) {
    try {
      visibleSearchResultLikeCount += document.querySelectorAll(sel).length
    } catch { /* ignore */ }
  }

  visibleArticleLikeCount += document.querySelectorAll('article').length
  visibleArticleLikeCount += document.querySelectorAll('main').length
  visibleArticleLikeCount += document.querySelectorAll('[role="main"]').length

  const articleLikeSelectors = [
    '[class*="article"]',
    '[class*="post"]',
    '[class*="entry"]',
    '[class*="content"]',
  ]
  for (const sel of articleLikeSelectors) {
    try {
      visibleArticleLikeCount += document.querySelectorAll(sel).length
    } catch { /* ignore */ }
  }

  return {
    visibleVideoCount,
    visibleCommentLikeCount,
    visibleSearchResultLikeCount,
    visibleArticleLikeCount,
  }
}

function isShortVideoProfile(siteProfileId?: string): boolean {
  if (!siteProfileId) return false
  return siteProfileId.includes('short-video')
}

export function detectClipIntent(
  snapshot: Omit<IntentSnapshot, 'intent' | 'confidence' | 'reasons'>,
): Pick<IntentSnapshot, 'intent' | 'confidence' | 'reasons'> {
  const { pageType, siteProfileId, selectionPresent, selectionContext, visibleContext } = snapshot
  const reasons: string[] = []

  if (selectionPresent) {
    if (selectionContext === 'comment') {
      if (pageType === 'video' && isShortVideoProfile(siteProfileId)) {
        return {
          intent: 'clip-short-video-comment',
          confidence: 0.9,
          reasons: ['Selection in comment area on short-video page'],
        }
      }
      if (pageType === 'video') {
        return {
          intent: 'clip-video-comment',
          confidence: 0.85,
          reasons: ['Selection in comment area on video page'],
        }
      }
      return {
        intent: 'clip-comment',
        confidence: 0.8,
        reasons: ['Selection in comment area'],
      }
    }

    if (selectionContext === 'video-description') {
      if (isShortVideoProfile(siteProfileId)) {
        return {
          intent: 'clip-short-video-caption',
          confidence: 0.85,
          reasons: ['Selection in description area on short-video page'],
        }
      }
      return {
        intent: 'clip-video-description',
        confidence: 0.8,
        reasons: ['Selection in video description area'],
      }
    }

    if (selectionContext === 'search-result') {
      return {
        intent: 'clip-search-result',
        confidence: 0.85,
        reasons: ['Selection in search result area'],
      }
    }

    if (selectionContext === 'ai-answer') {
      return {
        intent: 'clip-ai-answer',
        confidence: 0.8,
        reasons: ['Selection in AI answer area'],
      }
    }

    if (selectionContext === 'article') {
      return {
        intent: 'clip-article',
        confidence: 0.8,
        reasons: ['Selection in article area'],
      }
    }

    return {
      intent: 'clip-selection-generic',
      confidence: 0.4,
      reasons: ['Selection present but context unknown'],
    }
  }

  const videoSignalCount = visibleContext.visibleVideoCount
  const commentSignalCount = visibleContext.visibleCommentLikeCount
  const searchSignalCount = visibleContext.visibleSearchResultLikeCount

  if (pageType === 'video') {
    reasons.push('Video page, no selection')
    return { intent: 'clip-video-page', confidence: 0.7, reasons }
  }

  if (pageType === 'navigation') {
    reasons.push('Navigation page, no selection')
    return { intent: 'clip-navigation-summary', confidence: 0.7, reasons }
  }

  if (pageType === 'article') {
    reasons.push('Article page, no selection')
    return { intent: 'clip-article', confidence: 0.7, reasons }
  }

  if (pageType === 'forum-or-comment') {
    reasons.push('Forum or comment page, no selection')
    return { intent: 'clip-forum-thread', confidence: 0.6, reasons }
  }

  if (pageType === 'search-results') {
    reasons.push('Search results page, no selection')
    return { intent: 'clip-search-result', confidence: 0.55, reasons }
  }

  if (pageType === 'ai-answer') {
    reasons.push('AI answer page, no selection')
    return { intent: 'clip-ai-answer', confidence: 0.55, reasons }
  }

  const hasVideoSignals = videoSignalCount > 0
  const hasCommentSignals = commentSignalCount > 0
  const hasSearchSignals = searchSignalCount > 0
  const signalCount = (hasVideoSignals ? 1 : 0) + (hasCommentSignals ? 1 : 0) + (hasSearchSignals ? 1 : 0)

  if (signalCount >= 2) {
    reasons.push(`Conflicting visible signals: video=${hasVideoSignals} comment=${hasCommentSignals} search=${hasSearchSignals}`)
  } else {
    reasons.push('Insufficient signals to determine intent')
  }

  return { intent: 'unknown', confidence: 0.3, reasons }
}

export function collectIntentSnapshot(input: IntentSignalInput): IntentSnapshot {
  const { document, pageType, siteProfileMatch, selection } = input

  const selectionRoot = getSelectionRootElement(selection)
  const selectionTextLength = getSelectionTextLength(selection)
  const selectionPresent = selectionTextLength > 0
  const selectionContext = classifyElementContext(selectionRoot)

  let selectionRectArea: number | undefined
  if (selection && selection.rangeCount > 0) {
    try {
      const rect = selection.getRangeAt(0).getBoundingClientRect()
      selectionRectArea = Math.round(rect.width * rect.height)
    } catch {
      selectionRectArea = undefined
    }
  }

  let nearestRole: string | undefined
  let nearestTag: string | undefined
  const nearestClassHints: string[] = []

  if (selectionRoot) {
    nearestTag = selectionRoot.tagName.toLowerCase()

    let ancestor: Element | null = selectionRoot
    for (let depth = 0; depth < MAX_ANCESTOR_DEPTH && ancestor; depth++) {
      const role = ancestor.getAttribute('role')
      if (role && !nearestRole) {
        nearestRole = role.toLowerCase()
      }

      const className = (ancestor as HTMLElement).className || ''
      if (className) {
        const hints = sanitizeClassHints(className)
        for (const h of hints) {
          if (nearestClassHints.length < MAX_CLASS_HINTS && !nearestClassHints.includes(h)) {
            nearestClassHints.push(h)
          }
        }
      }

      if (nearestRole && nearestClassHints.length >= MAX_CLASS_HINTS) break

      ancestor = ancestor.parentElement
    }
  }

  const visibleContext = collectVisibleContext(document)

  const { intent, confidence, reasons } = detectClipIntent({
    pageType,
    siteProfileId: siteProfileMatch?.profile.id,
    selectionPresent,
    selectionTextLength,
    selectionContext,
    selectionRectArea,
    nearestRole,
    nearestTag,
    nearestClassHints,
    visibleContext,
  })

  return {
    pageType,
    siteProfileId: siteProfileMatch?.profile.id,
    selectionPresent,
    selectionTextLength,
    selectionContext,
    selectionRectArea,
    nearestRole,
    nearestTag,
    nearestClassHints,
    visibleContext,
    confidence,
    intent,
    reasons,
  }
}
