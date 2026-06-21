import { getVideoProvider, isVideoPageUrl } from '../../shared/media/videoUrl'

export interface VideoPageSummary {
  title: string
  url: string
  description: string
  provider: string
  commentCount?: string
}

interface VideoPageInput {
  title: string
  url: string
  description?: string
}

function readMeta(doc: Document, selector: string): string {
  return doc.querySelector(selector)?.getAttribute('content')?.trim() || ''
}

function normalizePageUrl(doc: Document, rawUrl: string): string | null {
  const candidate = doc.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href ||
    readMeta(doc, 'meta[property="og:url"]') || rawUrl
  try {
    const url = new URL(candidate, rawUrl)
    if (!isVideoPageUrl(url.toString())) return null
    url.hash = ''
    for (const key of ['spm_id_from', 'feature', 'si', 'share_source', 'share_medium']) {
      url.searchParams.delete(key)
    }
    return url.toString()
  } catch {
    return null
  }
}

function cleanDescription(value: string, provider: string): string {
  let text = value.replace(/^简介[：:]\s*/, '').replace(/\s+/g, ' ').trim()
  if (provider === 'Bilibili') {
    text = text.split(/(?:；更多|,\s*视频播放量|，\s*视频播放量)/)[0].trim()
  }
  if (text.length > 360) text = `${text.slice(0, 357).trimEnd()}...`
  return text
}

function normalizeCount(value: string): string | undefined {
  const match = value.match(/(?:查看\s*)?(\d+(?:\.\d+)?\s*(?:万|千|亿)?\+?)\s*(?:条)?评论/i) ||
    value.match(/评论(?:数)?[：:\s]*(\d+(?:\.\d+)?\s*(?:万|千|亿)?\+?)/i)
  return match?.[1]?.replace(/\s+/g, '')
}

function readJsonLdCommentCount(doc: Document): string | undefined {
  for (const script of doc.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]')) {
    try {
      const data = JSON.parse(script.textContent || '') as unknown
      const stack: unknown[] = [data]
      while (stack.length > 0) {
        const current = stack.pop()
        if (!current || typeof current !== 'object') continue
        if (Array.isArray(current)) {
          stack.push(...current)
          continue
        }
        const record = current as Record<string, unknown>
        const count = record.commentCount
        if (typeof count === 'number' || typeof count === 'string') return String(count)
        stack.push(...Object.values(record))
      }
    } catch {
      continue
    }
  }
  return undefined
}

function readCommentCount(doc: Document): string | undefined {
  const selectors = [
    '#limit-mask-tip',
    '.reply-header .nav-title-text',
    '.total-reply',
    '[class*="comment"][class*="count"]',
    '[data-testid*="comment-count"]',
  ]
  for (const selector of selectors) {
    for (const node of doc.querySelectorAll(selector)) {
      const count = normalizeCount(node.textContent || '')
      if (count) return count
    }
  }
  return readJsonLdCommentCount(doc)
}

export function extractVideoPageSummary(
  doc: Document,
  input: VideoPageInput,
): VideoPageSummary | null {
  const url = normalizePageUrl(doc, input.url)
  if (!url) return null
  const provider = getVideoProvider(url)
  if (!provider) return null

  const title = readMeta(doc, 'meta[property="og:title"]') || input.title
  const rawDescription = readMeta(doc, 'meta[name="description"]') ||
    readMeta(doc, 'meta[property="og:description"]') || input.description || ''

  return {
    title: title.trim() || input.title,
    url,
    description: cleanDescription(rawDescription, provider),
    provider,
    commentCount: readCommentCount(doc),
  }
}

export function formatVideoPageMarkdown(summary: VideoPageSummary): string {
  const lines = [`> ${summary.provider} 视频页摘要`]
  if (summary.description) lines.push('', summary.description)
  lines.push('', `[打开原视频](${summary.url})`)
  if (summary.commentCount) lines.push('', `评论数：${summary.commentCount}`)
  return lines.join('\n')
}
