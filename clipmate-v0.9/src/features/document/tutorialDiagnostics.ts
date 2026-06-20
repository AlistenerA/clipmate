import { isKnownVideoUrl } from '../../shared/media/videoUrl'

export type UnknownResourceKind = 'iframe' | 'embed' | 'object' | 'canvas'

export interface UnknownResourceDiagnostic {
  kind: UnknownResourceKind
  label: string
  url?: string
}

const NOISE_RE = /(?:^|[-_])(ad|ads|advert|banner|tracking|pixel)(?:$|[-_])/i

function resolveHttpUrl(rawUrl: string | null, pageUrl: string): string | undefined {
  if (!rawUrl) return undefined
  try {
    const url = new URL(rawUrl, pageUrl)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : undefined
  } catch {
    return undefined
  }
}

export function collectUnknownResourceDiagnostics(
  doc: Document,
  pageUrl: string,
): UnknownResourceDiagnostic[] {
  const scope = doc.querySelector('article, main, [role="main"]') || doc.body
  if (!scope) return []

  const results: UnknownResourceDiagnostic[] = []
  const seen = new Set<string>()

  for (const node of scope.querySelectorAll<HTMLElement>('iframe, embed, object, canvas')) {
    if (results.length >= 12) break
    if (node.getAttribute('aria-hidden') === 'true') continue
    const identity = `${node.id} ${node.className}`
    if (NOISE_RE.test(identity)) continue

    const kind = node.tagName.toLowerCase() as UnknownResourceKind
    const rawUrl = node.getAttribute('src') || node.getAttribute('data')
    const url = resolveHttpUrl(rawUrl, pageUrl)
    if (kind === 'iframe' && url && isKnownVideoUrl(url)) continue

    const label = (node.getAttribute('title') || node.getAttribute('aria-label') ||
      node.getAttribute('type') || `${kind.toUpperCase()} 资源`)
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 120)
    const key = `${kind}|${url || ''}|${label}`
    if (seen.has(key)) continue
    seen.add(key)
    results.push({ kind, label, url })
  }

  return results
}
