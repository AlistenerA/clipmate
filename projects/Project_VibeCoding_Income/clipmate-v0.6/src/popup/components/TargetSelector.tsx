import type { NotionTarget } from '../../shared/types/settings.types'

interface Props {
  targets: NotionTarget[]
  selectedTargetId: string
  onChange: (targetId: string) => void
}

export default function TargetSelector({ targets, selectedTargetId, onChange }: Props) {
  if (targets.length === 0) {
    return (
      <div className="text-xs text-gray-400 px-1">
        请先在设置页添加 Notion 目标页面
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-gray-500 whitespace-nowrap">保存到：</label>
      <select
        className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 bg-white text-gray-700"
        value={selectedTargetId || ''}
        onChange={(e) => onChange(e.target.value)}
      >
        {targets.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
    </div>
  )
}
