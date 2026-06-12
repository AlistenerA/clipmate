interface Props {
  tags: string[]
  onChange: (tags: string[]) => void
  disabled: boolean
}

export default function DefaultTagsForm({ tags, onChange, disabled }: Props) {
  const tagsStr = tags.join(', ')

  return (
    <div className="bg-white p-4 rounded border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">默认标签</h3>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          标签列表（逗号分隔）
        </label>
        <input
          type="text"
          className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded focus:border-blue-400 focus:outline-none disabled:bg-gray-50"
          placeholder="例如：技术, 前端, 收藏"
          value={tagsStr}
          disabled={disabled}
          onChange={(e) => {
            const parts = e.target.value
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
            onChange(parts)
          }}
        />
        <p className="text-xs text-gray-400 mt-0.5">
          剪藏时自动填充这些标签
        </p>
      </div>
    </div>
  )
}
