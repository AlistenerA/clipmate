import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import ClipModeToggle from './components/ClipModeToggle'
import SaveSummary from './components/SaveSummary'
import TagEditor from './components/TagEditor'
import NoteEditor from './components/NoteEditor'
import StatusBar from './components/StatusBar'
import ActionButtons from './components/ActionButtons'
import TargetSelector from './components/TargetSelector'
import MarkdownTargetSelector from './components/MarkdownTargetSelector'
import MarkdownPreview from './components/MarkdownPreview'
import { useCurrentTab } from './hooks/useCurrentTab'
import { useExtractContent } from './hooks/useExtractContent'
import { useClipDraft } from './hooks/useClipDraft'
import { useCopyMarkdown } from './hooks/useCopyMarkdown'
import { useSaveToNotion } from './hooks/useSaveToNotion'
import { getSettings, saveLastClipDraft, getLastClipDraft, getHistory } from '../shared/storage/storage'
import { formatMarkdownWithProfile } from '../shared/markdown/formatWithProfile'
import { resolveSelectedTarget } from './utils/targetSelection'
import { findMostRecentSavedHistoryByUrl } from './utils/recentHistory'
import { ERROR_MESSAGES } from '../shared/constants/defaults'
import { createClipDraft } from '../features/capture'
import { createClipSession, createSaveToNotionPayloadFromSession } from '../features/session'
import { generateId } from '../shared/utils/id'
import type { ClipMode, MarkdownTarget } from '../shared/types/clip.types'
import type { ClipHistoryItem, ClipMateSettingsV2 } from '../shared/types/settings.types'

