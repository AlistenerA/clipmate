import type { PageType } from '../utils/pageTypeDetector'
import type {
  SiteProfile,
  SiteProfileMatch,
  SiteProfileMatchInput,
} from './siteProfile.types'
import { SEED_PROFILES } from './seedProfiles'

export function normalizeHostname(urlOrHostname: string): string {
  if (!urlOrHostname) return ''

  const trimmed = urlOrHostname.trim()
  if (!trimmed) return ''

  if (trimmed.includes('://')) {
    try {
      const url = new URL(trimmed)
      return url.hostname.toLowerCase()
    } catch {
      return ''
    }
  }

  const cleaned = trimmed.replace(/^\/+|\/+$/g, '')
  if (cleaned.includes('/')) {
    const firstSlash = cleaned.indexOf('/')
    return cleaned.substring(0, firstSlash).toLowerCase()
  }

  return cleaned.toLowerCase()
}

export function hostnameMatchesDomain(hostname: string, domain: string): boolean {
  if (!hostname || !domain) return false

  const h = hostname.toLowerCase().trim()
  const d = domain.toLowerCase().trim()

  if (h === d) return true
  if (h.endsWith('.' + d)) return true

  return false
}

const DOMAIN_BASE_CONFIDENCE = 0.7
const SUBDOMAIN_BASE_CONFIDENCE = 0.6
const PAGE_TYPE_BOOST = 0.3

function isExactDomainMatch(hostname: string, domain: string): boolean {
  return hostname === domain.toLowerCase().trim()
}

function calcMatchConfidence(
  hostname: string,
  matchedDomain: string,
  pageType: PageType | undefined,
  profile: SiteProfile,
): { confidence: number; reasons: string[] } {
  const reasons: string[] = []
  let confidence = 0

  if (isExactDomainMatch(hostname, matchedDomain)) {
    confidence = DOMAIN_BASE_CONFIDENCE
    reasons.push(`Exact domain match: ${matchedDomain}`)
  } else {
    confidence = SUBDOMAIN_BASE_CONFIDENCE
    reasons.push(`Subdomain match: ${hostname} on ${matchedDomain}`)
  }

  if (pageType && profile.pageTypes.length > 0) {
    if (profile.pageTypes.includes(pageType)) {
      confidence += PAGE_TYPE_BOOST
      reasons.push(`Page type matches profile: ${pageType}`)
    } else {
      const diff = pageType
      reasons.push(`Page type ${diff} not in profile pageTypes`)
    }
  }

  return {
    confidence: Math.min(Math.round(confidence * 100) / 100, 1),
    reasons,
  }
}

export function matchSiteProfile(
  input: SiteProfileMatchInput,
  profiles?: SiteProfile[],
): SiteProfileMatch | null {
  const hostname = normalizeHostname(input.url)
  if (!hostname) return null

  const list = profiles ?? (SEED_PROFILES as SiteProfile[])

  let best: SiteProfileMatch | null = null

  for (const profile of list) {
    for (const domain of profile.domains) {
      if (!hostnameMatchesDomain(hostname, domain)) continue
      if (profile.pathPatterns?.length) {
        let pathname = ''
        try {
          pathname = new URL(input.url).pathname.toLowerCase()
        } catch {
          continue
        }
        if (!profile.pathPatterns.some((pattern) => pathname.includes(pattern.toLowerCase()))) {
          continue
        }
      }

      const { confidence, reasons } = calcMatchConfidence(
        hostname,
        domain,
        input.pageType,
        profile,
      )

      if (!best || confidence > best.confidence) {
        best = {
          profile,
          matchedDomain: domain,
          matchedPageType: input.pageType,
          confidence,
          reasons,
        }
      } else if (confidence === best.confidence && profile.priority > best.profile.priority) {
        best = {
          profile,
          matchedDomain: domain,
          matchedPageType: input.pageType,
          confidence,
          reasons,
        }
      }
    }
  }

  return best
}

export function listSiteProfiles(
  profiles?: SiteProfile[],
): SiteProfile[] {
  const source = profiles ?? (SEED_PROFILES as SiteProfile[])
  return [...source]
}
