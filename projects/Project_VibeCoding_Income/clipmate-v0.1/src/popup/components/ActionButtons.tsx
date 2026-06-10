interface Props {
  hasContent: boolean
  copied: boolean
  onCopy: () => void
  onSaveToNotion: () => void
  onOpenSettings: () => void
}

export default function ActionButtons({
  hasContent,
  copied,
  onCopy,
  onSaveToNotion,
  onOpenSettings,
}: Props) {
  return (
    <div className="flex gap-2">
      <button
        className={`flex-1 px-3 py-2 text-sm font-medium rounded transition-colors disabled:opacity-40 ${
          copied
            ? 'bg-green-500 text-white'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
        disabled={!hasContent}
        onClick={onCopy}
      >
        {copied ? '已复制' : '复制 Markdown'}
      </button>
      <button
        className="flex-1 px-3 py-2 text-sm font-medium rounded bg-gray-700 text-white hover:bg-gray-800 transition-colors disabled:opacity-40"
        disabled={!hasContent}
        onClick={onSaveToNotion}
      >
        保存到 Notion
      </button>
      <button
        className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        onClick={onOpenSettings}
        title="打开设置"
      >
        设置
      </button>
    </div>
  )
}
