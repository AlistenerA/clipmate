import type { NotionTarget } from '../../shared/types/settings.types'
import { maskPageId } from '../utils/targetManager'

interface Props {
  targets: NotionTarget[]
  onEdit: (target: NotionTarget) => void
  onDelete: (target: NotionTarget) => void
  onSetDefault: (target: NotionTarget) => void
  onAdd: () => void
  disabled: boolean
}

export default function TargetList({
  targets,
  onEdit,
  onDelete,
  onSetDefault,
  onAdd,
  disabled,
}: Props) {
  if (targets.length === 0) {
    return (
      <div className="bg-white p-4 rounded border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">
          Notion 保存目标
        </h3>
        <p className="text-xs text-gray-400 mb-3">暂未配置保存目标</p>
        <button
          className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-40"
          disabled={disabled}
          onClick={onAdd}
        >
          添加目标
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white p-4 rounded border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-800">
          Notion 保存目标
        </h3>
        <button
          className="px-2 py-0.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-40"
          disabled={disabled}
          onClick={onAdd}
        >
          添加目标
        </button>
      </div>
      <div className="space-y-2">
        {targets.map((target) => (
          <div
            key={target.id}
            className="flex items-center justify-between p-2 rounded border border-gray-100 bg-gray-50"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-gray-800 truncate">
                  {target.name}
                </span>
                {target.isDefault && (
                  <span className="text-xs px-1 py-0 bg-blue-100 text-blue-700 rounded">
                    默认
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-400 font-mono mt-0.5">
                {maskPageId(target.pageId)}
              </div>
            </div>
            <div className="flex gap-1 ml-2 shrink-0">
              {!target.isDefault && (
                <button
                  className="px-2 py-0.5 text-xs text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded disabled:opacity-40"
                  disabled={disabled}
                  onClick={() => onSetDefault(target)}
                >
                  设为默认
                </button>
              )}
              <button
                className="px-2 py-0.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded disabled:opacity-40"
                disabled={disabled}
                onClick={() => onEdit(target)}
              >
                编辑
              </button>
              <button
                className="px-2 py-0.5 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-40"
                disabled={disabled}
                onClick={() => onDelete(target)}
              >
                删除
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
