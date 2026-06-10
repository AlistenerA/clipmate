import { useState, useEffect, useCallback } from 'react'
import ClipModeToggle from './components/ClipModeToggle'
import ContentPreview from './components/ContentPreview'
import TagEditor from './components/TagEditor'
import NoteEditor from './components/NoteEditor'
import StatusBar from './components/StatusBar'
import ActionButtons from './components/ActionButtons'
import { useCurrentTab } from './hooks/useCurrentTab'
import { useExtractContent } from './hooks/useExtractContent'
import { useClipDraft } from './hooks/useClipDraft'
import { useCopyMarkdown } from './hooks/useCopyMarkdown'
import { getSettings } from '../shared/storage/storage'
import type { ClipMode } from '../shared/types/clip.types'

export default function App() {
  const { tab } = useCurrentTab()
  const [mode, setMode] = useState<ClipMode>('fullpage')
  const { content, loading, error, extract } = useExtractContent()
  const { tags, addTag, removeTag, note, setNote } = useClipDraft()
  const { copy, copied } = useCopyMarkdown()

  const [notionConfigured, setNotionConfigured] = useState(false)

  useEffect(() => {
    getSettings().then((s) => {
      setNotionConfigured(Boolean(s.notionToken && s.notionPageId))
    })
  }, [])

  useEffect(() => {
    extract(mode)
  }, [mode, extract])

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
      copy(content.markdown)
    }
  }, [content, copy])

  const handleSaveToNotion = useCallback(() => {
    if (!notionConfigured) {
      alert('请先打开设置页面，配置 Notion Token 和 Page ID')
      chrome.runtime.openOptionsPage()
      return
    }
    alert('保存到 Notion 功能将在下一阶段接入')
  }, [notionConfigured])

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

      <ActionButtons
        hasContent={content !== null && !error}
        copied={copied}
        onCopy={handleCopy}
        onSaveToNotion={handleSaveToNotion}
        onOpenSettings={openOptions}
      />

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
