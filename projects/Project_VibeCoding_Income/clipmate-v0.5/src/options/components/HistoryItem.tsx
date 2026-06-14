import { useState, type ReactNode } from 'react'
import type { ClipHistoryItem } from '../../shared/types/settings.types'
import {
  getHistoryStatusLabel,
  getHistoryStatusTone,
  formatHistoryTime,
  getHostname,
  getModeLabel,
  highlightText,
  getHistoryMatchInfo,
  getSiteInitial,
  getHistorySummary,
  getStableSiteColor,
} from '../utils/historyView'
import type { HighlightToken } from '../utils/historyView'

interface HistoryItemProps {
  item: ClipHistoryItem
  query: string
  onCopy: (item: ClipHistoryItem) => void
  onDelete: (item: ClipHistoryItem) => void
  onRetry: (item: ClipHistoryItem) => void
}

const toneBadge: Record<string, string> = {
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
  gray: 'bg-gray-100 text-gray-500',
}

function renderTokens(tokens: HighlightToken[]): ReactNode[] {
  return tokens.map((t, i) => {
    if (typeof t === 'string') return <span key={i}>{t}</span>
    return (
      <mark key={i} className="bg-yellow-200 text-gray-900 rounded-sm px-0.5">
        {t.match}
      </mark>
    )
  })
}

export default function HistoryItem({ item, query, onCopy, onDelete, onRetry }: HistoryItemProps) {
  const [copied, setCopied] = useState(false)
  const [iconError, setIconError] = useState(false)
  const tone = getHistoryStatusTone(item.saveStatus)
  const canRetry = item.saveStatus === 'failed' || item.saveStatus === 'unsaved'
  const domain = getHostname(item.url)
  const siteColor = getStableSiteColor(domain)
  const siteInitial = getSiteInitial(domain)
  const summary = getHistorySummary(item)
  const matchInfo = getHistoryMatchInfo(item, query)
  const titleTokens = highlightText(item.title || '无标题', query)
  const urlTokens = highlightText(domain, query)
  const summaryTokens = highlightText(summary, query)
  const showIconImg = item.siteIconUrl && !iconError

  const handleCopy = async () => {
    if (!item.markdown) return
    await onCopy(item)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div
      className="bg-white rounded border border-gray-200 border-l-4 p-3 text-sm"
      style={{ borderLeftColor: siteColor }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 overflow-hidden"
          style={{ backgroundColor: siteColor }}
          title={domain}
        >
          {showIconImg ? (
            <img
              src={item.siteIconUrl}
              alt=""
              className="w-full h-full object-cover"
              onError={() => setIconError(true)}
            />
          ) : (
            siteInitial
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex-1 min-w-0">
              <span className="font-medium text-gray-900 block leading-tight">
                {renderTokens(titleTokens)}
              </span>
              <span className="text-gray-400 text-xs block mt-0.5">
                {renderTokens(urlTokens)}
              </span>
            </div>
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full font-medium shrink-0 ${toneBadge[tone]}`}
            >
              {getHistoryStatusLabel(item.saveStatus)}
            </span>
          </div>

          <div className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">
            {renderTokens(summaryTokens)}
          </div>

          <div className="flex flex-wrap gap-1.5 mt-1.5">
            <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
              {getModeLabel(item.mode)}
            </span>
            {item.tags.map((tag) => {
              const matched = matchInfo.tagsMatched.includes(tag)
              return (
                <span
                  key={tag}
                  className={`text-xs px-1.5 py-0.5 rounded ${
                    matched
                      ? 'bg-yellow-100 text-yellow-800 font-medium'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  #{tag}
                </span>
              )
            })}
            {item.markdownTruncated && (
              <span className="text-xs bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded">
                Markdown 已截断
              </span>
            )}
            {matchInfo.targetMatched && (
              <span className="text-xs bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded">
                目标匹配
              </span>
            )}
            {matchInfo.noteMatched && (
              <span className="text-xs bg-teal-50 text-teal-600 px-1.5 py-0.5 rounded">
                备注匹配
              </span>
            )}
            {(matchInfo.contentMatched || matchInfo.markdownMatched) && !matchInfo.titleMatched && !matchInfo.urlMatched && (
              <span className="text-xs bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded">
                正文匹配
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5 text-xs text-gray-400">
            {item.targetName && <span>目标：{item.targetName}</span>}
            <span>{item.wordCount} 字</span>
            {(item.imageCount ?? 0) > 0 && item.mode === 'fullpage' && (
              <span className="text-purple-500">图片 {item.imageCount}</span>
            )}
            {item.savedAt && <span>保存于 {formatHistoryTime(item.savedAt)}</span>}
            {!item.savedAt && <span>创建于 {formatHistoryTime(item.createdAt)}</span>}
            {item.errorCode && (
              <span className="text-red-400">错误：{item.errorCode}</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-2 ml-11">
        <button
          className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-40"
          disabled={!item.markdown}
          onClick={handleCopy}
        >
          {copied ? '已复制' : '复制 Markdown'}
        </button>
        {canRetry && (
          <button
            className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
            onClick={() => onRetry(item)}
          >
            重试保存
          </button>
        )}
        <button
          className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors ml-auto"
          onClick={() => onDelete(item)}
        >
          删除
        </button>
      </div>
    </div>
  )
}
