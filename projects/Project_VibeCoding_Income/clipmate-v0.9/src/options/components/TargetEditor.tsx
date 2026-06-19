import { useState } from 'react'
import type { NotionTarget } from '../../shared/types/settings.types'
import { extractNotionPageId } from '../utils/targetManager'

interface Props {
  initial?: NotionTarget
  onSave: (name: string, pageId: string, makeDefault?: boolean) => void
  onCancel: () => void
  disabled: boolean
}

export default function TargetEditor({ initial, onSave, onCancel, disabled }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [pageId, setPageId] = useState(initial?.pageId ?? '')
  const [makeDefault, setMakeDefault] = useState(false)
  const [error, setError] = useState('')

  const handleSave = () => {
    if (!name.trim()) {
      setError('名称不能为空')
      return
    }
    const normalizedPageId = extractNotionPageId(pageId)
    if (!normalizedPageId) {
      setError('无法识别 Notion 页面 ID，请复制 Notion 页面链接或填写 32 位页面 ID')
      return
    }
    setError('')
    onSave(name, normalizedPageId, initial ? undefined : makeDefault)
  }

  return (
    <div className="bg-gray-50 p-3 rounded border border-gray-200 space-y-2">
      <h4 className="text-xs font-semibold text-gray-700">
        {initial ? '编辑目标' : '新增目标'}
      </h4>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          名称
        </label>
        <input
          type="text"
          className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:border-blue-400 focus:outline-none disabled:bg-gray-100"
          placeholder="如：工作笔记本"
          value={name}
          disabled={disabled}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          Notion Page ID
        </label>
        <input
          type="text"
          className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:border-blue-400 focus:outline-none disabled:bg-gray-100"
          placeholder="从 Notion 页面 URL 中获取（32位十六进制）"
          value={pageId}
          disabled={disabled}
          onChange={(e) => setPageId(e.target.value)}
        />
        <p className="text-xs text-gray-400 mt-1">
          可粘贴完整 Notion 页面链接；如链接包含 #，# 后通常是块定位，不需要填写。
        </p>
        {!initial && (
          <label className="flex items-center gap-1 mt-1 cursor-pointer">
            <input
              type="checkbox"
              className="rounded"
              checked={makeDefault}
              disabled={disabled}
              onChange={(e) => setMakeDefault(e.target.checked)}
            />
            <span className="text-xs text-gray-500">设为默认目标</span>
          </label>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
      <div className="flex gap-2">
        <button
          className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-40"
          disabled={disabled}
          onClick={handleSave}
        >
          保存
        </button>
        <button
          className="px-3 py-1 text-xs bg-gray-200 text-gray-600 rounded hover:bg-gray-300 disabled:opacity-40"
          disabled={disabled}
          onClick={onCancel}
        >
          取消
        </button>
      </div>
    </div>
  )
}
