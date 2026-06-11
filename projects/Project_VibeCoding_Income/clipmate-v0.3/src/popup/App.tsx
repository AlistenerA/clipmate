import { useState, useEffect, useCallback, useRef } from 'react'
import ClipModeToggle from './components/ClipModeToggle'
import ContentPreview from './components/ContentPreview'
import TagEditor from './components/TagEditor'
import NoteEditor from './components/NoteEditor'
import StatusBar from './components/StatusBar'
import ActionButtons from './components/ActionButtons'
import TargetSelector from './components/TargetSelector'
import { useCurrentTab } from './hooks/useCurrentTab'
import { useExtractContent } from './hooks/useExtractContent'
import { useClipDraft } from './hooks/useClipDraft'
import { useCopyMarkdown } from './hooks/useCopyMarkdown'
import { useSaveToNotion } from './hooks/useSaveToNotion'
import { getSettings, saveLastClipDraft, getLastClipDraft } from '../shared/storage/storage'
import { formatCopyMarkdown } from '../shared/utils/formatMarkdown'
import { resolveSelectedTarget } from './utils/targetSelection'
import { ERROR_MESSAGES } from '../shared/constants/defaults'
import type { ClipMode, ClipDraft } from '../shared/types/clip.types'
import type { ClipMateSettingsV2 } from '../shared/types/settings.types'

export default function App() {
  const { tab } = useCurrentTab()
  const [mode, setMode] = useState<ClipMode>('fullpage')
  const { content, loading, error, extract, setContent } = useExtractContent()
  const { tags, setTags, addTag, removeTag, note, setNote } = useClipDraft()
  const { copy, copied } = useCopyMarkdown()
  const { saving, saveError, saved, save: saveToNotion, clearResult } =
    useSaveToNotion()

  const [settings, setSettings] = useState<ClipMateSettingsV2 | null>(null)
  const [selectedTargetId, setSelectedTargetId] = useState<string>('')
  const [draftLoaded, setDraftLoaded] = useState(false)
  const restoredRef = useRef(false)

  useEffect(() => {
    getSettings().then((s) => {
      setSettings(s)
      const resolved = resolveSelectedTarget(s.notionTargets, s.defaultTargetId)
      if (resolved) {
        setSelectedTargetId(resolved.id)
      }
    })
    Promise.all([
      getLastClipDraft(),
      chrome.tabs.query({ active: true, currentWindow: true }),
    ]).then(([draft, tabs]) => {
      const activeUrl = tabs[0]?.url
      const draftUrl = draft?.content?.url

      if (draft?.content && draftUrl && activeUrl === draftUrl) {
        restoredRef.current = true
        setContent(draft.content)
        setTags(draft.tags)
        setNote(draft.note)
        setMode(draft.mode)
      }
      setDraftLoaded(true)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setContent/setTags/setNote are stable setters
  }, [])

  useEffect(() => {
    if (!draftLoaded) return
    if (restoredRef.current) {
      restoredRef.current = false
      return
    }
    extract(mode)
  }, [mode, draftLoaded, extract])

  useEffect(() => {
    if (!content) return
    const draft: ClipDraft = {
      title: content.title,
      tags,
      note,
      mode: content.mode,
      content,
    }
    saveLastClipDraft(draft)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- use createdAt as identity to avoid infinite loop
  }, [content?.metadata?.createdAt, tags, note])

  const statusLabel: 'idle' | 'loading' | 'success' | 'error' = loading
    ? 'loading'
    : error
      ? 'error'
      : content
        ? 'success'
        : 'idle'

  const handleExtract = useCallback(() => {
    extract(mode)
  }, [mode, extract])

  const handleCopy = useCallback(() => {
    if (content) {
      const fullMarkdown = formatCopyMarkdown(
        content.title,
        content.url,
        tags,
        note,
        content.markdown,
      )
      copy(fullMarkdown)
    }
  }, [content, copy, tags, note])

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
    const draft: ClipDraft = {
      title: content.title,
      tags,
      note,
      mode: content.mode,
      content,
    }
    saveToNotion({
      draft,
      targetId: target.id,
      targetName: target.name,
      pageId: target.pageId,
    })
  }, [content, settings, selectedTargetId, tags, note, saveToNotion, clearResult])

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
        onModeChange={setMode}
        disabled={loading}
      />

      <div className="max-h-48 overflow-y-auto border border-gray-100 rounded p-2.5 bg-gray-50">
        <ContentPreview
          content={content}
          loading={loading}
          error={error}
        />
      </div>

      <StatusBar
        mode={mode}
        wordCount={content?.wordCount ?? 0}
        modeLabel={statusLabel}
      />

      <TagEditor tags={tags} onAdd={addTag} onRemove={removeTag} disabled={loading} />
      <NoteEditor note={note} onChange={setNote} disabled={loading} />

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
