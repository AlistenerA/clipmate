import type { PageType } from '../../shared/utils/pageTypeDetector'
import type { SiteProfileMatch } from '../../shared/siteProfiles'
import type { IntentSnapshot } from '../intent'
import type {
  NavigationSummaryDraft,
  NavigationSummaryInput,
  NavigationSummaryLink,
  NavigationSummaryMode,
} from './navigationSummary.types'

const DEFAULT_MAX_LINKS = 15
const MAX_LINKS_PER_DOMAIN = 3
const MIN_LINK_TEXT_LENGTH = 2

const SPECIALIZED_NON_NAV_PAGE_TYPES = new Set<PageType>([
  'video',
  'forum-or-comment',
  'ai-answer',
])

const REJECTED_PROTOCOLS = new Set([
  'javascript:',
  'data:',
  'mailto:',
  'tel:',
  'blob:',
  'chrome:',
  'edge:',
  'about:',
])

export function sanitizeLinkText(text: string, maxLength = 80): string {
  if (!text) return ''
  const trimmed = text.trim()
  if (!trimmed) return ''
  const collapsed = trimmed.replace(/\s+/g, ' ')
  if (collapsed.length <= maxLength) return collapsed
  return collapsed.slice(0, maxLength)
}

export function isSafeLinkHref(href: string): boolean {
  if (!href || href === '#') return false
  const lowered = href.trim().toLowerCase()
  if (!lowered) return false
  for (const proto of REJECTED_PROTOCOLS) {
    if (lowered.startsWith(proto)) return false
  }
  return true
}

export function toAbsoluteHttpUrl(href: string, baseUrl: string): string | null {
  if (!href || !baseUrl) return null
  try {
    const resolved = new URL(href, baseUrl)
    if (resolved.protocol === 'http:' || resolved.protocol === 'https:') {
      return resolved.href
    }
    return null
  } catch {
    return null
  }
}

export function extractDomain(url: string): string {
  if (!url) return ''
  try {
    return new URL(url).hostname
  } catch {
    return ''
  }
}

function hasValidSelection(intentSnapshot?: IntentSnapshot | null): boolean {
  if (!intentSnapshot) return false
  return intentSnapshot.selectionPresent === true && intentSnapshot.selectionTextLength > 0
}

export function shouldBuildNavigationSummary(input: NavigationSummaryInput): boolean {
  const hasSelection = hasValidSelection(input.intentSnapshot)
  if (hasSelection) return false

  if (input.intentSnapshot?.intent === 'clip-navigation-summary') {
    return true
  }

  if (input.pageType === 'navigation') return true
  if (input.pageType === 'search-results') return true

  if (!SPECIALIZED_NON_NAV_PAGE_TYPES.has(input.pageType)) {
    if (
      input.articleConfidence != null &&
      input.articleConfidence < 0.45 &&
      (input.linkDensity ?? 0) >= 0.55
    ) {
      return true
    }

    if (
      input.pageType === 'unknown' &&
      (input.linkDensity ?? 0) >= 0.65
    ) {
      return true
    }
  }

  return false
}

function tryCollectLinksFromSelector(
  doc: Document,
  selector: string,
  maxLinks: number,
): NavigationSummaryLink[] {
  const links: NavigationSummaryLink[] = []
  try {
    const containers = doc.querySelectorAll(selector)
    for (const container of containers) {
      const anchors = container.querySelectorAll('a[href]')
      for (const a of anchors) {
        if (links.length >= maxLinks) break
        const rawHref = (a.getAttribute('href') || '').trim()
        if (!isSafeLinkHref(rawHref)) continue

        const absoluteHref = toAbsoluteHttpUrl(rawHref, doc.URL)
        if (!absoluteHref) continue

        const text = sanitizeLinkText(a.textContent || '')
        if (text.length < MIN_LINK_TEXT_LENGTH) continue

        const domain = extractDomain(absoluteHref)
        links.push({ text, href: absoluteHref, domain })
      }
      if (links.length >= maxLinks) break
    }
  } catch {
    /* selector invalid, skip */
  }
  return links
}

function deduplicateAndLimitByDomain(
  candidates: NavigationSummaryLink[],
  maxLinks: number,
): NavigationSummaryLink[] {
  const seenHrefs = new Set<string>()
  const domainCounts = new Map<string, number>()
  const result: NavigationSummaryLink[] = []

  for (const link of candidates) {
    if (result.length >= maxLinks) break

    if (seenHrefs.has(link.href)) continue

    const domain = link.domain || 'unknown'
    const domainCount = domainCounts.get(domain) ?? 0
    if (domainCount >= MAX_LINKS_PER_DOMAIN) continue

    seenHrefs.add(link.href)
    domainCounts.set(domain, domainCount + 1)
    result.push({ ...link, domain })
  }

  return result
}

