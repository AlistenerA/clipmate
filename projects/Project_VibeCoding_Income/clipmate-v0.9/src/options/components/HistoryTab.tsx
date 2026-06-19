import { useState, useEffect, useCallback, useMemo } from 'react'
import HistoryItem from './HistoryItem'
import {
  getHistory,
  deleteHistoryItem,
  clearHistory,
  getSettings,
} from '../../shared/storage/storage'
import { sendToRuntime } from '../../shared/messaging/sendMessage'
import { MESSAGE_TYPES } from '../../shared/constants/messageTypes'
import { ERROR_MESSAGES } from '../../shared/constants/defaults'
import {
  extractBodyMarkdown,
  filterHistoryLocally,
  resolveRetryTarget,
} from '../utils/historyView'
import { createClipDocument } from '../../features/document'
import type {
  ClipHistoryItem,
  ClipMateSettingsV2,
} from '../../shared/types/settings.types'
import type { SaveToNotionPayload } from '../../shared/types/message.types'

export default function HistoryTab() {
  const [items, setItems] = useState<ClipHistoryItem[]>([])
  const [loaded, setLoaded] = useState(false)
  const [query, setQuery] = useState('')
  const [statusMsg, setStatusMsg] = useState('')

  const refresh = useCallback(async () => {
    try {
      const history = await getHistory()
      setItems(history)
      setLoaded(true)
    } catch {
      setStatusMsg('加载历史记录失败')
      setLoaded(true)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const filtered = useMemo(
    () => filterHistoryLocally(items, query),
    [items, query],
  )

  const showStatus = useCallback((msg: string) => {
    setStatusMsg(msg)
    setTimeout(() => setStatusMsg(''), 2000)
  }, [])

  const handleCopy = useCallback(
    async (item: ClipHistoryItem) => {
      try {
        await navigator.clipboard.writeText(item.markdown)
        showStatus('已复制 Markdown 到剪贴板')
      } catch {
        showStatus('复制失败，请手动复制')
      }
    },
    [showStatus],
  )

  const handleDelete = useCallback(
    async (item: ClipHistoryItem) => {
      if (!confirm(`确定删除「${item.title || '无标题'}」吗？`)) return
      try {
        await deleteHistoryItem(item.id)
        showStatus('已删除')
        await refresh()
      } catch {
        showStatus('删除失败')
      }
    },
    [refresh, showStatus],
  )

  const handleClearAll = useCallback(async () => {
    if (!confirm('确定清空全部剪藏历史吗？此操作不可恢复。')) return
    try {
      await clearHistory()
      showStatus('已清空全部历史')
      await refresh()
    } catch {
      showStatus('清空失败')
    }
  }, [refresh, showStatus])

  const handleRetry = useCallback(
    async (item: ClipHistoryItem) => {
      try {
        const settings: ClipMateSettingsV2 = await getSettings()

        if (!settings.notionToken) {
          showStatus(ERROR_MESSAGES.NOTION_TOKEN_MISSING)
          return
        }

        const target = resolveRetryTarget(settings.notionTargets, item)
        if (!target) {
          showStatus(ERROR_MESSAGES.NOTION_TARGETS_EMPTY)
          return
        }

        const bodyMarkdown = item.mode === 'tutorial'
          ? extractBodyMarkdown(item.markdown)
          : item.markdown
        const contentText = bodyMarkdown
        const clipDocument = item.mode === 'tutorial'
          ? createClipDocument({
              title: item.title,
              url: item.url,
              markdown: bodyMarkdown,
            })
          : undefined

        const payload: SaveToNotionPayload = {
          draft: {
            title: item.title,
            tags: item.tags,
            note: '',
            mode: item.mode,
            content: {
              mode: item.mode,
              title: item.title,
              url: item.url,
              description: '',
              contentText,
              contentHtml: '',
              markdown: bodyMarkdown,
              wordCount: item.wordCount,
              clipDocument,
              metadata: {
                url: item.url,
                title: item.title,
                description: '',
                siteName: '',
                createdAt: item.createdAt,
              },
            },
          },
          targetId: target.id,
          targetName: target.name,
          pageId: target.pageId,
          sourceHistoryId: item.id,
          historyWriteMode: 'update',
        }

        showStatus('正在重试保存…')
        const response = await sendToRuntime<{
          success: boolean
          error?: string
        }>({
          type: MESSAGE_TYPES.SAVE_TO_NOTION,
          payload: payload as unknown as Record<string, unknown>,
        })

        if (response.success) {
          showStatus('重试成功，已保存到 Notion')
          await refresh()
        } else {
          showStatus(
            response.error
              ? ERROR_MESSAGES[response.error] || response.error
              : '重试保存失败',
          )
          await refresh()
        }
      } catch {
        showStatus('重试保存失败')
        await refresh()
      }
    },
    [refresh, showStatus],
  )

  if (!loaded) {
    return (
      <div className="text-center text-sm text-gray-400 py-12">
        加载中…
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {statusMsg && (
        <div className="text-xs text-center px-3 py-1.5 bg-blue-50 text-blue-600 rounded">
          {statusMsg}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 text-sm border border-gray-200 rounded px-3 py-1.5 outline-none focus:border-blue-400"
          placeholder="搜索标题、URL、标签、目标名…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          className="text-xs px-3 py-1.5 rounded bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-30"
          disabled={items.length === 0}
          onClick={handleClearAll}
        >
          清空全部
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center text-sm text-gray-400 py-12">
          暂无剪藏历史
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-sm text-gray-400 py-12">
          未找到匹配历史
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <HistoryItem
              key={item.id}
              item={item}
              query={query}
              onCopy={handleCopy}
              onDelete={handleDelete}
              onRetry={handleRetry}
            />
          ))}
        </div>
      )}

      {items.length > 0 && (
        <div className="text-xs text-gray-400 text-right">
          {filtered.length === items.length
            ? `共 ${items.length} 条`
            : `${filtered.length} / ${items.length} 条`}
        </div>
      )}
    </div>
  )
}