export default function App() {
  const { tab } = useCurrentTab()
  const [mode, setMode] = useState<ClipMode>('fullpage')
  const { content, loading, error, extract, tryExtractPrioritizeSelection, setContent } = useExtractContent()
  const { tags, setTags, addTag, removeTag, note, setNote } = useClipDraft()
  const { copy, copied, resetCopy } = useCopyMarkdown()
  const { saving, saveError, saved, save: saveToNotion, clearResult } =
    useSaveToNotion()

  const [settings, setSettings] = useState<ClipMateSettingsV2 | null>(null)
  const [selectedTargetId, setSelectedTargetId] = useState<string>('')
  const [mdTarget, setMdTarget] = useState<MarkdownTarget>('notion')
  const [showPreview, setShowPreview] = useState(true)
  const [draftTitle, setDraftTitle] = useState('')
  const [recentHistory, setRecentHistory] = useState<ClipHistoryItem | null>(null)
  const initRef = useRef(false)

  useEffect(() => {
    if (initRef.current) return
    initRef.current = true

    const init = async () => {
      const s = await getSettings()
      setSettings(s)
      const resolved = resolveSelectedTarget(s.notionTargets, s.defaultTargetId)
      if (resolved) {
        setSelectedTargetId(resolved.id)
      }

      const [draft, tabsResult] = await Promise.all([
        getLastClipDraft(),
        chrome.tabs.query({ active: true, currentWindow: true }),
      ])
      const activeUrl = tabsResult[0]?.url

      const selResult = await tryExtractPrioritizeSelection()

      if (selResult && selResult.content) {
        setMode('selection')
        resetCopy()
        return
      }

      if (draft?.content && draft.content.url && activeUrl === draft.content.url) {
        const restoredTitle = draft.title || draft.content.title
        const restoredContent = {
          ...draft.content,
          title: restoredTitle,
          metadata: {
            ...draft.content.metadata,
            title: restoredTitle,
          },
        }
        setContent(restoredContent)
        setDraftTitle(restoredTitle)
        setTags(draft.tags)
        setNote(draft.note)
        setMode(draft.mode)
        return
      }

      extract('fullpage')
    }

    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, [])

  useEffect(() => {
    if (!content) return
    const title = draftTitle.trim() || content.title
    const draft = createClipDraft({
      content,
      tags,
      note,
      title,
      mode,
    })
    saveLastClipDraft(draft)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- use createdAt as identity to avoid infinite loop
  }, [content?.metadata?.createdAt, tags, note, draftTitle, mode])

  useEffect(() => {
    if (!content) {
      setDraftTitle('')
      setRecentHistory(null)
      return
    }
    setDraftTitle(content.title)
  }, [content])

  const refreshRecentHistory = useCallback(async () => {
    if (!content?.url) {
      setRecentHistory(null)
      return
    }

    const history = await getHistory()
    setRecentHistory(findMostRecentSavedHistoryByUrl(history, content.url))
  }, [content?.url])

  useEffect(() => {
    refreshRecentHistory()
  }, [refreshRecentHistory, saved])

  const statusLabel: 'idle' | 'loading' | 'success' | 'error' = loading
    ? 'loading'
    : error
      ? 'error'
      : content
        ? 'success'
        : 'idle'

  const displayMarkdown = useMemo(() => {
    if (!content) return ''
    const title = draftTitle.trim() || content.title
    return formatMarkdownWithProfile(
      {
        title,
        url: content.url,
        tags,
        note,
        bodyMarkdown: content.markdown,
        createdAt: content.metadata?.createdAt,
        mode: content.mode,
        clipMode: content.clipMode,
      },
      mdTarget,
    )
  }, [content, tags, note, mdTarget, draftTitle])

  useEffect(() => {
    resetCopy()
  }, [mdTarget, content?.metadata?.createdAt, resetCopy])

  const handleExtract = useCallback(() => {
    resetCopy()
    extract(mode)
  }, [mode, extract, resetCopy])

  const handleModeChange = useCallback((nextMode: ClipMode) => {
    setMode(nextMode)
    resetCopy()
    extract(nextMode)
  }, [extract, resetCopy])

  const handleCopy = useCallback(() => {
    if (displayMarkdown) {
      copy(displayMarkdown)
    }
  }, [displayMarkdown, copy])

  const handleSaveToNotion = useCallback(() => {
    if (!content) return

    if (!settings?.notionToken) {
      alert(ERROR_MESSAGES.NOTION_TOKEN_MISSING)
      chrome.runtime.openOptionsPage()
      return
    }
    if (!settings?.notionTargets || settings.notionTargets.length === 0) {
      alert(ERROR_MESSAGES.NOTION_TARGETS_EMPTY)
      chrome.runtime.openOptionsPage()
      return
    }
    if (!selectedTargetId) {
      alert('请先选择一个 Notion 目标页面')
      return
    }

    const target = settings.notionTargets.find((t) => t.id === selectedTargetId)
    if (!target) {
      alert(ERROR_MESSAGES.NOTION_TARGET_NOT_FOUND)
      return
    }

    clearResult()
    const title = draftTitle.trim() || content.title
    const draft = createClipDraft({
      content,
      tags,
      note,
      title,
      mode,
    })
    const session = createClipSession({
      id: generateId(),
      draft,
      target: {
        id: target.id,
        name: target.name,
        pageId: target.pageId,
      },
    })
    saveToNotion(createSaveToNotionPayloadFromSession(session))
  }, [content, settings, selectedTargetId, tags, note, draftTitle, mode, saveToNotion, clearResult])

  const openOptions = useCallback(() => {
    chrome.runtime.openOptionsPage()
  }, [])

  return (
    <div className="w-96 p-4 flex flex-col gap-3 bg-white">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-bold text-gray-900">ClipMate</h1>
        {tab && (
          <span className="text-xs text-gray-400 truncate max-w-[200px]">
            {tab.hostname}
          </span>
        )}
      </div>

      <ClipModeToggle
        mode={mode}
        onModeChange={handleModeChange}
        disabled={loading}
      />

      <SaveSummary
        content={content}
        loading={loading}
        error={error}
        title={draftTitle}
        onTitleChange={setDraftTitle}
        disabled={loading}
        recentHistory={recentHistory}
      />

      <StatusBar
        mode={mode}
        wordCount={content?.wordCount ?? 0}
        modeLabel={statusLabel}
        imageCount={content?.imageCount}
      />

      <TagEditor tags={tags} onAdd={addTag} onRemove={removeTag} disabled={loading} />
      <NoteEditor note={note} onChange={setNote} disabled={loading} />

      <MarkdownTargetSelector selectedTarget={mdTarget} onChange={setMdTarget} />

      {content && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1">
            <button
              className={`px-2 py-0.5 text-xs rounded transition-colors ${
                !showPreview
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
              onClick={() => setShowPreview(false)}
            >
              原文
            </button>
            <button
              className={`px-2 py-0.5 text-xs rounded transition-colors ${
                showPreview
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
              onClick={() => setShowPreview(true)}
            >
              预览
            </button>
          </div>
          <div className="max-h-48 overflow-y-auto border border-gray-200 rounded p-2 bg-white">
            {showPreview ? (
              <MarkdownPreview markdown={displayMarkdown} />
            ) : (
              <pre className="text-xs text-gray-700 font-mono whitespace-pre-wrap break-words">
                {displayMarkdown || '提取后将在此显示 Markdown'}
              </pre>
            )}
          </div>
        </div>
      )}

      <TargetSelector
        targets={settings?.notionTargets ?? []}
        selectedTargetId={selectedTargetId}
        onChange={setSelectedTargetId}
      />

      <ActionButtons
        hasContent={content !== null && !error}
        copied={copied}
        saving={saving}
        onCopy={handleCopy}
        onSaveToNotion={handleSaveToNotion}
        onOpenSettings={openOptions}
      />

      {saved && (
        <div className="text-xs text-green-600 text-center">
          已保存到 Notion
        </div>
      )}
      {saveError && (
        <div className="text-xs text-red-600 text-center">{saveError}</div>
      )}

      <button
        className="w-full py-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-30"
        disabled={loading}
        onClick={handleExtract}
      >
        重新提取
      </button>
    </div>
  )
}
