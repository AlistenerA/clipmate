import { useEffect, useState } from 'react'
import type { ExtractedContent } from '../../shared/types/clip.types'
import type { ClipHistoryItem } from '../../shared/types/settings.types'
import { formatRecentHistoryHint } from '../utils/recentHistory'

interface Props {
  content: ExtractedContent | null
  loading: boolean
  error: string | null
  title: string
  onTitleChange: (title: string) => void
  disabled?: boolean
  recentHistory: ClipHistoryItem | null
}

function getHostname(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

function getSiteInitial(label: string): string {
  const trimmed = label.trim()
  if (!trimmed) return '?'
  return trimmed[0].toUpperCase()
}

export default function SaveSummary({
  content,
  loading,
  error,
  title,
  onTitleChange,
  disabled,
  recentHistory,
}: Props) {
  const [iconError, setIconError] = useState(false)

  useEffect(() => {
    setIconError(false)
  }, [content?.metadata.siteIconUrl])

  if (loading) {
    return (
      <div className="border border-gray-100 rounded bg-gray-50 px-3 py-4 text-sm text-gray-400 text-center animate-pulse">
        正在提取页面内容...
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded border border-red-200">
        {error}
      </div>
    )
  }

  if (!content) {
    return (
      <div className="border border-gray-100 rounded bg-gray-50 px-3 py-4 text-sm text-gray-400 text-center">
        等待提取页面内容
      </div>
    )
  }

  const siteLabel = content.metadata.siteName || getHostname(content.url)
  const imageText = (content.imageCount ?? 0) > 0
    ? `图片 ${content.imageCount}`
    : '无图片'
  const showIcon = content.metadata.siteIconUrl && !iconError

  return (
    <section className="border border-gray-200 rounded bg-white px-3 py-2.5">
      <div className="flex items-start gap-2.5">
        <div
          className="w-8 h-8 rounded overflow-hidden shrink-0 flex items-center justify-center text-xs font-semibold text-white bg-gray-500"
          style={{ backgroundColor: content.metadata.themeColor || undefined }}
          title={siteLabel}
        >
          {showIcon ? (
            <img
              src={content.metadata.siteIconUrl}
              alt=""
              className="w-full h-full object-cover bg-white"
              onError={() => setIconError(true)}
            />
          ) : (
            getSiteInitial(siteLabel)
          )}
        </div>

        <div className="min-w-0 flex-1">
          <input
            className="w-full text-sm font-semibold text-gray-900 border border-transparent rounded px-1 py-0.5 -ml-1 focus:border-blue-300 focus:outline-none disabled:bg-transparent disabled:text-gray-500"
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            disabled={disabled}
            aria-label="剪藏标题"
          />
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
            <span className="truncate max-w-[180px]">{siteLabel}</span>
            <span>{content.wordCount} 字</span>
            <span>{imageText}</span>
          </div>
          {recentHistory && (
            <div className="mt-1 text-xs text-amber-600">
              {formatRecentHistoryHint(recentHistory)}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
