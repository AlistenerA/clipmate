import { useState, useEffect, useCallback } from 'react'
import NotionSettingsForm from './components/NotionSettingsForm'
import DefaultTagsForm from './components/DefaultTagsForm'
import TargetList from './components/TargetList'
import TargetEditor from './components/TargetEditor'
import StorageDebugPanel from './components/StorageDebugPanel'
import SettingsStatus from './components/SettingsStatus'
import HistoryTab from './components/HistoryTab'
import { getSettings, saveSettings } from '../shared/storage/storage'
import { DEFAULT_SETTINGS_V2 } from '../shared/constants/defaults'
import type { ClipMateSettingsV2, NotionTarget } from '../shared/types/settings.types'
import {
  addTarget,
  updateTarget,
  deleteTarget,
  setDefaultTarget,
} from './utils/targetManager'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'
type OptionsTab = 'settings' | 'history'

export default function App() {
  const [settings, setSettings] = useState<ClipMateSettingsV2>(DEFAULT_SETTINGS_V2)
  const [loaded, setLoaded] = useState(false)
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [statusMsg, setStatusMsg] = useState('')
  const [editingTarget, setEditingTarget] = useState<NotionTarget | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [activeTab, setActiveTab] = useState<OptionsTab>('settings')

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

  const persistTargets = useCallback(
    async (targets: NotionTarget[], defaultTargetId?: string) => {
      setStatus('saving')
      setStatusMsg('保存中…')
      try {
        const partial: Partial<ClipMateSettingsV2> = { notionTargets: targets }
        if (defaultTargetId !== undefined) {
          partial.defaultTargetId = defaultTargetId
        }
        await saveSettings(partial)
        setSettings((s) => ({
          ...s,
          notionTargets: targets,
          ...(defaultTargetId !== undefined ? { defaultTargetId } : {}),
        }))
        showStatus('saved', '目标已保存')
      } catch {
        showStatus('error', '保存失败，请重试')
      }
    },
    [showStatus],
  )

  const handleAddTarget = useCallback(
    async (name: string, pageId: string, makeDefault?: boolean) => {
      try {
        const result = addTarget(settings.notionTargets, name, pageId, makeDefault)
        const newDefaultId = result.newTarget.isDefault
          ? result.newTarget.id
          : settings.defaultTargetId
        await persistTargets(result.targets, newDefaultId)
        setShowAddForm(false)
      } catch {
        showStatus('error', '添加失败，请重试')
      }
    },
    [settings.notionTargets, settings.defaultTargetId, persistTargets, showStatus],
  )

  const handleUpdateTarget = useCallback(
    async (name: string, pageId: string) => {
      if (!editingTarget) return
      try {
        const updated = updateTarget(settings.notionTargets, editingTarget.id, name, pageId)
        await persistTargets(updated)
        setEditingTarget(null)
      } catch {
        showStatus('error', '更新失败，请重试')
      }
    },
    [settings.notionTargets, editingTarget, persistTargets, showStatus],
  )

  const handleDeleteTarget = useCallback(
    async (target: NotionTarget) => {
      if (!confirm(`确定删除目标「${target.name}」吗？`)) return
      try {
        const result = deleteTarget(settings.notionTargets, target.id)
        await persistTargets(result.targets, result.newDefaultId)
      } catch {
        showStatus('error', '删除失败，请重试')
      }
    },
    [settings.notionTargets, persistTargets, showStatus],
  )

  const handleSetDefault = useCallback(
    async (target: NotionTarget) => {
      try {
        const updated = setDefaultTarget(settings.notionTargets, target.id)
        await persistTargets(updated, target.id)
      } catch {
        showStatus('error', '设置默认失败，请重试')
      }
    },
    [settings.notionTargets, persistTargets, showStatus],
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
        notionTargets: [],
        defaultTargetId: undefined,
      })
      setSettings({
        ...DEFAULT_SETTINGS_V2,
        saveHistoryEnabled: true,
        notionTargets: [],
        defaultTargetId: undefined,
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

  const isSaving = status === 'saving'

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-xl mx-auto space-y-4">
        <h1 className="text-xl font-bold text-gray-900">ClipMate</h1>

        <div className="flex gap-0 border-b border-gray-200">
          <button
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'settings'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('settings')}
          >
            设置
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'history'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('history')}
          >
            剪藏历史
          </button>
        </div>

        {activeTab === 'history' ? (
          <HistoryTab />
        ) : (
          <>
            <SettingsStatus status={status} message={statusMsg} />

            <NotionSettingsForm
              token={settings.notionToken}
              onChangeToken={(v) =>
                setSettings((s) => ({ ...s, notionToken: v }))
              }
              disabled={isSaving}
            />

            {showAddForm ? (
              <TargetEditor
                onSave={handleAddTarget}
                onCancel={() => setShowAddForm(false)}
                disabled={isSaving}
              />
            ) : editingTarget ? (
              <TargetEditor
                initial={editingTarget}
                onSave={handleUpdateTarget}
                onCancel={() => setEditingTarget(null)}
                disabled={isSaving}
              />
            ) : (
              <TargetList
                targets={settings.notionTargets}
                onEdit={(t) => setEditingTarget(t)}
                onDelete={handleDeleteTarget}
                onSetDefault={handleSetDefault}
                onAdd={() => setShowAddForm(true)}
                disabled={isSaving}
              />
            )}

            <DefaultTagsForm
              tags={settings.defaultTags}
              onChange={(tags) =>
                setSettings((s) => ({ ...s, defaultTags: tags }))
              }
              disabled={isSaving}
            />

            <div className="bg-white p-4 rounded border border-gray-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded"
                  checked={settings.saveHistoryEnabled}
                  disabled={isSaving}
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
                disabled={isSaving}
                onClick={handleSave}
              >
                保存配置
              </button>
              <button
                className="py-2 px-4 bg-gray-100 text-gray-600 text-sm rounded hover:bg-gray-200 transition-colors disabled:opacity-40"
                disabled={isSaving}
                onClick={handleClear}
              >
                清空配置
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
