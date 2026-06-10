import { useState, useEffect, useCallback } from 'react'
import NotionSettingsForm from './components/NotionSettingsForm'
import DefaultTagsForm from './components/DefaultTagsForm'
import StorageDebugPanel from './components/StorageDebugPanel'
import SettingsStatus from './components/SettingsStatus'
import { getSettings, saveSettings } from '../shared/storage/storage'
import { DEFAULT_SETTINGS } from '../shared/constants/defaults'
import type { ClipMateSettings } from '../shared/types/settings.types'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export default function App() {
  const [settings, setSettings] = useState<ClipMateSettings>(DEFAULT_SETTINGS)
  const [loaded, setLoaded] = useState(false)
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [statusMsg, setStatusMsg] = useState('')

  useEffect(() => {
    getSettings().then((s) => {
      setSettings(s)
      setLoaded(true)
    })
  }, [])

  const showStatus = useCallback(
    (s: SaveStatus, msg: string) => {
      setStatus(s)
      setStatusMsg(msg)
      if (s === 'saved' || s === 'error') {
        setTimeout(() => setStatus('idle'), 2000)
      }
    },
    [],
  )

  const handleSave = useCallback(async () => {
    setStatus('saving')
    setStatusMsg('保存中…')
    try {
      await saveSettings(settings)
      showStatus('saved', '配置已保存')
    } catch {
      showStatus('error', '保存失败，请重试')
    }
  }, [settings, showStatus])

  const handleClear = useCallback(async () => {
    setStatus('saving')
    setStatusMsg('清空中…')
    try {
      await saveSettings({
        notionToken: '',
        notionPageId: '',
        defaultTags: [],
        saveHistoryEnabled: true,
      })
      setSettings({
        ...DEFAULT_SETTINGS,
        saveHistoryEnabled: true,
      })
      showStatus('saved', '配置已清空')
    } catch {
      showStatus('error', '清空失败，请重试')
    }
  }, [showStatus])

  if (!loaded) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-xl mx-auto text-center text-sm text-gray-400 mt-20">
          加载中…
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-xl mx-auto space-y-4">
        <h1 className="text-xl font-bold text-gray-900">ClipMate 设置</h1>

        <SettingsStatus status={status} message={statusMsg} />

        <NotionSettingsForm
          token={settings.notionToken}
          pageId={settings.notionPageId}
          onChangeToken={(v) =>
            setSettings((s) => ({ ...s, notionToken: v }))
          }
          onChangePageId={(v) =>
            setSettings((s) => ({ ...s, notionPageId: v }))
          }
          disabled={status === 'saving'}
        />

        <DefaultTagsForm
          tags={settings.defaultTags}
          onChange={(tags) =>
            setSettings((s) => ({ ...s, defaultTags: tags }))
          }
          disabled={status === 'saving'}
        />

        <div className="bg-white p-4 rounded border border-gray-200">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="rounded"
              checked={settings.saveHistoryEnabled}
              disabled={status === 'saving'}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  saveHistoryEnabled: e.target.checked,
                }))
              }
            />
            <span className="text-sm text-gray-700">保存剪藏历史</span>
          </label>
        </div>

        <StorageDebugPanel settings={settings} />

        <div className="flex gap-3">
          <button
            className="flex-1 py-2 px-4 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors disabled:opacity-40"
            disabled={status === 'saving'}
            onClick={handleSave}
          >
            保存配置
          </button>
          <button
            className="py-2 px-4 bg-gray-100 text-gray-600 text-sm rounded hover:bg-gray-200 transition-colors disabled:opacity-40"
            disabled={status === 'saving'}
            onClick={handleClear}
          >
            清空配置
          </button>
        </div>
      </div>
    </div>
  )
}