function tryCollectLinksFromSelectors(
  doc: Document,
  selectors: string[],
  maxLinks: number,
): NavigationSummaryLink[] {
  const links: NavigationSummaryLink[] = []
  for (const sel of selectors) {
    if (links.length >= maxLinks) break
    const batch = tryCollectLinksFromSelector(doc, sel.trim(), maxLinks - links.length)
    links.push(...batch)
  }
  return links
}

function parseSearchResultCardSelectors(
  siteProfileMatch?: SiteProfileMatch | null,
): string[] {
  const raw = siteProfileMatch?.profile.selectorHints?.searchResultCard
  if (!raw) return []
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function parseContentContainerSelectors(
  siteProfileMatch?: SiteProfileMatch | null,
): string[] {
  const raw = siteProfileMatch?.profile.selectorHints?.contentContainer
  if (!raw) return []
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

const MAIN_CONTENT_SELECTORS = ['main', 'article', '[role="main"]']

function assignLinkReasons(
  links: NavigationSummaryLink[],
  reason: string,
): NavigationSummaryLink[] {
  return links.map((l) => ({ ...l, reason }))
}

export function collectNavigationSummaryLinks(
  input: NavigationSummaryInput,
): NavigationSummaryLink[] {
  const { document: doc, siteProfileMatch } = input
  const maxLinks = input.maxLinks ?? DEFAULT_MAX_LINKS

  const collected: NavigationSummaryLink[] = []

  const searchCardSelectors = parseSearchResultCardSelectors(siteProfileMatch)
  if (searchCardSelectors.length > 0) {
    const batch = tryCollectLinksFromSelectors(doc, searchCardSelectors, maxLinks)
    collected.push(...assignLinkReasons(batch, 'search result'))
  }

  if (collected.length < maxLinks) {
    const remaining = maxLinks - collected.length

    const contentSelectors = parseContentContainerSelectors(siteProfileMatch)
    const combinedSelectors = [...contentSelectors, ...MAIN_CONTENT_SELECTORS]
    const batch = tryCollectLinksFromSelectors(doc, combinedSelectors, remaining)
    collected.push(...assignLinkReasons(batch, 'main content'))
  }

  if (collected.length < maxLinks) {
    const remaining = maxLinks - collected.length
    const batch = tryCollectLinksFromSelector(doc, 'body', remaining)
    collected.push(...assignLinkReasons(batch, 'navigation link'))
  }

  return deduplicateAndLimitByDomain(collected, maxLinks)
}

const NAVIGATION_WARNING = '当前页面更像导航/目录页，已生成主要链接摘要。'
const SEARCH_RESULTS_WARNING = '当前页面更像搜索结果页，已生成主要结果摘要。'
const LOW_CONFIDENCE_WARNING = '当前页面正文置信度较低，已生成安全摘要。'

function getSummaryMode(pageType: PageType): NavigationSummaryMode {
  if (pageType === 'search-results') return 'search-results'
  if (pageType === 'navigation') return 'navigation'
  return 'low-confidence'
}

function getWarningText(pageType: PageType): string {
  if (pageType === 'search-results') return SEARCH_RESULTS_WARNING
  if (pageType === 'navigation') return NAVIGATION_WARNING
  return LOW_CONFIDENCE_WARNING
}

function getTriggerReasons(input: NavigationSummaryInput): string[] {
  const reasons: string[] = []

  if (input.intentSnapshot?.intent === 'clip-navigation-summary') {
    reasons.push('Intent signal: navigation summary requested')
  }

  if (input.pageType === 'navigation') {
    reasons.push(`Page type detected as navigation`)
  }

  if (input.pageType === 'search-results') {
    reasons.push(`Page type detected as search results`)
  }

  if (input.articleConfidence != null && input.articleConfidence < 0.45) {
    reasons.push(`Low article confidence: ${input.articleConfidence.toFixed(2)}`)
  }

  if ((input.linkDensity ?? 0) >= 0.55) {
    reasons.push(`High link density: ${(input.linkDensity ?? 0).toFixed(2)}`)
  }

  if (input.intentSnapshot) {
    reasons.push(`Intent confidence: ${input.intentSnapshot.confidence.toFixed(2)}`)
  }

  return reasons
}

export function buildNavigationSummaryDraft(
  input: NavigationSummaryInput,
): NavigationSummaryDraft {
  try {
    const title = input.title || input.document.title || extractDomain(input.url) || ''
    const domain = extractDomain(input.url)
    const mode = getSummaryMode(input.pageType)
    const warning = getWarningText(input.pageType)
    const links = collectNavigationSummaryLinks(input)
    const reasons = getTriggerReasons(input)

    return {
      title,
      url: input.url,
      domain,
      pageType: input.pageType,
      siteProfileId: input.siteProfileMatch?.profile.id,
      mode,
      warning,
      links,
      reasons,
    }
  } catch {
    return {
      title: input.title || '',
      url: input.url || '',
      domain: '',
      pageType: input.pageType,
      mode: 'low-confidence',
      warning: LOW_CONFIDENCE_WARNING,
      links: [],
      reasons: ['Build failed, returning empty draft'],
    }
  }
}
