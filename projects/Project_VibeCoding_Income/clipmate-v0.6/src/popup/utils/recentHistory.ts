import type { ClipHistoryItem } from '../../shared/types/settings.types'

function getHistoryTime(item: ClipHistoryItem): number {
  const raw = item.savedAt || item.updatedAt || item.createdAt
  const time = Date.parse(raw)
  return Number.isFinite(time) ? time : 0
}

export function findMostRecentSavedHistoryByUrl(
  history: ClipHistoryItem[],
  url: string,
): ClipHistoryItem | null {
  if (!url.trim()) return null

  const matches = history
    .filter((item) => item.saveStatus === 'saved' && item.url === url)
    .sort((a, b) => getHistoryTime(b) - getHistoryTime(a))

  return matches[0] ?? null
}

export function formatRecentHistoryHint(
  item: ClipHistoryItem,
  now = Date.now(),
): string {
  const time = getHistoryTime(item)
  if (!time) return '此前已剪藏过该网页'

  const diffMinutes = Math.max(0, Math.floor((now - time) / 60000))

  if (diffMinutes < 1) return '刚刚已剪藏过该网页'
  if (diffMinutes < 60) return `${diffMinutes} 分钟前已剪藏过该网页`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} 小时前已剪藏过该网页`

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} 天前已剪藏过该网页`
}
