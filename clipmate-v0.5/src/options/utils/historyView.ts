import type { ClipHistoryItem, NotionTarget } from '../../shared/types/settings.types'
import type { SaveStatus } from '../../shared/types/clip.types'

export function extractBodyMarkdown(markdown: string): string {
  const idx = markdown.indexOf('\n---\n\n')
  if (idx !== -1) {
    const result = markdown.slice(idx + 5)
    return result.startsWith('\n') ? result.slice(1) : result
  }
  const idx2 = markdown.indexOf('\n---\n')
  if (idx2 !== -1) {
    const result = markdown.slice(idx2 + 5)
    return result.startsWith('\n') ? result.slice(1) : result
  }
  return markdown
}

export function getHistoryStatusLabel(status: SaveStatus): string {
  switch (status) {
    case 'saved':
      return '已保存'
    case 'failed':
      return '保存失败'
    case 'unsaved':
      return '未保存'
  }
}

export function getHistoryStatusTone(status: SaveStatus): 'green' | 'red' | 'gray' {
  switch (status) {
    case 'saved':
      return 'green'
    case 'failed':
      return 'red'
    case 'unsaved':
      return 'gray'
  }
}

export function formatHistoryTime(iso: string): string {
  try {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return iso
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  } catch {
    return iso
  }
}

export function getHostname(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

export function resolveRetryTarget(
  targets: NotionTarget[],
  historyItem: ClipHistoryItem,
): NotionTarget | null {
  if (targets.length === 0) return null

  if (historyItem.targetId) {
    const match = targets.find((t) => t.id === historyItem.targetId)
    if (match) return match
  }

  const defaultTarget = targets.find((t) => t.isDefault)
  if (defaultTarget) return defaultTarget

  return targets[0]
}

export function filterHistoryLocally(
  items: ClipHistoryItem[],
  query: string,
): ClipHistoryItem[] {
  if (!query.trim()) return items

  const q = query.toLowerCase()
  return items.filter((item) => {
    if (item.title.toLowerCase().includes(q)) return true
    if (item.url.toLowerCase().includes(q)) return true
    if (item.tags.some((t) => t.toLowerCase().includes(q))) return true
    if (item.targetName?.toLowerCase().includes(q)) return true
    if (item.notePreview.toLowerCase().includes(q)) return true
    if (item.contentPreview.toLowerCase().includes(q)) return true
    const body = extractBodyMarkdown(item.markdown)
    if (body.toLowerCase().includes(q)) return true
    return false
  })
}

export function getModeLabel(mode: 'fullpage' | 'selection'): string {
  return mode === 'fullpage' ? '全文' : '选区'
}

export type HighlightToken = string | { match: string }

export function highlightText(text: string, query: string): HighlightToken[] {
  if (!query) return [text]
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escaped})`, 'gi')
  const parts = text.split(regex)
  const result: HighlightToken[] = []
  for (const part of parts) {
    if (!part) continue
    if (part.toLowerCase() === query.toLowerCase()) {
      result.push({ match: part })
    } else {
      result.push(part)
    }
  }
  return result.length ? result : [text]
}

export interface HistoryMatchInfo {
  titleMatched: boolean
  urlMatched: boolean
  tagsMatched: string[]
  targetMatched: boolean
  noteMatched: boolean
  contentMatched: boolean
  markdownMatched: boolean
}

export function getHistoryMatchInfo(
  item: ClipHistoryItem,
  query: string,
): HistoryMatchInfo {
  const q = query.toLowerCase().trim()
  const empty: HistoryMatchInfo = {
    titleMatched: false,
    urlMatched: false,
    tagsMatched: [],
    targetMatched: false,
    noteMatched: false,
    contentMatched: false,
    markdownMatched: false,
  }
  if (!q) return empty

  empty.titleMatched = item.title.toLowerCase().includes(q)
  empty.urlMatched = item.url.toLowerCase().includes(q)
  empty.tagsMatched = item.tags.filter((t) => t.toLowerCase().includes(q))
  if (item.targetName) {
    empty.targetMatched = item.targetName.toLowerCase().includes(q)
  }
  empty.noteMatched = item.notePreview.toLowerCase().includes(q)
  empty.contentMatched = item.contentPreview.toLowerCase().includes(q)

  const body = extractBodyMarkdown(item.markdown)
  if (!empty.contentMatched && body.toLowerCase().includes(q)) {
    empty.markdownMatched = true
  }

  return empty
}

export function getDomainFromUrl(url: string): string {
  return getHostname(url)
}

export function getSiteInitial(domain: string): string {
  if (!domain) return '?'
  const code = domain.codePointAt(0)
  if (code === undefined) return '?'
  return String.fromCodePoint(code).toUpperCase()
}

const SITE_PALETTE = [
  '#2563EB', '#D97706', '#059669', '#DC2626',
  '#7C3AED', '#DB2777', '#0284C7', '#CA8A04',
  '#16A34A', '#E11D48', '#6D28D9', '#0891B2',
]

export function getStableSiteColor(domain: string): string {
  if (!domain) return '#6B7280'
  let hash = 0
  for (let i = 0; i < domain.length; i++) {
    hash = ((hash << 5) - hash + domain.charCodeAt(i)) | 0
  }
  const index = Math.abs(hash) % SITE_PALETTE.length
  return SITE_PALETTE[index]
}

export function extractMarkdownBodyPreview(
  markdown: string,
  maxLength: number,
): string {
  const body = extractBodyMarkdown(markdown)
  return body.slice(0, maxLength)
}

export function stripMarkdownImages(text: string): string {
  return text
    .replace(/\[!\[.*?\]\([^)]*\)\]\([^)]*\)/g, '')
    .replace(/!\[.*?\]\([^)]*\)/g, '')
    .replace(/<img\b[^>]*\/?>/gi, '')
}

export function normalizeSummaryText(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

export function getHistorySummary(item: ClipHistoryItem): string {
  if (item.descriptionPreview) {
    return item.descriptionPreview
  }
  if (item.contentPreview) {
    const cleaned = normalizeSummaryText(stripMarkdownImages(item.contentPreview))
    if (cleaned) return cleaned
  }
  const body = extractMarkdownBodyPreview(item.markdown, 120)
  const cleaned = normalizeSummaryText(stripMarkdownImages(body))
  if (cleaned) return cleaned
  return item.url || item.title
}

export function shouldAutoExtractForActiveTab(
  draftUrl: string | undefined,
  activeTabUrl: string | undefined,
): boolean {
  if (!activeTabUrl) return false
  if (!draftUrl) return true
  return draftUrl !== activeTabUrl
}
